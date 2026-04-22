import {
  createSupabaseAdminClient,
  HttpError,
  requireAuthorizedAdminOrCronSecret,
} from "../_shared/admin.ts";
import { jsonResponse, safeJson } from "../_shared/http.ts";
import {
  cleanupFakeOutreachData,
  inspectOutreachDraft,
  runFakeOutreachTest,
  runOutreachAutomation,
} from "../_shared/outreach.ts";
import * as jose from "jsr:@panva/jose@6";

const githubActionsOutreachAudience =
  Deno.env.get("GITHUB_ACTIONS_OUTREACH_AUDIENCE") ||
  "levamen-tech-outreach-cron";
const githubActionsOutreachRepository =
  Deno.env.get("GITHUB_ACTIONS_OUTREACH_REPOSITORY") ||
  "medkit992/levamen-tech";
const githubActionsOutreachBranchRef =
  Deno.env.get("GITHUB_ACTIONS_OUTREACH_BRANCH_REF") || "refs/heads/main";
const githubActionsOutreachWorkflowRef =
  Deno.env.get("GITHUB_ACTIONS_OUTREACH_WORKFLOW_REF") ||
  `${githubActionsOutreachRepository}/.github/workflows/outreach-automation.yml@${githubActionsOutreachBranchRef}`;
const githubActionsOutreachSubject = `repo:${githubActionsOutreachRepository}:ref:${githubActionsOutreachBranchRef}`;
const githubActionsAllowedEvents = new Set(
  (Deno.env.get("GITHUB_ACTIONS_OUTREACH_EVENTS") || "schedule,workflow_dispatch")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
);
const githubActionsIssuer = "https://token.actions.githubusercontent.com";
const githubActionsJwks = jose.createRemoteJWKSet(
  new URL("https://token.actions.githubusercontent.com/.well-known/jwks")
);

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return jsonResponse({ ok: true });
    }

    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed." }, 405);
    }

    const payload = await safeJson(req);
    const mode =
      payload.mode === "fake_test" ||
      payload.mode === "inspect_draft" ||
      payload.mode === "cleanup_fake_tests"
        ? payload.mode
        : "daily";

    await requireOutreachInvoker({
      authHeader: req.headers.get("Authorization"),
      cronSecretHeader: req.headers.get("x-outreach-cron-secret"),
      githubOidcToken: req.headers.get("x-github-oidc-token"),
    });

    const supabaseAdmin = createSupabaseAdminClient();

    if (mode === "fake_test") {
      const scenario =
        payload.scenario === "bounced" || payload.scenario === "complained"
          ? payload.scenario
          : "delivered";
      const result = await runFakeOutreachTest({
        supabaseAdmin,
        scenario,
      });

      return jsonResponse({
        ok: true,
        result,
      });
    }

    if (mode === "inspect_draft") {
      const draftId = typeof payload.draftId === "string" ? payload.draftId : "";
      if (!draftId) {
        return jsonResponse({ error: "Missing draftId." }, 400);
      }

      const inspection = await inspectOutreachDraft(supabaseAdmin, draftId);
      const resendEmail =
        inspection.draft.provider_email_id != null
          ? await retrieveResendEmail(inspection.draft.provider_email_id)
          : null;

      return jsonResponse({
        ok: true,
        inspection,
        resendEmail,
      });
    }

    if (mode === "cleanup_fake_tests") {
      const result = await cleanupFakeOutreachData(supabaseAdmin);
      return jsonResponse({
        ok: true,
        result,
      });
    }

    const result = await runOutreachAutomation({
      supabaseAdmin,
      trigger: "scheduled",
    });

    return jsonResponse({
      ok: true,
      result,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status);
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse({ error: message }, 500);
  }
});

async function requireOutreachInvoker({
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
    secretEnvName: "OUTREACH_CRON_SECRET",
  });
}

async function verifyGithubActionsOidcToken(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, githubActionsJwks, {
      issuer: githubActionsIssuer,
      audience: githubActionsOutreachAudience,
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
      repository !== githubActionsOutreachRepository ||
      workflowRef !== githubActionsOutreachWorkflowRef ||
      ref !== githubActionsOutreachBranchRef ||
      sub !== githubActionsOutreachSubject ||
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

async function retrieveResendEmail(emailId: string) {
  const resendApiKey =
    Deno.env.get("OUTREACH_RESEND_API_KEY") ||
    Deno.env.get("RESEND_API_KEY") ||
    "";
  if (!resendApiKey) {
    return null;
  }

  const response = await fetch(`https://api.resend.com/emails/${emailId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "User-Agent": "levamen-tech-outreach/1.0",
    },
  });

  if (!response.ok) {
    return {
      error: await response.text(),
    };
  }

  return await response.json();
}
