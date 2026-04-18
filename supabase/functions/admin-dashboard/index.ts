import {
  createSupabaseAdminClient,
  HttpError,
  requireAuthorizedAdmin,
} from "../_shared/admin.ts";
import { jsonResponse, safeJson } from "../_shared/http.ts";

const REVIEW_ACTIONS = new Set(["approve", "delete"]);
const INQUIRY_STATUSES = new Set([
  "new",
  "contacted",
  "approved",
  "payment_sent",
  "payment_expired",
  "paid",
]);
const WEBSITE_STATUSES = new Set(["active", "paused", "shut_down"]);

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return jsonResponse({ ok: true });
    }

    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed." }, 405);
    }

    await requireAuthorizedAdmin(req.headers.get("Authorization"));

    const payload = await safeJson(req);
    const action = typeof payload.action === "string" ? payload.action : "load";
    const supabaseAdmin = createSupabaseAdminClient();

    switch (action) {
      case "load":
        return await handleLoad(supabaseAdmin);
      case "review":
        return await handleReviewAction(supabaseAdmin, payload);
      case "inquiry":
        return await handleInquiryAction(supabaseAdmin, payload);
      case "client":
        return await handleClientAction(supabaseAdmin, payload);
      default:
        return jsonResponse({ error: "Unsupported admin action." }, 400);
    }
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status);
    }

    const message =
      error instanceof Error ? error.message : "Unknown server error";

    return jsonResponse({ error: message }, 500);
  }
});

async function handleLoad(
  supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>
) {
  const [reviewsRes, inquiriesRes, clientsRes] = await Promise.all([
    supabaseAdmin.from("reviews").select("*").order("created_at", {
      ascending: false,
    }),
    supabaseAdmin.from("pricing_inquiries").select("*").order("created_at", {
      ascending: false,
    }),
    supabaseAdmin.from("client_accounts").select("*").order("updated_at", {
      ascending: false,
    }),
  ]);

  const errors = [reviewsRes.error, inquiriesRes.error, clientsRes.error]
    .filter((value) => value != null)
    .map((value) => value?.message)
    .filter(Boolean);

  if (errors.length > 0) {
    return jsonResponse(
      {
        error: errors.join(" | "),
      },
      500
    );
  }

  return jsonResponse({
    ok: true,
    reviews: reviewsRes.data ?? [],
    inquiries: inquiriesRes.data ?? [],
    clients: clientsRes.data ?? [],
  });
}

async function handleReviewAction(
  supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>,
  payload: Record<string, unknown>
) {
  const reviewId = typeof payload.reviewId === "string" ? payload.reviewId : "";
  const operation =
    typeof payload.operation === "string" ? payload.operation : "";

  if (!reviewId || !REVIEW_ACTIONS.has(operation)) {
    return jsonResponse({ error: "Invalid review action payload." }, 400);
  }

  if (operation === "approve") {
    const { error } = await supabaseAdmin
      .from("reviews")
      .update({ approved: true })
      .eq("id", reviewId);

    if (error) {
      return jsonResponse({ error: error.message }, 500);
    }

    return jsonResponse({
      ok: true,
      message: "Review approved.",
    });
  }

  const { error } = await supabaseAdmin
    .from("reviews")
    .delete()
    .eq("id", reviewId);

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  return jsonResponse({
    ok: true,
    message: "Review deleted.",
  });
}

async function handleInquiryAction(
  supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>,
  payload: Record<string, unknown>
) {
  const inquiryId =
    typeof payload.inquiryId === "string" ? payload.inquiryId : "";
  const status = typeof payload.status === "string" ? payload.status : "";

  if (!inquiryId || !INQUIRY_STATUSES.has(status)) {
    return jsonResponse({ error: "Invalid inquiry action payload." }, 400);
  }

  const nowIso = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from("pricing_inquiries")
    .update({
      status,
      last_contacted_at: nowIso,
    })
    .eq("id", inquiryId);

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  return jsonResponse({
    ok: true,
    message: "Inquiry updated.",
  });
}

async function handleClientAction(
  supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>,
  payload: Record<string, unknown>
) {
  const clientId = typeof payload.clientId === "string" ? payload.clientId : "";
  const operation =
    typeof payload.operation === "string" ? payload.operation : "";

  if (!clientId) {
    return jsonResponse({ error: "Missing clientId." }, 400);
  }

  if (operation === "updateWebsiteInfo") {
    const websiteLabel = normalizeOptionalString(payload.websiteLabel);
    const websiteUrl = normalizeWebsiteUrl(payload.websiteUrl);

    const { error } = await supabaseAdmin
      .from("client_accounts")
      .update({
        website_label: websiteLabel,
        website_url: websiteUrl,
      })
      .eq("id", clientId);

    if (error) {
      return jsonResponse({ error: error.message }, 500);
    }

    return jsonResponse({
      ok: true,
      message: "Website info updated.",
    });
  }

  if (operation === "markWebsiteStatus") {
    const websiteStatus =
      typeof payload.websiteStatus === "string" ? payload.websiteStatus : "";

    if (!WEBSITE_STATUSES.has(websiteStatus)) {
      return jsonResponse({ error: "Invalid website status." }, 400);
    }

    const updatePayload: Record<string, unknown> = {
      website_status: websiteStatus,
    };

    if (websiteStatus === "active") {
      updatePayload.shutdown_required = false;
    }

    if (websiteStatus === "shut_down") {
      updatePayload.shutdown_required = false;
      updatePayload.shutdown_marked_at = new Date().toISOString();
    }

    const { error } = await supabaseAdmin
      .from("client_accounts")
      .update(updatePayload)
      .eq("id", clientId);

    if (error) {
      return jsonResponse({ error: error.message }, 500);
    }

    return jsonResponse({
      ok: true,
      message: `Website marked as ${websiteStatus.replaceAll("_", " ")}.`,
    });
  }

  return jsonResponse({ error: "Unsupported client action." }, 400);
}

function normalizeOptionalString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized ? normalized : null;
}

function normalizeWebsiteUrl(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  if (!normalized) {
    return null;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new HttpError(400, "Website URL must be a valid absolute URL.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new HttpError(400, "Website URL must use http or https.");
  }

  return parsed.toString();
}
