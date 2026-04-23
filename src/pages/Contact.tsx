import { useEffect, useMemo, useState, type FormEvent } from "react"
import {
  Globe,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Send,
  Sparkles,
} from "lucide-react"
import { Link, useLocation, useSearchParams } from "react-router-dom"
import headshot from "../assets/images/andrew-headshot.jpg"
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
  buildWebPageStructuredData,
  siteConfig,
} from "../seo/site"

const contactMethods = [
  {
    icon: Mail,
    label: "Email",
    value: "admin@levamentech.com",
    href: "mailto:admin@levamentech.com",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "(864) 510-8711",
    href: "tel:+18645108711",
  },
  {
    icon: Globe,
    label: "Website",
    value: "levamentech.com",
    href: "https://levamentech.com",
  },
  {
    icon: MessageSquareText,
    label: "Fastest path",
    value: "Use the short form below or email/text directly",
  },
]

const highlights = [
  "Custom business websites",
  "Cleaner UI and trust-first layout structure",
  "Responsive builds that feel good on mobile",
  "Demo-led planning if you are still narrowing the direction",
]

const pageTitle = "Contact Levamen Tech"
const pageDescription =
  "Reach out to Levamen Tech about a custom website project, pricing questions, demo requests, or a new service business site."

const contactStructuredData = [
  buildWebPageStructuredData({
    path: "/contact",
    title: pageTitle,
    description: pageDescription,
    pageType: "ContactPage",
  }),
  buildBreadcrumbStructuredData([
    { name: "Home", path: "/" },
    { name: "Contact", path: "/contact" },
  ]),
  {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: `${siteConfig.name} contact page`,
    url: `${siteConfig.url}/contact`,
    description: pageDescription,
    mainEntity: {
      "@id": `${siteConfig.url}/#organization`,
    },
  },
]

export default function Contact() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const industryContext = searchParams.get("industry")
  const demoContext = searchParams.get("demo")

  const [reviews, setReviews] = useState<ApprovedReview[]>([])
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    businessName: "",
    businessType: industryContext ?? "",
    timeline: "",
    projectScope: demoContext ? `Closest demo: ${demoContext}` : "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [submitSuccess, setSubmitSuccess] = useState(false)

  useEffect(() => {
    void fetchApprovedReviews({ limit: 2 })
      .then(setReviews)
      .catch(() => setReviews([]))
  }, [])

  const sourcePath = useMemo(() => {
    if (demoContext) {
      return `/demos/${demoContext}`
    }

    if (industryContext) {
      return `/demos?industry=${encodeURIComponent(industryContext)}`
    }

    return location.pathname
  }, [demoContext, industryContext, location.pathname])

  function updateField(field: keyof typeof form, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
    setSubmitError("")
    setSubmitSuccess(false)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setSubmitError("")
    setSubmitSuccess(false)

    const { error } = await supabase.from("contact_inquiries").insert({
      full_name: form.fullName.trim(),
      email: form.email.trim(),
      business_name: form.businessName.trim() || null,
      business_type: form.businessType.trim() || null,
      requested_demo_slug: demoContext || null,
      source_path: sourcePath,
      timeline: form.timeline || null,
      project_scope: form.projectScope.trim() || null,
      message: form.message.trim(),
    })

    if (error) {
      setSubmitError(
        "Something went wrong while sending your message. Please try again."
      )
      setIsSubmitting(false)
      return
    }

    trackCta("Contact Submitted", {
      industry: industryContext ?? (form.businessType || "unknown"),
      demo: demoContext ?? "none",
      source_path: sourcePath,
    })

    setSubmitSuccess(true)
    setIsSubmitting(false)
    setForm({
      fullName: "",
      email: "",
      businessName: "",
      businessType: industryContext ?? "",
      timeline: "",
      projectScope: demoContext ? `Closest demo: ${demoContext}` : "",
      message: "",
    })
  }

  return (
    <>
      <Seo
        title={pageTitle}
        description={pageDescription}
        path="/contact"
        image="/og-contact.svg"
        keywords={[
          "contact web designer",
          "service business website designer",
          "custom website project inquiry",
          "Levamen Tech contact",
        ]}
        structuredData={contactStructuredData}
      />

      <section className="section pt-8 sm:pt-10">
        <div className="container-custom">
          <div className="grid gap-8 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="space-y-8">
              <div className="section-panel px-6 py-8 sm:px-8 lg:px-10">
                <div className="absolute -left-12 top-8 h-36 w-36 rounded-full bg-orange-200/35 blur-3xl" />
                <div className="absolute -right-12 bottom-6 h-44 w-44 rounded-full bg-blue-200/30 blur-3xl" />

                <div className="relative grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.78fr)] xl:items-end">
                  <div className="min-w-0">
                    <div className="section-kicker">
                      <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                      Direct contact
                    </div>

                    <h1 className="hero-heading mt-6 max-w-2xl text-3xl font-extrabold tracking-[-0.06em] text-slate-950 sm:text-5xl md:text-[3.4rem] md:leading-[1.02]">
                      A lightweight way to start the project conversation
                    </h1>

                    <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
                      If pricing feels too early or you just want to talk through
                      the direction first, this page is the fast path. You can
                      send a short message here or reach out directly by email or
                      phone.
                    </p>

                    {industryContext || demoContext ? (
                      <div className="mt-5 rounded-[1.5rem] border border-slate-200/80 bg-white/82 px-5 py-4 text-sm leading-7 text-slate-600">
                        Carrying context from{" "}
                        <span className="font-extrabold text-slate-950">
                          {[industryContext, demoContext ? `demo: ${demoContext}` : null]
                            .filter(Boolean)
                            .join(" / ")}
                        </span>
                      </div>
                    ) : null}

                    <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                      <a
                        href="mailto:admin@levamentech.com"
                        className="btn-primary !w-full sm:!w-auto"
                        onClick={() =>
                          trackCta("Email contact", {
                            from_path: "/contact",
                            to_path: "mailto:admin@levamentech.com",
                          })
                        }
                      >
                        <Send className="h-4 w-4" />
                        Email directly
                      </a>

                      <Link
                        to={buildContextPath("/pricing", industryContext, demoContext)}
                        className="btn-secondary !w-full sm:!w-auto"
                        onClick={() =>
                          trackCta("Contact to pricing", {
                            from_path: "/contact",
                            to_path: "/pricing",
                          })
                        }
                      >
                        Go to pricing
                      </Link>
                    </div>

                    <div className="mt-8 grid gap-3 text-sm text-slate-500 sm:flex sm:flex-wrap">
                      {[
                        "Direct collaboration",
                        "Low-friction first step",
                        "Custom direction, not templates",
                      ].map((trait) => (
                        <span
                          key={trait}
                          className="rounded-full border border-slate-200/80 bg-white/76 px-4 py-2 text-center font-semibold"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="relative mx-auto w-full max-w-sm xl:max-w-none">
                    <div className="absolute inset-x-5 bottom-4 top-12 rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,122,24,0.2),rgba(75,140,255,0.16))] blur-3xl" />

                    <div className="relative overflow-hidden rounded-[2rem] border border-white/75 bg-white/76 p-3 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-sm">
                      <img
                        src={headshot}
                        alt="Portrait of Andrew from Levamen Tech"
                        className="aspect-[4/5] w-full rounded-[1.7rem] object-cover shadow-[0_18px_40px_rgba(15,23,42,0.14)] ring-1 ring-white/70"
                      />

                      <div className="mt-4 rounded-[1.5rem] border border-slate-200/80 bg-white/88 p-4">
                        <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.22em] text-slate-400">
                          Independent studio
                        </p>
                        <p className="mt-2 text-lg font-extrabold tracking-[-0.03em] text-slate-950">
                          You are talking to the builder directly.
                        </p>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          That keeps the process tighter, faster, and easier to
                          shape around what the business actually needs.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="card">
                  <h2 className="text-xl font-extrabold tracking-[-0.03em] text-slate-950">
                    What I help with
                  </h2>
                  <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
                    {highlights.map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <span className="mt-2 h-2.5 w-2.5 rounded-full gradient-bg" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="card">
                  <h2 className="text-xl font-extrabold tracking-[-0.03em] text-slate-950">
                    What happens next
                  </h2>
                  <div className="mt-5 space-y-4">
                    {[
                      "You send a short message with the business context.",
                      "I review the goals, scope, and best next step.",
                      "We move into pricing or project planning with much less repetition.",
                    ].map((item, index) => (
                      <div key={item} className="flex gap-4">
                        <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-extrabold text-white">
                          {index + 1}
                        </div>
                        <p className="text-sm leading-7 text-slate-600">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {reviews.length > 0 ? (
                <div className="grid gap-6 lg:grid-cols-2">
                  {reviews.map((review) => (
                    <CompactReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : null}
            </div>

            <div className="space-y-6">
              <div className="card-glass p-6 sm:p-8">
                <div className="section-kicker">Quick inquiry form</div>

                <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.04em] text-slate-950">
                  Send a short project note
                </h2>

                <p className="mt-3 text-base leading-8 text-slate-600">
                  Enough to start the conversation without going through the full
                  pricing flow.
                </p>

                <form className="mt-6 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="field-label">Full name</label>
                      <input
                        value={form.fullName}
                        onChange={(event) => updateField("fullName", event.target.value)}
                        className="field-input"
                        required
                      />
                    </div>

                    <div>
                      <label className="field-label">Email</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(event) => updateField("email", event.target.value)}
                        className="field-input"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="field-label">Business name</label>
                      <input
                        value={form.businessName}
                        onChange={(event) => updateField("businessName", event.target.value)}
                        className="field-input"
                      />
                    </div>

                    <div>
                      <label className="field-label">Business type</label>
                      <input
                        value={form.businessType}
                        onChange={(event) => updateField("businessType", event.target.value)}
                        placeholder="Landscaping, salon, law firm..."
                        className="field-input"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="field-label">Timeline</label>
                      <select
                        value={form.timeline}
                        onChange={(event) => updateField("timeline", event.target.value)}
                        className="field-input"
                      >
                        <option value="">Select timeline</option>
                        <option value="asap">As soon as possible</option>
                        <option value="1-2-weeks">1-2 weeks</option>
                        <option value="2-4-weeks">2-4 weeks</option>
                        <option value="flexible">Flexible</option>
                      </select>
                    </div>

                    <div>
                      <label className="field-label">Project scope</label>
                      <input
                        value={form.projectScope}
                        onChange={(event) => updateField("projectScope", event.target.value)}
                        placeholder="New site, redesign, lead-gen page..."
                        className="field-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="field-label">Message</label>
                    <textarea
                      value={form.message}
                      onChange={(event) => updateField("message", event.target.value)}
                      rows={6}
                      placeholder="Tell me about the business and what you want the site to improve."
                      className="field-input min-h-[10rem] resize-y"
                      required
                    />
                  </div>

                  {submitError ? (
                    <div className="rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                      {submitError}
                    </div>
                  ) : null}

                  {submitSuccess ? (
                    <div className="rounded-[1.2rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
                      Your message was sent. I will follow up after reviewing it.
                    </div>
                  ) : null}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary !w-full disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? "Sending..." : "Send inquiry"}
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>

              <div className="card">
                <h2 className="text-xl font-extrabold tracking-[-0.03em] text-slate-950">
                  Reach out directly
                </h2>

                <div className="mt-5 space-y-4">
                  {contactMethods.map((method) => {
                    const Icon = method.icon

                    const content = (
                      <div className="flex items-start gap-4 rounded-[1.4rem] border border-slate-200/80 bg-white/92 p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_30px_rgba(15,23,42,0.08)]">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-500">
                            {method.label}
                          </p>
                          <p className="mt-1 break-words text-base font-extrabold tracking-[-0.02em] text-slate-900 [overflow-wrap:anywhere]">
                            {method.value}
                          </p>
                        </div>
                      </div>
                    )

                    if (method.href) {
                      return (
                        <a
                          key={method.label}
                          href={method.href}
                          target={method.href.startsWith("http") ? "_blank" : undefined}
                          rel="noreferrer"
                          onClick={() =>
                            trackCta(method.label, {
                              from_path: "/contact",
                              to_path: method.href,
                            })
                          }
                        >
                          {content}
                        </a>
                      )
                    }

                    return <div key={method.label}>{content}</div>
                  })}
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,248,240,0.96),rgba(239,245,255,0.96))] p-5 shadow-[0_16px_34px_rgba(15,23,42,0.06)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-800 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
                    <MapPin className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-lg font-extrabold tracking-[-0.03em] text-slate-950">
                      Remote-first workflow
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      Everything is designed to work cleanly online, which keeps
                      the process simple whether you start from demos, pricing,
                      or direct contact.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

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
