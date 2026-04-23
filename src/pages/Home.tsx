import { useEffect, useState } from "react"
import {
  ArrowRight,
  Compass,
  MessageSquareQuote,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react"
import { Link } from "react-router-dom"
import CompactReviewCard from "../components/reviews/CompactReviewCard"
import PricingPreview from "../components/pricing/PricingPreview"
import Hero from "../components/sections/Hero"
import Seo from "../components/seo/Seo"
import { demoCatalog } from "../demos/catalog"
import { trackCta } from "../lib/analytics"
import {
  fetchApprovedReviews,
  type ApprovedReview,
} from "../lib/publicReviews"
import {
  buildFaqStructuredData,
  buildOrganizationStructuredData,
  buildWebPageStructuredData,
  buildWebsiteStructuredData,
} from "../seo/site"

const proofCards = [
  {
    title: "Niche-first direction",
    value: `${demoCatalog.length}+`,
    description:
      "Industry-focused demos make it easier to picture the tone, structure, and trust cues your site should lead with.",
  },
  {
    title: "Direct collaboration",
    value: "1:1",
    description:
      "You work with the builder directly, which keeps feedback tighter and the final result more intentional.",
  },
  {
    title: "Reviewed before billing",
    value: "0 surprises",
    description:
      "Pricing requests are reviewed before any payment is collected, so the project scope stays clear.",
  },
  {
    title: "Built for conversion",
    value: "Mobile first",
    description:
      "The layout is designed to help visitors trust the business quickly and take the next step on any screen.",
  },
]

const fitCards = [
  {
    title: "Service businesses outgrowing template sites",
    description:
      "When the current site feels dated, generic, or hard to trust, a clearer structure and stronger presentation makes a real difference.",
  },
  {
    title: "Founders who need help shaping the direction",
    description:
      "You do not need a perfect brief. The process is built to help narrow the design, hierarchy, and messaging with you.",
  },
  {
    title: "Businesses that want a cleaner first impression",
    description:
      "If the goal is better leads, more polish, and a site you are proud to send people to, this is the lane.",
  },
]

const processSteps = [
  {
    title: "Choose a starting point",
    description:
      "Browse demos or jump into pricing so we can anchor the project around a style, industry, or scope that feels close.",
  },
  {
    title: "Clarify the business goals",
    description:
      "We shape what the site needs to communicate, what it should emphasize, and what visitors should do next.",
  },
  {
    title: "Launch something intentional",
    description:
      "The build focuses on responsive polish, trust cues, and a cleaner conversion path instead of filler sections.",
  },
]

const homeFaqs = [
  {
    question: "What kind of businesses is Levamen Tech best for?",
    answer:
      "Levamen Tech is a strong fit for service businesses, contractors, local shops, and other small businesses that want a cleaner, more premium online presence.",
  },
  {
    question: "Do I need to know exactly what I want before reaching out?",
    answer:
      "No. The demos, pricing flow, and direct contact path are meant to help narrow the direction even if you only know the general feel you are after.",
  },
  {
    question: "Can I start with pricing and still ask questions before paying?",
    answer:
      "Yes. Pricing submissions are reviewed before any payment is collected, which keeps the process lower pressure and easier to discuss.",
  },
]

const featuredDemoShortcuts = [
  {
    slug: "landscaping",
    eyebrow: "Home services",
    note: "Great for businesses that need stronger project proof and local trust.",
  },
  {
    slug: "restaurants",
    eyebrow: "Hospitality",
    note: "A mood-driven path for businesses that need personality and clearer next steps.",
  },
  {
    slug: "law-firm",
    eyebrow: "Professional services",
    note: "Authority-first structure for practices that need credibility without clutter.",
  },
]

const pageTitle = "Custom Websites for Service Businesses"
const pageDescription =
  "Levamen Tech builds custom websites for service businesses with cleaner branding, stronger trust cues, guided pricing, and demo-led planning."

const homeStructuredData = [
  buildWebsiteStructuredData(),
  buildOrganizationStructuredData(pageDescription),
  buildWebPageStructuredData({
    path: "/",
    title: pageTitle,
    description: pageDescription,
  }),
  buildFaqStructuredData(homeFaqs),
]

export default function Home() {
  const [reviews, setReviews] = useState<ApprovedReview[]>([])

  useEffect(() => {
    void fetchApprovedReviews({ limit: 3 })
      .then(setReviews)
      .catch(() => setReviews([]))
  }, [])

  return (
    <>
      <Seo
        title={pageTitle}
        description={pageDescription}
        path="/"
        image="/og-home.svg"
        keywords={[
          "custom websites for service businesses",
          "small business web design",
          "website design for contractors",
          "service business website development",
        ]}
        structuredData={homeStructuredData}
      />

      <Hero
        eyebrow="Premium websites for service businesses"
        title="A cleaner path from first click to first impression"
        gradientWord="first impression"
        description="Levamen Tech builds modern, trust-forward websites for businesses that want something more intentional than a template and easier for customers to say yes to."
        primaryCtaText="View Demos"
        primaryCtaTo="/demos"
        secondaryCtaText="See Pricing"
        secondaryCtaTo="/pricing"
      />

      <section className="section pt-8 sm:pt-10">
        <div className="container-custom">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {proofCards.map((card) => (
              <article key={card.title} className="card-glass h-full">
                <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                  {card.title}
                </p>
                <p className="mt-4 text-4xl font-extrabold tracking-[-0.06em] text-slate-950">
                  {card.value}
                </p>
                <p className="mt-4 text-sm leading-7 text-slate-600">
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container-custom grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="section-panel px-6 py-8 sm:px-8 lg:px-10">
            <div className="section-kicker">
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} />
              Who this is for
            </div>
            <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.05em] text-slate-950 sm:text-4xl">
              Built for businesses that need a site to feel more <span className="gradient-text">credible, clear, and custom</span>
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
              The strongest projects usually start with one simple problem:
              the current site does not reflect the quality of the business.
              Everything here is structured to make that easier to fix.
            </p>
          </div>

          <div className="grid gap-4">
            {fitCards.map((card) => (
              <article key={card.title} className="card h-full">
                <h3 className="text-xl font-extrabold tracking-[-0.03em] text-slate-950">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {card.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container-custom">
          <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="section-kicker">
                <Workflow className="h-3.5 w-3.5" strokeWidth={2} />
                Simple process
              </div>
              <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.05em] text-slate-950 sm:text-4xl md:text-5xl">
                A lighter process that still ends in a <span className="gradient-text">high-polish build</span>
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
                The site, demos, contact form, and pricing flow are designed to
                reduce friction for both sides. You get clearer next steps
                without being forced into a generic process.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/82 px-5 py-4 text-sm leading-7 text-slate-500 shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
              Best entry points:
              <div className="mt-2 flex flex-wrap gap-2">
                <Link
                  to="/demos"
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-semibold text-slate-900"
                  onClick={() =>
                    trackCta("View Demos", {
                      from_path: "/",
                      to_path: "/demos",
                    })
                  }
                >
                  Browse demos
                </Link>
                <Link
                  to="/pricing"
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 font-semibold text-slate-900"
                  onClick={() =>
                    trackCta("See Pricing", {
                      from_path: "/",
                      to_path: "/pricing",
                    })
                  }
                >
                  Compare plans
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {processSteps.map((step, index) => (
              <article key={step.title} className="card h-full">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl gradient-bg text-sm font-extrabold text-white">
                  {index + 1}
                </div>
                <h3 className="mt-5 text-xl font-extrabold tracking-[-0.03em] text-slate-950">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section pt-0">
        <div className="container-custom">
          <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="section-kicker">
                <Compass className="h-3.5 w-3.5" strokeWidth={2} />
                Popular starting points
              </div>
              <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.05em] text-slate-950 sm:text-4xl md:text-5xl">
                Shortcut into a direction that already feels <span className="gradient-text">close to your business</span>
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
                A few of the strongest demo starting points below. Each one can
                carry context into pricing or contact so the next step feels less
                repetitive.
              </p>
            </div>

            <Link
              to="/demos"
              className="btn-secondary !w-full sm:!w-auto"
              onClick={() =>
                trackCta("Browse all demos", {
                  from_path: "/",
                  to_path: "/demos",
                })
              }
            >
              Browse all demos
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {featuredDemoShortcuts.map((shortcut) => {
              const demo = demoCatalog.find((item) => item.slug === shortcut.slug)
              if (!demo) return null

              const context = new URLSearchParams({
                industry: demo.title,
                demo: demo.slug,
              }).toString()

              return (
                <article key={demo.slug} className="card-glass h-full">
                  <div className="text-[0.72rem] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                    {shortcut.eyebrow}
                  </div>
                  <h3 className="mt-4 text-2xl font-extrabold tracking-[-0.04em] text-slate-950">
                    {demo.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {demo.description}
                  </p>
                  <p className="mt-4 rounded-[1.2rem] border border-slate-200/80 bg-white/75 px-4 py-3 text-sm leading-7 text-slate-600">
                    {shortcut.note}
                  </p>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <Link
                      to={`/demos/${demo.slug}`}
                      className="btn-secondary !w-full sm:!w-auto"
                      onClick={() =>
                        trackCta("Open demo", {
                          from_path: "/",
                          to_path: `/demos/${demo.slug}`,
                          demo: demo.slug,
                        })
                      }
                    >
                      Open demo
                    </Link>
                    <Link
                      to={`/pricing?${context}`}
                      className="btn-primary !w-full sm:!w-auto"
                      onClick={() =>
                        trackCta("Use this direction", {
                          from_path: "/",
                          to_path: `/pricing?${context}`,
                          demo: demo.slug,
                        })
                      }
                    >
                      Use this direction
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {reviews.length > 0 ? (
        <section className="section pt-0">
          <div className="container-custom">
            <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="section-kicker">
                  <MessageSquareQuote className="h-3.5 w-3.5" strokeWidth={2} />
                  Featured reviews
                </div>
                <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.05em] text-slate-950 sm:text-4xl">
                  Trust should show up before visitors have to go looking for it
                </h2>
                <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
                  A few approved reviews from the public testimonial feed to
                  reinforce the quality of the process before someone commits to
                  the next step.
                </p>
              </div>

              <Link
                to="/reviews"
                className="btn-secondary !w-full sm:!w-auto"
                onClick={() =>
                  trackCta("Read Reviews", {
                    from_path: "/",
                    to_path: "/reviews",
                  })
                }
              >
                Read all reviews
              </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {reviews.map((review) => (
                <CompactReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section pt-0">
        <div className="container-custom">
          <div className="section-panel px-6 py-8 sm:px-8 lg:px-10">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <div className="section-kicker">
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                  Two clear next steps
                </div>
                <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.05em] text-slate-950 sm:text-4xl">
                  Browse examples first, or skip straight to the project conversation
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                  The site is set up so administrators and visitors both make
                  fewer unnecessary clicks. If you want examples, go to demos. If
                  you already know the business needs help, go straight to
                  pricing or contact.
                </p>
              </div>

              <div className="grid gap-4">
                <Link
                  to="/demos"
                  className="card block transition hover:-translate-y-1"
                  onClick={() =>
                    trackCta("Home CTA View Demos", {
                      from_path: "/",
                      to_path: "/demos",
                    })
                  }
                >
                  <div className="font-extrabold tracking-[-0.03em] text-slate-950">
                    Explore demos
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Best if you want to compare industries and see different
                    visual directions first.
                  </p>
                </Link>

                <Link
                  to="/contact"
                  className="card-glass block transition hover:-translate-y-1"
                  onClick={() =>
                    trackCta("Home CTA Contact", {
                      from_path: "/",
                      to_path: "/contact",
                    })
                  }
                >
                  <div className="font-extrabold tracking-[-0.03em] text-slate-950">
                    Start a conversation
                  </div>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Best if you already know the site needs an upgrade and want a
                    lightweight way to reach out.
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PricingPreview />
    </>
  )
}
