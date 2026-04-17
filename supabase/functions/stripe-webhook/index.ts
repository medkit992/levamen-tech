import Stripe from "https://esm.sh/stripe@18.4.0?target=denonext";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const stripe = new Stripe(stripeSecretKey, {
  appInfo: {
    name: "Levamen Tech Stripe Webhook",
    version: "1.0.0",
  },
});

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return json({ error: "Missing stripe-signature header" }, 400);
    }

    const body = await req.text();

    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      stripeWebhookSecret
    );

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscriptionChanged(event.data.object as Stripe.Subscription);
        break;

      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
    }

    return json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return json({ error: message }, 400);
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const inquiryId =
    session.metadata?.inquiry_id || session.client_reference_id || null;

  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id || null;

  if (!customerId) return;

  let inquiry: Record<string, unknown> | null = null;

  if (inquiryId) {
    const { data } = await supabaseAdmin
      .from("pricing_inquiries")
      .select("*")
      .eq("id", inquiryId)
      .maybeSingle();

    inquiry = data;
  }

  const fullName =
    (inquiry?.full_name as string | undefined) ||
    (session.customer_details?.name ?? "Client");

  const email =
    (inquiry?.email as string | undefined) ||
    session.customer_details?.email ||
    "";

  const businessName =
    (inquiry?.business_name as string | undefined) ||
    session.metadata?.business_name ||
    fullName;

  const existing = await findClientByCustomerId(customerId);

  if (existing) {
    await supabaseAdmin
      .from("client_accounts")
      .update({
        pricing_inquiry_id: inquiryId,
        stripe_checkout_session_id: session.id,
        full_name: fullName,
        email,
        business_name: businessName,
      })
      .eq("id", existing.id);
    return;
  }

  await supabaseAdmin.from("client_accounts").insert({
    pricing_inquiry_id: inquiryId,
    stripe_customer_id: customerId,
    stripe_checkout_session_id: session.id,
    full_name: fullName,
    email,
    business_name: businessName,
    website_status: "active",
  });
}

async function handleSubscriptionChanged(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id || null;

  if (!customerId) return;

  const existing = await findClientByCustomerId(customerId);
  if (!existing) return;

  const periodEndUnix =
    subscription.items.data[0]?.current_period_end ??
    subscription.current_period_end ??
    null;

  await supabaseAdmin
    .from("client_accounts")
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      current_period_end: periodEndUnix
        ? new Date(periodEndUnix * 1000).toISOString()
        : null,
      shutdown_required:
        subscription.status === "canceled" || subscription.status === "unpaid",
      website_status:
        subscription.status === "canceled" || subscription.status === "unpaid"
          ? "paused"
          : existing.website_status ?? "active",
    })
    .eq("id", existing.id);
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id || null;

  if (!customerId) return;

  const existing = await findClientByCustomerId(customerId);
  if (!existing) return;

  await supabaseAdmin
    .from("client_accounts")
    .update({
      latest_invoice_id: invoice.id,
      last_invoice_status: invoice.status,
      last_payment_at: new Date((invoice.status_transitions?.paid_at || Math.floor(Date.now() / 1000)) * 1000).toISOString(),
      last_payment_amount:
        typeof invoice.amount_paid === "number" ? invoice.amount_paid / 100 : null,
      payment_failed_at: null,
      grace_period_ends_at: null,
      shutdown_required: false,
      payment_method_update_url: null,
      subscription_status: "active",
      website_status: "active",
    })
    .eq("id", existing.id);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id || null;

  if (!customerId) return;

  const existing = await findClientByCustomerId(customerId);
  if (!existing) return;

  const failedAt = new Date().toISOString();
  const gracePeriodEndsAt = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  await supabaseAdmin
    .from("client_accounts")
    .update({
      latest_invoice_id: invoice.id,
      last_invoice_status: invoice.status,
      payment_failed_at: failedAt,
      grace_period_ends_at: gracePeriodEndsAt,
    })
    .eq("id", existing.id);
}

async function findClientByCustomerId(customerId: string) {
  const { data } = await supabaseAdmin
    .from("client_accounts")
    .select("*")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  return data;
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}