import Stripe from "https://esm.sh/stripe@18.4.0?target=denonext";
import { createSupabaseAdminClient } from "../_shared/admin.ts";
import { sendAdminAlert, sendEmail } from "../_shared/email.ts";
import { escapeHtml, jsonResponse } from "../_shared/http.ts";
import { createStripeClient } from "../_shared/stripe.ts";

const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
const billingPortalReturnUrl =
  Deno.env.get("BILLING_PORTAL_RETURN_URL") || "https://levamentech.com/success";

const stripe = createStripeClient("Levamen Tech Stripe Webhook");
const supabaseAdmin = createSupabaseAdminClient();

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    if (!stripeWebhookSecret) {
      return jsonResponse({ error: "Missing STRIPE_WEBHOOK_SECRET." }, 500);
    }

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return jsonResponse({ error: "Missing stripe-signature header." }, 400);
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

      case "checkout.session.expired":
        await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
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

    return jsonResponse({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse({ error: message }, 400);
  }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const inquiryId =
    session.metadata?.inquiry_id || session.client_reference_id || null;
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id || null;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id || null;

  if (!customerId) return;

  let inquiry: Record<string, unknown> | null = null;

  if (inquiryId) {
    const { data } = await supabaseAdmin
      .from("pricing_inquiries")
      .select("*")
      .eq("id", inquiryId)
      .maybeSingle();

    inquiry = data;

    await supabaseAdmin
      .from("pricing_inquiries")
      .update({
        status: "paid",
        last_contacted_at: new Date().toISOString(),
      })
      .eq("id", inquiryId);
  }

  const fullName =
    String(inquiry?.full_name || session.customer_details?.name || "Client");
  const email = String(inquiry?.email || session.customer_details?.email || "");
  const businessName = String(
    inquiry?.business_name || session.metadata?.business_name || fullName
  );

  const existing = await findClientByCustomerId(customerId);

  const payload = {
    pricing_inquiry_id: inquiryId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    stripe_checkout_session_id: session.id,
    full_name: fullName,
    email,
    business_name: businessName,
    website_status: "active",
    payment_failed_at: null,
    grace_period_ends_at: null,
    shutdown_required: false,
    shutdown_marked_at: null,
  };

  if (existing) {
    await supabaseAdmin
      .from("client_accounts")
      .update(payload)
      .eq("id", existing.id);
    return;
  }

  await supabaseAdmin.from("client_accounts").insert(payload);
}

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const inquiryId =
    session.metadata?.inquiry_id || session.client_reference_id || null;

  if (!inquiryId) return;

  await supabaseAdmin
    .from("pricing_inquiries")
    .update({
      status: "payment_expired",
      last_contacted_at: new Date().toISOString(),
    })
    .eq("id", inquiryId);
}

async function handleSubscriptionChanged(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id || null;

  if (!customerId) return;

  const existing = await findClientByCustomerId(customerId);
  if (!existing) return;

  const periodEndUnix = subscription.items.data[0]?.current_period_end ?? null;
  const shouldPause =
    subscription.status === "canceled" || subscription.status === "unpaid";

  await supabaseAdmin
    .from("client_accounts")
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      current_period_end: periodEndUnix
        ? new Date(periodEndUnix * 1000).toISOString()
        : null,
      shutdown_required: shouldPause,
      website_status: shouldPause
        ? "paused"
        : String(existing.website_status || "active"),
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

  const hadBillingIssue =
    Boolean(existing.payment_failed_at) || Boolean(existing.shutdown_required);

  await supabaseAdmin
    .from("client_accounts")
    .update({
      latest_invoice_id: invoice.id,
      last_invoice_status: invoice.status,
      last_payment_at: new Date(
        (invoice.status_transitions?.paid_at || Math.floor(Date.now() / 1000)) *
          1000
      ).toISOString(),
      last_payment_amount:
        typeof invoice.amount_paid === "number" ? invoice.amount_paid / 100 : null,
      payment_failed_at: null,
      grace_period_ends_at: null,
      shutdown_required: false,
      shutdown_marked_at: null,
      payment_method_update_url: null,
      subscription_status: "active",
      website_status: "active",
    })
    .eq("id", existing.id);

  if (hadBillingIssue) {
    await sendAdminAlert({
      subject: `Billing recovered: ${String(existing.business_name || "Client")}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;">
          <p><strong>Billing recovered.</strong></p>
          <p>
            <strong>Business:</strong> ${escapeHtml(
              String(existing.business_name || "Client")
            )}<br />
            <strong>Client:</strong> ${escapeHtml(
              String(existing.full_name || "Unknown")
            )}<br />
            <strong>Email:</strong> ${escapeHtml(String(existing.email || "unknown"))}
          </p>
        </div>
      `,
      text: [
        `Billing recovered for ${String(existing.business_name || "Client")}.`,
        `Client: ${String(existing.full_name || "Unknown")} <${String(
          existing.email || "unknown"
        )}>`,
      ].join("\n"),
    });
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id || null;

  if (!customerId) return;

  const existing = await findClientByCustomerId(customerId);
  if (!existing) return;

  const nowIso = new Date().toISOString();
  const defaultGracePeriodEndsAt = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000
  ).toISOString();
  const hadExistingFailure = Boolean(existing.payment_failed_at);
  const gracePeriodEndsAt = hadExistingFailure
    ? String(existing.grace_period_ends_at || defaultGracePeriodEndsAt)
    : defaultGracePeriodEndsAt;

  let portalUrl = String(existing.payment_method_update_url || "");

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: billingPortalReturnUrl,
    });
    portalUrl = portalSession.url;
  } catch {
    // Keep the existing portal URL when Stripe portal creation fails.
  }

  const reminderCooldownMs = 24 * 60 * 60 * 1000;
  const lastReminderMs = existing.last_reminder_sent_at
    ? new Date(String(existing.last_reminder_sent_at)).getTime()
    : 0;
  const shouldSendReminder =
    !existing.last_reminder_sent_at ||
    Date.now() - lastReminderMs >= reminderCooldownMs;

  let reminderDelivered = false;

  if (portalUrl && shouldSendReminder) {
    const reminderResult = await sendEmail({
      to: [String(existing.email || "")],
      subject: `Action needed: update payment for ${String(
        existing.business_name || "your account"
      )}`,
      html: buildReminderEmailHtml(existing, portalUrl, gracePeriodEndsAt),
      text: buildReminderEmailText(existing, portalUrl, gracePeriodEndsAt),
    });

    reminderDelivered = reminderResult.delivered;
  }

  await supabaseAdmin
    .from("client_accounts")
    .update({
      latest_invoice_id: invoice.id,
      last_invoice_status: invoice.status,
      payment_failed_at: hadExistingFailure
        ? existing.payment_failed_at
        : nowIso,
      grace_period_ends_at: gracePeriodEndsAt || null,
      payment_method_update_url: portalUrl || null,
      last_reminder_sent_at: reminderDelivered ? nowIso : existing.last_reminder_sent_at,
      reminder_count: reminderDelivered
        ? Number(existing.reminder_count || 0) + 1
        : Number(existing.reminder_count || 0),
    })
    .eq("id", existing.id);

  if (!hadExistingFailure) {
    await sendAdminAlert({
      subject: `Payment failed: ${String(existing.business_name || "Client")}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;">
          <p><strong>Payment failed and grace period started.</strong></p>
          <p>
            <strong>Business:</strong> ${escapeHtml(
              String(existing.business_name || "Client")
            )}<br />
            <strong>Client:</strong> ${escapeHtml(
              String(existing.full_name || "Unknown")
            )}<br />
            <strong>Email:</strong> ${escapeHtml(String(existing.email || "unknown"))}<br />
            <strong>Grace period ends:</strong> ${escapeHtml(
              new Date(gracePeriodEndsAt).toLocaleDateString("en-US")
            )}
          </p>
          ${
            portalUrl
              ? `<p><a href="${portalUrl}" style="display:inline-block;padding:12px 18px;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;">Open billing portal</a></p>`
              : ""
          }
        </div>
      `,
      text: [
        `Payment failed for ${String(existing.business_name || "Client")}.`,
        `Client: ${String(existing.full_name || "Unknown")} <${String(
          existing.email || "unknown"
        )}>`,
        `Grace period ends: ${new Date(gracePeriodEndsAt).toLocaleDateString("en-US")}`,
        portalUrl ? `Billing portal: ${portalUrl}` : "Billing portal unavailable.",
      ].join("\n"),
    });
  }
}

async function findClientByCustomerId(customerId: string) {
  const { data } = await supabaseAdmin
    .from("client_accounts")
    .select("*")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  return data;
}

function buildReminderEmailText(
  client: Record<string, unknown>,
  portalUrl: string,
  gracePeriodEndsAt: string
) {
  return [
    `Hi ${String(client.full_name || "there")},`,
    "",
    `We were unable to process your most recent monthly payment for ${String(
      client.business_name || "your account"
    )}.`,
    "",
    "Please update your payment method using the secure link below:",
    portalUrl,
    "",
    `Your current grace period ends on ${new Date(gracePeriodEndsAt).toLocaleDateString(
      "en-US"
    )}. If payment is not resolved by then, your website may be shut down.`,
    "",
    "- Levamen Tech",
  ].join("\n");
}

function buildReminderEmailHtml(
  client: Record<string, unknown>,
  portalUrl: string,
  gracePeriodEndsAt: string
) {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;">
      <p>Hi ${escapeHtml(String(client.full_name || "there"))},</p>
      <p>We were unable to process your most recent monthly payment for <strong>${escapeHtml(
        String(client.business_name || "your account")
      )}</strong>.</p>
      <p>Please update your payment method using the secure link below:</p>
      <p>
        <a href="${portalUrl}" style="display:inline-block;padding:12px 18px;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;">
          Update payment method
        </a>
      </p>
      <p>Your current grace period ends on <strong>${escapeHtml(
        new Date(gracePeriodEndsAt).toLocaleDateString("en-US")
      )}</strong>. If payment is not resolved by then, your website may be shut down.</p>
      <p>- Levamen Tech</p>
    </div>
  `;
}
