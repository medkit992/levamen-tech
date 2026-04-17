import Stripe from "https://esm.sh/stripe@18.4.0?target=denonext";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const billingPortalReturnUrl =
  Deno.env.get("BILLING_PORTAL_RETURN_URL") || "https://levamentech.com/success";
const adminFromEmail =
  Deno.env.get("ADMIN_FROM_EMAIL") || "admin@levamentech.com";

const stripe = new Stripe(stripeSecretKey, {
  appInfo: {
    name: "Levamen Tech Billing Processor",
    version: "1.0.0",
  },
});

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return json({ ok: true });
    }

    if (req.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
    const payload = await safeJson(req);

    const mode = payload?.mode === "single" ? "single" : "daily";
    const clientId = typeof payload?.clientId === "string" ? payload.clientId : null;
    const forceSendReminder = payload?.forceSendReminder === true;

    if (mode === "single") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return json({ error: "Missing Authorization header" }, 401);
      }

      const userClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
          headers: { Authorization: authHeader },
        },
      });

      const {
        data: { user },
        error: authError,
      } = await userClient.auth.getUser();

      if (authError || !user) {
        return json({ error: "Unauthorized" }, 401);
      }

      if (!clientId) {
        return json({ error: "Missing clientId" }, 400);
      }

      const { data: client, error } = await supabaseAdmin
        .from("client_accounts")
        .select("*")
        .eq("id", clientId)
        .single();

      if (error || !client) {
        return json({ error: "Client not found" }, 404);
      }

      const result = await processOneClient(supabaseAdmin, client, forceSendReminder);
      return json({
        ok: true,
        message: result,
      });
    }

    const { data: clients, error } = await supabaseAdmin
      .from("client_accounts")
      .select("*")
      .not("payment_failed_at", "is", null);

    if (error) {
      return json({ error: error.message }, 500);
    }

    const messages: string[] = [];

    for (const client of clients ?? []) {
      const result = await processOneClient(supabaseAdmin, client, false);
      messages.push(`${client.business_name}: ${result}`);
    }

    return json({
      ok: true,
      processed: messages.length,
      messages,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return json({ error: message }, 500);
  }
});

async function processOneClient(supabaseAdmin: ReturnType<typeof createClient>, client: any, forceSendReminder: boolean) {
  const now = Date.now();

  if (!client.stripe_customer_id) {
    return "Skipped, no Stripe customer id";
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: client.stripe_customer_id,
    return_url: billingPortalReturnUrl,
  });

  const gracePeriodEndMs = client.grace_period_ends_at
    ? new Date(client.grace_period_ends_at).getTime()
    : null;

  const shouldShutdown =
    gracePeriodEndMs != null && now > gracePeriodEndMs;

  if (shouldShutdown) {
    await supabaseAdmin
      .from("client_accounts")
      .update({
        shutdown_required: true,
        payment_method_update_url: portalSession.url,
      })
      .eq("id", client.id);

    return "Marked for shutdown";
  }

  const lastReminderMs = client.last_reminder_sent_at
    ? new Date(client.last_reminder_sent_at).getTime()
    : 0;

  const reminderCooldownMs = 24 * 60 * 60 * 1000;
  const shouldSendReminder =
    forceSendReminder || !client.last_reminder_sent_at || now - lastReminderMs >= reminderCooldownMs;

  if (!shouldSendReminder) {
    return "No reminder needed yet";
  }

  if (!resendApiKey) {
    await supabaseAdmin
      .from("client_accounts")
      .update({
        payment_method_update_url: portalSession.url,
      })
      .eq("id", client.id);

    return "Portal link generated but email skipped because RESEND_API_KEY is missing";
  }

  const graceText = client.grace_period_ends_at
    ? new Date(client.grace_period_ends_at).toLocaleDateString("en-US")
    : "within 30 days";

  const subject = `Action needed: update payment for ${client.business_name}`;
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;">
      <p>Hi ${escapeHtml(client.full_name)},</p>
      <p>We were unable to process your most recent monthly payment for <strong>${escapeHtml(
        client.business_name
      )}</strong>.</p>
      <p>Please update your payment method using the secure link below:</p>
      <p>
        <a href="${portalSession.url}" style="display:inline-block;padding:12px 18px;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;">
          Update Payment Method
        </a>
      </p>
      <p>You have a 30 day grace period to restore billing. Your current grace period ends on <strong>${escapeHtml(
        graceText
      )}</strong>. If payment is not resolved by then, your website may be shut down.</p>
      <p>If you have already updated your billing details, you can ignore this message.</p>
      <p>- Levamen Tech</p>
    </div>
  `;

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Levamen Tech <${adminFromEmail}>`,
      to: [client.email],
      subject,
      html,
    }),
  });

  if (!resendResponse.ok) {
    const resendText = await resendResponse.text();

    await supabaseAdmin
      .from("client_accounts")
      .update({
        payment_method_update_url: portalSession.url,
      })
      .eq("id", client.id);

    return `Portal link generated, email failed: ${resendText}`;
  }

  await supabaseAdmin
    .from("client_accounts")
    .update({
      payment_method_update_url: portalSession.url,
      last_reminder_sent_at: new Date().toISOString(),
      reminder_count: (client.reminder_count ?? 0) + 1,
    })
    .eq("id", client.id);

  return "Reminder email sent";
}

async function safeJson(req: Request) {
  try {
    return await req.json();
  } catch {
    return {};
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function json(body: Record<string, unknown>, status = 200) {
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