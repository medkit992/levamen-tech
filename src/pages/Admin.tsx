import { type ReactNode, useEffect, useMemo, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import {
  ArrowUpRight,
  CreditCard,
  ExternalLink,
  Globe,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquareQuote,
  Pencil,
  RefreshCw,
  ShieldAlert,
  Trash2,
  Users,
  X,
} from "lucide-react"
import OutreachPanel from "../components/admin/OutreachPanel"
import { supabase } from "../lib/supabase"

type ReviewRow = {
  id: string
  client_name: string
  business_name: string | null
  industry: string | null
  review_headline: string | null
  review_text: string
  rating: number
  featured: boolean
  approved: boolean
  project_type: string | null
  project_url: string | null
  client_logo_url: string | null
  created_at: string
}

type InquiryRow = {
  id: string
  created_at: string
  status: string
  selected_plan: string
  selected_addons: string[]
  plan_name: string
  plan_setup_price: number
  plan_monthly_price: number
  addon_one_time_total: number
  addon_monthly_total: number
  domain_choice: string
  domain_name: string | null
  needs_domain_privacy: boolean
  domain_one_time_fee: number
  domain_privacy_monthly_fee: number
  total_setup: number
  total_monthly: number
  full_name: string
  email: string
  business_name: string
  phone: string | null
  business_type: string | null
  timeline: string | null
  pages_needed: string | null
  inspiration: string | null
  goals: string | null
  notes: string | null
  inquiry_snapshot: Record<string, unknown>
  payment_link_url: string | null
  stripe_checkout_session_id: string | null
  payment_sent_at: string | null
  last_contacted_at: string | null
}

type InquiryEditForm = {
  fullName: string
  email: string
  businessName: string
  phone: string
  businessType: string
  timeline: string
  pagesNeeded: string
  domainName: string
  inspiration: string
  goals: string
  notes: string
}

type ClientRow = {
  id: string
  pricing_inquiry_id: string | null
  full_name: string
  email: string
  business_name: string
  website_label: string | null
  website_url: string | null
  website_status: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  stripe_checkout_session_id: string | null
  subscription_status: string | null
  latest_invoice_id: string | null
  last_invoice_status: string | null
  current_period_end: string | null
  last_payment_at: string | null
  last_payment_amount: number | null
  payment_method_update_url: string | null
  payment_failed_at: string | null
  grace_period_ends_at: string | null
  shutdown_required: boolean
  shutdown_marked_at: string | null
  last_reminder_sent_at: string | null
  reminder_count: number
  notes: string | null
  created_at: string
  updated_at: string
}

type TabKey = "reviews" | "requests" | "clients" | "outreach"
type ButtonTone = "primary" | "secondary" | "danger"
type AdminAction =
  | { action: "load" }
  | { action: "review"; operation: "approve" | "delete"; reviewId: string }
  | { action: "inquiry"; inquiryId: string; status: string }
  | {
      action: "inquiry"
      operation: "update"
      inquiryId: string
      fullName: string
      email: string
      businessName: string
      phone: string
      businessType: string
      timeline: string
      pagesNeeded: string
      domainName: string
      inspiration: string
      goals: string
      notes: string
    }
  | { action: "inquiry"; operation: "delete"; inquiryId: string }
  | {
      action: "client"
      operation: "updateWebsiteInfo"
      clientId: string
      websiteLabel: string
      websiteUrl: string
    }
  | {
      action: "client"
      operation: "markWebsiteStatus"
      clientId: string
      websiteStatus: string
    }

type AdminDashboardPayload = {
  reviews?: ReviewRow[]
  inquiries?: InquiryRow[]
  clients?: ClientRow[]
  message?: string
  error?: string
}

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const buttonClass: Record<ButtonTone, string> = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-full border border-transparent bg-white px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-full border border-white/14 bg-white/8 px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/14 disabled:cursor-not-allowed disabled:opacity-50",
  danger:
    "inline-flex items-center justify-center gap-2 rounded-full border border-red-400/20 bg-red-500/16 px-4 py-2.5 text-sm font-bold text-red-100 transition hover:-translate-y-0.5 hover:bg-red-500/24 disabled:cursor-not-allowed disabled:opacity-50",
}

const surfaceButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:-translate-y-0.5 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"

const adminFieldClass =
  "w-full rounded-[1.1rem] border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-100"

function createInquiryEditForm(inquiry: InquiryRow): InquiryEditForm {
  return {
    fullName: inquiry.full_name,
    email: inquiry.email,
    businessName: inquiry.business_name,
    phone: inquiry.phone || "",
    businessType: inquiry.business_type || "",
    timeline: inquiry.timeline || "",
    pagesNeeded: inquiry.pages_needed || "",
    domainName: inquiry.domain_name || "",
    inspiration: inquiry.inspiration || "",
    goals: inquiry.goals || "",
    notes: inquiry.notes || "",
  }
}

function formatDate(value: string | null | undefined, fallback = "—") {
  return value ? new Date(value).toLocaleString() : fallback
}

function formatDateOnly(value: string | null | undefined, fallback = "—") {
  return value ? new Date(value).toLocaleDateString() : fallback
}

function openExternalWindow(url: string) {
  window.open(url, "_blank", "noopener,noreferrer")
}

function isAdminAuthError(message: string) {
  return (
    message.includes("Admin access required") ||
    message.includes("Unauthorized")
  )
}

function MetricCard({
  label,
  value,
  description,
  icon,
}: {
  label: string
  value: string | number
  description: string
  icon: ReactNode
}) {
  return (
    <div className="min-w-0 rounded-[1.5rem] border border-white/10 bg-white/[0.07] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-slate-400">
            {label}
          </p>
          <p className="mt-3 text-3xl font-extrabold tracking-[-0.05em] text-white">
            {value}
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-300">{description}</p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-slate-100">
          {icon}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-8 text-sm leading-7 text-slate-300 shadow-[0_18px_50px_rgba(0,0,0,0.12)]">
      {message}
    </div>
  )
}

function DetailItem({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="min-w-0 rounded-[1.2rem] border border-slate-200/80 bg-slate-50/90 p-4">
      <div className="text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
        {label}
      </div>
      <div className="mt-2 min-w-0 break-words text-sm font-semibold leading-6 text-slate-700 [overflow-wrap:anywhere]">
        {value}
      </div>
    </div>
  )
}

function StatusBadge({
  label,
  tone = "neutral",
}: {
  label: string
  tone?: "success" | "warning" | "danger" | "neutral"
}) {
  const classes = {
    success: "bg-emerald-100 text-emerald-800",
    warning: "bg-amber-100 text-amber-800",
    danger: "bg-red-100 text-red-700",
    neutral: "bg-slate-100 text-slate-700",
  }

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] ${classes[tone]}`}>
      {label}
    </span>
  )
}

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState("")

  const [tab, setTab] = useState<TabKey>("reviews")

  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [inquiries, setInquiries] = useState<InquiryRow[]>([])
  const [clients, setClients] = useState<ClientRow[]>([])

  const [dataLoading, setDataLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [editingInquiry, setEditingInquiry] = useState<InquiryRow | null>(null)
  const [inquiryForm, setInquiryForm] = useState<InquiryEditForm | null>(null)
  const [inquiryFormError, setInquiryFormError] = useState("")

  useEffect(() => {
    let mounted = true

    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setSession(data.session ?? null)
      setAuthLoading(false)
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!session) return
    void loadAdminData()
    // loadAdminData is intentionally invoked from session changes only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session])

  useEffect(() => {
    if (!editingInquiry) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [editingInquiry])

  const pendingReviews = useMemo(
    () => reviews.filter((review) => !review.approved),
    [reviews]
  )

  const sortedInquiries = useMemo(() => {
    return [...inquiries].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }, [inquiries])

  const sortedClients = useMemo(() => {
    const priority = (client: ClientRow) => {
      if (client.shutdown_required) return 0
      if (client.payment_failed_at) return 1
      return 2
    }

    return [...clients].sort((a, b) => {
      const pa = priority(a)
      const pb = priority(b)

      if (pa !== pb) return pa - pb

      const aTime = new Date(a.updated_at ?? a.created_at).getTime()
      const bTime = new Date(b.updated_at ?? b.created_at).getTime()

      return bTime - aTime
    })
  }, [clients])

  const clientsNeedingShutdown = useMemo(
    () => clients.filter((client) => client.shutdown_required),
    [clients]
  )

  const activeInquiries = useMemo(
    () => inquiries.filter((inquiry) => inquiry.status !== "approved"),
    [inquiries]
  )

  const inquiryIdsWithLinkedClients = useMemo(() => {
    return new Set(
      clients
        .map((client) => client.pricing_inquiry_id)
        .filter((value): value is string => Boolean(value))
    )
  }, [clients])

  async function callAdminAction(action: AdminAction) {
    const { data, error } = await supabase.functions.invoke("admin-dashboard", {
      body: action,
    })

    if (error) {
      throw new Error(error.message)
    }

    const payload = (data ?? {}) as AdminDashboardPayload

    if (payload.error) {
      throw new Error(payload.error)
    }

    return payload
  }

  async function loadAdminData(options?: { preserveMessage?: boolean }) {
    setDataLoading(true)

    if (!options?.preserveMessage) {
      setActionMessage("")
    }

    try {
      const payload = await callAdminAction({ action: "load" })
      setReviews(payload.reviews ?? [])
      setInquiries(payload.inquiries ?? [])
      setClients(payload.clients ?? [])
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not load admin data."

      if (isAdminAuthError(message)) {
        setLoginError("Admin access required.")
        await supabase.auth.signOut()
        return
      }

      setActionMessage(message)
    } finally {
      setDataLoading(false)
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError("")

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setLoginError(error.message)
    }

    setLoginLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  async function approveReview(reviewId: string) {
    setBusyId(reviewId)
    setActionMessage("")

    try {
      const payload = await callAdminAction({
        action: "review",
        operation: "approve",
        reviewId,
      })
      await loadAdminData({ preserveMessage: true })
      setActionMessage(payload.message || "Review approved.")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not approve review."
      setActionMessage(`Could not approve review: ${message}`)
    }

    setBusyId(null)
  }

  async function deleteReview(reviewId: string) {
    const confirmed = window.confirm("Delete this review permanently?")
    if (!confirmed) return

    setBusyId(reviewId)
    setActionMessage("")

    try {
      const payload = await callAdminAction({
        action: "review",
        operation: "delete",
        reviewId,
      })
      await loadAdminData({ preserveMessage: true })
      setActionMessage(payload.message || "Review deleted.")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not delete review."
      setActionMessage(`Could not delete review: ${message}`)
    }

    setBusyId(null)
  }

  async function updateInquiryStatus(inquiryId: string, status: string) {
    setBusyId(inquiryId)
    setActionMessage("")

    try {
      const payload = await callAdminAction({
        action: "inquiry",
        inquiryId,
        status,
      })
      await loadAdminData({ preserveMessage: true })
      setActionMessage(payload.message || "Inquiry updated.")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not update inquiry."
      setActionMessage(`Could not update inquiry: ${message}`)
    }

    setBusyId(null)
  }

  function openInquiryEditor(inquiry: InquiryRow) {
    setEditingInquiry(inquiry)
    setInquiryForm(createInquiryEditForm(inquiry))
    setInquiryFormError("")
  }

  function closeInquiryEditor() {
    setEditingInquiry(null)
    setInquiryForm(null)
    setInquiryFormError("")
  }

  function updateInquiryForm<K extends keyof InquiryEditForm>(
    key: K,
    value: InquiryEditForm[K]
  ) {
    setInquiryForm((current) =>
      current
        ? {
            ...current,
            [key]: value,
          }
        : current
    )
    setInquiryFormError("")
  }

  async function saveInquiryEdits() {
    if (!editingInquiry || !inquiryForm) return

    const saveBusyId = `inquiry-save:${editingInquiry.id}`
    setBusyId(saveBusyId)
    setInquiryFormError("")

    try {
      const payload = await callAdminAction({
        action: "inquiry",
        operation: "update",
        inquiryId: editingInquiry.id,
        fullName: inquiryForm.fullName,
        email: inquiryForm.email,
        businessName: inquiryForm.businessName,
        phone: inquiryForm.phone,
        businessType: inquiryForm.businessType,
        timeline: inquiryForm.timeline,
        pagesNeeded: inquiryForm.pagesNeeded,
        domainName: inquiryForm.domainName,
        inspiration: inquiryForm.inspiration,
        goals: inquiryForm.goals,
        notes: inquiryForm.notes,
      })

      await loadAdminData({ preserveMessage: true })
      closeInquiryEditor()
      setActionMessage(payload.message || "Request details updated.")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not update request."
      setInquiryFormError(message)
    }

    setBusyId(null)
  }

  async function deleteInquiry(inquiry: InquiryRow) {
    const confirmed = window.confirm(
      `Delete the request from ${inquiry.business_name}? This cannot be undone.`
    )
    if (!confirmed) return

    const deleteBusyId = `inquiry-delete:${inquiry.id}`
    setBusyId(deleteBusyId)
    setActionMessage("")

    try {
      const payload = await callAdminAction({
        action: "inquiry",
        operation: "delete",
        inquiryId: inquiry.id,
      })

      await loadAdminData({ preserveMessage: true })
      if (editingInquiry?.id === inquiry.id) {
        closeInquiryEditor()
      }
      setActionMessage(payload.message || "Request deleted.")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not delete request."
      setActionMessage(`Could not delete request: ${message}`)
    }

    setBusyId(null)
  }

  async function createAndSendPaymentLink(inquiryId: string) {
    setBusyId(inquiryId)
    setActionMessage("")

    const { data, error } = await supabase.functions.invoke("create-payment-link", {
      body: { inquiryId },
    })

    if (error) {
      setActionMessage(`Could not create payment link: ${error.message}`)
      setBusyId(null)
      return
    }

    const paymentUrl = data?.url as string | undefined
    const subject = data?.emailSubject as string | undefined
    const body = data?.emailBody as string | undefined
    const emailDeliveryStatus = data?.emailDeliveryStatus as string | undefined
    const emailDeliveryError = data?.emailDeliveryError as string | undefined
    const lineItems = Array.isArray(data?.lineItems)
      ? (data.lineItems as string[])
      : []

    await loadAdminData()

    if (paymentUrl && subject && body && emailDeliveryStatus !== "sent") {
      const mailto = `mailto:${encodeURIComponent(
        data.customerEmail ?? ""
      )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

      openExternalWindow(mailto)
      openExternalWindow(paymentUrl)
    }

    const itemSummary = lineItems.length ? ` Items: ${lineItems.join(", ")}.` : ""
    const reusedSummary = data?.reused ? " Existing checkout link reused." : ""

    if (emailDeliveryStatus === "sent") {
      setActionMessage(`Payment link created and emailed automatically.${reusedSummary}${itemSummary}`)
    } else if (emailDeliveryStatus === "failed") {
      setActionMessage(
        `Payment link created, but automatic email failed: ${emailDeliveryError || "Unknown email error"}. A fallback mail draft and the Stripe checkout page were opened.${reusedSummary}${itemSummary}`
      )
    } else {
      setActionMessage(
        `Payment link created. Automatic email delivery is not configured, so a fallback mail draft and the Stripe checkout page were opened.${reusedSummary}${itemSummary}`
      )
    }

    setBusyId(null)
  }

  async function generatePortalLink(clientId: string) {
    setBusyId(clientId)
    setActionMessage("")

    const { data, error } = await supabase.functions.invoke(
      "create-billing-portal-link",
      {
        body: { clientId },
      }
    )

    if (error) {
      setActionMessage(`Could not create billing portal link: ${error.message}`)
      setBusyId(null)
      return
    }

    await loadAdminData()

    const url = data?.url as string | undefined
    if (url) {
      openExternalWindow(url)
    }

    setActionMessage("Billing portal link created.")
    setBusyId(null)
  }

  async function sendManualReminder(clientId: string) {
    setBusyId(clientId)
    setActionMessage("")

    const { data, error } = await supabase.functions.invoke("process-client-billing", {
      body: {
        mode: "single",
        clientId,
        forceSendReminder: true,
      },
    })

    if (error) {
      setActionMessage(`Could not send reminder: ${error.message}`)
      setBusyId(null)
      return
    }

    await loadAdminData()
    setActionMessage(data?.message || "Reminder processed.")
    setBusyId(null)
  }

  async function updateWebsiteInfo(clientId: string, existing: ClientRow) {
    const websiteLabel = window.prompt(
      "Website label",
      existing.website_label ?? existing.business_name
    )
    if (websiteLabel === null) return

    const websiteUrl = window.prompt(
      "Website URL",
      existing.website_url ?? "https://"
    )
    if (websiteUrl === null) return

    setBusyId(clientId)
    setActionMessage("")

    try {
      const payload = await callAdminAction({
        action: "client",
        operation: "updateWebsiteInfo",
        clientId,
        websiteLabel,
        websiteUrl,
      })
      await loadAdminData({ preserveMessage: true })
      setActionMessage(payload.message || "Website info updated.")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not update website info."
      setActionMessage(`Could not update website info: ${message}`)
    }

    setBusyId(null)
  }

  async function markClientWebsiteStatus(clientId: string, websiteStatus: string) {
    setBusyId(clientId)
    setActionMessage("")

    try {
      const payload = await callAdminAction({
        action: "client",
        operation: "markWebsiteStatus",
        clientId,
        websiteStatus,
      })
      await loadAdminData({ preserveMessage: true })
      setActionMessage(
        payload.message || `Website marked as ${websiteStatus.replaceAll("_", " ")}.`
      )
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not update website status."
      setActionMessage(`Could not update website status: ${message}`)
    }

    setBusyId(null)
  }

  function renderClientStatus(client: ClientRow) {
    if (client.shutdown_required) {
      return {
        label: "Needs shutdown",
        tone: "danger" as const,
      }
    }

    if (client.payment_failed_at) {
      return {
        label: "Payment failed",
        tone: "warning" as const,
      }
    }

    if (client.subscription_status === "active") {
      return {
        label: "Active",
        tone: "success" as const,
      }
    }

    return {
      label: client.subscription_status || "Unknown",
      tone: "neutral" as const,
    }
  }

  function canDeleteInquiry(inquiry: InquiryRow) {
    return !(
      inquiryIdsWithLinkedClients.has(inquiry.id) ||
      inquiry.payment_link_url ||
      inquiry.stripe_checkout_session_id ||
      inquiry.payment_sent_at ||
      ["payment_sent", "payment_expired", "paid"].includes(inquiry.status)
    )
  }

  if (authLoading) {
    return (
      <main className="min-h-screen overflow-x-clip bg-[linear-gradient(180deg,#081423_0%,#10213a_100%)] px-4 py-6 text-white sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl items-center justify-center">
          <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.08] px-8 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
            Loading admin...
          </div>
        </div>
      </main>
    )
  }

  if (!session) {
    return (
      <main className="min-h-screen overflow-x-clip bg-[linear-gradient(180deg,#081423_0%,#10213a_100%)] px-4 py-6 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-5xl items-center gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          <div className="min-w-0 space-y-6">
            <div className="rounded-[1.8rem] border border-white/10 bg-white/[0.08] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-slate-200">
                <LayoutDashboard className="h-4 w-4" />
                Levamen Tech admin
              </div>

              <h1 className="mt-6 text-4xl font-extrabold tracking-[-0.06em] sm:text-5xl">
                A cleaner control panel for reviews, requests, and billing clients.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-8 text-slate-200">
                Sign in with your Supabase auth account to manage public reviews,
                pricing requests, and active client accounts from one place.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <MetricCard
                  label="Reviews"
                  value="Moderate"
                  description="Approve or remove incoming testimonials."
                  icon={<MessageSquareQuote className="h-5 w-5" />}
                />
                <MetricCard
                  label="Requests"
                  value="Track"
                  description="Follow pricing inquiries through approval."
                  icon={<Mail className="h-5 w-5" />}
                />
                <MetricCard
                  label="Clients"
                  value="Manage"
                  description="Handle billing, reminders, and website status."
                  icon={<Users className="h-5 w-5" />}
                />
              </div>
            </div>
          </div>

          <form
            onSubmit={handleLogin}
            className="min-w-0 rounded-[1.8rem] border border-white/10 bg-white/[0.08] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:p-8"
          >
            <div className="mb-6">
              <div className="text-[0.74rem] font-extrabold uppercase tracking-[0.24em] text-slate-300">
                Secure access
              </div>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.05em] text-white">
                Admin login
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-300">
                Use the same email and password tied to your Supabase auth account.
              </p>
            </div>

            <label className="mb-4 block">
              <span className="mb-2 block text-sm font-bold text-slate-200">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="field-input bg-white/92 text-slate-900"
              />
            </label>

            <label className="mb-5 block">
              <span className="mb-2 block text-sm font-bold text-slate-200">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="field-input bg-white/92 text-slate-900"
              />
            </label>

            {loginError ? (
              <div className="mb-5 rounded-[1.2rem] border border-red-400/20 bg-red-500/14 px-4 py-3 text-sm font-semibold text-red-100">
                {loginError}
              </div>
            ) : null}

            <button type="submit" disabled={loginLoading} className={`${buttonClass.primary} w-full`}>
              {loginLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#081423_0%,#10213a_100%)] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-[0_28px_100px_rgba(0,0,0,0.24)] backdrop-blur-2xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-slate-200">
                <LayoutDashboard className="h-4 w-4" />
                Levamen Tech admin
              </div>
              <h1 className="mt-5 text-4xl font-extrabold tracking-[-0.06em] text-white sm:text-5xl">
                Admin panel
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-200">
                Manage reviews, pricing requests, client billing, and outreach
                approvals from one place. The workflows stay the same, but the
                screen is tuned for faster scanning and fewer missed details.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => void loadAdminData()}
                disabled={dataLoading}
                className={buttonClass.secondary}
              >
                <RefreshCw className="h-4 w-4" />
                {dataLoading ? "Refreshing..." : "Refresh"}
              </button>
              <button onClick={handleLogout} className={buttonClass.secondary}>
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="Pending reviews"
              value={pendingReviews.length}
              description="Testimonials waiting for moderation."
              icon={<MessageSquareQuote className="h-5 w-5" />}
            />
            <MetricCard
              label="Open requests"
              value={activeInquiries.length}
              description="Pricing inquiries that still need attention."
              icon={<Mail className="h-5 w-5" />}
            />
            <MetricCard
              label="Clients"
              value={clients.length}
              description="Active and historical client accounts."
              icon={<Users className="h-5 w-5" />}
            />
            <MetricCard
              label="Shutdown flags"
              value={clientsNeedingShutdown.length}
              description="Clients that need a site takedown follow-up."
              icon={<ShieldAlert className="h-5 w-5" />}
            />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {[
              { key: "reviews" as const, label: `Reviews (${pendingReviews.length} pending)` },
              { key: "requests" as const, label: `Requests (${inquiries.length})` },
              { key: "clients" as const, label: `Clients (${clients.length})` },
              { key: "outreach" as const, label: "Outreach" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => setTab(item.key)}
                className={
                  tab === item.key
                    ? buttonClass.primary
                    : buttonClass.secondary
                }
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {tab === "clients" && clientsNeedingShutdown.length > 0 ? (
          <div className="mt-6 rounded-[1.6rem] border border-red-400/18 bg-red-500/12 px-5 py-4 text-sm leading-7 text-red-100 shadow-[0_18px_50px_rgba(0,0,0,0.14)]">
            <div className="font-extrabold uppercase tracking-[0.18em] text-red-100">
              Clients needing shutdown
            </div>
            <div className="mt-2">
              {clientsNeedingShutdown.map((client) => client.business_name).join(", ")}
            </div>
          </div>
        ) : null}

        {actionMessage ? (
          <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/[0.08] px-5 py-4 text-sm font-semibold text-slate-100 shadow-[0_18px_50px_rgba(0,0,0,0.12)]">
            {actionMessage}
          </div>
        ) : null}

        <div className="mt-6">
          {dataLoading ? (
            <EmptyState message="Loading admin data..." />
          ) : tab === "outreach" ? (
            <OutreachPanel />
          ) : tab === "reviews" ? (
            reviews.length === 0 ? (
              <EmptyState message="No reviews found." />
            ) : (
              <div className="grid gap-6 xl:grid-cols-2">
                {reviews.map((review) => (
                  <article
                    key={review.id}
                    className="rounded-[1.7rem] border border-white/10 bg-white p-6 text-slate-900 shadow-[0_24px_80px_rgba(0,0,0,0.18)]"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge
                            label={review.approved ? "Approved" : "Pending"}
                            tone={review.approved ? "success" : "warning"}
                          />
                          {review.featured ? (
                            <StatusBadge label="Featured" tone="neutral" />
                          ) : null}
                        </div>

                        <h2 className="mt-4 text-2xl font-extrabold tracking-[-0.04em] text-slate-950">
                          {review.review_headline || "Untitled review"}
                        </h2>
                        <p className="mt-2 text-sm leading-7 text-slate-500">
                          {[review.client_name, review.business_name, review.industry]
                            .filter(Boolean)
                            .join(" / ")}
                        </p>
                      </div>

                      <div className="rounded-[1.2rem] bg-slate-50 px-4 py-3 text-right">
                        <div className="text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                          Rating
                        </div>
                        <div className="mt-1 text-xl font-extrabold tracking-[-0.03em] text-slate-950">
                          {review.rating}/5
                        </div>
                      </div>
                    </div>

                    <p className="mt-6 text-sm leading-8 text-slate-700">{review.review_text}</p>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                      <DetailItem label="Project type" value={review.project_type || "—"} />
                      <DetailItem
                        label="Project URL"
                        value={
                          review.project_url ? (
                            <a
                              href={review.project_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-slate-900 hover:text-blue-700"
                            >
                              Open URL
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          ) : (
                            "—"
                          )
                        }
                      />
                      <DetailItem label="Created" value={formatDate(review.created_at)} />
                      <DetailItem
                        label="Client logo URL"
                        value={review.client_logo_url || "—"}
                      />
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      {!review.approved && (
                        <button
                          onClick={() => void approveReview(review.id)}
                          disabled={busyId === review.id}
                          className={buttonClass.primary}
                        >
                          {busyId === review.id ? "Approving..." : "Approve"}
                        </button>
                      )}

                      <button
                        onClick={() => void deleteReview(review.id)}
                        disabled={busyId === review.id}
                        className={buttonClass.danger}
                      >
                        {busyId === review.id ? "Working..." : "Delete"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )
          ) : tab === "requests" ? (
            sortedInquiries.length === 0 ? (
              <EmptyState message="No pricing inquiries found." />
            ) : (
              <div className="grid gap-6">
                {sortedInquiries.map((inquiry) => (
                  <article
                    key={inquiry.id}
                    className="rounded-[1.7rem] border border-white/10 bg-white p-6 text-slate-900 shadow-[0_24px_80px_rgba(0,0,0,0.18)]"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <StatusBadge label={inquiry.status} tone="neutral" />
                        <h2 className="mt-4 text-2xl font-extrabold tracking-[-0.04em] text-slate-950">
                          {inquiry.business_name}
                        </h2>
                        <p className="mt-2 text-sm leading-7 text-slate-500">
                          {inquiry.full_name} / {inquiry.email}
                          {inquiry.phone ? ` / ${inquiry.phone}` : ""}
                        </p>
                      </div>

                      <div className="rounded-[1.2rem] bg-slate-50 px-4 py-3 text-right">
                        <div className="text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                          Pricing
                        </div>
                        <div className="mt-1 text-base font-extrabold tracking-[-0.02em] text-slate-950">
                          {currency.format(Number(inquiry.total_setup || 0))} setup
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-500">
                          {currency.format(Number(inquiry.total_monthly || 0))}/mo
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <DetailItem label="Plan" value={inquiry.plan_name} />
                      <DetailItem
                        label="Domain"
                        value={`${inquiry.domain_choice}${inquiry.domain_name ? ` (${inquiry.domain_name})` : ""}`}
                      />
                      <DetailItem label="Timeline" value={inquiry.timeline || "—"} />
                      <DetailItem label="Pages needed" value={inquiry.pages_needed || "—"} />
                      <DetailItem label="Business type" value={inquiry.business_type || "—"} />
                      <DetailItem label="Created" value={formatDate(inquiry.created_at)} />
                      <DetailItem
                        label="Payment link"
                        value={
                          inquiry.payment_link_url ? (
                            <a
                              href={inquiry.payment_link_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-slate-900 hover:text-blue-700"
                            >
                              Open Stripe checkout
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          ) : (
                            "Not created yet"
                          )
                        }
                      />
                      <DetailItem
                        label="Last contacted"
                        value={formatDate(inquiry.last_contacted_at)}
                      />
                    </div>

                    {inquiry.selected_addons?.length ? (
                      <div className="mt-5 rounded-[1.3rem] bg-slate-50/90 p-4 text-sm leading-7 text-slate-600">
                        <span className="font-extrabold text-slate-900">Add-ons:</span>{" "}
                        {inquiry.selected_addons.join(", ")}
                      </div>
                    ) : null}

                    {inquiry.goals ? (
                      <div className="mt-5">
                        <div className="text-[0.74rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                          Goals
                        </div>
                        <p className="mt-2 text-sm leading-8 text-slate-700">{inquiry.goals}</p>
                      </div>
                    ) : null}

                    {inquiry.notes ? (
                      <div className="mt-5">
                        <div className="text-[0.74rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                          Notes
                        </div>
                        <p className="mt-2 text-sm leading-8 text-slate-700">{inquiry.notes}</p>
                      </div>
                    ) : null}

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        onClick={() => openInquiryEditor(inquiry)}
                        disabled={busyId === `inquiry-save:${inquiry.id}`}
                        className={surfaceButtonClass}
                      >
                        <Pencil className="h-4 w-4" />
                        Edit request
                      </button>

                      <button
                        onClick={() => void updateInquiryStatus(inquiry.id, "contacted")}
                        disabled={busyId === inquiry.id}
                        className={surfaceButtonClass}
                      >
                        Mark contacted
                      </button>

                      <button
                        onClick={() => void updateInquiryStatus(inquiry.id, "approved")}
                        disabled={busyId === inquiry.id}
                        className={surfaceButtonClass}
                      >
                        Mark approved
                      </button>

                      <button
                        onClick={() => void createAndSendPaymentLink(inquiry.id)}
                        disabled={busyId === inquiry.id}
                        className={buttonClass.primary}
                      >
                        {busyId === inquiry.id ? "Creating..." : "Send payment link"}
                      </button>

                      <button
                        onClick={() => void deleteInquiry(inquiry)}
                        disabled={
                          busyId === `inquiry-delete:${inquiry.id}` ||
                          !canDeleteInquiry(inquiry)
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:-translate-y-0.5 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        {busyId === `inquiry-delete:${inquiry.id}`
                          ? "Deleting..."
                          : "Delete request"}
                      </button>
                    </div>

                    {!canDeleteInquiry(inquiry) ? (
                      <p className="mt-3 text-xs font-semibold leading-6 text-slate-500">
                        Delete is disabled after billing history exists or a client
                        account is linked to the request.
                      </p>
                    ) : null}
                  </article>
                ))}
              </div>
            )
          ) : sortedClients.length === 0 ? (
            <EmptyState message="No clients found yet. Clients will appear here after Stripe checkout completion is synced into client_accounts." />
          ) : (
            <div className="grid gap-6">
              {sortedClients.map((client) => {
                const statusPill = renderClientStatus(client)

                return (
                  <article
                    key={client.id}
                    className="rounded-[1.7rem] border border-white/10 bg-white p-6 text-slate-900 shadow-[0_24px_80px_rgba(0,0,0,0.18)]"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <StatusBadge label={statusPill.label} tone={statusPill.tone} />
                        <h2 className="mt-4 text-2xl font-extrabold tracking-[-0.04em] text-slate-950">
                          {client.business_name}
                        </h2>
                        <p className="mt-2 text-sm leading-7 text-slate-500">
                          {client.full_name} / {client.email}
                        </p>
                      </div>

                      <div className="rounded-[1.2rem] bg-slate-50 px-4 py-3 text-right">
                        <div className="text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                          Website status
                        </div>
                        <div className="mt-1 text-base font-extrabold tracking-[-0.02em] text-slate-950">
                          {client.website_status.replaceAll("_", " ")}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <DetailItem
                        label="Website"
                        value={
                          client.website_url ? (
                            <a
                              href={client.website_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-slate-900 hover:text-blue-700"
                            >
                              {client.website_label || client.website_url}
                              <ArrowUpRight className="h-4 w-4" />
                            </a>
                          ) : (
                            "—"
                          )
                        }
                      />
                      <DetailItem
                        label="Subscription"
                        value={client.subscription_status || "—"}
                      />
                      <DetailItem
                        label="Last invoice"
                        value={client.last_invoice_status || "—"}
                      />
                      <DetailItem
                        label="Current period end"
                        value={formatDateOnly(client.current_period_end)}
                      />
                      <DetailItem
                        label="Last payment"
                        value={
                          client.last_payment_at
                            ? `${formatDate(client.last_payment_at)}${
                                client.last_payment_amount != null
                                  ? ` / ${currency.format(Number(client.last_payment_amount))}`
                                  : ""
                              }`
                            : "—"
                        }
                      />
                      <DetailItem
                        label="Payment failed at"
                        value={formatDate(client.payment_failed_at)}
                      />
                      <DetailItem
                        label="Grace period ends"
                        value={formatDate(client.grace_period_ends_at)}
                      />
                      <DetailItem
                        label="Reminder count"
                        value={client.reminder_count}
                      />
                    </div>

                    {client.notes ? (
                      <div className="mt-5">
                        <div className="text-[0.74rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                          Notes
                        </div>
                        <p className="mt-2 text-sm leading-8 text-slate-700">{client.notes}</p>
                      </div>
                    ) : null}

                    {client.shutdown_required ? (
                      <div className="mt-5 rounded-[1.3rem] border border-red-200 bg-red-50 px-4 py-4 text-sm font-semibold leading-7 text-red-700">
                        This client has passed the grace period and should have
                        their site shut down.
                      </div>
                    ) : null}

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        onClick={() => void updateWebsiteInfo(client.id, client)}
                        disabled={busyId === client.id}
                        className={buttonClass.secondary.replace("text-white", "text-slate-950").replace("bg-white/8", "bg-slate-100").replace("border-white/14", "border-slate-200")}
                      >
                        <Globe className="h-4 w-4" />
                        Edit website info
                      </button>

                      <button
                        onClick={() => void generatePortalLink(client.id)}
                        disabled={busyId === client.id}
                        className={buttonClass.secondary.replace("text-white", "text-slate-950").replace("bg-white/8", "bg-slate-100").replace("border-white/14", "border-slate-200")}
                      >
                        <CreditCard className="h-4 w-4" />
                        {busyId === client.id ? "Working..." : "Open billing portal"}
                      </button>

                      <button
                        onClick={() => void sendManualReminder(client.id)}
                        disabled={busyId === client.id}
                        className={buttonClass.primary}
                      >
                        {busyId === client.id ? "Working..." : "Send reminder"}
                      </button>

                      <button
                        onClick={() => void markClientWebsiteStatus(client.id, "paused")}
                        disabled={busyId === client.id}
                        className={buttonClass.secondary.replace("text-white", "text-slate-950").replace("bg-white/8", "bg-slate-100").replace("border-white/14", "border-slate-200")}
                      >
                        Mark paused
                      </button>

                      <button
                        onClick={() => void markClientWebsiteStatus(client.id, "shut_down")}
                        disabled={busyId === client.id}
                        className={buttonClass.danger}
                      >
                        Mark shut down
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
        </div>

        {editingInquiry && inquiryForm ? (
          <div className="fixed inset-0 z-[80] flex items-start justify-center overflow-y-auto bg-slate-950/45 px-4 py-6 sm:px-6">
            <div className="w-full max-w-4xl rounded-[1.8rem] border border-slate-200 bg-white p-6 text-slate-900 shadow-[0_30px_120px_rgba(15,23,42,0.22)] sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge label={editingInquiry.status} tone="neutral" />
                    <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-slate-400">
                      Request editor
                    </span>
                  </div>

                  <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.05em] text-slate-950">
                    Edit {editingInquiry.business_name}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
                    Update the request details that guide follow-up and project
                    scoping. Plan, add-ons, and pricing totals stay as originally
                    submitted.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeInquiryEditor}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 rounded-[1.4rem] border border-slate-200 bg-slate-50/90 px-4 py-4 text-sm leading-7 text-slate-600">
                <span className="font-extrabold text-slate-900">Package snapshot:</span>{" "}
                {editingInquiry.plan_name}
                {editingInquiry.selected_addons?.length
                  ? ` + ${editingInquiry.selected_addons.join(", ")}`
                  : ""}
              </div>

              <form
                className="mt-6 space-y-6"
                onSubmit={(event) => {
                  event.preventDefault()
                  void saveInquiryEdits()
                }}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <label>
                    <span className="mb-2 block text-sm font-bold text-slate-700">
                      Full name
                    </span>
                    <input
                      value={inquiryForm.fullName}
                      onChange={(event) =>
                        updateInquiryForm("fullName", event.target.value)
                      }
                      className={adminFieldClass}
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-sm font-bold text-slate-700">
                      Email
                    </span>
                    <input
                      type="email"
                      value={inquiryForm.email}
                      onChange={(event) =>
                        updateInquiryForm("email", event.target.value)
                      }
                      className={adminFieldClass}
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-sm font-bold text-slate-700">
                      Business name
                    </span>
                    <input
                      value={inquiryForm.businessName}
                      onChange={(event) =>
                        updateInquiryForm("businessName", event.target.value)
                      }
                      className={adminFieldClass}
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-sm font-bold text-slate-700">
                      Phone
                    </span>
                    <input
                      value={inquiryForm.phone}
                      onChange={(event) =>
                        updateInquiryForm("phone", event.target.value)
                      }
                      className={adminFieldClass}
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-sm font-bold text-slate-700">
                      Business type
                    </span>
                    <input
                      value={inquiryForm.businessType}
                      onChange={(event) =>
                        updateInquiryForm("businessType", event.target.value)
                      }
                      className={adminFieldClass}
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-sm font-bold text-slate-700">
                      Timeline
                    </span>
                    <input
                      value={inquiryForm.timeline}
                      onChange={(event) =>
                        updateInquiryForm("timeline", event.target.value)
                      }
                      className={adminFieldClass}
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-sm font-bold text-slate-700">
                      Pages needed
                    </span>
                    <input
                      value={inquiryForm.pagesNeeded}
                      onChange={(event) =>
                        updateInquiryForm("pagesNeeded", event.target.value)
                      }
                      className={adminFieldClass}
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-sm font-bold text-slate-700">
                      Requested domain
                    </span>
                    <input
                      value={inquiryForm.domainName}
                      onChange={(event) =>
                        updateInquiryForm("domainName", event.target.value)
                      }
                      className={adminFieldClass}
                    />
                  </label>
                </div>

                <div className="grid gap-4">
                  <label>
                    <span className="mb-2 block text-sm font-bold text-slate-700">
                      Inspiration / reference sites
                    </span>
                    <textarea
                      value={inquiryForm.inspiration}
                      onChange={(event) =>
                        updateInquiryForm("inspiration", event.target.value)
                      }
                      className={`${adminFieldClass} min-h-[8rem] resize-y`}
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-sm font-bold text-slate-700">
                      Goals
                    </span>
                    <textarea
                      value={inquiryForm.goals}
                      onChange={(event) =>
                        updateInquiryForm("goals", event.target.value)
                      }
                      className={`${adminFieldClass} min-h-[8rem] resize-y`}
                    />
                  </label>

                  <label>
                    <span className="mb-2 block text-sm font-bold text-slate-700">
                      Notes
                    </span>
                    <textarea
                      value={inquiryForm.notes}
                      onChange={(event) =>
                        updateInquiryForm("notes", event.target.value)
                      }
                      className={`${adminFieldClass} min-h-[8rem] resize-y`}
                    />
                  </label>
                </div>

                {inquiryFormError ? (
                  <div className="rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {inquiryFormError}
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={closeInquiryEditor}
                    className={surfaceButtonClass}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={busyId === `inquiry-save:${editingInquiry.id}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-transparent bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Pencil className="h-4 w-4" />
                    {busyId === `inquiry-save:${editingInquiry.id}`
                      ? "Saving..."
                      : "Save changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </main>
    )
  }
