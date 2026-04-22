import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  MailSearch,
  PauseCircle,
  Pencil,
  PlayCircle,
  RefreshCw,
  Save,
  Send,
  ShieldAlert,
  X,
  XCircle,
} from "lucide-react"
import { invokeProtectedFunction } from "../../lib/supabase"

type OutreachSettings = {
  enabled: boolean
  sender_name: string
  sender_email: string
  reply_to_email: string
  website_url: string
  contact_url: string
  mailing_address: string
  daily_draft_limit: number
  daily_send_limit: number
  max_pending_approval: number
  target_cities: string[]
  target_industries: string[]
  last_run_at: string | null
  last_run_status: string
}

type OutreachProspect = {
  id: string
  business_name: string
  primary_type: string | null
  city: string | null
  region: string | null
  formatted_address: string | null
  website_url: string | null
  website_quality: string
  website_quality_reasons: string[]
  phone: string | null
  contact_email: string | null
  qualification_summary: string | null
  personalization_context: string | null
  demo_slug: string | null
  status: string
  created_at: string
}

type OutreachDraft = {
  id: string
  recipient_email: string
  subject: string
  body_text: string
  personalization_summary: string
  demo_slug: string | null
  demo_url: string | null
  ai_model: string | null
  status: string
  provider_last_event: string | null
  provider_error: string | null
  sent_at: string | null
  created_at: string
  prospect: OutreachProspect | null
}

type OutreachDashboardData = {
  settings: OutreachSettings
  stats: {
    pendingApprovalCount: number
    needsContactCount: number
    sentTodayCount: number
    draftedTodayCount: number
    suppressedCount: number
  }
  pendingDrafts: OutreachDraft[]
  recentSentDrafts: OutreachDraft[]
  needsContactProspects: OutreachProspect[]
  recentEvents: Array<{
    id: string
    event_type: string
    created_at: string
    provider_message_id: string | null
  }>
}

type SettingsForm = {
  senderName: string
  senderEmail: string
  replyToEmail: string
  websiteUrl: string
  contactUrl: string
  mailingAddress: string
  dailyDraftLimit: string
  dailySendLimit: string
  maxPendingApproval: string
  targetCities: string
  targetIndustries: string
}

type DraftEditorForm = {
  draftId: string
  recipientEmail: string
  subject: string
  bodyText: string
  demoSlug: string
  personalizationSummary: string
}

const demoOptions = [
  "landscaping",
  "plumbing",
  "hvac",
  "electrician",
  "roofing",
  "cleaning-services",
  "pressure-washing",
  "auto-detailing",
  "restaurants",
  "cafes-coffee-shops",
  "barbershops",
  "salons",
  "fitness-personal-training",
  "real-estate",
  "photography",
  "dental-medical",
  "law-firm",
  "construction",
  "moving-company",
  "home-remodeling",
]

const surfaceCardClass =
  "rounded-[1.85rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.985),rgba(247,250,252,0.96))] p-6 text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.14)]"

const surfaceMetricClass =
  "rounded-[1.3rem] border border-slate-200/75 bg-white/80 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"

const surfaceFooterClass =
  "mt-5 flex flex-wrap gap-3 rounded-[1.3rem] border border-slate-200/75 bg-slate-50/85 p-3"

const fieldClass =
  "w-full rounded-[1rem] border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-100"

const surfaceButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-slate-200/90 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-[0_10px_26px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"

const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-slate-950/10 bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-[0_16px_30px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"

const dangerButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 shadow-[0_12px_26px_rgba(248,113,113,0.14)] transition hover:-translate-y-0.5 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"

function formatDate(value: string | null | undefined, fallback = "--") {
  return value ? new Date(value).toLocaleString() : fallback
}

function MetricCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode
  label: string
  value: number
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

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 px-5 py-5 text-sm leading-7 text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]">
      {message}
    </div>
  )
}

function createSettingsForm(settings: OutreachSettings): SettingsForm {
  return {
    senderName: settings.sender_name,
    senderEmail: settings.sender_email,
    replyToEmail: settings.reply_to_email,
    websiteUrl: settings.website_url,
    contactUrl: settings.contact_url,
    mailingAddress: settings.mailing_address,
    dailyDraftLimit: String(settings.daily_draft_limit),
    dailySendLimit: String(settings.daily_send_limit),
    maxPendingApproval: String(settings.max_pending_approval),
    targetCities: settings.target_cities.join("\n"),
    targetIndustries: settings.target_industries.join("\n"),
  }
}

function createDraftEditorForm(draft: OutreachDraft): DraftEditorForm {
  return {
    draftId: draft.id,
    recipientEmail: draft.recipient_email,
    subject: draft.subject,
    bodyText: draft.body_text,
    demoSlug: draft.demo_slug || "plumbing",
    personalizationSummary: draft.personalization_summary,
  }
}

export default function OutreachPanel() {
  const [data, setData] = useState<OutreachDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionMessage, setActionMessage] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [settingsForm, setSettingsForm] = useState<SettingsForm | null>(null)
  const [editor, setEditor] = useState<DraftEditorForm | null>(null)

  useEffect(() => {
    void loadDashboard()
    // loadDashboard is intentionally triggered once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pendingDrafts = data?.pendingDrafts ?? []
  const needsContactProspects = data?.needsContactProspects ?? []
  const recentSentDrafts = data?.recentSentDrafts ?? []
  const recentEvents = data?.recentEvents ?? []

  const mailingAddressMissing = useMemo(() => {
    return !settingsForm?.mailingAddress.trim()
  }, [settingsForm])

  async function callAction(body: Record<string, unknown>) {
    const data = await invokeProtectedFunction<Record<string, unknown>>(
      "outreach-admin",
      body
    )

    if (data?.error) {
      throw new Error(String(data.error))
    }

    return data
  }

  async function loadDashboard(options?: { preserveMessage?: boolean }) {
    setLoading(true)
    if (!options?.preserveMessage) {
      setActionMessage("")
    }

    try {
      const response = (await callAction({ action: "load" })) as OutreachDashboardData
      setData(response)
      setSettingsForm(createSettingsForm(response.settings))
    } catch (error) {
      setActionMessage(
        error instanceof Error ? error.message : "Could not load outreach data."
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleEnabled(enabled: boolean) {
    setBusyId("toggle-enabled")
    setActionMessage("")

    try {
      const response = await callAction({
        action: "set_enabled",
        enabled,
      })
      await loadDashboard({ preserveMessage: true })
      setActionMessage(String(response.message || "Automation status updated."))
    } catch (error) {
      setActionMessage(
        error instanceof Error ? error.message : "Could not update automation state."
      )
    } finally {
      setBusyId(null)
    }
  }

  async function handleRunNow() {
    setBusyId("run-now")
    setActionMessage("")

    try {
      const response = await callAction({ action: "run_now" })
      await loadDashboard({ preserveMessage: true })
      setActionMessage(String(response.message || "Manual run completed."))
    } catch (error) {
      setActionMessage(
        error instanceof Error ? error.message : "Could not run the workflow."
      )
    } finally {
      setBusyId(null)
    }
  }

  async function handleSaveSettings() {
    if (!settingsForm) return

    setBusyId("save-settings")
    setActionMessage("")

    try {
      const response = await callAction({
        action: "save_settings",
        senderName: settingsForm.senderName,
        senderEmail: settingsForm.senderEmail,
        replyToEmail: settingsForm.replyToEmail,
        websiteUrl: settingsForm.websiteUrl,
        contactUrl: settingsForm.contactUrl,
        mailingAddress: settingsForm.mailingAddress,
        dailyDraftLimit: Number(settingsForm.dailyDraftLimit),
        dailySendLimit: Number(settingsForm.dailySendLimit),
        maxPendingApproval: Number(settingsForm.maxPendingApproval),
        targetCities: settingsForm.targetCities
          .split("\n")
          .map((value) => value.trim())
          .filter(Boolean),
        targetIndustries: settingsForm.targetIndustries
          .split("\n")
          .map((value) => value.trim())
          .filter(Boolean),
      })
      await loadDashboard({ preserveMessage: true })
      setActionMessage(String(response.message || "Settings saved."))
    } catch (error) {
      setActionMessage(
        error instanceof Error ? error.message : "Could not save outreach settings."
      )
    } finally {
      setBusyId(null)
    }
  }

  async function handleApproveAndSend(draftId: string) {
    setBusyId(`approve:${draftId}`)
    setActionMessage("")

    try {
      const response = await callAction({
        action: "approve_and_send",
        draftId,
      })
      await loadDashboard({ preserveMessage: true })
      setActionMessage(String(response.message || "Draft sent."))
    } catch (error) {
      setActionMessage(
        error instanceof Error ? error.message : "Could not send outreach draft."
      )
    } finally {
      setBusyId(null)
    }
  }

  async function handleDenyDraft(draftId: string) {
    setBusyId(`deny:${draftId}`)
    setActionMessage("")

    try {
      const response = await callAction({
        action: "deny_draft",
        draftId,
      })
      await loadDashboard({ preserveMessage: true })
      setActionMessage(String(response.message || "Draft denied."))
    } catch (error) {
      setActionMessage(
        error instanceof Error ? error.message : "Could not deny outreach draft."
      )
    } finally {
      setBusyId(null)
    }
  }

  async function handleSaveDraftEdit() {
    if (!editor) return

    setBusyId(`edit:${editor.draftId}`)
    setActionMessage("")

    try {
      const response = await callAction({
        action: "update_draft",
        draftId: editor.draftId,
        recipientEmail: editor.recipientEmail,
        subject: editor.subject,
        bodyText: editor.bodyText,
        demoSlug: editor.demoSlug,
        personalizationSummary: editor.personalizationSummary,
      })
      await loadDashboard({ preserveMessage: true })
      setEditor(null)
      setActionMessage(String(response.message || "Draft updated."))
    } catch (error) {
      setActionMessage(
        error instanceof Error ? error.message : "Could not update the draft."
      )
    } finally {
      setBusyId(null)
    }
  }

  if (loading && !data) {
    return <EmptyState message="Loading outreach automation..." />
  }

  if (!data || !settingsForm) {
    return <EmptyState message="Could not load the outreach dashboard." />
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Pending approval"
          value={data.stats.pendingApprovalCount}
          description="Drafts waiting for your review."
          icon={<Clock3 className="h-5 w-5" />}
        />
        <MetricCard
          label="Drafted today"
          value={data.stats.draftedTodayCount}
          description="New drafts created in the current Phoenix day."
          icon={<MailSearch className="h-5 w-5" />}
        />
        <MetricCard
          label="Sent today"
          value={data.stats.sentTodayCount}
          description="Approved emails already sent today."
          icon={<Send className="h-5 w-5" />}
        />
        <MetricCard
          label="Suppressed"
          value={data.stats.suppressedCount}
          description="Addresses blocked because of unsubscribe, bounce, or complaint."
          icon={<ShieldAlert className="h-5 w-5" />}
        />
      </div>

      {actionMessage ? (
        <div className="rounded-[1.5rem] border border-white/12 bg-white/[0.08] px-5 py-4 text-sm font-semibold text-slate-100 shadow-[0_18px_50px_rgba(0,0,0,0.12)] backdrop-blur-xl">
          {actionMessage}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className={surfaceCardClass}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-[0.74rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                Automation controls
              </div>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.05em] text-slate-950">
                Outreach automation
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
                Discovery, drafting, and sending are capped server-side. Nothing
                is sent without your approval.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => void loadDashboard()}
                disabled={loading || busyId === "refresh"}
                className={surfaceButtonClass}
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
              <button
                onClick={() => void handleRunNow()}
                disabled={busyId === "run-now"}
                className={primaryButtonClass}
              >
                <Send className="h-4 w-4" />
                {busyId === "run-now" ? "Running..." : "Run now"}
              </button>
              {data.settings.enabled ? (
                <button
                  onClick={() => void handleToggleEnabled(false)}
                  disabled={busyId === "toggle-enabled"}
                  className={dangerButtonClass}
                >
                  <PauseCircle className="h-4 w-4" />
                  Stop automation
                </button>
              ) : (
                <button
                  onClick={() => void handleToggleEnabled(true)}
                  disabled={busyId === "toggle-enabled"}
                  className={primaryButtonClass}
                >
                  <PlayCircle className="h-4 w-4" />
                  Start automation
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className={surfaceMetricClass}>
              <div className="text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                Status
              </div>
              <div className="mt-2 text-base font-extrabold tracking-[-0.02em] text-slate-950">
                {data.settings.enabled ? "Running" : "Stopped"}
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Last run: {formatDate(data.settings.last_run_at, "Never")}
              </p>
            </div>

            <div className={surfaceMetricClass}>
              <div className="text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                Guardrails
              </div>
              <div className="mt-2 text-base font-extrabold tracking-[-0.02em] text-slate-950">
                {data.settings.daily_draft_limit} drafts / {data.settings.daily_send_limit} sends
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Pending queue cap: {data.settings.max_pending_approval}
              </p>
            </div>
          </div>

          {mailingAddressMissing ? (
            <div className="mt-6 rounded-[1.35rem] border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-7 text-amber-900">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-1 h-5 w-5 shrink-0" />
                <div>
                  <div className="font-extrabold">Mailing address required before live sending</div>
                  <div className="mt-1">
                    The workflow is built, but live outreach should not send
                    until you add a real postal address to the footer settings.
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <form
            className="mt-6 grid gap-4 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault()
              void handleSaveSettings()
            }}
          >
            <label>
              <div className="mb-2 text-sm font-bold text-slate-700">Sender name</div>
              <input
                value={settingsForm.senderName}
                onChange={(event) =>
                  setSettingsForm((current) =>
                    current ? { ...current, senderName: event.target.value } : current
                  )
                }
                className={fieldClass}
              />
            </label>

            <label>
              <div className="mb-2 text-sm font-bold text-slate-700">From email</div>
              <input
                value={settingsForm.senderEmail}
                onChange={(event) =>
                  setSettingsForm((current) =>
                    current ? { ...current, senderEmail: event.target.value } : current
                  )
                }
                className={fieldClass}
              />
            </label>

            <label>
              <div className="mb-2 text-sm font-bold text-slate-700">Reply-to email</div>
              <input
                value={settingsForm.replyToEmail}
                onChange={(event) =>
                  setSettingsForm((current) =>
                    current ? { ...current, replyToEmail: event.target.value } : current
                  )
                }
                className={fieldClass}
              />
            </label>

            <label>
              <div className="mb-2 text-sm font-bold text-slate-700">Website URL</div>
              <input
                value={settingsForm.websiteUrl}
                onChange={(event) =>
                  setSettingsForm((current) =>
                    current ? { ...current, websiteUrl: event.target.value } : current
                  )
                }
                className={fieldClass}
              />
            </label>

            <label>
              <div className="mb-2 text-sm font-bold text-slate-700">Contact URL</div>
              <input
                value={settingsForm.contactUrl}
                onChange={(event) =>
                  setSettingsForm((current) =>
                    current ? { ...current, contactUrl: event.target.value } : current
                  )
                }
                className={fieldClass}
              />
            </label>

            <label>
              <div className="mb-2 text-sm font-bold text-slate-700">Daily draft limit</div>
              <input
                type="number"
                min={1}
                max={50}
                value={settingsForm.dailyDraftLimit}
                onChange={(event) =>
                  setSettingsForm((current) =>
                    current
                      ? { ...current, dailyDraftLimit: event.target.value }
                      : current
                  )
                }
                className={fieldClass}
              />
            </label>

            <label>
              <div className="mb-2 text-sm font-bold text-slate-700">Daily send limit</div>
              <input
                type="number"
                min={1}
                max={50}
                value={settingsForm.dailySendLimit}
                onChange={(event) =>
                  setSettingsForm((current) =>
                    current
                      ? { ...current, dailySendLimit: event.target.value }
                      : current
                  )
                }
                className={fieldClass}
              />
            </label>

            <label>
              <div className="mb-2 text-sm font-bold text-slate-700">Max pending approval</div>
              <input
                type="number"
                min={1}
                max={250}
                value={settingsForm.maxPendingApproval}
                onChange={(event) =>
                  setSettingsForm((current) =>
                    current
                      ? { ...current, maxPendingApproval: event.target.value }
                      : current
                  )
                }
                className={fieldClass}
              />
            </label>

            <label className="md:col-span-2">
              <div className="mb-2 text-sm font-bold text-slate-700">
                Postal mailing address
              </div>
              <textarea
                rows={3}
                value={settingsForm.mailingAddress}
                onChange={(event) =>
                  setSettingsForm((current) =>
                    current ? { ...current, mailingAddress: event.target.value } : current
                  )
                }
                className={fieldClass}
              />
              <div className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Shown in the outreach email footer for compliance
              </div>
            </label>

            <label>
              <div className="mb-2 text-sm font-bold text-slate-700">
                Target cities
              </div>
              <textarea
                rows={8}
                value={settingsForm.targetCities}
                onChange={(event) =>
                  setSettingsForm((current) =>
                    current ? { ...current, targetCities: event.target.value } : current
                  )
                }
                className={fieldClass}
              />
            </label>

            <label>
              <div className="mb-2 text-sm font-bold text-slate-700">
                Target industries
              </div>
              <textarea
                rows={8}
                value={settingsForm.targetIndustries}
                onChange={(event) =>
                  setSettingsForm((current) =>
                    current
                      ? { ...current, targetIndustries: event.target.value }
                      : current
                  )
                }
                className={fieldClass}
              />
            </label>

            <div className="md:col-span-2 rounded-[1.3rem] border border-slate-200/75 bg-slate-50/85 p-3">
              <button
                type="submit"
                disabled={busyId === "save-settings"}
                className={primaryButtonClass}
              >
                <Save className="h-4 w-4" />
                {busyId === "save-settings" ? "Saving..." : "Save settings"}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-6">
          <div className={surfaceCardClass}>
            <div className="text-[0.74rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
              Needs contact info
            </div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-[-0.04em] text-slate-950">
              Leads without a usable email
            </h2>
            <div className="mt-4 space-y-4">
              {needsContactProspects.length === 0 ? (
                <EmptyState message="No queued leads are missing an email right now." />
              ) : (
                needsContactProspects.map((prospect) => (
                  <div
                    key={prospect.id}
                    className="rounded-[1.25rem] border border-slate-200/80 bg-slate-50/80 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
                  >
                    <div className="font-extrabold tracking-[-0.02em] text-slate-950">
                      {prospect.business_name}
                    </div>
                    <div className="mt-1 text-sm leading-7 text-slate-600">
                      {[prospect.primary_type, prospect.city, prospect.region]
                        .filter(Boolean)
                        .join(" / ")}
                    </div>
                    <div className="mt-2 text-sm leading-7 text-slate-600">
                      {prospect.qualification_summary || "Waiting on a usable contact email."}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className={surfaceCardClass}>
            <div className="text-[0.74rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
              Recent events
            </div>
            <div className="mt-4 space-y-3">
              {recentEvents.length === 0 ? (
                <EmptyState message="No delivery events have been stored yet." />
              ) : (
                recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-[1.2rem] border border-slate-200/80 bg-slate-50/80 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
                  >
                    <div className="text-sm font-extrabold text-slate-950">
                      {event.event_type}
                    </div>
                    <div className="mt-1 text-xs leading-6 text-slate-500">
                      {formatDate(event.created_at)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className={surfaceCardClass}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-[0.74rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                Approval queue
              </div>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.05em] text-slate-950">
                Drafts waiting for approval
              </h2>
            </div>

            <div className="text-sm leading-7 text-slate-500">
              {pendingDrafts.length} draft(s) currently in queue
            </div>
          </div>

          <div className="mt-6 grid gap-6">
            {pendingDrafts.length === 0 ? (
              <EmptyState message="No pending drafts right now." />
            ) : (
              pendingDrafts.map((draft) => (
                <article
                  key={draft.id}
                  className="rounded-[1.55rem] border border-slate-200/80 bg-slate-50/85 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] text-white">
                          {draft.status.replaceAll("_", " ")}
                        </span>
                        {draft.provider_error ? (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] text-red-700">
                            Send failed
                          </span>
                        ) : null}
                      </div>

                      <h3 className="mt-4 text-2xl font-extrabold tracking-[-0.04em] text-slate-950">
                        {draft.prospect?.business_name || "Unknown prospect"}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-slate-500">
                        {draft.recipient_email}
                        {draft.prospect?.primary_type
                          ? ` / ${draft.prospect.primary_type}`
                          : ""}
                        {draft.prospect?.city ? ` / ${draft.prospect.city}` : ""}
                      </p>
                    </div>

                    <div className={`${surfaceMetricClass} text-sm leading-7 text-slate-600`}>
                      <div className="font-extrabold text-slate-950">Created</div>
                      <div>{formatDate(draft.created_at)}</div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-[1.2rem] border border-slate-200/80 bg-white px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                    <div className="text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                      Subject
                    </div>
                    <div className="mt-2 text-base font-extrabold tracking-[-0.02em] text-slate-950">
                      {draft.subject}
                    </div>
                    <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                      {draft.body_text}
                    </div>
                  </div>

                  {draft.personalization_summary ? (
                    <div className="mt-4 rounded-[1.2rem] border border-slate-200/80 bg-white px-4 py-4 text-sm leading-7 text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
                      <div className="font-extrabold text-slate-950">
                        Personalization note
                      </div>
                      <div className="mt-2">{draft.personalization_summary}</div>
                    </div>
                  ) : null}

                  {draft.provider_error ? (
                    <div className="mt-4 rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-4 text-sm leading-7 text-red-700">
                      {draft.provider_error}
                    </div>
                  ) : null}

                  <div className={surfaceFooterClass}>
                    <button
                      onClick={() => setEditor(createDraftEditorForm(draft))}
                      disabled={busyId === `edit:${draft.id}`}
                      className={surfaceButtonClass}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit draft
                    </button>

                    <button
                      onClick={() => void handleDenyDraft(draft.id)}
                      disabled={busyId === `deny:${draft.id}`}
                      className={dangerButtonClass}
                    >
                      <XCircle className="h-4 w-4" />
                      {busyId === `deny:${draft.id}` ? "Working..." : "Deny"}
                    </button>

                    <button
                      onClick={() => void handleApproveAndSend(draft.id)}
                      disabled={
                        busyId === `approve:${draft.id}` || mailingAddressMissing
                      }
                      className={primaryButtonClass}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {busyId === `approve:${draft.id}`
                        ? "Sending..."
                        : "Approve & send"}
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        <div className={surfaceCardClass}>
          <div className="text-[0.74rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
            Recently sent
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {recentSentDrafts.length === 0 ? (
              <EmptyState message="No outreach emails have been sent yet." />
            ) : (
              recentSentDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="rounded-[1.2rem] border border-slate-200/80 bg-slate-50/80 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
                >
                  <div className="font-extrabold text-slate-950">
                    {draft.prospect?.business_name || draft.recipient_email}
                  </div>
                  <div className="mt-1 text-sm leading-7 text-slate-600">{draft.subject}</div>
                  <div className="mt-2 text-xs leading-6 text-slate-500">
                    Sent {formatDate(draft.sent_at)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {editor ? (
        <div className="fixed inset-0 z-[85] flex items-start justify-center overflow-y-auto bg-slate-950/55 px-4 py-6 backdrop-blur-sm sm:px-6">
          <div className={`${surfaceCardClass} w-full max-w-4xl sm:p-8`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[0.74rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                  Draft editor
                </div>
                <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.05em] text-slate-950">
                  Edit outreach draft
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setEditor(null)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              className="mt-6 grid gap-4"
              onSubmit={(event) => {
                event.preventDefault()
                void handleSaveDraftEdit()
              }}
            >
              <label>
                <div className="mb-2 text-sm font-bold text-slate-700">Recipient email</div>
                <input
                  value={editor.recipientEmail}
                  onChange={(event) =>
                    setEditor((current) =>
                      current
                        ? { ...current, recipientEmail: event.target.value }
                        : current
                    )
                  }
                  className={fieldClass}
                />
              </label>

              <label>
                <div className="mb-2 text-sm font-bold text-slate-700">Demo route</div>
                <select
                  value={editor.demoSlug}
                  onChange={(event) =>
                    setEditor((current) =>
                      current ? { ...current, demoSlug: event.target.value } : current
                    )
                  }
                  className={fieldClass}
                >
                  {demoOptions.map((slug) => (
                    <option key={slug} value={slug}>
                      {slug}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <div className="mb-2 text-sm font-bold text-slate-700">Subject</div>
                <input
                  value={editor.subject}
                  onChange={(event) =>
                    setEditor((current) =>
                      current ? { ...current, subject: event.target.value } : current
                    )
                  }
                  className={fieldClass}
                />
              </label>

              <label>
                <div className="mb-2 text-sm font-bold text-slate-700">
                  Personalization summary
                </div>
                <textarea
                  rows={3}
                  value={editor.personalizationSummary}
                  onChange={(event) =>
                    setEditor((current) =>
                      current
                        ? { ...current, personalizationSummary: event.target.value }
                        : current
                    )
                  }
                  className={fieldClass}
                />
              </label>

              <label>
                <div className="mb-2 text-sm font-bold text-slate-700">Email body</div>
                <textarea
                  rows={12}
                  value={editor.bodyText}
                  onChange={(event) =>
                    setEditor((current) =>
                      current ? { ...current, bodyText: event.target.value } : current
                    )
                  }
                  className={fieldClass}
                />
              </label>

              <div className="flex flex-wrap gap-3 rounded-[1.3rem] border border-slate-200/75 bg-slate-50/85 p-3">
                <button
                  type="submit"
                  disabled={busyId === `edit:${editor.draftId}`}
                  className={primaryButtonClass}
                >
                  <Save className="h-4 w-4" />
                  {busyId === `edit:${editor.draftId}` ? "Saving..." : "Save draft"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditor(null)}
                  className={surfaceButtonClass}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  )
}
