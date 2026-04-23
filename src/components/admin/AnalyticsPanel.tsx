import { type ReactNode, useEffect, useState } from "react"
import { BarChart3, Globe2, MousePointerClick, Route } from "lucide-react"
import { invokeProtectedFunction } from "../../lib/supabase"

type AnalyticsPayload = {
  summary: {
    pageviews7d: number
    pageviews30d: number
    uniqueSessions7d: number
    uniqueSessions30d: number
    conversions7d: number
    conversions30d: number
  }
  dailyPageviews: Array<{
    date: string
    count: number
  }>
  topPages: Array<{
    label: string
    count: number
  }>
  topReferrers: Array<{
    label: string
    count: number
  }>
  topCountries: Array<{
    label: string
    count: number
  }>
  topEvents: Array<{
    label: string
    count: number
  }>
  recentEvents: Array<{
    id: string
    eventType: string
    eventName: string | null
    path: string
    country: string | null
    occurredAt: string
  }>
}

const surfaceCardClass =
  "rounded-[1.85rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.985),rgba(247,250,252,0.96))] p-6 text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.14)]"

function MetricCard({
  icon,
  label,
  value,
  description,
}: {
  icon: ReactNode
  label: string
  value: string | number
  description: string
}) {
  return (
    <div className="relative overflow-hidden rounded-[1.65rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.11),rgba(255,255,255,0.05))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-slate-300/80">
            {label}
          </div>
          <div className="mt-3 text-3xl font-extrabold tracking-[-0.05em] text-white">
            {value}
          </div>
          <p className="mt-2 text-sm leading-7 text-slate-200/85">{description}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/12 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          {icon}
        </div>
      </div>
    </div>
  )
}

export default function AnalyticsPanel() {
  const [data, setData] = useState<AnalyticsPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    void loadAnalytics()
  }, [])

  async function loadAnalytics() {
    setLoading(true)
    setError("")

    try {
      const payload = await invokeProtectedFunction<AnalyticsPayload>("analytics-admin")
      setData(payload)
    } catch (nextError) {
      setError(
        nextError instanceof Error ? nextError.message : "Could not load analytics."
      )
    } finally {
      setLoading(false)
    }
  }

  if (loading && !data) {
    return (
      <div className="rounded-[1.6rem] border border-white/12 bg-white/[0.08] p-8 text-sm leading-7 text-slate-200/85 shadow-[0_18px_50px_rgba(0,0,0,0.16)] backdrop-blur-xl">
        Loading site traffic data...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-[1.6rem] border border-red-400/22 bg-red-500/12 p-8 text-sm leading-7 text-red-100 shadow-[0_18px_50px_rgba(0,0,0,0.16)] backdrop-blur-xl">
        {error}
      </div>
    )
  }

  if (!data) {
    return null
  }

  const maxDailyPageviews = Math.max(...data.dailyPageviews.map((item) => item.count), 1)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Pageviews (7d)"
          value={data.summary.pageviews7d}
          description="Tracked pageviews over the last 7 days."
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <MetricCard
          label="Pageviews (30d)"
          value={data.summary.pageviews30d}
          description="Tracked pageviews over the last 30 days."
          icon={<Route className="h-5 w-5" />}
        />
        <MetricCard
          label="Sessions (30d)"
          value={data.summary.uniqueSessions30d}
          description="Approximate unique sessions from analytics events."
          icon={<Globe2 className="h-5 w-5" />}
        />
        <MetricCard
          label="Conversions (30d)"
          value={data.summary.conversions30d}
          description="Tracked CTA and custom conversion events."
          icon={<MousePointerClick className="h-5 w-5" />}
        />
      </div>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className={surfaceCardClass}>
          <div className="text-[0.74rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
            Traffic trend
          </div>
          <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.05em] text-slate-950">
            Daily pageviews
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
            This is a lightweight internal view of the last 7 days of pageview
            traffic captured from Vercel analytics events.
          </p>

          <div className="mt-6 grid grid-cols-7 gap-3">
            {data.dailyPageviews.map((item) => {
              const height = `${Math.max((item.count / maxDailyPageviews) * 100, item.count > 0 ? 16 : 6)}%`

              return (
                <div key={item.date} className="flex flex-col items-center gap-3">
                  <div className="flex h-44 w-full items-end rounded-[1.2rem] border border-slate-200/80 bg-slate-50/80 p-3">
                    <div
                      className="w-full rounded-[0.9rem] bg-[linear-gradient(180deg,#0f172a,#2563eb)]"
                      style={{ height }}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-extrabold tracking-[-0.02em] text-slate-950">
                      {item.count}
                    </div>
                    <div className="text-xs uppercase tracking-[0.16em] text-slate-400">
                      {item.date.slice(5)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className={surfaceCardClass}>
            <div className="text-[0.74rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
              Top pages
            </div>
            <div className="mt-4 space-y-3">
              {data.topPages.length === 0 ? (
                <EmptyList message="No analytics rows have been ingested yet." />
              ) : (
                data.topPages.map((item) => (
                  <RankedRow key={item.label} label={item.label} count={item.count} />
                ))
              )}
            </div>
          </div>

          <div className={surfaceCardClass}>
            <div className="text-[0.74rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
              Top events
            </div>
            <div className="mt-4 space-y-3">
              {data.topEvents.length === 0 ? (
                <EmptyList message="Custom events will appear here after CTA tracking fires in production." />
              ) : (
                data.topEvents.map((item) => (
                  <RankedRow key={item.label} label={item.label} count={item.count} />
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className={surfaceCardClass}>
          <div className="text-[0.74rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
            Referrers
          </div>
          <div className="mt-4 space-y-3">
            {data.topReferrers.length === 0 ? (
              <EmptyList message="No referrer data is available yet." />
            ) : (
              data.topReferrers.map((item) => (
                <RankedRow key={item.label} label={item.label} count={item.count} />
              ))
            )}
          </div>
        </div>

        <div className={surfaceCardClass}>
          <div className="text-[0.74rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
            Geography
          </div>
          <div className="mt-4 space-y-3">
            {data.topCountries.length === 0 ? (
              <EmptyList message="No geographic data is available yet." />
            ) : (
              data.topCountries.map((item) => (
                <RankedRow key={item.label} label={item.label} count={item.count} />
              ))
            )}
          </div>
        </div>

        <div className={surfaceCardClass}>
          <div className="text-[0.74rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
            Recent analytics events
          </div>
          <div className="mt-4 space-y-3">
            {data.recentEvents.length === 0 ? (
              <EmptyList message="No recent analytics events have been ingested." />
            ) : (
              data.recentEvents.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[1.2rem] border border-slate-200/80 bg-slate-50/80 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-extrabold tracking-[-0.02em] text-slate-950">
                      {item.eventName || item.eventType}
                    </div>
                    <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.18em] text-slate-500">
                      {item.eventType}
                    </div>
                  </div>
                  <div className="mt-2 text-sm leading-7 text-slate-600">
                    {item.path}
                    {item.country ? ` / ${item.country}` : ""}
                  </div>
                  <div className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                    {new Date(item.occurredAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function RankedRow({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[1.2rem] border border-slate-200/80 bg-slate-50/80 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
      <div className="min-w-0 break-words text-sm font-semibold leading-7 text-slate-700 [overflow-wrap:anywhere]">
        {label}
      </div>
      <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-extrabold tracking-[-0.02em] text-slate-950">
        {count}
      </div>
    </div>
  )
}

function EmptyList({ message }: { message: string }) {
  return (
    <div className="rounded-[1.2rem] border border-slate-200/80 bg-slate-50/80 px-4 py-4 text-sm leading-7 text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
      {message}
    </div>
  )
}
