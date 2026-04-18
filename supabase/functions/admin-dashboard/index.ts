import {
  createSupabaseAdminClient,
  HttpError,
  requireAuthorizedAdmin,
} from "../_shared/admin.ts";
import { jsonResponse, safeJson } from "../_shared/http.ts";

const REVIEW_ACTIONS = new Set(["approve", "delete"]);
const INQUIRY_ACTIONS = new Set(["update", "delete"]);
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
  const operation =
    typeof payload.operation === "string" ? payload.operation : "";
  const status = typeof payload.status === "string" ? payload.status : "";

  if (!inquiryId) {
    return jsonResponse({ error: "Missing inquiryId." }, 400);
  }

  if (INQUIRY_ACTIONS.has(operation)) {
    if (operation === "update") {
      return await handleInquiryUpdate(supabaseAdmin, inquiryId, payload);
    }

    return await handleInquiryDelete(supabaseAdmin, inquiryId);
  }

  if (!INQUIRY_STATUSES.has(status)) {
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

async function handleInquiryUpdate(
  supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>,
  inquiryId: string,
  payload: Record<string, unknown>
) {
  const { data: existing, error: existingError } = await supabaseAdmin
    .from("pricing_inquiries")
    .select("*")
    .eq("id", inquiryId)
    .maybeSingle();

  if (existingError) {
    return jsonResponse({ error: existingError.message }, 500);
  }

  if (!existing) {
    return jsonResponse({ error: "Inquiry not found." }, 404);
  }

  const fullName = normalizeRequiredString(payload.fullName, "Full name");
  const email = normalizeEmail(payload.email);
  const businessName = normalizeRequiredString(
    payload.businessName,
    "Business name"
  );
  const phone = normalizeOptionalString(payload.phone);
  const businessType = normalizeOptionalString(payload.businessType);
  const timeline = normalizeOptionalString(payload.timeline);
  const pagesNeeded = normalizeOptionalString(payload.pagesNeeded);
  const domainName = normalizeOptionalString(payload.domainName);
  const inspiration = normalizeOptionalString(payload.inspiration);
  const goals = normalizeOptionalString(payload.goals);
  const notes = normalizeOptionalString(payload.notes);

  const updatePayload: Record<string, unknown> = {
    full_name: fullName,
    email,
    business_name: businessName,
    phone,
    business_type: businessType,
    timeline,
    pages_needed: pagesNeeded,
    domain_name: domainName,
    inspiration,
    goals,
    notes,
  };

  const nextSnapshot = patchInquirySnapshot(existing.inquiry_snapshot, {
    fullName,
    email,
    businessName,
    phone,
    businessType,
    timeline,
    pagesNeeded,
    domainName,
    inspiration,
    goals,
    notes,
  });

  if (nextSnapshot) {
    updatePayload.inquiry_snapshot = nextSnapshot;
  }

  const { error } = await supabaseAdmin
    .from("pricing_inquiries")
    .update(updatePayload)
    .eq("id", inquiryId);

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  return jsonResponse({
    ok: true,
    message: "Request details updated.",
  });
}

async function handleInquiryDelete(
  supabaseAdmin: ReturnType<typeof createSupabaseAdminClient>,
  inquiryId: string
) {
  const { data: inquiry, error: inquiryError } = await supabaseAdmin
    .from("pricing_inquiries")
    .select(
      "id, status, payment_link_url, stripe_checkout_session_id, payment_sent_at"
    )
    .eq("id", inquiryId)
    .maybeSingle();

  if (inquiryError) {
    return jsonResponse({ error: inquiryError.message }, 500);
  }

  if (!inquiry) {
    return jsonResponse({ error: "Inquiry not found." }, 404);
  }

  const { data: linkedClient, error: clientError } = await supabaseAdmin
    .from("client_accounts")
    .select("id")
    .eq("pricing_inquiry_id", inquiryId)
    .maybeSingle();

  if (clientError) {
    return jsonResponse({ error: clientError.message }, 500);
  }

  if (linkedClient) {
    return jsonResponse(
      {
        error:
          "This request is linked to a client account and cannot be deleted.",
      },
      400
    );
  }

  const hasBillingHistory =
    Boolean(inquiry.payment_link_url) ||
    Boolean(inquiry.stripe_checkout_session_id) ||
    Boolean(inquiry.payment_sent_at) ||
    ["payment_sent", "payment_expired", "paid"].includes(
      String(inquiry.status || "")
    );

  if (hasBillingHistory) {
    return jsonResponse(
      {
        error:
          "This request already has Stripe billing history. Keep it for recordkeeping instead of deleting it.",
      },
      400
    );
  }

  const { error } = await supabaseAdmin
    .from("pricing_inquiries")
    .delete()
    .eq("id", inquiryId);

  if (error) {
    return jsonResponse({ error: error.message }, 500);
  }

  return jsonResponse({
    ok: true,
    message: "Request deleted.",
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

function normalizeRequiredString(value: unknown, label: string) {
  if (typeof value !== "string") {
    throw new HttpError(400, `${label} is required.`);
  }

  const normalized = value.trim();
  if (!normalized) {
    throw new HttpError(400, `${label} is required.`);
  }

  return normalized;
}

function normalizeEmail(value: unknown) {
  const email = normalizeRequiredString(value, "Email").toLowerCase();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    throw new HttpError(400, "Email must be valid.");
  }

  return email;
}

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? { ...(value as Record<string, unknown>) }
    : null;
}

function patchInquirySnapshot(
  snapshotValue: unknown,
  updates: {
    fullName: string;
    email: string;
    businessName: string;
    phone: string | null;
    businessType: string | null;
    timeline: string | null;
    pagesNeeded: string | null;
    domainName: string | null;
    inspiration: string | null;
    goals: string | null;
    notes: string | null;
  }
) {
  const snapshot = asRecord(snapshotValue);
  if (!snapshot) {
    return null;
  }

  const customer = asRecord(snapshot.customer) ?? {};
  customer.fullName = updates.fullName;
  customer.email = updates.email;
  customer.businessName = updates.businessName;
  customer.phone = updates.phone ?? "";
  customer.businessType = updates.businessType ?? "";
  customer.timeline = updates.timeline ?? "";
  customer.pagesNeeded = updates.pagesNeeded ?? "";
  customer.inspiration = updates.inspiration ?? "";
  customer.goals = updates.goals ?? "";
  customer.notes = updates.notes ?? "";
  snapshot.customer = customer;

  const domain = asRecord(snapshot.domain);
  if (domain) {
    domain.domainName = updates.domainName ?? "";
    snapshot.domain = domain;
  }

  return snapshot;
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
