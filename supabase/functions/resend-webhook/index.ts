import { Webhook } from "npm:svix";
import { createSupabaseAdminClient } from "../_shared/admin.ts";
import { handleResendWebhookEvent } from "../_shared/outreach.ts";

Deno.serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const webhookSecret = Deno.env.get("RESEND_WEBHOOK_SECRET") || "";
    if (!webhookSecret) {
      return new Response("Missing RESEND_WEBHOOK_SECRET.", { status: 500 });
    }

    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return new Response("Missing webhook signature headers.", { status: 400 });
    }

    const payload = await req.text();
    const verifier = new Webhook(webhookSecret);
    const event = verifier.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as Record<string, unknown>;

    const supabaseAdmin = createSupabaseAdminClient();
    await handleResendWebhookEvent(supabaseAdmin, event, svixId);

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
});
