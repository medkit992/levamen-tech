const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
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
  return Boolean(resendApiKey);
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
}: {
  to: string[];
  subject: string;
  html: string;
  text?: string;
}) {
  if (!resendApiKey) {
    return {
      delivered: false,
      skipped: true,
      error: "RESEND_API_KEY is not configured.",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `Levamen Tech <${adminFromEmail}>`,
      to,
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    return {
      delivered: false,
      skipped: false,
      error: await response.text(),
    };
  }

  return {
    delivered: true,
    skipped: false,
    error: null,
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

