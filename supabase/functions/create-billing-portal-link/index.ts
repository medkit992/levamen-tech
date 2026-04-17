import Stripe from "https://esm.sh/stripe@18.4.0?target=denonext";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const billingPortalReturnUrl =
  Deno.env.get("BILLING_PORTAL_RETURN_URL") || "https://levamentech.com/success";

const stripe = new Stripe(stripeSecretKey, {
  appInfo: {
    name: "Levamen Tech Billing Portal",
    version: "1.0.0",
  },
});

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return response({ ok: true });
    }

    if (req.method !== "POST") {
      return response({ error: "Method not allowed" }, 405);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return response({ error: "Missing Authorization header" }, 401);
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return response({ error: "Unauthorized" }, 401);
    }

    const { clientId } = await req.json();
    if (!clientId) {
      return response({ error: "Missing clientId" }, 400);
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { data: client, error } = await supabaseAdmin
      .from("client_accounts")
      .select("*")
      .eq("id", clientId)
      .single();

    if (error || !client) {
      return response({ error: "Client not found" }, 404);
    }

    if (!client.stripe_customer_id) {
      return response({ error: "Client does not have a Stripe customer id yet" }, 400);
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

    return response({
      ok: true,
      url: session.url,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return response({ error: message }, 500);
  }
});

function response(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
}