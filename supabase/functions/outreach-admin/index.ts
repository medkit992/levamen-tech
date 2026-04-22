import {
  createSupabaseAdminClient,
  HttpError,
  requireAuthorizedAdmin,
} from "../_shared/admin.ts";
import { jsonResponse, safeJson } from "../_shared/http.ts";
import {
  approveAndSendOutreachDraft,
  denyOutreachDraft,
  loadOutreachDashboard,
  runOutreachAutomation,
  setOutreachAutomationEnabled,
  updateOutreachDraft,
  updateOutreachSettings,
} from "../_shared/outreach.ts";

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return jsonResponse({ ok: true });
    }

    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed." }, 405);
    }

    const adminUser = await requireAuthorizedAdmin(req.headers.get("Authorization"));
    const payload = await safeJson(req);
    const action = typeof payload.action === "string" ? payload.action : "load";
    const supabaseAdmin = createSupabaseAdminClient();

    switch (action) {
      case "load": {
        const data = await loadOutreachDashboard(supabaseAdmin);
        return jsonResponse({ ok: true, ...data });
      }

      case "save_settings": {
        const settings = await updateOutreachSettings(supabaseAdmin, payload);
        return jsonResponse({
          ok: true,
          settings,
          message: "Outreach settings saved.",
        });
      }

      case "set_enabled": {
        const enabled = payload.enabled === true;
        const settings = await setOutreachAutomationEnabled(supabaseAdmin, enabled);
        return jsonResponse({
          ok: true,
          settings,
          message: enabled
            ? "Outreach automation enabled."
            : "Outreach automation disabled.",
        });
      }

      case "run_now": {
        const result = await runOutreachAutomation({
          supabaseAdmin,
          trigger: "manual",
          initiatedByEmail: adminUser.email ?? null,
          ignoreEnabled: true,
        });

        return jsonResponse({
          ok: true,
          result,
          message: result.skipped
            ? String(result.reason || "Run skipped.")
            : `Run completed. Created ${result.createdDrafts} draft(s).`,
        });
      }

      case "update_draft": {
        await updateOutreachDraft(supabaseAdmin, payload);
        return jsonResponse({
          ok: true,
          message: "Draft updated.",
        });
      }

      case "deny_draft": {
        await denyOutreachDraft(
          supabaseAdmin,
          payload,
          adminUser.email?.trim().toLowerCase() || "admin"
        );
        return jsonResponse({
          ok: true,
          message: "Draft denied.",
        });
      }

      case "approve_and_send": {
        await approveAndSendOutreachDraft(
          supabaseAdmin,
          payload,
          adminUser.email?.trim().toLowerCase() || "admin"
        );
        return jsonResponse({
          ok: true,
          message: "Draft approved and sent.",
        });
      }

      default:
        return jsonResponse({ error: "Unsupported outreach admin action." }, 400);
    }
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status);
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse({ error: message }, 500);
  }
});
