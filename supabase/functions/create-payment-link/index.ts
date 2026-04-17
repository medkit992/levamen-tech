// supabase/functions/create-payment-link/index.ts

import Stripe from "https://esm.sh/stripe@18.4.0?target=denonext";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const stripe = new Stripe(stripeSecretKey, {
  appInfo: {
    name: "Levamen Tech Admin",
    version: "1.0.0",
  },
});

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response("ok", {
        headers: corsHeaders,
      });
    }

    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed." }, 405);
    }

    if (!stripeSecretKey) {
      return jsonResponse({ error: "Missing STRIPE_SECRET_KEY." }, 500);
    }

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
      return jsonResponse(
        { error: "Missing default Supabase environment variables." },
        500
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Missing Authorization header." }, 401);
    }

    const { inquiryId } = await req.json();

    if (!inquiryId) {
      return jsonResponse({ error: "Missing inquiryId." }, 400);
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();

    if (authError || !user) {
      return jsonResponse({ error: "Unauthorized." }, 401);
    }

    const { data: inquiry, error: inquiryError } = await supabaseAdmin
      .from("pricing_inquiries")
      .select("*")
      .eq("id", inquiryId)
      .single();

    if (inquiryError || !inquiry) {
      return jsonResponse({ error: "Inquiry not found." }, 404);
    }

    const setupTotal =
      Number(inquiry.plan_setup_price || 0) +
      Number(inquiry.addon_one_time_total || 0) +
      Number(inquiry.domain_one_time_fee || 0);

    const monthlyTotal =
      Number(inquiry.plan_monthly_price || 0) +
      Number(inquiry.addon_monthly_total || 0) +
      Number(inquiry.domain_privacy_monthly_fee || 0);

    if (setupTotal <= 0 && monthlyTotal <= 0) {
      return jsonResponse(
        { error: "Inquiry does not contain any billable amount." },
        400
      );
    }

    const customer = await stripe.customers.create({
      email: inquiry.email,
      name: inquiry.full_name,
      metadata: {
        inquiry_id: inquiry.id,
        business_name: inquiry.business_name ?? "",
      },
    });

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    if (setupTotal > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(setupTotal * 100),
          product_data: {
            name: `${inquiry.plan_name} Setup`,
            description: `One-time setup for ${inquiry.business_name}`,
          },
        },
      });
    }

    if (monthlyTotal > 0) {
      lineItems.push({
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(monthlyTotal * 100),
          recurring: {
            interval: "month",
          },
          product_data: {
            name: `${inquiry.plan_name} Monthly Maintenance`,
            description: `Monthly recurring service for ${inquiry.business_name}`,
          },
        },
      });
    }

    const successUrl =
      Deno.env.get("STRIPE_SUCCESS_URL") ||
      "https://levamentech.com/success?session_id={CHECKOUT_SESSION_ID}";

    const cancelUrl =
      Deno.env.get("STRIPE_CANCEL_URL") ||
      "https://levamentech.com/failure";

    const session = await stripe.checkout.sessions.create({
      mode: monthlyTotal > 0 ? "subscription" : "payment",
      customer: customer.id,
      customer_email: inquiry.email,
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        inquiry_id: inquiry.id,
        business_name: inquiry.business_name ?? "",
        full_name: inquiry.full_name ?? "",
      },
      client_reference_id: inquiry.id,
      subscription_data:
        monthlyTotal > 0
          ? {
              metadata: {
                inquiry_id: inquiry.id,
                business_name: inquiry.business_name ?? "",
              },
            }
          : undefined,
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
          error: `Stripe session created, but DB update failed: ${updateError.message}`,
        },
        500
      );
    }

    const emailSubject = `Levamen Tech payment link for ${inquiry.business_name}`;
    const emailBody = [
      `Hi ${inquiry.full_name},`,
      ``,
      `Thanks again for your interest in working with Levamen Tech.`,
      `Here is your secure payment link to get started:`,
      `${session.url}`,
      ``,
      `Plan: ${inquiry.plan_name}`,
      `One-time total: $${Number(inquiry.total_setup || 0).toFixed(2)}`,
      `Monthly total: $${Number(inquiry.total_monthly || 0).toFixed(2)}`,
      ``,
      `If you have any questions before paying, just reply to this email.`,
      ``,
      `- Levamen Tech`,
    ].join("\n");

    return jsonResponse({
      ok: true,
      url: session.url,
      sessionId: session.id,
      customerEmail: inquiry.email,
      emailSubject,
      emailBody,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";

    return jsonResponse({ error: message }, 500);
  }
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders,
  });
}