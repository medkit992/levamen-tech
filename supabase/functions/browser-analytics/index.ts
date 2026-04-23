import { createSupabaseAdminClient, HttpError } from "../_shared/admin.ts";
import { jsonResponse, safeJson } from "../_shared/http.ts";

type BrowserAnalyticsPayload = {
  eventType?: unknown;
  eventName?: unknown;
  eventData?: unknown;
  path?: unknown;
  route?: unknown;
  origin?: unknown;
  referrer?: unknown;
  queryParams?: unknown;
  sessionId?: unknown;
  deviceId?: unknown;
  timestamp?: unknown;
};

const allowedHosts = [
  "levamentech.com",
  "www.levamentech.com",
  "localhost",
  "127.0.0.1",
];

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return jsonResponse({ ok: true });
    }

    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed." }, 405);
    }

    ensureAllowedRequest(req);

    const payload = (await safeJson(req)) as BrowserAnalyticsPayload;
    const row = await mapPayloadToRow(payload);

    const supabaseAdmin = createSupabaseAdminClient();
    const { error } = await supabaseAdmin
      .from("vercel_analytics_events")
      .upsert([row], { onConflict: "fingerprint", ignoreDuplicates: true });

    if (error) {
      return jsonResponse({ error: error.message }, 500);
    }

    return jsonResponse({ ok: true, inserted: 1 });
  } catch (error) {
    if (error instanceof HttpError) {
      return jsonResponse({ error: error.message }, error.status);
    }

    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unknown error." },
      500
    );
  }
});

function ensureAllowedRequest(req: Request) {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  if (!isAllowedUrl(origin) && !isAllowedUrl(referer)) {
    throw new HttpError(403, "Origin not allowed.");
  }
}

function isAllowedUrl(value: string | null) {
  if (!value) {
    return false;
  }

  try {
    const host = new URL(value).hostname.toLowerCase();
    if (allowedHosts.includes(host)) {
      return true;
    }

    return host.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

async function mapPayloadToRow(payload: BrowserAnalyticsPayload) {
  const timestamp = normalizeTimestamp(payload.timestamp);
  const normalizedEvent = {
    schema_name: "browser.analytics.v1",
    event_type: normalizeEventType(payload.eventType),
    event_name: asString(payload.eventName),
    occurred_at: timestamp,
    path: asString(payload.path) || "/",
    route: asString(payload.route),
    origin: asString(payload.origin),
    referrer: asString(payload.referrer),
    query_params: asString(payload.queryParams),
    session_id: stringOrNull(payload.sessionId),
    device_id: stringOrNull(payload.deviceId),
    event_data: normalizeEventData(payload.eventData),
    raw_payload: payload,
  };

  return {
    ...normalizedEvent,
    fingerprint: await createFingerprint(normalizedEvent),
  };
}

function normalizeEventType(value: unknown) {
  return value === "pageview" ? "pageview" : "event";
}

function normalizeEventData(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value;
}

function normalizeTimestamp(value: unknown) {
  if (typeof value === "number") {
    return new Date(value).toISOString();
  }

  if (typeof value === "string") {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return new Date(parsed).toISOString();
    }
  }

  return new Date().toISOString();
}

function asString(value: unknown) {
  return typeof value === "string" ? value : null;
}

function stringOrNull(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return null;
}

async function createFingerprint(event: Record<string, unknown>) {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(JSON.stringify(event))
  );

  return [...new Uint8Array(buffer)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}
