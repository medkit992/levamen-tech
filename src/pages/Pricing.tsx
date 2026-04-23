import { useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Globe,
  Laptop2,
  Receipt,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { Link, useSearchParams } from "react-router-dom"
import CompactReviewCard from "../components/reviews/CompactReviewCard"
import Seo from "../components/seo/Seo"
import { trackCta } from "../lib/analytics"
import {
  fetchApprovedReviews,
  type ApprovedReview,
} from "../lib/publicReviews"
import { supabase } from "../lib/supabase"
import {
  buildBreadcrumbStructuredData,
  buildFaqStructuredData,
  buildWebPageStructuredData,
  siteConfig,
} from "../seo/site"

type PlanKey = "starter" | "growth" | "premium"
type AddonKey =
  | "extraPage"
  | "seo"
  | "contactForm"
  | "booking"
  | "blog"
  | "rush"
  | "prioritySupport"
type DomainChoice = "have-domain" | "need-domain"

type StepShellProps = {
  title: string
  description: string
  icon: ReactNode
  children: ReactNode
}

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

const VALID_PLAN_KEYS: PlanKey[] = ["starter", "growth", "premium"]

const PLAN_DETAILS: Record<
  PlanKey,
  {
    name: string
    setupPrice: number
    monthlyPrice: number
    description: string
    bestFor: string
    features: string[]
  }
> = {
  starter: {
    name: "Starter",
    setupPrice: 149,
    monthlyPrice: 39,
    description:
      "A focused site for businesses that need a sharp online presence without extra complexity.",
    bestFor: "Best when you need a strong homepage and a cleaner first impression fast.",
    features: [
      "1-page custom site",
      "Responsive layout",
      "Modern visual direction",
      "Lead-friendly contact section",
      "Hosting and maintenance included",
    ],
  },
  growth: {
    name: "Growth",
    setupPrice: 299,
    monthlyPrice: 79,
    description:
      "The best balance of flexibility, content depth, and conversion structure for most local businesses.",
    bestFor: "Best for most service businesses that need multiple pages and clearer lead flow.",
    features: [
      "Up to 5 pages",
      "Custom branding direction",
      "Contact form integration",
      "SEO and speed basics",
      "Hosting and maintenance included",
    ],
  },
  premium: {
    name: "Premium",
    setupPrice: 499,
    monthlyPrice: 149,
    description:
      "A higher-polish custom site for businesses that want stronger presentation and more room to scale.",
    bestFor: "Best when the brand needs to look notably more premium and content-rich.",
    features: [
      "Up to 10 pages",
      "Premium layout direction",
      "Advanced sections and storytelling",
      "Priority support",
      "Hosting and maintenance included",
    ],
  },
}

const ADDONS: Record<
  AddonKey,
  {
    name: string
    type: "one-time" | "monthly"
    price: number
    description: string
  }
> = {
  extraPage: {
    name: "Extra Page",
    type: "one-time",
    price: 75,
    description: "Add an additional custom page beyond the plan limit.",
  },
  seo: {
    name: "SEO Boost",
    type: "monthly",
    price: 35,
    description: "Ongoing SEO improvements and search visibility support.",
  },
  contactForm: {
    name: "Advanced Contact Form",
    type: "one-time",
    price: 45,
    description: "Expanded lead form setup with clearer structure and follow-up details.",
  },
  booking: {
    name: "Booking Integration",
    type: "one-time",
    price: 95,
    description: "Connect a scheduling or consultation workflow into the site.",
  },
  blog: {
    name: "Blog / News Section",
    type: "one-time",
    price: 120,
    description: "Add a content section for future updates, articles, or announcements.",
  },
  rush: {
    name: "Rush Build",
    type: "one-time",
    price: 150,
    description: "Priority turnaround for businesses that need to move faster.",
  },
  prioritySupport: {
    name: "Priority Support",
    type: "monthly",
    price: 25,
    description: "Faster response times for edits and support requests.",
  },
}

const pricingFaqs = [
  {
    question: "Do I pay immediately after submitting the pricing form?",
    answer:
      "No. Pricing requests are reviewed before any payment is collected, so the scope can be confirmed first.",
  },
  {
    question: "What if I am not sure which plan fits yet?",
    answer:
      "Choose the closest fit and use the project details section to explain what you are unsure about. You can also use the direct contact form instead.",
  },
  {
    question: "Can I start from a demo and keep that context?",
    answer:
      "Yes. Pricing now accepts demo and industry context from the demo library, which helps the next step feel much less repetitive.",
  },
]

const pricingPageTitle = "Website Pricing and Packages for Service Businesses"
const pricingPageDescription =
  "Compare Levamen Tech website packages, customize your plan with add-ons, and send a guided project request for review before any payment is collected."

const pricingStructuredData = [
  buildWebPageStructuredData({
    path: "/pricing",
    title: pricingPageTitle,
    description: pricingPageDescription,
  }),
  buildBreadcrumbStructuredData([
    { name: "Home", path: "/" },
    { name: "Pricing", path: "/pricing" },
  ]),
  buildFaqStructuredData(pricingFaqs),
  {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Custom website design and development",
    description: pricingPageDescription,
    provider: {
      "@id": `${siteConfig.url}/#organization`,
    },
    areaServed: "United States",
    serviceType: "Service business website design",
    offers: VALID_PLAN_KEYS.map((planKey) => {
      const plan = PLAN_DETAILS[planKey]

      return {
        "@type": "Offer",
        name: `${plan.name} Website Package`,
        priceCurrency: "USD",
        price: plan.setupPrice,
        description: `${plan.description} Monthly maintenance starts at ${plan.monthlyPrice} per month.`,
      }
    }),
  },
]

function buildContextPath(basePath: string, industry: string | null, demo: string | null) {
  const params = new URLSearchParams()

  if (industry) {
    params.set("industry", industry)
  }

  if (demo) {
    params.set("demo", demo)
  }

  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

function StepShell({ title, description, icon, children }: StepShellProps) {
  return (
    <div className="card-glass soft-shadow rounded-[1.75rem] p-5 sm:p-6 md:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="rounded-2xl p-3 gradient-bg text-white">{icon}</div>
        <div>
          <h2 className="text-2xl font-semibold text-[var(--color-text)] md:text-3xl">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-[var(--color-text-muted)]">
            {description}
          </p>
        </div>
      </div>
      {children}
    </div>
  )
}

export default function Pricing() {
  const [searchParams] = useSearchParams()
  const initialPlan = searchParams.get("plan")
  const demoContext = searchParams.get("demo")
  const industryContext = searchParams.get("industry")

  const [step, setStep] = useState(1)
  const [reviews, setReviews] = useState<ApprovedReview[]>([])
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>(() => {
    return VALID_PLAN_KEYS.includes(initialPlan as PlanKey)
      ? (initialPlan as PlanKey)
      : "growth"
  })
  const [selectedAddons, setSelectedAddons] = useState<AddonKey[]>([])
  const [domainChoice, setDomainChoice] = useState<DomainChoice>("have-domain")
  const [domainName, setDomainName] = useState("")
  const [needsDomainPrivacy, setNeedsDomainPrivacy] = useState(true)
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    businessName: "",
    phone: "",
    businessType: industryContext ?? "",
    timeline: "",
    pagesNeeded: "",
    inspiration: demoContext ? `Closest demo: ${demoContext}` : "",
    goals: "",
    notes: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState("")

  useEffect(() => {
    void fetchApprovedReviews({ limit: 2, featuredOnly: true })
      .then(setReviews)
      .catch(() => setReviews([]))
  }, [])

  const selectedPlanData = PLAN_DETAILS[selectedPlan]

  const addonBreakdown = useMemo(() => {
    const oneTime = selectedAddons
      .filter((key) => ADDONS[key].type === "one-time")
      .reduce((sum, key) => sum + ADDONS[key].price, 0)

    const monthly = selectedAddons
      .filter((key) => ADDONS[key].type === "monthly")
      .reduce((sum, key) => sum + ADDONS[key].price, 0)

    return { oneTime, monthly }
  }, [selectedAddons])

  const domainOneTime = domainChoice === "need-domain" ? 20 : 0
  const domainPrivacyMonthly =
    domainChoice === "need-domain" && needsDomainPrivacy ? 2 : 0
  const totalSetup =
    selectedPlanData.setupPrice + addonBreakdown.oneTime + domainOneTime
  const totalMonthly =
    selectedPlanData.monthlyPrice + addonBreakdown.monthly + domainPrivacyMonthly

  const canContinuePlan = Boolean(selectedPlan)
  const canContinueCustomize = Boolean(domainChoice)
  const canContinueProject =
    form.fullName.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.businessName.trim().length > 0

  const progressSteps = [
    { id: 1, label: "Plan" },
    { id: 2, label: "Customize" },
    { id: 3, label: "Project" },
    { id: 4, label: "Review" },
  ]

  const contactPath = buildContextPath("/contact", industryContext, demoContext)

  function toggleAddon(key: AddonKey) {
    setSelectedAddons((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key]
    )
  }

  function handleInput(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function resetSubmissionState() {
    setSubmitError("")
    setSubmitSuccess(false)
  }

  async function handleSubmit() {
    if (isSubmitting) return

    setIsSubmitting(true)
    setSubmitError("")
    setSubmitSuccess(false)

    const inquirySnapshot = {
      plan: {
        key: selectedPlan,
        ...selectedPlanData,
      },
      addons: selectedAddons.map((key) => ({
        key,
        ...ADDONS[key],
      })),
      domain: {
        choice: domainChoice,
        domainName,
        needsDomainPrivacy,
        oneTimeFee: domainOneTime,
        monthlyFee: domainPrivacyMonthly,
      },
      customer: form,
      context: {
        industry: industryContext,
        demo: demoContext,
      },
      pricing: {
        addonOneTimeTotal: addonBreakdown.oneTime,
        addonMonthlyTotal: addonBreakdown.monthly,
        totalSetup,
        totalMonthly,
      },
    }

    const { error } = await supabase.from("pricing_inquiries").insert({
      selected_plan: selectedPlan,
      selected_addons: selectedAddons,
      plan_name: selectedPlanData.name,
      plan_setup_price: selectedPlanData.setupPrice,
      plan_monthly_price: selectedPlanData.monthlyPrice,
      addon_one_time_total: addonBreakdown.oneTime,
      addon_monthly_total: addonBreakdown.monthly,
      domain_choice: domainChoice,
      domain_name: domainName.trim() || null,
      needs_domain_privacy:
        domainChoice === "need-domain" ? needsDomainPrivacy : false,
      domain_one_time_fee: domainOneTime,
      domain_privacy_monthly_fee: domainPrivacyMonthly,
      total_setup: totalSetup,
      total_monthly: totalMonthly,
      full_name: form.fullName.trim(),
      email: form.email.trim(),
      business_name: form.businessName.trim(),
      phone: form.phone.trim() || null,
      business_type: form.businessType.trim() || null,
      timeline: form.timeline || null,
      pages_needed: form.pagesNeeded.trim() || null,
      inspiration: form.inspiration.trim() || null,
      goals: form.goals.trim() || null,
      notes: form.notes.trim() || null,
      inquiry_snapshot: inquirySnapshot,
    })

    if (error) {
      setSubmitError(
        "Something went wrong while sending your request. Please try again."
      )
      setIsSubmitting(false)
      return
    }

    trackCta("Pricing Submitted", {
      plan: selectedPlanData.name,
      industry: industryContext ?? (form.businessType || "unknown"),
      demo: demoContext ?? "none",
      total_setup: totalSetup,
      total_monthly: totalMonthly,
    })

    setSubmitSuccess(true)
    setIsSubmitting(false)
    setStep(4)
  }

  return (
    <>
      <Seo
        title={pricingPageTitle}
        description={pricingPageDescription}
        path="/pricing"
        image="/og-pricing.svg"
        keywords={[
          "website pricing for service businesses",
          "small business website packages",
          "web design pricing",
          "website maintenance plans",
        ]}
        structuredData={pricingStructuredData}
      />

      <section className="section pt-8 sm:pt-10">
        <div className="container-custom">
          <div className="mb-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm text-[var(--color-text-muted)] soft-shadow">
                <Sparkles size={16} />
                Guided pricing for custom websites
              </p>

              <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text)] sm:text-4xl md:text-5xl">
                Choose a plan, shape the details, and submit for{" "}
                <span className="gradient-text">review before payment</span>
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--color-text-muted)] sm:text-lg">
                This flow is meant to feel guided, not heavy. Start with the
                closest package, add only what matters, and send the request for
                review before any billing is discussed.
              </p>

              {industryContext || demoContext ? (
                <div className="mt-5 rounded-[1.5rem] border border-slate-200/80 bg-white/82 px-5 py-4 text-sm leading-7 text-slate-600 soft-shadow">
                  {industryContext ? (
                    <span className="font-semibold text-slate-950">
                      Context carried in:
                    </span>
                  ) : null}{" "}
                  {[industryContext, demoContext ? `demo: ${demoContext}` : null]
                    .filter(Boolean)
                    .join(" / ")}
                </div>
              ) : null}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={contactPath}
                  className="btn-secondary !w-full sm:!w-auto"
                  onClick={() =>
                    trackCta("Pricing to contact", {
                      from_path: "/pricing",
                      to_path: contactPath,
                    })
                  }
                >
                  Just contact me instead
                </Link>
                <Link
                  to="/reviews"
                  className="btn-secondary !w-full sm:!w-auto"
                  onClick={() =>
                    trackCta("Pricing to reviews", {
                      from_path: "/pricing",
                      to_path: "/reviews",
                    })
                  }
                >
                  Read reviews
                </Link>
              </div>
            </div>

            <aside className="card soft-shadow rounded-[1.75rem] p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <ShieldCheck className="text-[var(--color-ocean-3)]" size={20} />
                <h2 className="text-lg font-semibold text-[var(--color-text)]">
                  What to expect
                </h2>
              </div>

              <ul className="space-y-3 text-sm text-[var(--color-text-muted)]">
                {[
                  "Your package request is reviewed before anything is charged.",
                  "You get a follow-up to confirm scope, timeline, and best fit.",
                  "Hosting and maintenance stay included in monthly pricing.",
                  "There is a low-friction contact path if you do not want to fill out everything right now.",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 text-[var(--color-ocean-3)]"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>

          {reviews.length > 0 ? (
            <div className="mb-8 grid gap-6 lg:grid-cols-2">
              {reviews.map((review) => (
                <CompactReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : null}

          <div className="mb-8 grid gap-4 md:grid-cols-3">
            <div className="card">
              <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                Reviewed first
              </p>
              <p className="mt-3 text-xl font-extrabold tracking-[-0.03em] text-slate-950">
                No payment before scope review
              </p>
            </div>
            <div className="card">
              <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                Included monthly
              </p>
              <p className="mt-3 text-xl font-extrabold tracking-[-0.03em] text-slate-950">
                Hosting + maintenance stay bundled
              </p>
            </div>
            <div className="card">
              <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                Lower pressure path
              </p>
              <p className="mt-3 text-xl font-extrabold tracking-[-0.03em] text-slate-950">
                Contact is one click away if the form feels like too much
              </p>
            </div>
          </div>

          <div className="mb-8 flex flex-wrap gap-2 sm:gap-3">
            {progressSteps.map((item) => {
              const isActive = step === item.id
              const isComplete = step > item.id

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (item.id < step) setStep(item.id)
                  }}
                  className={[
                    "rounded-full border px-4 py-2 text-xs transition sm:text-sm",
                    isActive
                      ? "gradient-bg border-transparent text-white"
                      : isComplete
                        ? "border-[var(--color-border)] bg-white text-[var(--color-text)]"
                        : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-muted)]",
                  ].join(" ")}
                >
                  {isComplete ? "Done" : item.id}. {item.label}
                </button>
              )
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
            <div className="space-y-6">
              {submitSuccess ? (
                <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
                  Your request was sent successfully. I will review it and reach
                  out before any payment is requested.
                </div>
              ) : null}

              {submitError ? (
                <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
                  {submitError}
                </div>
              ) : null}

              {step === 1 ? (
                <StepShell
                  title="Select the closest base plan"
                  description="Choose the package that best fits the amount of structure and polish you need. We can still refine the details after review."
                  icon={<Laptop2 size={22} />}
                >
                  <div className="grid gap-5 md:grid-cols-3">
                    {VALID_PLAN_KEYS.map((key) => {
                      const plan = PLAN_DETAILS[key]
                      const active = selectedPlan === key

                      return (
                        <button
                          type="button"
                          key={key}
                          onClick={() => {
                            resetSubmissionState()
                            setSelectedPlan(key)
                          }}
                          className={[
                            "text-left rounded-3xl border p-5 transition",
                            active
                              ? "card-glass glow-blue border-transparent"
                              : "card hover:-translate-y-1",
                          ].join(" ")}
                        >
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <h3 className="text-xl font-semibold text-[var(--color-text)]">
                              {plan.name}
                            </h3>
                            {key === "growth" ? (
                              <span className="rounded-full px-3 py-1 text-xs font-medium text-white gradient-bg">
                                Most Popular
                              </span>
                            ) : null}
                          </div>

                          <p className="mb-4 text-sm text-[var(--color-text-muted)]">
                            {plan.description}
                          </p>

                          <div className="mb-4">
                            <div className="text-3xl font-bold text-[var(--color-text)]">
                              {currency.format(plan.setupPrice)}
                            </div>
                            <div className="text-sm text-[var(--color-text-muted)]">
                              setup + {currency.format(plan.monthlyPrice)}/month
                            </div>
                          </div>

                          <p className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
                            {plan.bestFor}
                          </p>

                          <ul className="mt-4 space-y-2">
                            {plan.features.map((feature) => (
                              <li
                                key={feature}
                                className="flex items-start gap-2 text-sm text-[var(--color-text-muted)]"
                              >
                                <Check
                                  size={14}
                                  className="mt-1 text-[var(--color-ocean-3)]"
                                />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </button>
                      )
                    })}
                  </div>
                </StepShell>
              ) : null}

              {step === 2 ? (
                <StepShell
                  title="Customize the package"
                  description="Choose the extras that matter and decide whether you already have a domain or want help getting one."
                  icon={<Sparkles size={22} />}
                >
                  <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--color-text)]">
                        Add-ons
                      </h3>
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {(Object.keys(ADDONS) as AddonKey[]).map((key) => {
                          const addon = ADDONS[key]
                          const active = selectedAddons.includes(key)

                          return (
                            <button
                              type="button"
                              key={key}
                              onClick={() => {
                                resetSubmissionState()
                                toggleAddon(key)
                              }}
                              className={[
                                "rounded-3xl border p-5 text-left transition",
                                active
                                  ? "card-glass glow-sunset border-transparent"
                                  : "card hover:-translate-y-1",
                              ].join(" ")}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <h4 className="text-lg font-semibold text-[var(--color-text)]">
                                    {addon.name}
                                  </h4>
                                  <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
                                    {addon.description}
                                  </p>
                                </div>
                                <span className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-sm font-semibold text-[var(--color-text)]">
                                  {currency.format(addon.price)}
                                  {addon.type === "monthly" ? "/mo" : ""}
                                </span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    <div className="card">
                      <div className="mb-4 flex items-center gap-3">
                        <Globe className="text-[var(--color-ocean-3)]" size={20} />
                        <h3 className="text-lg font-semibold text-[var(--color-text)]">
                          Domain setup
                        </h3>
                      </div>

                      <div className="space-y-3">
                        <button
                          type="button"
                          onClick={() => {
                            resetSubmissionState()
                            setDomainChoice("have-domain")
                          }}
                          className={[
                            "w-full rounded-3xl border p-4 text-left transition",
                            domainChoice === "have-domain"
                              ? "card-glass border-transparent"
                              : "card",
                          ].join(" ")}
                        >
                          <div className="font-semibold text-[var(--color-text)]">
                            I already have a domain
                          </div>
                          <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
                            Best if the domain is already live or already owned.
                          </p>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            resetSubmissionState()
                            setDomainChoice("need-domain")
                          }}
                          className={[
                            "w-full rounded-3xl border p-4 text-left transition",
                            domainChoice === "need-domain"
                              ? "card-glass border-transparent"
                              : "card",
                          ].join(" ")}
                        >
                          <div className="font-semibold text-[var(--color-text)]">
                            I need help getting a domain
                          </div>
                          <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
                            Adds {currency.format(20)} one time, plus optional privacy.
                          </p>
                        </button>
                      </div>

                      <div className="mt-5 grid gap-4">
                        <div>
                          <label className="field-label">Preferred domain name</label>
                          <input
                            value={domainName}
                            onChange={(event) => {
                              resetSubmissionState()
                              setDomainName(event.target.value)
                            }}
                            placeholder="examplebusiness.com"
                            className="field-input"
                          />
                        </div>

                        {domainChoice === "need-domain" ? (
                          <label className="flex items-start gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-4 text-sm text-[var(--color-text-muted)]">
                            <input
                              type="checkbox"
                              checked={needsDomainPrivacy}
                              onChange={(event) => {
                                resetSubmissionState()
                                setNeedsDomainPrivacy(event.target.checked)
                              }}
                              className="mt-1"
                            />
                            <span>
                              Add domain privacy for {currency.format(2)}/month
                            </span>
                          </label>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </StepShell>
              ) : null}

              {step === 3 ? (
                <StepShell
                  title="Tell me about the project"
                  description="Keep this lightweight. The basics below are enough to review fit, follow up, and suggest any scope adjustments."
                  icon={<ShieldCheck size={22} />}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="field-label">Full name</label>
                      <input
                        name="fullName"
                        value={form.fullName}
                        onChange={(event) => {
                          resetSubmissionState()
                          handleInput(event)
                        }}
                        className="field-input"
                      />
                    </div>

                    <div>
                      <label className="field-label">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={(event) => {
                          resetSubmissionState()
                          handleInput(event)
                        }}
                        className="field-input"
                      />
                    </div>

                    <div>
                      <label className="field-label">Business name</label>
                      <input
                        name="businessName"
                        value={form.businessName}
                        onChange={(event) => {
                          resetSubmissionState()
                          handleInput(event)
                        }}
                        className="field-input"
                      />
                    </div>

                    <div>
                      <label className="field-label">Phone (optional)</label>
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={(event) => {
                          resetSubmissionState()
                          handleInput(event)
                        }}
                        className="field-input"
                      />
                    </div>

                    <div>
                      <label className="field-label">Business type</label>
                      <input
                        name="businessType"
                        value={form.businessType}
                        onChange={(event) => {
                          resetSubmissionState()
                          handleInput(event)
                        }}
                        placeholder="Landscaping, salon, law firm..."
                        className="field-input"
                      />
                    </div>

                    <div>
                      <label className="field-label">Preferred timeline</label>
                      <select
                        name="timeline"
                        value={form.timeline}
                        onChange={(event) => {
                          resetSubmissionState()
                          handleInput(event)
                        }}
                        className="field-input"
                      >
                        <option value="">Select timeline</option>
                        <option value="asap">As soon as possible</option>
                        <option value="1-2-weeks">1-2 weeks</option>
                        <option value="2-4-weeks">2-4 weeks</option>
                        <option value="flexible">Flexible</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4">
                    <div>
                      <label className="field-label">Estimated number of pages</label>
                      <input
                        name="pagesNeeded"
                        value={form.pagesNeeded}
                        onChange={(event) => {
                          resetSubmissionState()
                          handleInput(event)
                        }}
                        placeholder="Example: 1, 3, 5..."
                        className="field-input"
                      />
                    </div>

                    <div>
                      <label className="field-label">
                        Inspiration or reference sites
                      </label>
                      <textarea
                        name="inspiration"
                        value={form.inspiration}
                        onChange={(event) => {
                          resetSubmissionState()
                          handleInput(event)
                        }}
                        rows={3}
                        placeholder="Drop links, mention a demo, or describe the feel you want..."
                        className="field-input min-h-[8rem] resize-y"
                      />
                    </div>

                    <div>
                      <label className="field-label">Main goals for the website</label>
                      <textarea
                        name="goals"
                        value={form.goals}
                        onChange={(event) => {
                          resetSubmissionState()
                          handleInput(event)
                        }}
                        rows={4}
                        placeholder="What should the site help your business do?"
                        className="field-input min-h-[8rem] resize-y"
                      />
                    </div>

                    <div>
                      <label className="field-label">Extra notes</label>
                      <textarea
                        name="notes"
                        value={form.notes}
                        onChange={(event) => {
                          resetSubmissionState()
                          handleInput(event)
                        }}
                        rows={4}
                        placeholder="Anything else useful before I review the request?"
                        className="field-input min-h-[8rem] resize-y"
                      />
                    </div>
                  </div>

                  <p className="mt-4 text-sm text-[var(--color-text-muted)]">
                    If this still feels like more than you want to fill out,
                    the direct contact form is always available.
                  </p>
                </StepShell>
              ) : null}

              {step === 4 ? (
                <StepShell
                  title="Review your request"
                  description="Check the package and details below, then submit for review."
                  icon={<Receipt size={22} />}
                >
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-3xl border border-[var(--color-border)] bg-white p-5">
                      <h3 className="text-lg font-semibold text-[var(--color-text)]">
                        Package
                      </h3>
                      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                        {selectedPlanData.name} - {currency.format(selectedPlanData.setupPrice)} setup +{" "}
                        {currency.format(selectedPlanData.monthlyPrice)}/month
                      </p>

                      <h4 className="mt-5 text-sm font-semibold text-[var(--color-text)]">
                        Add-ons
                      </h4>
                      {selectedAddons.length === 0 ? (
                        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                          No add-ons selected
                        </p>
                      ) : (
                        <ul className="mt-2 space-y-2 text-sm text-[var(--color-text-muted)]">
                          {selectedAddons.map((key) => (
                            <li key={key}>
                              {ADDONS[key].name} - {currency.format(ADDONS[key].price)}
                              {ADDONS[key].type === "monthly" ? " / month" : " one time"}
                            </li>
                          ))}
                        </ul>
                      )}

                      <h4 className="mt-5 text-sm font-semibold text-[var(--color-text)]">
                        Domain
                      </h4>
                      <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                        {domainChoice === "have-domain"
                          ? "Using an existing domain"
                          : `Need help getting a domain (${currency.format(domainOneTime)} one time)`}
                      </p>
                      {domainName ? (
                        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                          Requested domain: {domainName}
                        </p>
                      ) : null}
                    </div>

                    <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg)] p-5">
                      <h3 className="text-lg font-semibold text-[var(--color-text)]">
                        Project details
                      </h3>
                      <div className="mt-3 space-y-2 text-sm text-[var(--color-text-muted)]">
                        <p>
                          <span className="font-medium text-[var(--color-text)]">Name:</span>{" "}
                          {form.fullName || "-"}
                        </p>
                        <p>
                          <span className="font-medium text-[var(--color-text)]">Email:</span>{" "}
                          {form.email || "-"}
                        </p>
                        <p>
                          <span className="font-medium text-[var(--color-text)]">Business:</span>{" "}
                          {form.businessName || "-"}
                        </p>
                        <p>
                          <span className="font-medium text-[var(--color-text)]">Type:</span>{" "}
                          {form.businessType || industryContext || "-"}
                        </p>
                        <p>
                          <span className="font-medium text-[var(--color-text)]">Timeline:</span>{" "}
                          {form.timeline || "-"}
                        </p>
                        <p>
                          <span className="font-medium text-[var(--color-text)]">Context:</span>{" "}
                          {[industryContext, demoContext].filter(Boolean).join(" / ") || "None"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-3xl border border-[var(--color-border)] bg-white p-6">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--color-text)]">
                          Pricing summary
                        </h3>
                        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                          Final billing is only discussed after review and scope confirmation.
                        </p>
                      </div>

                      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-3 text-right">
                        <p className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                          Next step
                        </p>
                        <p className="text-sm font-semibold text-[var(--color-text)]">
                          Review request
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm text-[var(--color-text-muted)]">
                      <div className="flex items-center justify-between">
                        <span>Base setup</span>
                        <span className="font-medium text-[var(--color-text)]">
                          {currency.format(selectedPlanData.setupPrice)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Add-on one-time total</span>
                        <span className="font-medium text-[var(--color-text)]">
                          {currency.format(addonBreakdown.oneTime)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Domain setup</span>
                        <span className="font-medium text-[var(--color-text)]">
                          {currency.format(domainOneTime)}
                        </span>
                      </div>

                      <div className="my-3 border-t border-[var(--color-border)]" />

                      <div className="flex items-center justify-between text-base">
                        <span className="font-semibold text-[var(--color-text)]">
                          Total setup
                        </span>
                        <span className="font-bold text-[var(--color-text)]">
                          {currency.format(totalSetup)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span>Base maintenance</span>
                        <span className="font-medium text-[var(--color-text)]">
                          {currency.format(selectedPlanData.monthlyPrice)}/month
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Add-on monthly total</span>
                        <span className="font-medium text-[var(--color-text)]">
                          {currency.format(addonBreakdown.monthly)}/month
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Domain privacy</span>
                        <span className="font-medium text-[var(--color-text)]">
                          {currency.format(domainPrivacyMonthly)}/month
                        </span>
                      </div>

                      <div className="my-3 border-t border-[var(--color-border)]" />

                      <div className="flex items-center justify-between text-base">
                        <span className="font-semibold text-[var(--color-text)]">
                          Total monthly
                        </span>
                        <span className="font-bold text-[var(--color-text)]">
                          {currency.format(totalMonthly)}/month
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => void handleSubmit()}
                        disabled={isSubmitting || submitSuccess}
                        className="btn-primary flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                      >
                        {isSubmitting
                          ? "Submitting..."
                          : submitSuccess
                            ? "Request Sent"
                            : "Submit for Review"}
                        <ArrowRight size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        disabled={isSubmitting}
                        className="btn-secondary w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                      >
                        Edit details
                      </button>
                    </div>
                  </div>
                </StepShell>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => setStep((current) => Math.max(1, current - 1))}
                  disabled={step === 1 || isSubmitting}
                  className="btn-secondary flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                <button
                  type="button"
                  onClick={() => setStep((current) => Math.min(4, current + 1))}
                  disabled={
                    isSubmitting ||
                    (step === 1 && !canContinuePlan) ||
                    (step === 2 && !canContinueCustomize) ||
                    (step === 3 && !canContinueProject) ||
                    step === 4
                  }
                  className="btn-primary flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  Next
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            <aside className="h-fit rounded-[1.75rem] border border-[var(--color-border)] bg-white p-6 soft-shadow lg:sticky lg:top-24">
              <h2 className="text-xl font-semibold text-[var(--color-text)]">
                Live summary
              </h2>

              <div className="mt-5 rounded-3xl bg-[var(--color-bg)] p-5">
                <p className="text-sm text-[var(--color-text-muted)]">Selected plan</p>
                <p className="mt-1 text-lg font-semibold text-[var(--color-text)]">
                  {selectedPlanData.name}
                </p>
                <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                  {currency.format(selectedPlanData.setupPrice)} setup +{" "}
                  {currency.format(selectedPlanData.monthlyPrice)}/month
                </p>
              </div>

              <div className="mt-4">
                <p className="text-sm font-semibold text-[var(--color-text)]">Add-ons</p>
                <div className="mt-2 space-y-2 text-sm text-[var(--color-text-muted)]">
                  {selectedAddons.length > 0 ? (
                    selectedAddons.map((key) => (
                      <div key={key} className="flex justify-between gap-3">
                        <span>{ADDONS[key].name}</span>
                        <span className="whitespace-nowrap">
                          {currency.format(ADDONS[key].price)}
                          {ADDONS[key].type === "monthly" ? "/mo" : ""}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p>No add-ons selected</p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-sm font-semibold text-[var(--color-text)]">Domain</p>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                  {domainChoice === "have-domain"
                    ? "Using existing domain"
                    : "Need help getting a domain"}
                </p>
                {domainName ? (
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                    {domainName}
                  </p>
                ) : null}
              </div>

              <div className="my-5 border-t border-[var(--color-border)]" />

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">Setup total</span>
                  <span className="font-semibold text-[var(--color-text)]">
                    {currency.format(totalSetup)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">Monthly total</span>
                  <span className="font-semibold text-[var(--color-text)]">
                    {currency.format(totalMonthly)}/mo
                  </span>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
                <p className="text-sm text-[var(--color-text-muted)]">
                  This flow now handles:
                </p>
                <ul className="mt-3 space-y-2 text-sm text-[var(--color-text-muted)]">
                  <li>- plan selection</li>
                  <li>- add-ons and domain decisions</li>
                  <li>- project inquiry submission before payment</li>
                </ul>
              </div>

              <Link
                to={contactPath}
                className="mt-4 block rounded-2xl border border-[var(--color-border)] bg-white px-4 py-4 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-ocean-3)] hover:text-[var(--color-ocean-2)]"
                onClick={() =>
                  trackCta("Pricing sidebar contact", {
                    from_path: "/pricing",
                    to_path: contactPath,
                  })
                }
              >
                Need less friction? Use the lightweight contact form instead.
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </>
  )
}
