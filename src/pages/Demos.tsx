import { useMemo, useState } from "react"
import {
  ArrowRight,
  Compass,
  Search,
  Tags,
} from "lucide-react"
import { Link } from "react-router-dom"
import DemoPreview from "../components/demos/DemoPreview"
import Hero from "../components/sections/Hero"
import Seo from "../components/seo/Seo"
import { demoCatalog } from "../demos/catalog"
import { trackCta } from "../lib/analytics"
import {
  buildBreadcrumbStructuredData,
  buildWebPageStructuredData,
} from "../seo/site"
import type { DemoTheme } from "../types/demo"

type DemoFilterKey =
  | "all"
  | "home-services"
  | "hospitality"
  | "beauty-fitness"
  | "professional"

const demoCategories: Array<{
  key: DemoFilterKey
  label: string
  description: string
  matches: string[]
}> = [
  {
    key: "all",
    label: "All demos",
    description: "See the full demo library.",
    matches: [],
  },
  {
    key: "home-services",
    label: "Home services",
    description: "Contractors and service businesses that rely on trust and fast scanning.",
    matches: [
      "landscaping",
      "plumbing",
      "hvac",
      "electrician",
      "roofing",
      "cleaning-services",
      "pressure-washing",
      "construction",
      "moving-company",
      "home-remodeling",
    ],
  },
  {
    key: "hospitality",
    label: "Food + hospitality",
    description: "Restaurants, cafes, and service businesses with a stronger visual vibe.",
    matches: ["restaurants", "cafes-coffee-shops"],
  },
  {
    key: "beauty-fitness",
    label: "Beauty + fitness",
    description: "Appointment-driven brands that need polish, personality, and clearer calls to action.",
    matches: ["barbershops", "salons", "fitness-personal-training", "auto-detailing"],
  },
  {
    key: "professional",
    label: "Professional",
    description: "Authority-first industries like law, real estate, photography, and healthcare.",
    matches: ["real-estate", "photography", "dental-medical", "law-firm"],
  },
]

function buildCardStyle(theme: DemoTheme) {
  return {
    background: `
      radial-gradient(circle at top right, ${theme.surfaceTint}, transparent 34%),
      radial-gradient(circle at bottom left, ${theme.accentSoft}, transparent 36%),
      linear-gradient(180deg, rgba(255,255,255,0.96), rgba(247,250,255,0.88))
    `,
  }
}

function buildArrowStyle(theme: DemoTheme) {
  return {
    background: `linear-gradient(135deg, rgba(255,255,255,0.95), ${theme.surfaceTint})`,
    color: theme.accentStrong,
  }
}

function buildStripeStyle(theme: DemoTheme) {
  return {
    backgroundImage: `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientVia}, ${theme.gradientTo})`,
  }
}

function buildContextPath(basePath: string, title: string, slug: string) {
  const params = new URLSearchParams({
    industry: title,
    demo: slug,
  })

  return `${basePath}?${params.toString()}`
}

const pageTitle = "Website Demos for Service Businesses"
const pageDescription =
  "Browse niche website demos for landscapers, plumbers, HVAC companies, electricians, restaurants, salons, law firms, and other service businesses."

const demosStructuredData = [
  buildWebPageStructuredData({
    path: "/demos",
    title: pageTitle,
    description: pageDescription,
    pageType: "CollectionPage",
  }),
  buildBreadcrumbStructuredData([
    { name: "Home", path: "/" },
    { name: "Demos", path: "/demos" },
  ]),
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Levamen Tech demo library",
    description: pageDescription,
    itemListElement: demoCatalog.map((demo, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `https://levamentech.com/demos/${demo.slug}`,
      name: demo.title,
      description: demo.description,
    })),
  },
]

export default function Demos() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState<DemoFilterKey>("all")

  const activeFilterConfig =
    demoCategories.find((category) => category.key === activeFilter) ?? demoCategories[0]

  const filteredDemos = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return demoCatalog.filter((demo) => {
      const matchesFilter =
        activeFilter === "all" || activeFilterConfig.matches.includes(demo.slug)

      if (!matchesFilter) {
        return false
      }

      if (!normalizedSearch) {
        return true
      }

      const haystack = [
        demo.title,
        demo.description,
        demo.data.businessName,
        demo.data.industryLabel,
      ]
        .join(" ")
        .toLowerCase()

      return haystack.includes(normalizedSearch)
    })
  }, [activeFilter, activeFilterConfig.matches, searchTerm])

  const searchContextLabel =
    searchTerm.trim() ||
    (activeFilter !== "all" ? activeFilterConfig.label : "service business")

  return (
    <>
      <Seo
        title={pageTitle}
        description={pageDescription}
        path="/demos"
        image="/og-demos.svg"
        keywords={[
          "website demos for service businesses",
          "small business website examples",
          "contractor website demos",
          "service business web design inspiration",
        ]}
        structuredData={demosStructuredData}
      />

      <Hero
        eyebrow="Explore tailored business demo directions"
        title="Browse demos that feel built for the industry"
        gradientWord="built for the industry"
        description="Filter the demo library by category or search your niche, then carry that context straight into pricing or contact so you do not have to start from scratch."
        primaryCtaText="Start a Project"
        primaryCtaTo="/contact"
        secondaryCtaText="See Pricing"
        secondaryCtaTo="/pricing"
        align="center"
        compact
      />

      <section className="section pt-8 sm:pt-10">
        <div className="container-custom">
          <div className="mb-10 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="card-glass">
              <div className="section-kicker">
                <Compass className="h-3.5 w-3.5" strokeWidth={2} />
                Demo library
              </div>
              <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.05em] text-slate-950 sm:text-4xl">
                Find a direction that already feels close to your business
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
                These demos are meant to reduce the blank-page problem. Start by
                choosing a category, searching your niche, or opening the closest
                example and then use that context in the next step.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="card h-full">
                <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                  Matched demos
                </p>
                <p className="mt-4 text-4xl font-extrabold tracking-[-0.06em] text-slate-950">
                  {filteredDemos.length}
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Filter the library without losing the stronger internal links
                  into pricing, contact, and the individual demo pages.
                </p>
              </div>

              <div className="card h-full">
                <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                  Need a closer fit?
                </p>
                <p className="mt-4 text-lg font-extrabold tracking-[-0.03em] text-slate-950">
                  Use the nearest match and carry it forward
                </p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Contact and pricing can now inherit demo context, so picking a
                  close example is enough to keep moving.
                </p>
              </div>
            </div>
          </div>

          <div className="card-glass">
            <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <label htmlFor="demo-search" className="field-label">
                  Search by niche, business type, or vibe
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="demo-search"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Try plumber, salon, law, coffee, remodeling..."
                    className="field-input pl-11"
                  />
                </div>
              </div>

              <div className="rounded-[1.4rem] border border-slate-200/80 bg-white/82 px-4 py-3 text-sm leading-7 text-slate-600">
                {filteredDemos.length} result{filteredDemos.length === 1 ? "" : "s"} for{" "}
                <span className="font-extrabold text-slate-950">{searchContextLabel}</span>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {demoCategories.map((category) => {
                const isActive = category.key === activeFilter

                return (
                  <button
                    key={category.key}
                    type="button"
                    onClick={() => setActiveFilter(category.key)}
                    className={[
                      "rounded-full border px-4 py-2 text-sm font-semibold transition",
                      isActive
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {category.label}
                  </button>
                )
              })}
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-500">
              {activeFilterConfig.description}
            </p>
          </div>

          {filteredDemos.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredDemos.map((demo) => {
                const cardStyle = buildCardStyle(demo.data.theme)
                const arrowStyle = buildArrowStyle(demo.data.theme)
                const stripeStyle = buildStripeStyle(demo.data.theme)
                const demoPath = `/demos/${demo.slug}`
                const pricingPath = buildContextPath("/pricing", demo.title, demo.slug)
                const contactPath = buildContextPath("/contact", demo.title, demo.slug)

                return (
                  <article
                    key={demo.slug}
                    className="relative overflow-hidden rounded-[1.85rem] border border-slate-200/80 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:p-6"
                    style={cardStyle}
                  >
                    <div
                      className="absolute inset-x-6 top-0 h-1 rounded-b-full opacity-95"
                      style={stripeStyle}
                    />

                    <div className="mb-6 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="mb-3 inline-flex rounded-full bg-slate-100/88 px-3 py-1 text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-slate-500">
                          <Tags className="mr-2 h-3.5 w-3.5" strokeWidth={2} />
                          {demo.data.industryLabel}
                        </div>
                        <h3 className="text-2xl font-extrabold tracking-[-0.04em] text-slate-950">
                          {demo.title}
                        </h3>
                        <p className="mt-3 text-sm leading-7 text-slate-600">
                          {demo.description}
                        </p>
                      </div>

                      <Link
                        to={demoPath}
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/80 transition hover:-translate-y-0.5"
                        style={arrowStyle}
                        onClick={() =>
                          trackCta("Open demo", {
                            from_path: "/demos",
                            to_path: demoPath,
                            demo: demo.slug,
                          })
                        }
                      >
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                    </div>

                    <DemoPreview compact {...demo.data} />

                    <div className="mt-5 border-t border-white/70 pt-5">
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Link
                          to={demoPath}
                          className="btn-secondary !w-full"
                          onClick={() =>
                            trackCta("View full demo", {
                              from_path: "/demos",
                              to_path: demoPath,
                              demo: demo.slug,
                            })
                          }
                        >
                          View full demo
                        </Link>
                        <Link
                          to={pricingPath}
                          className="btn-primary !w-full"
                          onClick={() =>
                            trackCta("Use this demo for pricing", {
                              from_path: "/demos",
                              to_path: pricingPath,
                              demo: demo.slug,
                            })
                          }
                        >
                          Use this direction
                        </Link>
                      </div>

                      <Link
                        to={contactPath}
                        className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-slate-700 transition hover:text-slate-950"
                        onClick={() =>
                          trackCta("Ask about this demo", {
                            from_path: "/demos",
                            to_path: contactPath,
                            demo: demo.slug,
                          })
                        }
                      >
                        Ask about this demo
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-[1.85rem] border border-dashed border-slate-300 bg-white/78 px-6 py-10 text-center shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
              <h3 className="text-2xl font-extrabold tracking-[-0.04em] text-slate-950">
                No exact match yet
              </h3>
              <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                Try a broader search term, switch categories, or use the contact
                form and mention the niche you are after. A close demo is still a
                good planning shortcut.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  to={`/contact?${new URLSearchParams({ industry: searchContextLabel }).toString()}`}
                  className="btn-primary !w-full sm:!w-auto"
                  onClick={() =>
                    trackCta("Demos empty state contact", {
                      from_path: "/demos",
                      to_path: "/contact",
                      industry: searchContextLabel,
                    })
                  }
                >
                  Ask about your niche
                </Link>
                <button
                  type="button"
                  className="btn-secondary !w-full sm:!w-auto"
                  onClick={() => {
                    setSearchTerm("")
                    setActiveFilter("all")
                  }}
                >
                  Reset filters
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_1fr]">
            <Link
              to={`/pricing?${new URLSearchParams({ industry: searchContextLabel }).toString()}`}
              className="card block transition hover:-translate-y-1"
              onClick={() =>
                trackCta("Filtered demos to pricing", {
                  from_path: "/demos",
                  to_path: "/pricing",
                  industry: searchContextLabel,
                })
              }
            >
              <div className="font-extrabold tracking-[-0.03em] text-slate-950">
                Price out a site in this direction
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Carry the current filter or search term into pricing so the
                request starts with useful context.
              </p>
            </Link>

            <Link
              to={`/contact?${new URLSearchParams({ industry: searchContextLabel }).toString()}`}
              className="card-glass block transition hover:-translate-y-1"
              onClick={() =>
                trackCta("Filtered demos to contact", {
                  from_path: "/demos",
                  to_path: "/contact",
                  industry: searchContextLabel,
                })
              }
            >
              <div className="font-extrabold tracking-[-0.03em] text-slate-950">
                Talk through the closest match
              </div>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                If none of the demos are exact, the nearest fit is still enough
                to start the project conversation.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
