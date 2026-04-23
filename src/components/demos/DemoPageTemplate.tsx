import { Link, useLocation } from "react-router-dom"
import Seo from "../seo/Seo"
import type { DemoPageData } from "../../types/demo"
import {
  buildBreadcrumbStructuredData,
  buildFaqStructuredData,
  buildWebPageStructuredData,
} from "../../seo/site"
import DemoPreview from "./DemoPreview"
import { trackCta } from "../../lib/analytics"

type Props = DemoPageData

type DemoPageTemplateProps = Props & {
  canonicalPath?: string
}

const demoOpenGraphImages: Record<string, string> = {
  "/demos/landscaping": "/og-demo-landscaping.svg",
  "/demos/plumbing": "/og-demo-plumbing.svg",
  "/demos/hvac": "/og-demo-hvac.svg",
}

function getDemoImage(path: string) {
  return demoOpenGraphImages[path] ?? "/og-demos.svg"
}

function buildContextPath(
  basePath: string,
  industryLabel: string,
  pagePath: string
) {
  const params = new URLSearchParams({
    industry: industryLabel,
    demo: pagePath.split("/").at(-1) ?? "",
  })

  return `${basePath}?${params.toString()}`
}

export default function DemoPageTemplate({
  businessName,
  industryLabel,
  location,
  heroEyebrow,
  heroTitle,
  heroGradientWord,
  heroDescription,
  primaryCtaText,
  primaryCtaHref = "/contact",
  secondaryCtaText,
  secondaryCtaHref = "/demos",
  aboutTitle,
  aboutDescription,
  aboutPoints,
  servicesTitle,
  services,
  stats,
  testimonialSectionTitle,
  testimonials,
  processTitle,
  processSteps,
  faqTitle,
  faqs,
  finalCtaTitle,
  finalCtaDescription,
  finalCtaPrimaryText,
  finalCtaSecondaryText,
  theme,
  canonicalPath,
}: DemoPageTemplateProps) {
  const routerLocation = useLocation()
  const pagePath = canonicalPath ?? routerLocation.pathname
  const pageTitle = `${businessName} ${industryLabel} Website Demo`
  const pageDescription = `${heroDescription} Explore this ${industryLabel.toLowerCase()} website demo from Levamen Tech${location ? ` for ${location}` : ""}.`
  const primaryCtaPath = buildContextPath("/contact", industryLabel, pagePath)
  const pricingCtaPath = buildContextPath("/pricing", industryLabel, pagePath)
  const resolvedPrimaryCtaPath =
    primaryCtaHref === "/pricing"
      ? pricingCtaPath
      : primaryCtaHref === "/contact"
        ? primaryCtaPath
        : primaryCtaHref

  const structuredData = [
    buildWebPageStructuredData({
      path: pagePath,
      title: pageTitle,
      description: pageDescription,
    }),
    buildBreadcrumbStructuredData([
      { name: "Home", path: "/" },
      { name: "Demos", path: "/demos" },
      { name: businessName, path: pagePath },
    ]),
    buildFaqStructuredData(faqs),
  ]

  const renderHeroTitle = () => {
    if (!heroGradientWord || !heroTitle.includes(heroGradientWord)) {
      return heroTitle
    }

    const [before, after] = heroTitle.split(heroGradientWord)

    return (
      <>
        {before}
        <span
          style={{
            backgroundImage: `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientVia}, ${theme.gradientTo})`,
          }}
          className="bg-clip-text text-transparent"
        >
          {heroGradientWord}
        </span>
        {after}
      </>
    )
  }

  return (
    <div className="overflow-hidden px-4 pt-6 sm:px-8 sm:pt-10 lg:px-12">
      <Seo
        title={pageTitle}
        description={pageDescription}
        path={pagePath}
        image={getDemoImage(pagePath)}
        structuredData={structuredData}
        keywords={[
          `${industryLabel.toLowerCase()} website demo`,
          `${industryLabel.toLowerCase()} website design`,
          `${businessName.toLowerCase()} demo`,
          "service business website example",
        ]}
      />
      <section className="container-custom">
        <div
          className="section-panel px-5 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-14"
          style={{
            background: `
              radial-gradient(circle at top left, ${theme.accentSoft}, transparent 28%),
              radial-gradient(circle at top right, ${theme.surfaceTint}, transparent 26%),
              linear-gradient(180deg, rgba(255,255,255,0.92), rgba(255,255,255,0.74))
            `,
          }}
        >
          <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-[1.02fr_0.98fr]">
            <div className="min-w-0 max-w-3xl">
              <div className="section-kicker">{heroEyebrow}</div>

              <h1 className="hero-heading mt-6 text-4xl font-extrabold tracking-[-0.06em] text-slate-950 sm:text-5xl md:text-6xl md:leading-[1.02]">
                {renderHeroTitle()}
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                {heroDescription}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={resolvedPrimaryCtaPath}
                  className="btn-primary !w-full sm:!w-auto"
                  onClick={() =>
                    trackCta(primaryCtaText, {
                      from_path: pagePath,
                      to_path: resolvedPrimaryCtaPath,
                      industry: industryLabel,
                    })
                  }
                  style={{
                    backgroundImage: `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientVia}, ${theme.gradientTo})`,
                  }}
                >
                  {primaryCtaText}
                </Link>

                <Link
                  to={secondaryCtaHref}
                  className="btn-secondary !w-full sm:!w-auto"
                  onClick={() =>
                    trackCta(secondaryCtaText, {
                      from_path: pagePath,
                      to_path: secondaryCtaHref,
                      industry: industryLabel,
                    })
                  }
                >
                  {secondaryCtaText}
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <span className="rounded-full border border-slate-200/80 bg-white/76 px-4 py-2 text-sm font-semibold text-slate-600">
                  {industryLabel}
                </span>
                {location && (
                  <span className="rounded-full border border-slate-200/80 bg-white/76 px-4 py-2 text-sm font-semibold text-slate-600">
                    {location}
                  </span>
                )}
              </div>
            </div>

            <div className="relative min-w-0">
              <DemoPreview
                businessName={businessName}
                industryLabel={industryLabel}
                location={location}
                heroTitle={heroTitle}
                heroDescription={heroDescription}
                primaryCtaText={primaryCtaText}
                secondaryCtaText={secondaryCtaText}
                services={services}
                stats={stats}
                theme={theme}
                className="mx-auto max-w-xl"
              />
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="metric-card px-5 py-5">
                <p className="text-3xl font-extrabold tracking-[-0.04em] text-slate-950">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-slate-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section pb-0 pt-12">
        <div className="container-custom grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="card-glass">
            <div className="section-kicker">About this business</div>
            <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.04em] text-slate-950">
              {aboutTitle}
            </h2>
            <p className="mt-5 text-base leading-8 text-slate-600">{aboutDescription}</p>
          </div>

          <div className="card">
            <h3 className="text-xl font-extrabold tracking-[-0.03em] text-slate-950">
              What stands out
            </h3>
            <ul className="mt-5 space-y-3">
              {aboutPoints.map((point) => (
                <li key={point} className="flex items-start gap-3 text-slate-600">
                  <span
                    className="mt-2 h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: theme.accentStrong }}
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section pb-0">
        <div className="container-custom">
          <div className="mb-10 max-w-2xl">
            <div className="section-kicker">Services</div>
            <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              {servicesTitle}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <div key={service.title} className="card-glass">
                <div
                  className="mb-4 h-1.5 w-20 rounded-full"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientTo})`,
                  }}
                />
                <h3 className="text-xl font-extrabold tracking-[-0.03em] text-slate-950">
                  {service.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section pb-0">
        <div className="container-custom">
          <div className="mb-10 max-w-2xl">
            <div className="section-kicker">Process</div>
            <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              {processTitle}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {processSteps.map((step, index) => (
              <div key={step.title} className="card">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-extrabold text-white"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientTo})`,
                  }}
                >
                  {index + 1}
                </div>

                <h3 className="mt-5 text-xl font-extrabold tracking-[-0.03em] text-slate-950">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section pb-0">
        <div className="container-custom">
          <div className="mb-10 max-w-2xl">
            <div className="section-kicker">Testimonials</div>
            <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              {testimonialSectionTitle}
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={`${testimonial.name}-${testimonial.quote}`} className="card-glass">
                <p className="text-base leading-8 text-slate-600">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                <div className="mt-6 border-t border-slate-100 pt-5">
                  <p className="font-extrabold tracking-[-0.02em] text-slate-950">
                    {testimonial.name}
                  </p>
                  {testimonial.role && (
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section pb-0">
        <div className="container-custom">
          <div className="mb-10 max-w-2xl">
            <div className="section-kicker">FAQ</div>
            <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.04em] text-slate-950 sm:text-4xl">
              {faqTitle}
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="card">
                <h3 className="text-lg font-extrabold tracking-[-0.03em] text-slate-950">
                  {faq.question}
                </h3>
                <p className="mt-3 leading-8 text-slate-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section pt-12">
        <div className="container-custom">
          <div
            className="overflow-hidden rounded-[2rem] border border-slate-200/80 px-5 py-10 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:px-12 sm:py-12"
            style={{
              background: `linear-gradient(to right, white, ${theme.surfaceTint}, white)`,
            }}
          >
            <h2 className="text-3xl font-extrabold tracking-[-0.05em] text-slate-950 sm:text-4xl">
              {finalCtaTitle}
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-slate-600">
              {finalCtaDescription}
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to={primaryCtaPath}
                className="btn-primary !w-full sm:!w-auto"
                onClick={() =>
                  trackCta(finalCtaPrimaryText, {
                    from_path: pagePath,
                    to_path: primaryCtaPath,
                    industry: industryLabel,
                  })
                }
                style={{
                  backgroundImage: `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientVia}, ${theme.gradientTo})`,
                }}
              >
                {finalCtaPrimaryText}
              </Link>

              <Link
                to="/demos"
                className="btn-secondary !w-full sm:!w-auto"
                onClick={() =>
                  trackCta(finalCtaSecondaryText, {
                    from_path: pagePath,
                    to_path: "/demos",
                    industry: industryLabel,
                  })
                }
              >
                {finalCtaSecondaryText}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
