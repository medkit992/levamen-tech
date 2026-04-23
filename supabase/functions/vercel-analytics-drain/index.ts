import { createSupabaseAdminClient, HttpError } from "../_shared/admin.ts";
import { jsonResponse } from "../_shared/http.ts";

type RawAnalyticsEvent = Record<string, unknown>;

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return jsonResponse({ ok: true });
    }

    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed." }, 405);
    }

    const rawBody = await req.text();
    await verifyDrainSignature(rawBody, req.headers.get("x-vercel-signature"));

    const events = parseAnalyticsPayload(rawBody);
    if (events.length === 0) {
      return jsonResponse({ ok: true, inserted: 0 });
    }

    const rows = await Promise.all(events.map((event) => mapEventToRow(event)));
    const supabaseAdmin = createSupabaseAdminClient();
    const { error } = await supabaseAdmin
      .from("vercel_analytics_events")
      .upsert(rows, { onConflict: "fingerprint", ignoreDuplicates: true });

    if (error) {
      return jsonResponse({ error: error.message }, 500);
    }

    return jsonResponse({ ok: true, inserted: rows.length });
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

async function verifyDrainSignature(rawBody: string, signatureHeader: string | null) {
  const secret = Deno.env.get("VERCEL_ANALYTICS_DRAIN_SECRET") || "";
  if (!secret) {
    return;
  }

  if (!signatureHeader) {
    throw new HttpError(401, "Missing Vercel drain signature.");
  }

  const provided = signatureHeader.trim().toLowerCase();
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(rawBody)
  );
  const expected = toHex(signatureBuffer);

  if (!timingSafeEqual(expected, provided)) {
    throw new HttpError(401, "Invalid Vercel drain signature.");
  }
}

function parseAnalyticsPayload(rawBody: string): RawAnalyticsEvent[] {
  const trimmed = rawBody.trim();
  if (!trimmed) {
    return [];
  }

  if (trimmed.startsWith("[")) {
    const parsed = JSON.parse(trimmed);
    return Array.isArray(parsed) ? parsed.filter(isRecord) : [];
  }

  if (trimmed.startsWith("{")) {
    const parsed = JSON.parse(trimmed);
    return isRecord(parsed) ? [parsed] : [];
  }

  return trimmed
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line))
    .filter(isRecord);
}

async function mapEventToRow(event: RawAnalyticsEvent) {
  const normalizedEvent = {
    schema_name: asString(event.schema) || "vercel.analytics.v2",
    event_type: asString(event.eventType) || "pageview",
    event_name: asString(event.eventName),
    occurred_at: toIsoTimestamp(event.timestamp),
    path: asString(event.path) || "/",
    route: asString(event.route),
    origin: asString(event.origin),
    referrer: asString(event.referrer),
    query_params: asString(event.queryParams),
    country: asString(event.country),
    region: asString(event.region),
    city: asString(event.city),
    os_name: asString(event.osName),
    os_version: asString(event.osVersion),
    client_name: asString(event.clientName),
    client_type: asString(event.clientType),
    client_version: asString(event.clientVersion),
    browser_engine: asString(event.browserEngine),
    browser_engine_version: asString(event.browserEngineVersion),
    device_type: asString(event.deviceType),
    device_brand: asString(event.deviceBrand),
    device_model: asString(event.deviceModel),
    sdk_name: asString(event.sdkName),
    sdk_version: asString(event.sdkVersion),
    vercel_environment: asString(event.vercelEnvironment),
    vercel_url: asString(event.vercelUrl),
    deployment: asString(event.deployment),
    project_id: asString(event.projectId),
    owner_id: asString(event.ownerId),
    session_id: stringOrNull(event.sessionId),
    device_id: stringOrNull(event.deviceId),
    event_data: parseEventData(event.eventData),
    raw_payload: event,
  };

  return {
    ...normalizedEvent,
    fingerprint: await createFingerprint(normalizedEvent),
  };
}

function parseEventData(value: unknown) {
  if (value == null) {
    return {};
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return isRecord(parsed) ? parsed : { value };
    } catch {
      return { value };
    }
  }

  return isRecord(value) ? value : { value };
}

function toIsoTimestamp(value: unknown) {
  if (typeof value === "number") {
    return new Date(value).toISOString();
  }

  if (typeof value === "string") {
    const timestamp = Date.parse(value);
    if (!Number.isNaN(timestamp)) {
      return new Date(timestamp).toISOString();
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

function isRecord(value: unknown): value is RawAnalyticsEvent {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

async function createFingerprint(event: Record<string, unknown>) {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest(
    "SHA-256",
    encoder.encode(JSON.stringify(event))
  );

  return toHex(buffer);
}

function toHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < a.length; index += 1) {
    mismatch |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }

  return mismatch === 0;
}
