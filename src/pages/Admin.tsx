import { type ReactNode, useEffect, useMemo, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import {
  ArrowUpRight,
  Clock3,
  CreditCard,
  ExternalLink,
  Globe,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquareQuote,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react"
import AnalyticsPanel from "../components/admin/AnalyticsPanel"
import OutreachPanel from "../components/admin/OutreachPanel"
import Seo from "../components/seo/Seo"
import { invokeProtectedFunction, supabase } from "../lib/supabase"

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

type ContactInquiryRow = {
  id: string
  full_name: string
  email: string
  business_name: string | null
  business_type: string | null
  requested_demo_slug: string | null
  source_path: string | null
  timeline: string | null
  project_scope: string | null
  message: string
  status: string
  last_contacted_at: string | null
  notes: string | null
  created_at: string
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

type WebsiteEditorState = {
  clientId: string
  businessName: string
  websiteLabel: string
  websiteUrl: string
}

type ConfirmDialogState =
  | {
      kind: "delete-review"
      title: string
      description: string
      reviewId: string
      confirmLabel: string
    }
  | {
      kind: "delete-inquiry"
      title: string
      description: string
      inquiry: InquiryRow
      confirmLabel: string
    }
  | {
      kind: "mark-shut-down"
      title: string
      description: string
      clientId: string
      confirmLabel: string
    }

type TabKey =
  | "overview"
  | "reviews"
  | "requests"
  | "clients"
  | "outreach"
  | "analytics"

type ButtonTone = "primary" | "secondary" | "danger"
type ReviewFilter = "pending" | "all" | "featured"
type RequestStatusFilter =
  | "all"
  | "new"
  | "contacted"
  | "approved"
  | "payment_sent"
  | "paid"
  | "needs_follow_up"
  | "linked_client"
type RequestWindowFilter = "all" | "today" | "7d" | "30d"
type RequestSort = "newest" | "oldest" | "highest_value" | "needs_follow_up"
type ClientStatusFilter =
  | "all"
  | "attention"
  | "active"
  | "paused"
  | "shut_down"
  | "missing_website"
type ClientWindowFilter = "all" | "7d" | "30d"
type ClientSort = "attention" | "recent_activity" | "alphabetical"

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
  contactInquiries?: ContactInquiryRow[]
  outreachPendingCount?: number
  message?: string
  error?: string
}

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
})

const adminPageClass =
  "relative min-h-screen overflow-x-clip bg-[#071321] px-4 py-5 text-white sm:px-6 lg:px-8"

const heroPanelClass =
  "relative overflow-hidden rounded-[2.25rem] border border-white/12 bg-[linear-gradient(160deg,rgba(15,23,42,0.84),rgba(30,41,59,0.56))] p-6 shadow-[0_30px_110px_rgba(0,0,0,0.3)] backdrop-blur-2xl sm:p-8"

const surfaceCardClass =
  "rounded-[1.85rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.985),rgba(247,250,252,0.96))] p-6 text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.14)]"

const surfaceMetricClass =
  "rounded-[1.3rem] border border-slate-200/75 bg-white/80 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"

const surfaceFooterClass =
  "mt-6 flex flex-wrap gap-3 rounded-[1.35rem] border border-slate-200/70 bg-slate-50/85 p-3"

const buttonClass: Record<ButtonTone, string> = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-full border border-white/70 bg-white px-4 py-2.5 text-sm font-bold text-slate-950 shadow-[0_16px_40px_rgba(255,255,255,0.14)] transition hover:-translate-y-0.5 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-full border border-white/14 bg-white/[0.08] px-4 py-2.5 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition hover:-translate-y-0.5 hover:border-white/24 hover:bg-white/[0.14] disabled:cursor-not-allowed disabled:opacity-50",
  danger:
    "inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 shadow-[0_12px_26px_rgba(248,113,113,0.14)] transition hover:-translate-y-0.5 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50",
}

const surfaceButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-slate-200/90 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 shadow-[0_10px_26px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"

const surfacePrimaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-full border border-slate-950/10 bg-slate-950 px-4 py-2.5 text-sm font-bold text-white shadow-[0_16px_30px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"

const adminFieldClass =
  "w-full rounded-[1.1rem] border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-100"

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

function formatDate(value: string | null | undefined, fallback = "--") {
  return value ? new Date(value).toLocaleString() : fallback
}

function formatDateOnly(value: string | null | undefined, fallback = "--") {
  return value ? new Date(value).toLocaleDateString() : fallback
}

function daysBetweenNow(value: string | null | undefined) {
  if (!value) {
    return Number.POSITIVE_INFINITY
  }

  return Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000)
}

function isWithinPastDays(value: string | null | undefined, days: number) {
  if (!value) {
    return false
  }

  return Date.now() - new Date(value).getTime() <= days * 86_400_000
}

function isDueSoon(value: string | null | undefined, days: number) {
  if (!value) {
    return false
  }

  const distance = new Date(value).getTime() - Date.now()
  return distance >= 0 && distance <= days * 86_400_000
}

function openExternalWindow(url: string) {
  window.open(url, "_blank", "noopener,noreferrer")
}

function isAdminAuthError(message: string) {
  return (
    message.includes("Admin access required") ||
    message.includes("Unauthorized") ||
    message.includes("sign in again") ||
    message.includes("session expired")
  )
}

function getInquiryFlags(inquiry: InquiryRow, linkedToClient: boolean) {
  const flags: Array<{ label: string; tone: "success" | "warning" | "danger" | "neutral" }> = []
  const lastTouch = inquiry.last_contacted_at ?? inquiry.created_at

  if (isWithinPastDays(inquiry.created_at, 1)) {
    flags.push({ label: "New today", tone: "warning" })
  }

  if (!["approved", "paid"].includes(inquiry.status.toLowerCase()) && daysBetweenNow(lastTouch) >= 3) {
    flags.push({ label: "Follow-up overdue", tone: "danger" })
  }

  if (
    inquiry.payment_link_url ||
    inquiry.payment_sent_at ||
    ["payment_sent", "payment_expired", "paid"].includes(inquiry.status)
  ) {
    flags.push({ label: "Payment link sent", tone: "success" })
  }

  if (linkedToClient) {
    flags.push({ label: "Linked client", tone: "neutral" })
  }

  return flags
}

function getClientFlags(client: ClientRow) {
  const flags: Array<{ label: string; tone: "success" | "warning" | "danger" | "neutral" }> = []

  if (!client.website_url) {
    flags.push({ label: "Website missing URL", tone: "warning" })
  }

  if (isDueSoon(client.grace_period_ends_at, 5) && !client.shutdown_required) {
    flags.push({ label: "Grace period ending", tone: "warning" })
  }

  if (client.payment_failed_at) {
    flags.push({ label: "Billing risk", tone: "danger" })
  }

  if (client.subscription_status === "active") {
    flags.push({ label: "Active subscription", tone: "success" })
  }

  return flags
}

function AdminShell({ children }: { children: ReactNode }) {
  return (
    <main className={adminPageClass}>
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-10rem] h-[30rem] w-[30rem] rounded-full bg-cyan-300/12 blur-[150px]" />
        <div className="absolute right-[-10rem] top-[6rem] h-[28rem] w-[28rem] rounded-full bg-blue-400/10 blur-[150px]" />
        <div className="absolute bottom-[-8rem] left-[12%] h-[24rem] w-[24rem] rounded-full bg-amber-300/8 blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_42%)]" />
      </div>

      <div className="relative mx-auto max-w-[1440px]">{children}</div>
    </main>
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
    <div className="relative min-w-0 overflow-hidden rounded-[1.65rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.11),rgba(255,255,255,0.05))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-slate-300/80">
            {label}
          </p>
          <p className="mt-3 text-3xl font-extrabold tracking-[-0.06em] text-white">
            {value}
          </p>
          <p className="mt-2 max-w-[18rem] text-sm leading-7 text-slate-200/85">
            {description}
          </p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/12 text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          {icon}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-[1.6rem] border border-white/12 bg-white/[0.08] p-8 text-sm leading-7 text-slate-200/85 shadow-[0_18px_50px_rgba(0,0,0,0.16)] backdrop-blur-xl">
      {message}
    </div>
  )
}

function DetailItem({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div className="min-w-0 rounded-[1.2rem] border border-slate-200/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,250,252,0.88))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
      <div className="text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-slate-400/90">
        {label}
      </div>
      <div className="mt-2 min-w-0 break-words text-sm font-semibold leading-6 text-slate-800 [overflow-wrap:anywhere]">
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
    success: "border border-emerald-200 bg-emerald-50 text-emerald-800",
    warning: "border border-amber-200 bg-amber-50 text-amber-800",
    danger: "border border-red-200 bg-red-50 text-red-700",
    neutral: "border border-slate-200 bg-slate-100 text-slate-700",
  }

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] ${classes[tone]}`}
    >
      {label}
    </span>
  )
}

function PanelHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div>
      <div className="text-[0.74rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
        {eyebrow}
      </div>
      <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.05em] text-slate-950">
        {title}
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">{description}</p>
    </div>
  )
}

export default function Admin() {
  const [session, setSession] = useState<Session | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState("")

  const [tab, setTab] = useState<TabKey>("overview")

  const [reviews, setReviews] = useState<ReviewRow[]>([])
  const [inquiries, setInquiries] = useState<InquiryRow[]>([])
  const [clients, setClients] = useState<ClientRow[]>([])
  const [contactInquiries, setContactInquiries] = useState<ContactInquiryRow[]>([])
  const [outreachPendingCount, setOutreachPendingCount] = useState(0)

  const [dataLoading, setDataLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState("")
  const [busyId, setBusyId] = useState<string | null>(null)

  const [editingInquiry, setEditingInquiry] = useState<InquiryRow | null>(null)
  const [inquiryForm, setInquiryForm] = useState<InquiryEditForm | null>(null)
  const [inquiryFormError, setInquiryFormError] = useState("")

  const [websiteEditor, setWebsiteEditor] = useState<WebsiteEditorState | null>(null)
  const [websiteEditorError, setWebsiteEditorError] = useState("")

  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null)

  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("pending")

  const [requestSearch, setRequestSearch] = useState("")
  const [requestStatusFilter, setRequestStatusFilter] =
    useState<RequestStatusFilter>("all")
  const [requestWindowFilter, setRequestWindowFilter] =
    useState<RequestWindowFilter>("all")
  const [requestSort, setRequestSort] = useState<RequestSort>("needs_follow_up")
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null)

  const [clientSearch, setClientSearch] = useState("")
  const [clientStatusFilter, setClientStatusFilter] =
    useState<ClientStatusFilter>("attention")
  const [clientWindowFilter, setClientWindowFilter] =
    useState<ClientWindowFilter>("all")
  const [clientSort, setClientSort] = useState<ClientSort>("attention")
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

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
  }, [session])

  useEffect(() => {
    if (!editingInquiry && !websiteEditor && !confirmDialog) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [editingInquiry, websiteEditor, confirmDialog])

  const pendingReviews = useMemo(
    () => reviews.filter((review) => !review.approved),
    [reviews]
  )

  const inquiryIdsWithLinkedClients = useMemo(() => {
    return new Set(
      clients
        .map((client) => client.pricing_inquiry_id)
        .filter((value): value is string => Boolean(value))
    )
  }, [clients])

  const staleInquiries = useMemo(() => {
    return inquiries.filter((inquiry) => {
      if (["approved", "paid"].includes(inquiry.status.toLowerCase())) {
        return false
      }

      return daysBetweenNow(inquiry.last_contacted_at ?? inquiry.created_at) >= 3
    })
  }, [inquiries])

  const clientAttentionCount = useMemo(() => {
    return clients.filter((client) => {
      return (
        client.shutdown_required ||
        Boolean(client.payment_failed_at) ||
        isDueSoon(client.grace_period_ends_at, 5) ||
        !client.website_url
      )
    }).length
  }, [clients])

  const newContactCount = useMemo(
    () => contactInquiries.filter((inquiry) => isWithinPastDays(inquiry.created_at, 1)).length,
    [contactInquiries]
  )

  const filteredReviews = useMemo(() => {
    if (reviewFilter === "pending") {
      return pendingReviews
    }

    if (reviewFilter === "featured") {
      return reviews.filter((review) => review.featured)
    }

    return reviews
  }, [pendingReviews, reviewFilter, reviews])

  const filteredInquiries = useMemo(() => {
    const normalizedSearch = requestSearch.trim().toLowerCase()

    const filtered = inquiries.filter((inquiry) => {
      const searchTarget = [
        inquiry.business_name,
        inquiry.full_name,
        inquiry.email,
        inquiry.business_type,
        inquiry.domain_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      if (normalizedSearch && !searchTarget.includes(normalizedSearch)) {
        return false
      }

      if (requestWindowFilter === "today" && !isWithinPastDays(inquiry.created_at, 1)) {
        return false
      }

      if (requestWindowFilter === "7d" && !isWithinPastDays(inquiry.created_at, 7)) {
        return false
      }

      if (requestWindowFilter === "30d" && !isWithinPastDays(inquiry.created_at, 30)) {
        return false
      }

      if (requestStatusFilter === "needs_follow_up") {
        return staleInquiries.some((item) => item.id === inquiry.id)
      }

      if (requestStatusFilter === "linked_client") {
        return inquiryIdsWithLinkedClients.has(inquiry.id)
      }

      return requestStatusFilter === "all" || inquiry.status === requestStatusFilter
    })

    return filtered.sort((a, b) => {
      if (requestSort === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      }

      if (requestSort === "highest_value") {
        return Number(b.total_setup || 0) - Number(a.total_setup || 0)
      }

      if (requestSort === "needs_follow_up") {
        const overdueDiff =
          Number(staleInquiries.some((item) => item.id === b.id)) -
          Number(staleInquiries.some((item) => item.id === a.id))

        if (overdueDiff !== 0) {
          return overdueDiff
        }
      }

      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [
    inquiries,
    inquiryIdsWithLinkedClients,
    requestSearch,
    requestSort,
    requestStatusFilter,
    requestWindowFilter,
    staleInquiries,
  ])

  const filteredClients = useMemo(() => {
    const normalizedSearch = clientSearch.trim().toLowerCase()

    const filtered = clients.filter((client) => {
      const searchTarget = [
        client.business_name,
        client.full_name,
        client.email,
        client.website_url,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      if (normalizedSearch && !searchTarget.includes(normalizedSearch)) {
        return false
      }

      if (clientWindowFilter === "7d" && !isWithinPastDays(client.updated_at, 7)) {
        return false
      }

      if (clientWindowFilter === "30d" && !isWithinPastDays(client.updated_at, 30)) {
        return false
      }

      if (clientStatusFilter === "attention") {
        return (
          client.shutdown_required ||
          Boolean(client.payment_failed_at) ||
          isDueSoon(client.grace_period_ends_at, 5) ||
          !client.website_url
        )
      }

      if (clientStatusFilter === "missing_website") {
        return !client.website_url
      }

      if (clientStatusFilter === "active") {
        return client.subscription_status === "active" && !client.shutdown_required
      }

      return clientStatusFilter === "all" || client.website_status === clientStatusFilter
    })

    return filtered.sort((a, b) => {
      if (clientSort === "alphabetical") {
        return a.business_name.localeCompare(b.business_name)
      }

      if (clientSort === "attention") {
        const score = (client: ClientRow) => {
          if (client.shutdown_required) return 3
          if (client.payment_failed_at) return 2
          if (!client.website_url || isDueSoon(client.grace_period_ends_at, 5)) return 1
          return 0
        }

        const difference = score(b) - score(a)
        if (difference !== 0) {
          return difference
        }
      }

      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })
  }, [clientSearch, clientSort, clientStatusFilter, clientWindowFilter, clients])

  const selectedInquiry =
    filteredInquiries.find((inquiry) => inquiry.id === selectedInquiryId) ??
    filteredInquiries[0] ??
    null

  const selectedClient =
    filteredClients.find((client) => client.id === selectedClientId) ??
    filteredClients[0] ??
    null

  useEffect(() => {
    if (filteredInquiries.length === 0) {
      setSelectedInquiryId(null)
      return
    }

    if (!filteredInquiries.some((inquiry) => inquiry.id === selectedInquiryId)) {
      setSelectedInquiryId(filteredInquiries[0].id)
    }
  }, [filteredInquiries, selectedInquiryId])

  useEffect(() => {
    if (filteredClients.length === 0) {
      setSelectedClientId(null)
      return
    }

    if (!filteredClients.some((client) => client.id === selectedClientId)) {
      setSelectedClientId(filteredClients[0].id)
    }
  }, [filteredClients, selectedClientId])

  async function callAdminAction(action: AdminAction) {
    const payload = (await invokeProtectedFunction<AdminDashboardPayload>(
      "admin-dashboard",
      action
    )) as AdminDashboardPayload

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
      setContactInquiries(payload.contactInquiries ?? [])
      setOutreachPendingCount(payload.outreachPendingCount ?? 0)
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

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault()
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
      setActionMessage(
        `Could not approve review: ${
          error instanceof Error ? error.message : "Unknown error."
        }`
      )
    } finally {
      setBusyId(null)
    }
  }

  async function deleteReview(reviewId: string) {
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
      setActionMessage(
        `Could not delete review: ${
          error instanceof Error ? error.message : "Unknown error."
        }`
      )
    } finally {
      setBusyId(null)
    }
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
      setActionMessage(
        `Could not update inquiry: ${
          error instanceof Error ? error.message : "Unknown error."
        }`
      )
    } finally {
      setBusyId(null)
    }
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
      setInquiryFormError(
        error instanceof Error ? error.message : "Could not update request."
      )
    } finally {
      setBusyId(null)
    }
  }

  async function deleteInquiry(inquiry: InquiryRow) {
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
      setActionMessage(
        `Could not delete request: ${
          error instanceof Error ? error.message : "Unknown error."
        }`
      )
    } finally {
      setBusyId(null)
    }
  }

  async function createAndSendPaymentLink(inquiryId: string) {
    setBusyId(inquiryId)
    setActionMessage("")

    try {
      const data = await invokeProtectedFunction<Record<string, unknown>>(
        "create-payment-link",
        { inquiryId }
      )

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
          typeof data?.customerEmail === "string" ? data.customerEmail : ""
        )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

        openExternalWindow(mailto)
        openExternalWindow(paymentUrl)
      }

      const itemSummary = lineItems.length ? ` Items: ${lineItems.join(", ")}.` : ""
      const reusedSummary = data?.reused ? " Existing checkout link reused." : ""

      if (emailDeliveryStatus === "sent") {
        setActionMessage(
          `Payment link created and emailed automatically.${reusedSummary}${itemSummary}`
        )
      } else if (emailDeliveryStatus === "failed") {
        setActionMessage(
          `Payment link created, but automatic email failed: ${
            emailDeliveryError || "Unknown email error"
          }. A fallback mail draft and the Stripe checkout page were opened.${reusedSummary}${itemSummary}`
        )
      } else {
        setActionMessage(
          `Payment link created. Automatic email delivery is not configured, so a fallback mail draft and the Stripe checkout page were opened.${reusedSummary}${itemSummary}`
        )
      }
    } catch (error) {
      setActionMessage(
        `Could not create payment link: ${
          error instanceof Error ? error.message : "Unknown function error."
        }`
      )
    } finally {
      setBusyId(null)
    }
  }

  async function generatePortalLink(clientId: string) {
    setBusyId(clientId)
    setActionMessage("")

    try {
      const data = await invokeProtectedFunction<Record<string, unknown>>(
        "create-billing-portal-link",
        { clientId }
      )

      await loadAdminData()

      const url = data?.url as string | undefined
      if (url) {
        openExternalWindow(url)
      }

      setActionMessage("Billing portal link created.")
    } catch (error) {
      setActionMessage(
        `Could not create billing portal link: ${
          error instanceof Error ? error.message : "Unknown function error."
        }`
      )
    } finally {
      setBusyId(null)
    }
  }

  async function sendManualReminder(clientId: string) {
    setBusyId(clientId)
    setActionMessage("")

    try {
      const data = await invokeProtectedFunction<Record<string, unknown>>(
        "process-client-billing",
        {
          mode: "single",
          clientId,
          forceSendReminder: true,
        }
      )

      await loadAdminData()
      setActionMessage(
        typeof data?.message === "string" ? data.message : "Reminder processed."
      )
    } catch (error) {
      setActionMessage(
        `Could not send reminder: ${
          error instanceof Error ? error.message : "Unknown function error."
        }`
      )
    } finally {
      setBusyId(null)
    }
  }

  function openWebsiteEditor(client: ClientRow) {
    setWebsiteEditor({
      clientId: client.id,
      businessName: client.business_name,
      websiteLabel: client.website_label ?? client.business_name,
      websiteUrl: client.website_url ?? "",
    })
    setWebsiteEditorError("")
  }

  function closeWebsiteEditor() {
    setWebsiteEditor(null)
    setWebsiteEditorError("")
  }

  function updateWebsiteEditor<K extends keyof WebsiteEditorState>(
    key: K,
    value: WebsiteEditorState[K]
  ) {
    setWebsiteEditor((current) =>
      current
        ? {
            ...current,
            [key]: value,
          }
        : current
    )
    setWebsiteEditorError("")
  }

  async function saveWebsiteInfo() {
    if (!websiteEditor) return

    const saveBusyId = `website-save:${websiteEditor.clientId}`
    setBusyId(saveBusyId)
    setWebsiteEditorError("")

    try {
      const payload = await callAdminAction({
        action: "client",
        operation: "updateWebsiteInfo",
        clientId: websiteEditor.clientId,
        websiteLabel: websiteEditor.websiteLabel,
        websiteUrl: websiteEditor.websiteUrl,
      })
      await loadAdminData({ preserveMessage: true })
      closeWebsiteEditor()
      setActionMessage(payload.message || "Website info updated.")
    } catch (error) {
      setWebsiteEditorError(
        error instanceof Error ? error.message : "Could not update website info."
      )
    } finally {
      setBusyId(null)
    }
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
      setActionMessage(
        `Could not update website status: ${
          error instanceof Error ? error.message : "Unknown error."
        }`
      )
    } finally {
      setBusyId(null)
    }
  }

  async function handleConfirmAction() {
    if (!confirmDialog) return

    const currentDialog = confirmDialog
    setConfirmDialog(null)

    if (currentDialog.kind === "delete-review") {
      await deleteReview(currentDialog.reviewId)
      return
    }

    if (currentDialog.kind === "delete-inquiry") {
      await deleteInquiry(currentDialog.inquiry)
      return
    }

    await markClientWebsiteStatus(currentDialog.clientId, "shut_down")
  }

  function renderClientStatus(client: ClientRow) {
    if (client.shutdown_required) {
      return { label: "Needs shutdown", tone: "danger" as const }
    }

    if (client.payment_failed_at) {
      return { label: "Payment failed", tone: "warning" as const }
    }

    if (client.subscription_status === "active") {
      return { label: "Active", tone: "success" as const }
    }

    return {
      label: client.subscription_status || client.website_status.replaceAll("_", " "),
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

  function renderInquiryStatus(status: string) {
    const normalized = status.toLowerCase()

    if (normalized === "approved" || normalized === "paid") {
      return { label: status, tone: "success" as const }
    }

    if (normalized === "new" || normalized === "pending") {
      return { label: status, tone: "warning" as const }
    }

    if (normalized.includes("expired")) {
      return { label: status, tone: "danger" as const }
    }

    return { label: status, tone: "neutral" as const }
  }

  const tabItems = [
    {
      key: "overview" as const,
      label: "Overview",
      summary: `${staleInquiries.length} requests need follow-up`,
      description: "Start with the queues that need attention before diving into full records.",
    },
    {
      key: "reviews" as const,
      label: `Reviews (${pendingReviews.length})`,
      summary: `${reviews.length} total testimonials`,
      description: "Approve public testimonials and keep the trust page clean.",
    },
    {
      key: "requests" as const,
      label: `Requests (${inquiries.length})`,
      summary: `${staleInquiries.length} follow-ups overdue`,
      description: "Filter, scan, and open one request at a time in a cleaner triage layout.",
    },
    {
      key: "clients" as const,
      label: `Clients (${clients.length})`,
      summary: `${clientAttentionCount} client accounts need attention`,
      description: "Watch billing health, website status, and reminders without losing context.",
    },
    {
      key: "outreach" as const,
      label: `Outreach (${outreachPendingCount})`,
      summary: `${outreachPendingCount} draft approvals waiting`,
      description: "Review the outbound automation queue and recent delivery activity.",
    },
    {
      key: "analytics" as const,
      label: "Analytics",
      summary: "Traffic, top pages, and CTA events",
      description: "See what traffic is reaching the site and which actions are converting.",
    },
  ]

  const activeTab = tabItems.find((item) => item.key === tab) ?? tabItems[0]

  if (authLoading) {
    return (
      <AdminShell>
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
          <div className="rounded-[1.8rem] border border-white/12 bg-white/[0.08] px-8 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
            Loading admin...
          </div>
        </div>
      </AdminShell>
    )
  }

  if (!session) {
    return (
      <AdminShell>
        <div className="grid min-h-[calc(100vh-4rem)] max-w-5xl items-center gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
          <div className="min-w-0 space-y-6">
            <div className={heroPanelClass}>
              <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute left-[-4rem] top-[-6rem] h-48 w-48 rounded-full bg-cyan-300/10 blur-3xl" />
                <div className="absolute bottom-[-5rem] right-[-2rem] h-56 w-56 rounded-full bg-blue-300/8 blur-3xl" />
              </div>

              <div className="relative inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-slate-200">
                <LayoutDashboard className="h-4 w-4" />
                Levamen Tech admin
              </div>

              <h1 className="relative mt-6 max-w-2xl text-4xl font-extrabold tracking-[-0.07em] text-white sm:text-5xl">
                A cleaner control panel for reviews, requests, billing, and traffic.
              </h1>

              <p className="relative mt-5 max-w-xl text-base leading-8 text-slate-200">
                Sign in with your Supabase auth account to manage testimonials,
                pricing requests, client records, outreach approvals, and site traffic
                from one place.
              </p>

              <div className="relative mt-8 grid gap-4 sm:grid-cols-3">
                <MetricCard
                  label="Reviews"
                  value="Moderate"
                  description="Approve or remove incoming testimonials."
                  icon={<MessageSquareQuote className="h-5 w-5" />}
                />
                <MetricCard
                  label="Requests"
                  value="Triage"
                  description="Track conversations, payments, and follow-up risk."
                  icon={<Mail className="h-5 w-5" />}
                />
                <MetricCard
                  label="Traffic"
                  value="Watch"
                  description="See which pages and CTAs are attracting attention."
                  icon={<Globe className="h-5 w-5" />}
                />
              </div>
            </div>
          </div>

          <form onSubmit={handleLogin} className={heroPanelClass}>
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
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                className={`${adminFieldClass} bg-white/92`}
              />
            </label>

            <label className="mb-5 block">
              <span className="mb-2 block text-sm font-bold text-slate-200">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                className={`${adminFieldClass} bg-white/92`}
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
      </AdminShell>
    )
  }

  return (
    <AdminShell>
      <Seo title="Admin Dashboard" description="Levamen Tech internal admin dashboard." path="/admin" noindex />

      <div className="space-y-6">
        <div className={heroPanelClass}>
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-[-4rem] top-[-7rem] h-56 w-56 rounded-full bg-cyan-300/10 blur-3xl" />
            <div className="absolute right-[-6rem] top-[3rem] h-64 w-64 rounded-full bg-blue-400/10 blur-3xl" />
            <div className="absolute bottom-[-7rem] left-[18%] h-56 w-56 rounded-full bg-amber-300/8 blur-3xl" />
          </div>

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.2em] text-slate-200">
                <LayoutDashboard className="h-4 w-4" />
                Levamen Tech admin
              </div>
              <h1 className="mt-5 text-4xl font-extrabold tracking-[-0.06em] text-white sm:text-5xl">
                Admin panel
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-200">
                Start on the overview to catch urgent work, then jump into the cleaner
                request, client, outreach, and analytics workspaces as needed.
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

          <div className="relative mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              label="Pending reviews"
              value={pendingReviews.length}
              description="Testimonials waiting for moderation."
              icon={<MessageSquareQuote className="h-5 w-5" />}
            />
            <MetricCard
              label="Follow-up overdue"
              value={staleInquiries.length}
              description="Requests that have sat too long without a touch."
              icon={<Clock3 className="h-5 w-5" />}
            />
            <MetricCard
              label="Client attention"
              value={clientAttentionCount}
              description="Billing or website records that need another look."
              icon={<Users className="h-5 w-5" />}
            />
            <MetricCard
              label="Outreach approvals"
              value={outreachPendingCount}
              description="Drafts waiting for a send decision."
              icon={<Mail className="h-5 w-5" />}
            />
            <MetricCard
              label="New contact leads"
              value={newContactCount}
              description="Lightweight contact form messages from the last day."
              icon={<Globe className="h-5 w-5" />}
            />
          </div>

          <div className="relative mt-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex flex-wrap gap-3">
              {tabItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => setTab(item.key)}
                  aria-pressed={tab === item.key}
                  className={tab === item.key ? buttonClass.primary : buttonClass.secondary}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="max-w-xl rounded-[1.5rem] border border-white/10 bg-slate-950/25 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
              <div className="text-[0.72rem] font-extrabold uppercase tracking-[0.2em] text-slate-300/75">
                Current workspace
              </div>
              <div className="mt-2 text-xl font-extrabold tracking-[-0.04em] text-white">
                {activeTab.summary}
              </div>
              <p className="mt-1 text-sm leading-7 text-slate-300">{activeTab.description}</p>
            </div>
          </div>
        </div>

        {actionMessage ? (
          <div className="rounded-[1.5rem] border border-white/12 bg-white/[0.08] px-5 py-4 text-sm font-semibold text-slate-100 shadow-[0_18px_50px_rgba(0,0,0,0.12)] backdrop-blur-xl">
            {actionMessage}
          </div>
        ) : null}

        {dataLoading ? (
          <EmptyState message="Loading admin data..." />
        ) : tab === "overview" ? (
          <div className="space-y-6">
            <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <div className={surfaceCardClass}>
                <PanelHeading
                  eyebrow="Needs attention"
                  title="Priority queues"
                  description="These are the most likely places where something gets missed if nobody looks today."
                />

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <QuickActionCard
                    title="Pending reviews"
                    value={pendingReviews.length}
                    description="Approve or remove new testimonials before they sit too long."
                    actionLabel="Open reviews"
                    onClick={() => setTab("reviews")}
                  />
                  <QuickActionCard
                    title="Overdue requests"
                    value={staleInquiries.length}
                    description="Requests with no recent follow-up and no completed outcome."
                    actionLabel="Open requests"
                    onClick={() => setTab("requests")}
                  />
                  <QuickActionCard
                    title="Client billing watchlist"
                    value={clientAttentionCount}
                    description="Failed billing, missing website info, or grace periods ending soon."
                    actionLabel="Open clients"
                    onClick={() => setTab("clients")}
                  />
                  <QuickActionCard
                    title="Outreach approvals"
                    value={outreachPendingCount}
                    description="Drafts queued and waiting for a human send decision."
                    actionLabel="Open outreach"
                    onClick={() => setTab("outreach")}
                  />
                </div>
              </div>

              <div className={surfaceCardClass}>
                <PanelHeading
                  eyebrow="Recent contact leads"
                  title="Lightweight inquiries"
                  description="These are short-form messages from the new contact form, useful for people who were not ready for the full pricing flow."
                />

                <div className="mt-6 space-y-4">
                  {contactInquiries.length === 0 ? (
                    <InfoPanel message="No lightweight contact inquiries have been submitted yet." />
                  ) : (
                    contactInquiries.slice(0, 5).map((lead) => (
                      <div
                        key={lead.id}
                        className="rounded-[1.2rem] border border-slate-200/80 bg-slate-50/80 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge
                            label={isWithinPastDays(lead.created_at, 1) ? "New today" : lead.status}
                            tone={isWithinPastDays(lead.created_at, 1) ? "warning" : "neutral"}
                          />
                          {lead.requested_demo_slug ? (
                            <StatusBadge label={lead.requested_demo_slug} tone="neutral" />
                          ) : null}
                        </div>
                        <div className="mt-4 font-extrabold tracking-[-0.03em] text-slate-950">
                          {lead.business_name || lead.full_name}
                        </div>
                        <div className="mt-1 text-sm leading-7 text-slate-500">
                          {lead.full_name} / {lead.email}
                        </div>
                        <div className="mt-2 text-sm leading-7 text-slate-600">{lead.message}</div>
                        <div className="mt-3 text-xs uppercase tracking-[0.16em] text-slate-400">
                          {formatDate(lead.created_at)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            <section className="grid gap-6 xl:grid-cols-3">
              <div className={surfaceCardClass}>
                <PanelHeading
                  eyebrow="Follow-up"
                  title="Requests at risk"
                  description="Oldest untouched items bubble up here so you can recover them fast."
                />
                <div className="mt-6 space-y-3">
                  {staleInquiries.slice(0, 5).map((inquiry) => (
                    <button
                      key={inquiry.id}
                      onClick={() => {
                        setTab("requests")
                        setSelectedInquiryId(inquiry.id)
                      }}
                      className="w-full rounded-[1.25rem] border border-slate-200/80 bg-slate-50/80 px-4 py-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition hover:border-slate-300 hover:bg-white"
                    >
                      <div className="font-extrabold tracking-[-0.02em] text-slate-950">
                        {inquiry.business_name}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {inquiry.full_name} / {inquiry.email}
                      </div>
                      <div className="mt-2 text-sm font-semibold text-red-700">
                        {daysBetweenNow(inquiry.last_contacted_at ?? inquiry.created_at)} day(s) since last touch
                      </div>
                    </button>
                  ))}
                  {staleInquiries.length === 0 ? (
                    <InfoPanel message="No overdue request follow-ups right now." />
                  ) : null}
                </div>
              </div>

              <div className={surfaceCardClass}>
                <PanelHeading
                  eyebrow="Billing"
                  title="Client watchlist"
                  description="Clients that may need reminders, website updates, or shutdown review."
                />
                <div className="mt-6 space-y-3">
                  {clients
                    .filter((client) => {
                      return (
                        client.shutdown_required ||
                        Boolean(client.payment_failed_at) ||
                        isDueSoon(client.grace_period_ends_at, 5) ||
                        !client.website_url
                      )
                    })
                    .slice(0, 5)
                    .map((client) => (
                      <button
                        key={client.id}
                        onClick={() => {
                          setTab("clients")
                          setSelectedClientId(client.id)
                        }}
                        className="w-full rounded-[1.25rem] border border-slate-200/80 bg-slate-50/80 px-4 py-4 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] transition hover:border-slate-300 hover:bg-white"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-extrabold tracking-[-0.02em] text-slate-950">
                            {client.business_name}
                          </div>
                          <StatusBadge label={renderClientStatus(client).label} tone={renderClientStatus(client).tone} />
                        </div>
                        <div className="mt-2 text-sm leading-7 text-slate-600">
                          {!client.website_url
                            ? "Website URL missing."
                            : client.payment_failed_at
                              ? "Billing issue flagged."
                              : isDueSoon(client.grace_period_ends_at, 5)
                                ? `Grace ends ${formatDateOnly(client.grace_period_ends_at)}.`
                                : "Needs attention."}
                        </div>
                      </button>
                    ))}
                  {clientAttentionCount === 0 ? (
                    <InfoPanel message="No client billing or website issues are flagged right now." />
                  ) : null}
                </div>
              </div>

              <div className={surfaceCardClass}>
                <PanelHeading
                  eyebrow="Trust queue"
                  title="Pending testimonials"
                  description="Moderate incoming reviews before they pile up or lose context."
                />
                <div className="mt-6 space-y-3">
                  {pendingReviews.slice(0, 5).map((review) => (
                    <div
                      key={review.id}
                      className="rounded-[1.25rem] border border-slate-200/80 bg-slate-50/80 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
                    >
                      <div className="font-extrabold tracking-[-0.02em] text-slate-950">
                        {review.client_name}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {[review.business_name, review.industry].filter(Boolean).join(" / ") || "Pending review"}
                      </div>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        {review.review_headline || review.review_text}
                      </p>
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          onClick={() => void approveReview(review.id)}
                          disabled={busyId === review.id}
                          className={surfacePrimaryButtonClass}
                        >
                          {busyId === review.id ? "Approving..." : "Approve"}
                        </button>
                        <button
                          onClick={() =>
                            setConfirmDialog({
                              kind: "delete-review",
                              title: "Delete this review?",
                              description: "This permanently removes the testimonial from the moderation queue.",
                              reviewId: review.id,
                              confirmLabel: "Delete review",
                            })
                          }
                          disabled={busyId === review.id}
                          className={buttonClass.danger}
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {pendingReviews.length === 0 ? (
                    <InfoPanel message="No testimonials are waiting for moderation." />
                  ) : null}
                </div>
              </div>
            </section>
          </div>
        ) : tab === "reviews" ? (
          <div className="space-y-6">
            <div className={surfaceCardClass}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <PanelHeading
                  eyebrow="Moderation"
                  title="Reviews workspace"
                  description="Keep the public testimonial page sharp by clearing pending reviews fast and trimming anything that should not go live."
                />

                <div className="flex flex-wrap gap-3">
                  {[
                    { key: "pending" as const, label: `Pending (${pendingReviews.length})` },
                    { key: "all" as const, label: `All (${reviews.length})` },
                    { key: "featured" as const, label: "Featured only" },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setReviewFilter(item.key)}
                      className={reviewFilter === item.key ? surfacePrimaryButtonClass : surfaceButtonClass}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredReviews.length === 0 ? (
              <EmptyState message="No reviews match the current filter." />
            ) : (
              <div className="grid gap-6 xl:grid-cols-2">
                {filteredReviews.map((review) => {
                  const reviewTone = review.approved ? "success" : "warning"

                  return (
                    <article key={review.id} className={surfaceCardClass}>
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge
                              label={review.approved ? "Approved" : "Pending"}
                              tone={reviewTone}
                            />
                            {review.featured ? (
                              <StatusBadge label="Featured" tone="neutral" />
                            ) : null}
                          </div>
                          <h2 className="mt-4 text-2xl font-extrabold tracking-[-0.04em] text-slate-950">
                            {review.client_name}
                          </h2>
                          <p className="mt-2 text-sm leading-7 text-slate-500">
                            {[review.business_name, review.industry].filter(Boolean).join(" / ") || "Levamen Tech client"}
                          </p>
                        </div>

                        <div className={`${surfaceMetricClass} text-right`}>
                          <div className="text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                            Submitted
                          </div>
                          <div className="mt-1 text-base font-extrabold tracking-[-0.02em] text-slate-950">
                            {formatDate(review.created_at)}
                          </div>
                        </div>
                      </div>

                      {review.review_headline ? (
                        <div className="mt-5">
                          <div className="text-[0.74rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                            Headline
                          </div>
                          <p className="mt-2 text-sm leading-8 text-slate-700">{review.review_headline}</p>
                        </div>
                      ) : null}

                      <div className="mt-5">
                        <div className="text-[0.74rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                          Review
                        </div>
                        <p className="mt-2 text-sm leading-8 text-slate-700">{review.review_text}</p>
                      </div>

                      <div className={surfaceFooterClass}>
                        {!review.approved ? (
                          <button
                            onClick={() => void approveReview(review.id)}
                            disabled={busyId === review.id}
                            className={surfacePrimaryButtonClass}
                          >
                            {busyId === review.id ? "Approving..." : "Approve"}
                          </button>
                        ) : null}

                        <button
                          onClick={() =>
                            setConfirmDialog({
                              kind: "delete-review",
                              title: "Delete this review?",
                              description: "This permanently removes the review from the site and moderation queue.",
                              reviewId: review.id,
                              confirmLabel: "Delete review",
                            })
                          }
                          disabled={busyId === review.id}
                          className={buttonClass.danger}
                        >
                          <Trash2 className="h-4 w-4" />
                          {busyId === review.id ? "Working..." : "Delete"}
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        ) : tab === "requests" ? (
          filteredInquiries.length === 0 ? (
            <EmptyState message="No pricing inquiries match the current filters." />
          ) : (
            <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
              <div className={`${surfaceCardClass} h-fit`}>
                <PanelHeading
                  eyebrow="Triage"
                  title="Requests list"
                  description="Filter the queue, then open one request at a time in the detail panel."
                />

                <div className="mt-6 grid gap-3">
                  <label>
                    <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Search className="h-4 w-4" />
                      Search
                    </span>
                    <input
                      value={requestSearch}
                      onChange={(event) => setRequestSearch(event.target.value)}
                      placeholder="Business, person, email, domain..."
                      className={adminFieldClass}
                    />
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label>
                      <span className="mb-2 block text-sm font-bold text-slate-700">Status</span>
                      <select
                        value={requestStatusFilter}
                        onChange={(event) =>
                          setRequestStatusFilter(event.target.value as RequestStatusFilter)
                        }
                        className={adminFieldClass}
                      >
                        <option value="all">All</option>
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="approved">Approved</option>
                        <option value="payment_sent">Payment sent</option>
                        <option value="paid">Paid</option>
                        <option value="needs_follow_up">Needs follow-up</option>
                        <option value="linked_client">Linked client</option>
                      </select>
                    </label>

                    <label>
                      <span className="mb-2 block text-sm font-bold text-slate-700">Date range</span>
                      <select
                        value={requestWindowFilter}
                        onChange={(event) =>
                          setRequestWindowFilter(event.target.value as RequestWindowFilter)
                        }
                        className={adminFieldClass}
                      >
                        <option value="all">All time</option>
                        <option value="today">Today</option>
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                      </select>
                    </label>
                  </div>

                  <label>
                    <span className="mb-2 block text-sm font-bold text-slate-700">Sort</span>
                    <select
                      value={requestSort}
                      onChange={(event) => setRequestSort(event.target.value as RequestSort)}
                      className={adminFieldClass}
                    >
                      <option value="needs_follow_up">Needs follow-up first</option>
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                      <option value="highest_value">Highest setup total first</option>
                    </select>
                  </label>
                </div>

                <div className="mt-6 text-sm font-semibold text-slate-500">
                  {filteredInquiries.length} request(s) match the current triage filters
                </div>

                <div className="mt-4 grid gap-3">
                  {filteredInquiries.map((inquiry) => {
                    const inquiryStatus = renderInquiryStatus(inquiry.status)
                    const flags = getInquiryFlags(
                      inquiry,
                      inquiryIdsWithLinkedClients.has(inquiry.id)
                    )
                    const selected = selectedInquiry?.id === inquiry.id

                    return (
                      <button
                        key={inquiry.id}
                        onClick={() => setSelectedInquiryId(inquiry.id)}
                        className={[
                          "rounded-[1.35rem] border px-4 py-4 text-left transition",
                          selected
                            ? "border-slate-950/12 bg-slate-950 text-white shadow-[0_20px_48px_rgba(15,23,42,0.16)]"
                            : "border-slate-200/80 bg-slate-50/80 hover:border-slate-300 hover:bg-white",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-extrabold tracking-[-0.02em]">
                              {inquiry.business_name}
                            </div>
                            <div className={selected ? "mt-1 text-sm text-slate-300" : "mt-1 text-sm text-slate-500"}>
                              {inquiry.full_name}
                            </div>
                          </div>
                          <div className={selected ? "text-sm font-bold text-slate-200" : "text-sm font-bold text-slate-700"}>
                            {currency.format(Number(inquiry.total_setup || 0))}
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          <StatusBadge label={inquiryStatus.label} tone={inquiryStatus.tone} />
                          {flags.slice(0, 2).map((flag) => (
                            <StatusBadge key={`${inquiry.id}-${flag.label}`} label={flag.label} tone={flag.tone} />
                          ))}
                        </div>

                        <div className={selected ? "mt-3 text-xs uppercase tracking-[0.16em] text-slate-300" : "mt-3 text-xs uppercase tracking-[0.16em] text-slate-400"}>
                          {formatDate(inquiry.created_at)}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {selectedInquiry ? (
                <article className={surfaceCardClass}>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge
                          label={renderInquiryStatus(selectedInquiry.status).label}
                          tone={renderInquiryStatus(selectedInquiry.status).tone}
                        />
                        {getInquiryFlags(
                          selectedInquiry,
                          inquiryIdsWithLinkedClients.has(selectedInquiry.id)
                        ).map((flag) => (
                          <StatusBadge
                            key={`${selectedInquiry.id}-${flag.label}`}
                            label={flag.label}
                            tone={flag.tone}
                          />
                        ))}
                      </div>
                      <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.05em] text-slate-950">
                        {selectedInquiry.business_name}
                      </h2>
                      <p className="mt-2 text-sm leading-7 text-slate-500">
                        {selectedInquiry.full_name} / {selectedInquiry.email}
                        {selectedInquiry.phone ? ` / ${selectedInquiry.phone}` : ""}
                      </p>
                    </div>

                    <div className={`${surfaceMetricClass} text-right`}>
                      <div className="text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                        Pricing
                      </div>
                      <div className="mt-1 text-base font-extrabold tracking-[-0.02em] text-slate-950">
                        {currency.format(Number(selectedInquiry.total_setup || 0))} setup
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-500">
                        {currency.format(Number(selectedInquiry.total_monthly || 0))}/mo
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <DetailItem label="Plan" value={selectedInquiry.plan_name} />
                    <DetailItem
                      label="Domain"
                      value={`${selectedInquiry.domain_choice}${selectedInquiry.domain_name ? ` (${selectedInquiry.domain_name})` : ""}`}
                    />
                    <DetailItem label="Timeline" value={selectedInquiry.timeline || "--"} />
                    <DetailItem label="Pages needed" value={selectedInquiry.pages_needed || "--"} />
                    <DetailItem label="Business type" value={selectedInquiry.business_type || "--"} />
                    <DetailItem label="Created" value={formatDate(selectedInquiry.created_at)} />
                    <DetailItem
                      label="Payment link"
                      value={
                        selectedInquiry.payment_link_url ? (
                          <a
                            href={selectedInquiry.payment_link_url}
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
                      value={formatDate(selectedInquiry.last_contacted_at)}
                    />
                  </div>

                  {selectedInquiry.selected_addons?.length ? (
                    <div className="mt-5 rounded-[1.3rem] border border-slate-200/75 bg-slate-50/90 p-4 text-sm leading-7 text-slate-600">
                      <span className="font-extrabold text-slate-900">Add-ons:</span>{" "}
                      {selectedInquiry.selected_addons.join(", ")}
                    </div>
                  ) : null}

                  <div className="mt-6 grid gap-4 xl:grid-cols-2">
                    <div className="rounded-[1.3rem] border border-slate-200/80 bg-slate-50/85 p-4">
                      <div className="text-[0.74rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                        Goals
                      </div>
                      <p className="mt-2 text-sm leading-8 text-slate-700">
                        {selectedInquiry.goals || "--"}
                      </p>
                    </div>

                    <div className="rounded-[1.3rem] border border-slate-200/80 bg-slate-50/85 p-4">
                      <div className="text-[0.74rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                        Notes
                      </div>
                      <p className="mt-2 text-sm leading-8 text-slate-700">
                        {selectedInquiry.notes || "--"}
                      </p>
                    </div>
                  </div>

                  {selectedInquiry.inspiration ? (
                    <div className="mt-5 rounded-[1.3rem] border border-slate-200/80 bg-slate-50/85 p-4">
                      <div className="text-[0.74rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                        Inspiration / reference sites
                      </div>
                      <p className="mt-2 text-sm leading-8 text-slate-700">{selectedInquiry.inspiration}</p>
                    </div>
                  ) : null}

                  <div className={surfaceFooterClass}>
                    <button
                      onClick={() => openInquiryEditor(selectedInquiry)}
                      disabled={busyId === `inquiry-save:${selectedInquiry.id}`}
                      className={surfaceButtonClass}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit request
                    </button>

                    <button
                      onClick={() => void updateInquiryStatus(selectedInquiry.id, "contacted")}
                      disabled={busyId === selectedInquiry.id}
                      className={surfaceButtonClass}
                    >
                      Mark contacted
                    </button>

                    <button
                      onClick={() => void updateInquiryStatus(selectedInquiry.id, "approved")}
                      disabled={busyId === selectedInquiry.id}
                      className={surfaceButtonClass}
                    >
                      Mark approved
                    </button>

                    <button
                      onClick={() => void createAndSendPaymentLink(selectedInquiry.id)}
                      disabled={busyId === selectedInquiry.id}
                      className={surfacePrimaryButtonClass}
                    >
                      {busyId === selectedInquiry.id ? "Creating..." : "Send payment link"}
                    </button>

                    <button
                      onClick={() =>
                        setConfirmDialog({
                          kind: "delete-inquiry",
                          title: "Delete this request?",
                          description: "Only use this when the request has no billing history and no linked client account.",
                          inquiry: selectedInquiry,
                          confirmLabel: "Delete request",
                        })
                      }
                      disabled={
                        busyId === `inquiry-delete:${selectedInquiry.id}` ||
                        !canDeleteInquiry(selectedInquiry)
                      }
                      className={buttonClass.danger}
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete request
                    </button>
                  </div>

                  {!canDeleteInquiry(selectedInquiry) ? (
                    <p className="mt-3 text-xs font-semibold leading-6 text-slate-500">
                      Delete is disabled after billing history exists or a client account is linked to the request.
                    </p>
                  ) : null}
                </article>
              ) : null}
            </div>
          )
        ) : tab === "clients" ? (
          filteredClients.length === 0 ? (
            <EmptyState message="No client accounts match the current filters." />
          ) : (
            <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
              <div className={`${surfaceCardClass} h-fit`}>
                <PanelHeading
                  eyebrow="Triage"
                  title="Clients list"
                  description="Sort by risk first, then open the full record on the right."
                />

                <div className="mt-6 grid gap-3">
                  <label>
                    <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Search className="h-4 w-4" />
                      Search
                    </span>
                    <input
                      value={clientSearch}
                      onChange={(event) => setClientSearch(event.target.value)}
                      placeholder="Business, contact, email, website..."
                      className={adminFieldClass}
                    />
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label>
                      <span className="mb-2 block text-sm font-bold text-slate-700">Status</span>
                      <select
                        value={clientStatusFilter}
                        onChange={(event) =>
                          setClientStatusFilter(event.target.value as ClientStatusFilter)
                        }
                        className={adminFieldClass}
                      >
                        <option value="all">All</option>
                        <option value="attention">Needs attention</option>
                        <option value="active">Active</option>
                        <option value="paused">Paused</option>
                        <option value="shut_down">Shut down</option>
                        <option value="missing_website">Missing website</option>
                      </select>
                    </label>

                    <label>
                      <span className="mb-2 block text-sm font-bold text-slate-700">Date range</span>
                      <select
                        value={clientWindowFilter}
                        onChange={(event) =>
                          setClientWindowFilter(event.target.value as ClientWindowFilter)
                        }
                        className={adminFieldClass}
                      >
                        <option value="all">All time</option>
                        <option value="7d">Updated in last 7 days</option>
                        <option value="30d">Updated in last 30 days</option>
                      </select>
                    </label>
                  </div>

                  <label>
                    <span className="mb-2 block text-sm font-bold text-slate-700">Sort</span>
                    <select
                      value={clientSort}
                      onChange={(event) => setClientSort(event.target.value as ClientSort)}
                      className={adminFieldClass}
                    >
                      <option value="attention">Attention first</option>
                      <option value="recent_activity">Recent activity</option>
                      <option value="alphabetical">Alphabetical</option>
                    </select>
                  </label>
                </div>

                <div className="mt-6 text-sm font-semibold text-slate-500">
                  {filteredClients.length} client account(s) match the current triage filters
                </div>

                <div className="mt-4 grid gap-3">
                  {filteredClients.map((client) => {
                    const selected = selectedClient?.id === client.id

                    return (
                      <button
                        key={client.id}
                        onClick={() => setSelectedClientId(client.id)}
                        className={[
                          "rounded-[1.35rem] border px-4 py-4 text-left transition",
                          selected
                            ? "border-slate-950/12 bg-slate-950 text-white shadow-[0_20px_48px_rgba(15,23,42,0.16)]"
                            : "border-slate-200/80 bg-slate-50/80 hover:border-slate-300 hover:bg-white",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-extrabold tracking-[-0.02em]">
                              {client.business_name}
                            </div>
                            <div className={selected ? "mt-1 text-sm text-slate-300" : "mt-1 text-sm text-slate-500"}>
                              {client.full_name}
                            </div>
                          </div>
                          <StatusBadge
                            label={renderClientStatus(client).label}
                            tone={renderClientStatus(client).tone}
                          />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {getClientFlags(client).slice(0, 2).map((flag) => (
                            <StatusBadge key={`${client.id}-${flag.label}`} label={flag.label} tone={flag.tone} />
                          ))}
                        </div>

                        <div className={selected ? "mt-3 text-xs uppercase tracking-[0.16em] text-slate-300" : "mt-3 text-xs uppercase tracking-[0.16em] text-slate-400"}>
                          Updated {formatDate(client.updated_at)}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {selectedClient ? (
                <article className={surfaceCardClass}>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge
                          label={renderClientStatus(selectedClient).label}
                          tone={renderClientStatus(selectedClient).tone}
                        />
                        {getClientFlags(selectedClient).map((flag) => (
                          <StatusBadge
                            key={`${selectedClient.id}-${flag.label}`}
                            label={flag.label}
                            tone={flag.tone}
                          />
                        ))}
                      </div>
                      <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.05em] text-slate-950">
                        {selectedClient.business_name}
                      </h2>
                      <p className="mt-2 text-sm leading-7 text-slate-500">
                        {selectedClient.full_name} / {selectedClient.email}
                      </p>
                    </div>

                    <div className={`${surfaceMetricClass} text-right`}>
                      <div className="text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                        Website status
                      </div>
                      <div className="mt-1 text-base font-extrabold tracking-[-0.02em] text-slate-950">
                        {selectedClient.website_status.replaceAll("_", " ")}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <DetailItem
                      label="Website"
                      value={
                        selectedClient.website_url ? (
                          <a
                            href={selectedClient.website_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-slate-900 hover:text-blue-700"
                          >
                            {selectedClient.website_label || selectedClient.website_url}
                            <ArrowUpRight className="h-4 w-4" />
                          </a>
                        ) : (
                          "--"
                        )
                      }
                    />
                    <DetailItem
                      label="Subscription"
                      value={selectedClient.subscription_status || "--"}
                    />
                    <DetailItem
                      label="Last invoice"
                      value={selectedClient.last_invoice_status || "--"}
                    />
                    <DetailItem
                      label="Current period end"
                      value={formatDateOnly(selectedClient.current_period_end)}
                    />
                    <DetailItem
                      label="Last payment"
                      value={
                        selectedClient.last_payment_at
                          ? `${formatDate(selectedClient.last_payment_at)}${
                              selectedClient.last_payment_amount != null
                                ? ` / ${currency.format(Number(selectedClient.last_payment_amount))}`
                                : ""
                            }`
                          : "--"
                      }
                    />
                    <DetailItem
                      label="Payment failed at"
                      value={formatDate(selectedClient.payment_failed_at)}
                    />
                    <DetailItem
                      label="Grace period ends"
                      value={formatDate(selectedClient.grace_period_ends_at)}
                    />
                    <DetailItem label="Reminder count" value={selectedClient.reminder_count} />
                  </div>

                  {selectedClient.notes ? (
                    <div className="mt-5 rounded-[1.3rem] border border-slate-200/80 bg-slate-50/85 p-4">
                      <div className="text-[0.74rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                        Notes
                      </div>
                      <p className="mt-2 text-sm leading-8 text-slate-700">{selectedClient.notes}</p>
                    </div>
                  ) : null}

                  {selectedClient.shutdown_required ? (
                    <div className="mt-5 rounded-[1.3rem] border border-red-200 bg-red-50 px-4 py-4 text-sm font-semibold leading-7 text-red-700">
                      This client has passed the grace period and should have their site shut down.
                    </div>
                  ) : null}

                  <div className={surfaceFooterClass}>
                    <button
                      onClick={() => openWebsiteEditor(selectedClient)}
                      disabled={busyId === `website-save:${selectedClient.id}`}
                      className={surfaceButtonClass}
                    >
                      <Globe className="h-4 w-4" />
                      Edit website info
                    </button>

                    <button
                      onClick={() => void generatePortalLink(selectedClient.id)}
                      disabled={busyId === selectedClient.id}
                      className={surfaceButtonClass}
                    >
                      <CreditCard className="h-4 w-4" />
                      {busyId === selectedClient.id ? "Working..." : "Open billing portal"}
                    </button>

                    <button
                      onClick={() => void sendManualReminder(selectedClient.id)}
                      disabled={busyId === selectedClient.id}
                      className={surfacePrimaryButtonClass}
                    >
                      {busyId === selectedClient.id ? "Working..." : "Send reminder"}
                    </button>

                    <button
                      onClick={() => void markClientWebsiteStatus(selectedClient.id, "active")}
                      disabled={busyId === selectedClient.id}
                      className={surfaceButtonClass}
                    >
                      Mark active
                    </button>

                    <button
                      onClick={() => void markClientWebsiteStatus(selectedClient.id, "paused")}
                      disabled={busyId === selectedClient.id}
                      className={surfaceButtonClass}
                    >
                      Mark paused
                    </button>

                    <button
                      onClick={() =>
                        setConfirmDialog({
                          kind: "mark-shut-down",
                          title: "Mark this site as shut down?",
                          description: "Use this when the grace period has ended and the takedown is complete or confirmed.",
                          clientId: selectedClient.id,
                          confirmLabel: "Mark shut down",
                        })
                      }
                      disabled={busyId === selectedClient.id}
                      className={buttonClass.danger}
                    >
                      Mark shut down
                    </button>
                  </div>
                </article>
              ) : null}
            </div>
          )
        ) : tab === "outreach" ? (
          <OutreachPanel />
        ) : (
          <AnalyticsPanel />
        )}
      </div>

      {editingInquiry && inquiryForm ? (
        <ModalShell>
          <div className={`${surfaceCardClass} w-full max-w-4xl sm:p-8`}>
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
                  Update the request details that guide follow-up and project scoping.
                  Plan, add-ons, and pricing totals stay as originally submitted.
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

            <div className="mt-6 rounded-[1.4rem] border border-slate-200/80 bg-slate-50/90 px-4 py-4 text-sm leading-7 text-slate-600">
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
                  <span className="mb-2 block text-sm font-bold text-slate-700">Full name</span>
                  <input
                    value={inquiryForm.fullName}
                    onChange={(event) => updateInquiryForm("fullName", event.target.value)}
                    className={adminFieldClass}
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-bold text-slate-700">Email</span>
                  <input
                    type="email"
                    value={inquiryForm.email}
                    onChange={(event) => updateInquiryForm("email", event.target.value)}
                    className={adminFieldClass}
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-bold text-slate-700">Business name</span>
                  <input
                    value={inquiryForm.businessName}
                    onChange={(event) => updateInquiryForm("businessName", event.target.value)}
                    className={adminFieldClass}
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-bold text-slate-700">Phone</span>
                  <input
                    value={inquiryForm.phone}
                    onChange={(event) => updateInquiryForm("phone", event.target.value)}
                    className={adminFieldClass}
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-bold text-slate-700">Business type</span>
                  <input
                    value={inquiryForm.businessType}
                    onChange={(event) => updateInquiryForm("businessType", event.target.value)}
                    className={adminFieldClass}
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-bold text-slate-700">Timeline</span>
                  <input
                    value={inquiryForm.timeline}
                    onChange={(event) => updateInquiryForm("timeline", event.target.value)}
                    className={adminFieldClass}
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-bold text-slate-700">Pages needed</span>
                  <input
                    value={inquiryForm.pagesNeeded}
                    onChange={(event) => updateInquiryForm("pagesNeeded", event.target.value)}
                    className={adminFieldClass}
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-bold text-slate-700">Requested domain</span>
                  <input
                    value={inquiryForm.domainName}
                    onChange={(event) => updateInquiryForm("domainName", event.target.value)}
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
                    onChange={(event) => updateInquiryForm("inspiration", event.target.value)}
                    className={`${adminFieldClass} min-h-[8rem] resize-y`}
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-bold text-slate-700">Goals</span>
                  <textarea
                    value={inquiryForm.goals}
                    onChange={(event) => updateInquiryForm("goals", event.target.value)}
                    className={`${adminFieldClass} min-h-[8rem] resize-y`}
                  />
                </label>

                <label>
                  <span className="mb-2 block text-sm font-bold text-slate-700">Notes</span>
                  <textarea
                    value={inquiryForm.notes}
                    onChange={(event) => updateInquiryForm("notes", event.target.value)}
                    className={`${adminFieldClass} min-h-[8rem] resize-y`}
                  />
                </label>
              </div>

              {inquiryFormError ? (
                <div className="rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {inquiryFormError}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 rounded-[1.35rem] border border-slate-200/80 bg-slate-50/85 p-3 sm:flex-row sm:items-center sm:justify-between">
                <button type="button" onClick={closeInquiryEditor} className={surfaceButtonClass}>
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={busyId === `inquiry-save:${editingInquiry.id}`}
                  className={surfacePrimaryButtonClass}
                >
                  <Pencil className="h-4 w-4" />
                  {busyId === `inquiry-save:${editingInquiry.id}` ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </ModalShell>
      ) : null}

      {websiteEditor ? (
        <ModalShell>
          <div className={`${surfaceCardClass} w-full max-w-2xl sm:p-8`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[0.74rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                  Website info
                </div>
                <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.05em] text-slate-950">
                  Edit {websiteEditor.businessName}
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  Replace the old prompt flow with a proper form so website record updates are easier to review.
                </p>
              </div>

              <button
                type="button"
                onClick={closeWebsiteEditor}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              className="mt-6 grid gap-4"
              onSubmit={(event) => {
                event.preventDefault()
                void saveWebsiteInfo()
              }}
            >
              <label>
                <span className="mb-2 block text-sm font-bold text-slate-700">Website label</span>
                <input
                  value={websiteEditor.websiteLabel}
                  onChange={(event) => updateWebsiteEditor("websiteLabel", event.target.value)}
                  className={adminFieldClass}
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-bold text-slate-700">Website URL</span>
                <input
                  value={websiteEditor.websiteUrl}
                  onChange={(event) => updateWebsiteEditor("websiteUrl", event.target.value)}
                  placeholder="https://"
                  className={adminFieldClass}
                />
              </label>

              {websiteEditorError ? (
                <div className="rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  {websiteEditorError}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3 rounded-[1.3rem] border border-slate-200/75 bg-slate-50/85 p-3">
                <button
                  type="submit"
                  disabled={busyId === `website-save:${websiteEditor.clientId}`}
                  className={surfacePrimaryButtonClass}
                >
                  <Globe className="h-4 w-4" />
                  {busyId === `website-save:${websiteEditor.clientId}` ? "Saving..." : "Save website info"}
                </button>
                <button type="button" onClick={closeWebsiteEditor} className={surfaceButtonClass}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </ModalShell>
      ) : null}

      {confirmDialog ? (
        <ModalShell>
          <div className={`${surfaceCardClass} w-full max-w-xl sm:p-8`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[0.74rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                  Confirmation
                </div>
                <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.05em] text-slate-950">
                  {confirmDialog.title}
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-500">{confirmDialog.description}</p>
              </div>

              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-[1.35rem] border border-slate-200/80 bg-slate-50/85 p-3 sm:flex-row sm:items-center sm:justify-between">
              <button type="button" onClick={() => setConfirmDialog(null)} className={surfaceButtonClass}>
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmAction()}
                className={buttonClass.danger}
              >
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </ModalShell>
      ) : null}
    </AdminShell>
  )
}

function QuickActionCard({
  title,
  value,
  description,
  actionLabel,
  onClick,
}: {
  title: string
  value: number
  description: string
  actionLabel: string
  onClick: () => void
}) {
  return (
    <div className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/85 p-4">
      <div className="text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-slate-400">
        {title}
      </div>
      <div className="mt-3 text-3xl font-extrabold tracking-[-0.05em] text-slate-950">{value}</div>
      <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
      <button onClick={onClick} className={`${surfaceButtonClass} mt-4`}>
        {actionLabel}
      </button>
    </div>
  )
}

function InfoPanel({ message }: { message: string }) {
  return (
    <div className="rounded-[1.2rem] border border-slate-200/80 bg-slate-50/80 px-4 py-4 text-sm leading-7 text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]">
      {message}
    </div>
  )
}

function ModalShell({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-slate-950/55 px-4 py-6 backdrop-blur-sm sm:px-6">
      {children}
    </div>
  )
}
