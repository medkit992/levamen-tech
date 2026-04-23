import {
  createSupabaseAdminClient,
  HttpError,
  requireAuthorizedAdmin,
} from "../_shared/admin.ts";
import { jsonResponse } from "../_shared/http.ts";

type AnalyticsEventRow = {
  id: string;
  event_type: string;
  event_name: string | null;
  path: string;
  referrer: string | null;
  country: string | null;
  session_id: string | null;
  occurred_at: string;
};

type RankedCount = {
  label: string;
  count: number;
};

Deno.serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return jsonResponse({ ok: true });
    }

    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed." }, 405);
    }

    await requireAuthorizedAdmin(req.headers.get("Authorization"));

    const supabaseAdmin = createSupabaseAdminClient();
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabaseAdmin
      .from("vercel_analytics_events")
      .select("id, event_type, event_name, path, referrer, country, session_id, occurred_at")
      .gte("occurred_at", thirtyDaysAgo.toISOString())
      .order("occurred_at", { ascending: false })
      .limit(5000);

    if (error) {
      return jsonResponse({ error: error.message }, 500);
    }

    const rows = (data ?? []) as AnalyticsEventRow[];
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const pageviews30d = rows.filter((row) => row.event_type === "pageview");
    const pageviews7d = pageviews30d.filter(
      (row) => new Date(row.occurred_at) >= sevenDaysAgo
    );
    const conversions30d = rows.filter((row) => row.event_type === "event");
    const conversions7d = conversions30d.filter(
      (row) => new Date(row.occurred_at) >= sevenDaysAgo
    );

    return jsonResponse({
      ok: true,
      summary: {
        pageviews7d: pageviews7d.length,
        pageviews30d: pageviews30d.length,
        uniqueSessions7d: countDistinct(pageviews7d.map((row) => row.session_id)),
        uniqueSessions30d: countDistinct(pageviews30d.map((row) => row.session_id)),
        conversions7d: conversions7d.length,
        conversions30d: conversions30d.length,
      },
      dailyPageviews: buildDailySeries(pageviews30d, 7),
      topPages: rankCounts(pageviews30d.map((row) => normalizeLabel(row.path)), 8),
      topReferrers: rankCounts(
        pageviews30d.map((row) => normalizeReferrer(row.referrer)),
        6
      ),
      topCountries: rankCounts(
        pageviews30d.map((row) => normalizeLabel(row.country, "Unknown")),
        6
      ),
      topEvents: rankCounts(
        conversions30d.map((row) => normalizeLabel(row.event_name, "Unnamed event")),
        8
      ),
      recentEvents: rows.slice(0, 12).map((row) => ({
        id: row.id,
        eventType: row.event_type,
        eventName: row.event_name,
        path: row.path,
        country: row.country,
        occurredAt: row.occurred_at,
      })),
    });
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

function countDistinct(values: Array<string | null>) {
  return new Set(values.filter(Boolean)).size;
}

function normalizeLabel(value: string | null | undefined, fallback = "Unknown") {
  if (!value) {
    return fallback;
  }

  const normalized = value.trim();
  return normalized || fallback;
}

function normalizeReferrer(value: string | null) {
  if (!value) {
    return "Direct / none";
  }

  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

function rankCounts(values: string[], limit: number): RankedCount[] {
  const counts = new Map<string, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

function buildDailySeries(rows: AnalyticsEventRow[], days: number) {
  const today = new Date();
  const buckets = new Map<string, number>();

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(date.getDate() - index);
    const key = date.toISOString().slice(0, 10);
    buckets.set(key, 0);
  }

  for (const row of rows) {
    const key = new Date(row.occurred_at).toISOString().slice(0, 10);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }

  return [...buckets.entries()].map(([date, count]) => ({ date, count }));
}
