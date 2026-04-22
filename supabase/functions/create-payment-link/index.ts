import { createSupabaseAdminClient, HttpError, requireAuthorizedAdmin } from "../_shared/admin.ts";
import { isEmailDeliveryConfigured, sendEmail } from "../_shared/email.ts";
import { escapeHtml, jsonResponse } from "../_shared/http.ts";
import {
  buildCheckoutLineItems,
  createStripeClient,
  ensureCustomerForInquiry,
  formatCurrency,
} from "../_shared/stripe.ts";

const stripe = createStripeClient("Levamen Tech Admin");

const successUrl =
  Deno.env.get("STRIPE_SUCCESS_URL") ||
  "https://levamentech.com/success?session_id={CHECKOUT_SESSION_ID}";
const cancelUrl =
  Deno.env.get("STRIPE_CANCEL_URL") || "https://levamentech.com/failure";

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return jsonResponse({ ok: true });
    }

    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed." }, 405);
    }

    // Protected admin action; access is enforced inside the function.
    await requireAuthorizedAdmin(req.headers.get("Authorization"));

    const payload = await req.json();
    const inquiryId =
      payload && typeof payload === "object" && typeof payload.inquiryId === "string"
        ? payload.inquiryId
        : "";

    if (!inquiryId) {
      return jsonResponse({ error: "Missing inquiryId." }, 400);
    }

    const supabaseAdmin = createSupabaseAdminClient();
    const { data: inquiry, error: inquiryError } = await supabaseAdmin
      .from("pricing_inquiries")
      .select("*")
      .eq("id", inquiryId)
      .single();

    if (inquiryError || !inquiry) {
      return jsonResponse({ error: "Inquiry not found." }, 404);
    }

    const existingSessionId =
      typeof inquiry.stripe_checkout_session_id === "string"
        ? inquiry.stripe_checkout_session_id
        : "";

    if (existingSessionId) {
      try {
        const existingSession = await stripe.checkout.sessions.retrieve(
          existingSessionId
        );

        if (existingSession.status === "open" && existingSession.url) {
          const resendResult = await maybeSendPaymentLinkEmail(
            inquiry,
            existingSession.url
          );
          const existingCustomerId =
            typeof existingSession.customer === "string"
              ? existingSession.customer
              : existingSession.customer?.id || null;

          return jsonResponse({
            ok: true,
            reused: true,
            url: existingSession.url,
            sessionId: existingSession.id,
            customerId: existingCustomerId,
            customerEmail: inquiry.email,
            emailSubject: buildPaymentEmailSubject(inquiry),
            emailBody: buildPaymentEmailText(inquiry, existingSession.url),
            emailDeliveryStatus: resendResult.status,
            emailDeliveryError: resendResult.error,
            lineItems: [],
          });
        }
      } catch {
        // Fall through to create a fresh Checkout Session when the saved one
        // is no longer retrievable.
      }
    }

    const { lineItems, hasRecurring, itemNames } = await buildCheckoutLineItems(
      stripe,
      inquiry
    );
    const customerId = await ensureCustomerForInquiry(stripe, inquiry);

    const session = await stripe.checkout.sessions.create({
      mode: hasRecurring ? "subscription" : "payment",
      customer: customerId,
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      billing_address_collection: "auto",
      phone_number_collection: {
        enabled: true,
      },
      customer_update: {
        address: "auto",
        name: "auto",
      },
      metadata: {
        inquiry_id: inquiry.id,
        business_name: inquiry.business_name ?? "",
        full_name: inquiry.full_name ?? "",
        email: inquiry.email ?? "",
      },
      client_reference_id: inquiry.id,
      subscription_data: hasRecurring
        ? {
            metadata: {
              inquiry_id: inquiry.id,
              business_name: inquiry.business_name ?? "",
              full_name: inquiry.full_name ?? "",
              email: inquiry.email ?? "",
            },
          }
        : undefined,
      payment_intent_data: hasRecurring
        ? undefined
        : {
            metadata: {
              inquiry_id: inquiry.id,
              business_name: inquiry.business_name ?? "",
              full_name: inquiry.full_name ?? "",
              email: inquiry.email ?? "",
            },
          },
    });

    const sentAt = new Date().toISOString();

    const { error: updateError } = await supabaseAdmin
      .from("pricing_inquiries")
      .update({
        status: "payment_sent",
        payment_link_url: session.url,
        stripe_checkout_session_id: session.id,
        payment_sent_at: sentAt,
        last_contacted_at: sentAt,
      })
      .eq("id", inquiry.id);

    if (updateError) {
      return jsonResponse(
        {
          error: `Stripe checkout created, but DB update failed: ${updateError.message}`,
        },
        500
      );
    }

    const resendResult = await maybeSendPaymentLinkEmail(inquiry, session.url || "");

    return jsonResponse({
      ok: true,
      reused: false,
      url: session.url,
      sessionId: session.id,
      customerId,
      customerEmail: inquiry.email,
      emailSubject: buildPaymentEmailSubject(inquiry),
      emailBody: buildPaymentEmailText(inquiry, session.url || ""),
      emailDeliveryStatus: resendResult.status,
      emailDeliveryError: resendResult.error,
      lineItems: itemNames,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status);
    }

    const message =
      error instanceof Error ? error.message : "Unknown server error";

    return jsonResponse({ error: message }, 500);
  }
});

function buildPaymentEmailSubject(inquiry: Record<string, unknown>) {
  return `Levamen Tech payment link for ${String(
    inquiry.business_name || "your project"
  )}`;
}

function buildPaymentEmailText(
  inquiry: Record<string, unknown>,
  checkoutUrl: string
) {
  return [
    `Hi ${String(inquiry.full_name || "there")},`,
    "",
    "Thanks again for your interest in working with Levamen Tech.",
    "Here is your secure payment link to get started:",
    checkoutUrl,
    "",
    `Plan: ${String(inquiry.plan_name || "Custom package")}`,
    `One-time total: ${formatCurrency(Number(inquiry.total_setup || 0))}`,
    `Monthly total: ${formatCurrency(Number(inquiry.total_monthly || 0))}`,
    "",
    "If you have any questions before paying, just reply to this email.",
    "",
    "- Levamen Tech",
  ].join("\n");
}

function buildPaymentEmailHtml(
  inquiry: Record<string, unknown>,
  checkoutUrl: string
) {
  const fullName = escapeHtml(String(inquiry.full_name || "there"));
  const planName = escapeHtml(String(inquiry.plan_name || "Custom package"));
  const businessName = escapeHtml(String(inquiry.business_name || "your project"));
  const totalSetup = formatCurrency(Number(inquiry.total_setup || 0));
  const totalMonthly = formatCurrency(Number(inquiry.total_monthly || 0));

  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;">
      <p>Hi ${fullName},</p>
      <p>Thanks again for your interest in working with <strong>Levamen Tech</strong>.</p>
      <p>Your reviewed payment link for <strong>${businessName}</strong> is ready:</p>
      <p>
        <a href="${checkoutUrl}" style="display:inline-block;padding:12px 18px;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;">
          Complete payment
        </a>
      </p>
      <p><strong>Plan:</strong> ${planName}<br />
      <strong>One-time total:</strong> ${escapeHtml(totalSetup)}<br />
      <strong>Monthly total:</strong> ${escapeHtml(totalMonthly)}</p>
      <p>If you have any questions before paying, just reply to this email.</p>
      <p>- Levamen Tech</p>
    </div>
  `;
}

async function maybeSendPaymentLinkEmail(
  inquiry: Record<string, unknown>,
  checkoutUrl: string
) {
  if (!checkoutUrl) {
    return {
      status: "failed",
      error: "Stripe checkout URL was not generated.",
    };
  }

  if (!isEmailDeliveryConfigured()) {
    return {
      status: "skipped",
      error: "RESEND_API_KEY is not configured.",
    };
  }

  const result = await sendEmail({
    to: [String(inquiry.email || "")],
    subject: buildPaymentEmailSubject(inquiry),
    html: buildPaymentEmailHtml(inquiry, checkoutUrl),
    text: buildPaymentEmailText(inquiry, checkoutUrl),
  });

  if (result.delivered) {
    return {
      status: "sent",
      error: null,
    };
  }

  return {
    status: result.skipped ? "skipped" : "failed",
    error: result.error,
  };
}
