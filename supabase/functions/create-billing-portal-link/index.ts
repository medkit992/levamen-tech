import { createSupabaseAdminClient, HttpError, requireAuthorizedAdmin } from "../_shared/admin.ts";
import { jsonResponse } from "../_shared/http.ts";
import { createStripeClient } from "../_shared/stripe.ts";

// Keep the return destination configurable across sandbox and production.
const billingPortalReturnUrl =
  Deno.env.get("BILLING_PORTAL_RETURN_URL") || "https://levamentech.com/success";

const stripe = createStripeClient("Levamen Tech Billing Portal");

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return jsonResponse({ ok: true });
    }

    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed." }, 405);
    }

    await requireAuthorizedAdmin(req.headers.get("Authorization"));

    const payload = await req.json();
    const clientId =
      payload && typeof payload === "object" && typeof payload.clientId === "string"
        ? payload.clientId
        : "";

    if (!clientId) {
      return jsonResponse({ error: "Missing clientId." }, 400);
    }

    const supabaseAdmin = createSupabaseAdminClient();
    const { data: client, error } = await supabaseAdmin
      .from("client_accounts")
      .select("*")
      .eq("id", clientId)
      .single();

    if (error || !client) {
      return jsonResponse({ error: "Client not found." }, 404);
    }

    if (!client.stripe_customer_id) {
      return jsonResponse(
        { error: "Client does not have a Stripe customer id yet." },
        400
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: client.stripe_customer_id,
      return_url: billingPortalReturnUrl,
    });

    await supabaseAdmin
      .from("client_accounts")
      .update({
        payment_method_update_url: session.url,
      })
      .eq("id", client.id);

    return jsonResponse({
      ok: true,
      url: session.url,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status);
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse({ error: message }, 500);
  }
});
