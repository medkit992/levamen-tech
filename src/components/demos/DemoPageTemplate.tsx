import { Link } from "react-router-dom"
import type { DemoPageData } from "../../types/demo"

type Props = DemoPageData

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
}: Props) {
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
            <div className="max-w-3xl">
              <div className="section-kicker">{heroEyebrow}</div>

              <h1 className="mt-6 text-4xl font-extrabold tracking-[-0.06em] text-slate-950 sm:text-5xl md:text-6xl md:leading-[1.02]">
                {renderHeroTitle()}
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                {heroDescription}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={primaryCtaHref}
                  className="btn-primary !w-full sm:!w-auto"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientVia}, ${theme.gradientTo})`,
                  }}
                >
                  {primaryCtaText}
                </Link>

                <Link
                  to={secondaryCtaHref}
                  className="btn-secondary !w-full sm:!w-auto"
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

            <div className="relative">
              <div
                className="card-glass relative mx-auto max-w-lg overflow-hidden p-5 sm:p-6"
                style={{
                  boxShadow: `0 24px 80px ${theme.surfaceTint}`,
                }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-1"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientVia}, ${theme.gradientTo})`,
                  }}
                />

                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-extrabold tracking-[-0.02em] text-slate-900">
                      {businessName}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{industryLabel}</p>
                  </div>

                  <div className="rounded-full border border-slate-200/80 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-500">
                    Demo site
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/92 p-4">
                    <div
                      className="mb-3 h-3 w-28 rounded-full"
                      style={{ backgroundColor: theme.accentSoft }}
                    />
                    <div className="mb-2 h-2 w-full rounded-full bg-slate-100" />
                    <div className="h-2 w-4/5 rounded-full bg-slate-100" />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/92 p-4">
                      <div
                        className="mb-3 h-3 w-20 rounded-full"
                        style={{ backgroundColor: theme.gradientVia }}
                      />
                      <div
                        className="h-20 rounded-[1.1rem]"
                        style={{
                          background: `linear-gradient(to bottom right, ${theme.accentSoft}, white)`,
                        }}
                      />
                    </div>

                    <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/92 p-4">
                      <div
                        className="mb-3 h-3 w-20 rounded-full"
                        style={{ backgroundColor: theme.gradientTo }}
                      />
                      <div
                        className="h-20 rounded-[1.1rem]"
                        style={{
                          background: `linear-gradient(to bottom right, ${theme.surfaceTint}, white)`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/92 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="h-3 w-24 rounded-full bg-slate-200" />
                      <div
                        className="h-9 w-28 rounded-full"
                        style={{
                          backgroundImage: `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientVia}, ${theme.gradientTo})`,
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="h-2 w-full rounded-full bg-slate-100" />
                      <div className="h-2 w-5/6 rounded-full bg-slate-100" />
                      <div className="h-2 w-2/3 rounded-full bg-slate-100" />
                    </div>
                  </div>
                </div>
              </div>
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
                to="/contact"
                className="btn-primary !w-full sm:!w-auto"
                style={{
                  backgroundImage: `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientVia}, ${theme.gradientTo})`,
                }}
              >
                {finalCtaPrimaryText}
              </Link>

              <Link to="/demos" className="btn-secondary !w-full sm:!w-auto">
                {finalCtaSecondaryText}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
