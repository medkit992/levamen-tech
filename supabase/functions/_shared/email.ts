const sharedResendApiKey = Deno.env.get("RESEND_API_KEY") || "";
const adminFromEmail =
  Deno.env.get("ADMIN_FROM_EMAIL") || "admin@levamentech.com";

function parseRecipients(raw: string | undefined, fallback: string) {
  const values = (raw || fallback)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return values.length > 0 ? values : [fallback];
}

export function isEmailDeliveryConfigured() {
  return Boolean(sharedResendApiKey);
}

export function getAdminNotificationRecipients() {
  return parseRecipients(
    Deno.env.get("ADMIN_NOTIFICATION_EMAILS") || "",
    adminFromEmail
  );
}

export async function sendEmail({
  to,
  subject,
  html,
  text,
  from,
  replyTo,
  apiKeyOverride,
}: {
  to: string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string | string[];
  apiKeyOverride?: string;
}) {
  const resendApiKey = apiKeyOverride || sharedResendApiKey;

  if (!resendApiKey) {
    return {
      delivered: false,
      skipped: true,
      error: "RESEND_API_KEY is not configured.",
      id: null,
    };
  }

  const normalizedReplyTo = Array.isArray(replyTo)
    ? replyTo.filter(Boolean)
    : replyTo
      ? [replyTo]
      : [];

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "levamen-tech-outreach/1.0",
    },
    body: JSON.stringify({
      from: from || `Levamen Tech <${adminFromEmail}>`,
      to,
      subject,
      html,
      text,
      reply_to: normalizedReplyTo.length > 0 ? normalizedReplyTo : undefined,
    }),
  });

  if (!response.ok) {
    return {
      delivered: false,
      skipped: false,
      error: await response.text(),
      id: null,
    };
  }

  const payload = await response.json().catch(() => ({}));

  return {
    delivered: true,
    skipped: false,
    error: null,
    id: typeof payload?.id === "string" ? payload.id : null,
  };
}

export async function sendAdminAlert({
  subject,
  html,
  text,
}: {
  subject: string;
  html: string;
  text?: string;
}) {
  return sendEmail({
    to: getAdminNotificationRecipients(),
    subject,
    html,
    text,
  });
}
