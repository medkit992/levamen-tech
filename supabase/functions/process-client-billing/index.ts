import {
  createSupabaseAdminClient,
  HttpError,
  requireAuthorizedAdmin,
  requireAuthorizedAdminOrCronSecret,
} from "../_shared/admin.ts";
import { sendAdminAlert, sendEmail } from "../_shared/email.ts";
import { escapeHtml, jsonResponse, safeJson } from "../_shared/http.ts";
import { createStripeClient } from "../_shared/stripe.ts";
import * as jose from "jsr:@panva/jose@6";

const billingPortalReturnUrl =
  Deno.env.get("BILLING_PORTAL_RETURN_URL") || "https://levamentech.com/success";
const githubActionsBillingAudience =
  Deno.env.get("GITHUB_ACTIONS_BILLING_AUDIENCE") ||
  "levamen-tech-billing-cron";
const githubActionsBillingRepository =
  Deno.env.get("GITHUB_ACTIONS_BILLING_REPOSITORY") ||
  "medkit992/levamen-tech";
const githubActionsBillingBranchRef =
  Deno.env.get("GITHUB_ACTIONS_BILLING_BRANCH_REF") || "refs/heads/main";
const githubActionsBillingWorkflowRef =
  Deno.env.get("GITHUB_ACTIONS_BILLING_WORKFLOW_REF") ||
  `${githubActionsBillingRepository}/.github/workflows/billing-reminders.yml@${githubActionsBillingBranchRef}`;
const githubActionsBillingSubject = `repo:${githubActionsBillingRepository}:ref:${githubActionsBillingBranchRef}`;
const githubActionsAllowedEvents = new Set(
  (Deno.env.get("GITHUB_ACTIONS_BILLING_EVENTS") ||
    "schedule,workflow_dispatch")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
);
const githubActionsIssuer = "https://token.actions.githubusercontent.com";
const githubActionsJwks = jose.createRemoteJWKSet(
  new URL("https://token.actions.githubusercontent.com/.well-known/jwks")
);

const stripe = createStripeClient("Levamen Tech Billing Processor");

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return jsonResponse({ ok: true });
    }

    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed." }, 405);
    }

    const payload = await safeJson(req);
    const mode = payload.mode === "single" ? "single" : "daily";
    const clientId = typeof payload.clientId === "string" ? payload.clientId : null;
    const forceSendReminder = payload.forceSendReminder === true;
    const authHeader = req.headers.get("Authorization");

    if (mode === "single") {
      await requireAuthorizedAdmin(authHeader);
    } else {
      await requireDailyBillingInvoker({
        authHeader,
        cronSecretHeader: req.headers.get("x-billing-cron-secret"),
        githubOidcToken: req.headers.get("x-github-oidc-token"),
      });
    }

    const supabaseAdmin = createSupabaseAdminClient();

    if (mode === "single") {
      if (!clientId) {
        return jsonResponse({ error: "Missing clientId." }, 400);
      }

      const { data: client, error } = await supabaseAdmin
        .from("client_accounts")
        .select("*")
        .eq("id", clientId)
        .single();

      if (error || !client) {
        return jsonResponse({ error: "Client not found." }, 404);
      }

      const result = await processOneClient(supabaseAdmin, client, forceSendReminder);
      return jsonResponse({
        ok: true,
        message: result,
      });
    }

    const { data: clients, error } = await supabaseAdmin
      .from("client_accounts")
      .select("*")
      .not("payment_failed_at", "is", null);

    if (error) {
      return jsonResponse({ error: error.message }, 500);
    }

    const messages: string[] = [];

    for (const client of clients ?? []) {
      const result = await processOneClient(supabaseAdmin, client, false);
      messages.push(`${client.business_name}: ${result}`);
    }

    return jsonResponse({
      ok: true,
      processed: messages.length,
      messages,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status);
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse({ error: message }, 500);
  }
});

async function requireDailyBillingInvoker({
  authHeader,
  cronSecretHeader,
  githubOidcToken,
}: {
  authHeader: string | null;
  cronSecretHeader: string | null;
  githubOidcToken: string | null;
}) {
  if (githubOidcToken) {
    await verifyGithubActionsOidcToken(githubOidcToken);
    return;
  }

  await requireAuthorizedAdminOrCronSecret({
    authHeader,
    cronSecretHeader,
    secretEnvName: "BILLING_CRON_SECRET",
  });
}

async function verifyGithubActionsOidcToken(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, githubActionsJwks, {
      issuer: githubActionsIssuer,
      audience: githubActionsBillingAudience,
    });

    const repository =
      typeof payload.repository === "string" ? payload.repository : "";
    const workflowRef =
      typeof payload.workflow_ref === "string" ? payload.workflow_ref : "";
    const eventName =
      typeof payload.event_name === "string" ? payload.event_name : "";
    const ref = typeof payload.ref === "string" ? payload.ref : "";
    const sub = typeof payload.sub === "string" ? payload.sub : "";

    if (
      repository !== githubActionsBillingRepository ||
      workflowRef !== githubActionsBillingWorkflowRef ||
      ref !== githubActionsBillingBranchRef ||
      sub !== githubActionsBillingSubject ||
      !githubActionsAllowedEvents.has(eventName)
    ) {
      throw new HttpError(403, "Untrusted GitHub Actions token.");
    }
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }

    throw new HttpError(403, "Invalid GitHub Actions token.");
  }
}

async function processOneClient(
  supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>,
  client: Record<string, unknown>,
  forceSendReminder: boolean
) {
  const customerId = String(client.stripe_customer_id || "");
  if (!customerId) {
    return "Skipped, no Stripe customer id.";
  }

  let portalUrl = String(client.payment_method_update_url || "");

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: billingPortalReturnUrl,
    });
    portalUrl = portalSession.url;
  } catch {
    if (!portalUrl) {
      return "Could not generate a Stripe billing portal link.";
    }
  }

  const now = Date.now();
  const gracePeriodEndMs = client.grace_period_ends_at
    ? new Date(String(client.grace_period_ends_at)).getTime()
    : null;

  if (gracePeriodEndMs != null && now > gracePeriodEndMs) {
    return handleExpiredGracePeriod(supabaseAdmin, client, portalUrl);
  }

  const lastReminderMs = client.last_reminder_sent_at
    ? new Date(String(client.last_reminder_sent_at)).getTime()
    : 0;
  const reminderCooldownMs = 24 * 60 * 60 * 1000;
  const shouldSendReminder =
    forceSendReminder ||
    !client.last_reminder_sent_at ||
    now - lastReminderMs >= reminderCooldownMs;

  if (!shouldSendReminder) {
    return "No reminder needed yet.";
  }

  const reminderResult = await sendEmail({
    to: [String(client.email || "")],
    subject: `Action needed: update payment for ${String(
      client.business_name || "your account"
    )}`,
    html: buildReminderEmailHtml(client, portalUrl),
    text: buildReminderEmailText(client, portalUrl),
  });

  const updatePayload: Record<string, unknown> = {
    payment_method_update_url: portalUrl,
  };

  if (reminderResult.delivered) {
    updatePayload.last_reminder_sent_at = new Date().toISOString();
    updatePayload.reminder_count = Number(client.reminder_count || 0) + 1;
  }

  await supabaseAdmin
    .from("client_accounts")
    .update(updatePayload)
    .eq("id", client.id);

  if (reminderResult.delivered) {
    return "Reminder email sent.";
  }

  if (reminderResult.skipped) {
    return "Portal link generated but email skipped because RESEND_API_KEY is missing.";
  }

  return `Portal link generated, email failed: ${reminderResult.error}`;
}

async function handleExpiredGracePeriod(
  supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>,
  client: Record<string, unknown>,
  portalUrl: string
) {
  if (client.shutdown_marked_at) {
    await supabaseAdmin
      .from("client_accounts")
      .update({
        shutdown_required: true,
        payment_method_update_url: portalUrl,
      })
      .eq("id", client.id);

    return "Already marked for shutdown.";
  }

  const shutdownMarkedAt = new Date().toISOString();

  await supabaseAdmin
    .from("client_accounts")
    .update({
      shutdown_required: true,
      shutdown_marked_at: shutdownMarkedAt,
      payment_method_update_url: portalUrl,
    })
    .eq("id", client.id);

  const clientNotice = await sendEmail({
    to: [String(client.email || "")],
    subject: `Urgent: billing grace period ended for ${String(
      client.business_name || "your account"
    )}`,
    html: buildGraceEndedClientHtml(client, portalUrl),
    text: buildGraceEndedClientText(client, portalUrl),
  });

  const adminAlert = await sendAdminAlert({
    subject: `Grace period ended: ${String(client.business_name || "Client")}`,
    html: buildGraceEndedAdminHtml(client, portalUrl),
    text: buildGraceEndedAdminText(client, portalUrl),
  });

  const statusParts = ["Marked for shutdown."];

  if (clientNotice.delivered) {
    statusParts.push("Client notice sent.");
  } else if (clientNotice.skipped) {
    statusParts.push("Client notice skipped because email delivery is not configured.");
  } else {
    statusParts.push(`Client notice failed: ${clientNotice.error}`);
  }

  if (adminAlert.delivered) {
    statusParts.push("Admin alert sent.");
  } else if (adminAlert.skipped) {
    statusParts.push("Admin alert skipped because email delivery is not configured.");
  } else {
    statusParts.push(`Admin alert failed: ${adminAlert.error}`);
  }

  return statusParts.join(" ");
}

function buildReminderEmailText(
  client: Record<string, unknown>,
  portalUrl: string
) {
  const graceText = client.grace_period_ends_at
    ? new Date(String(client.grace_period_ends_at)).toLocaleDateString("en-US")
    : "within 30 days";

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
    `Your current grace period ends on ${graceText}. If payment is not resolved by then, your website may be shut down.`,
    "",
    "- Levamen Tech",
  ].join("\n");
}

function buildReminderEmailHtml(
  client: Record<string, unknown>,
  portalUrl: string
) {
  const graceText = client.grace_period_ends_at
    ? new Date(String(client.grace_period_ends_at)).toLocaleDateString("en-US")
    : "within 30 days";

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
        graceText
      )}</strong>. If payment is not resolved by then, your website may be shut down.</p>
      <p>- Levamen Tech</p>
    </div>
  `;
}

function buildGraceEndedClientText(
  client: Record<string, unknown>,
  portalUrl: string
) {
  return [
    `Hi ${String(client.full_name || "there")},`,
    "",
    `Your billing grace period for ${String(
      client.business_name || "your website"
    )} has ended without payment.`,
    "",
    "Your website is now queued for shutdown unless billing is resolved immediately.",
    "Update your payment method here:",
    portalUrl,
    "",
    "- Levamen Tech",
  ].join("\n");
}

function buildGraceEndedClientHtml(
  client: Record<string, unknown>,
  portalUrl: string
) {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;">
      <p>Hi ${escapeHtml(String(client.full_name || "there"))},</p>
      <p>Your billing grace period for <strong>${escapeHtml(
        String(client.business_name || "your website")
      )}</strong> has ended without payment.</p>
      <p>Your website is now queued for shutdown unless billing is resolved immediately.</p>
      <p>
        <a href="${portalUrl}" style="display:inline-block;padding:12px 18px;background:#7f1d1d;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;">
          Resolve billing now
        </a>
      </p>
      <p>- Levamen Tech</p>
    </div>
  `;
}

function buildGraceEndedAdminText(
  client: Record<string, unknown>,
  portalUrl: string
) {
  return [
    `Grace period ended for ${String(client.business_name || "Client")}.`,
    `Client: ${String(client.full_name || "Unknown")} <${String(
      client.email || "unknown"
    )}>`,
    `Billing portal: ${portalUrl}`,
    `Client record: ${String(client.id || "unknown")}`,
  ].join("\n");
}

function buildGraceEndedAdminHtml(
  client: Record<string, unknown>,
  portalUrl: string
) {
  return `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a;">
      <p><strong>Grace period ended.</strong></p>
      <p>
        <strong>Business:</strong> ${escapeHtml(
          String(client.business_name || "Client")
        )}<br />
        <strong>Client:</strong> ${escapeHtml(
          String(client.full_name || "Unknown")
        )}<br />
        <strong>Email:</strong> ${escapeHtml(String(client.email || "unknown"))}
      </p>
      <p>
        <a href="${portalUrl}" style="display:inline-block;padding:12px 18px;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;">
          Open billing portal
        </a>
      </p>
      <p>Client record id: ${escapeHtml(String(client.id || "unknown"))}</p>
    </div>
  `;
}
