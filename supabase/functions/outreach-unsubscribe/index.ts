import { createSupabaseAdminClient, HttpError } from "../_shared/admin.ts";
import { jsonResponse, safeJson } from "../_shared/http.ts";
import { unsubscribeOutreachEmail } from "../_shared/outreach.ts";

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return jsonResponse({ ok: true });
    }

    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed." }, 405);
    }

    const payload = await safeJson(req);
    const token = typeof payload.token === "string" ? payload.token.trim() : "";

    if (!token) {
      return jsonResponse({ error: "Missing unsubscribe token." }, 400);
    }

    const supabaseAdmin = createSupabaseAdminClient();
    const result = await unsubscribeOutreachEmail(supabaseAdmin, token);

    return jsonResponse({
      ok: true,
      result,
      message: `You will no longer receive outreach emails for ${result.businessName}.`,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status);
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse({ error: message }, 500);
  }
});
