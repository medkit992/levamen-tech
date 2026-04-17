import { Link } from "react-router-dom";
import type { DemoPageData } from "../../types/demo";

type Props = DemoPageData;

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
      return heroTitle;
    }

    const [before, after] = heroTitle.split(heroGradientWord);

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
    );
  };

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background: `
              radial-gradient(circle at top left, ${theme.accentSoft}, transparent 30%),
              radial-gradient(circle at top right, ${theme.surfaceTint}, transparent 28%),
              linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(248,250,252,1))
            `,
          }}
        />

        <div className="container-custom py-24 md:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center rounded-full border border-slate-200 bg-white/85 px-4 py-1.5 text-sm text-slate-600 soft-shadow">
                {heroEyebrow}
              </div>

              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl md:text-6xl md:leading-tight">
                {renderHeroTitle()}
              </h1>

              <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                {heroDescription}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to={primaryCtaHref}
                  className="text-center text-white"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientVia}, ${theme.gradientTo})`,
                    borderRadius: "0.75rem",
                    padding: "0.75rem 1.4rem",
                    fontWeight: 500,
                  }}
                >
                  {primaryCtaText}
                </Link>

                <Link to={secondaryCtaHref} className="btn-secondary text-center">
                  {secondaryCtaText}
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <span className="rounded-full bg-white px-3 py-1 text-sm text-slate-600 border border-slate-200">
                  {industryLabel}
                </span>

                {location && (
                  <span className="rounded-full bg-white px-3 py-1 text-sm text-slate-600 border border-slate-200">
                    {location}
                  </span>
                )}
              </div>
            </div>

            <div className="relative">
              <div
                className="card-glass soft-shadow relative mx-auto max-w-lg overflow-hidden"
                style={{
                  boxShadow: `0 20px 60px ${theme.surfaceTint}`,
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
                    <p className="text-sm font-medium text-slate-900">{businessName}</p>
                    <p className="text-sm text-slate-500">{industryLabel}</p>
                  </div>

                  <div
                    className="rounded-full px-3 py-1 text-xs"
                    style={{
                      backgroundColor: "#f8fafc",
                      color: "#475569",
                    }}
                  >
                    Demo site
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div
                      className="mb-3 h-3 w-28 rounded-full"
                      style={{ backgroundColor: theme.accentSoft }}
                    />
                    <div className="mb-2 h-2 w-full rounded-full bg-slate-100" />
                    <div className="h-2 w-4/5 rounded-full bg-slate-100" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div
                        className="mb-3 h-3 w-20 rounded-full"
                        style={{ backgroundColor: theme.gradientVia }}
                      />
                      <div
                        className="h-20 rounded-xl"
                        style={{
                          background: `linear-gradient(to bottom right, ${theme.accentSoft}, white)`,
                        }}
                      />
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <div
                        className="mb-3 h-3 w-20 rounded-full"
                        style={{ backgroundColor: theme.gradientTo }}
                      />
                      <div
                        className="h-20 rounded-xl"
                        style={{
                          background: `linear-gradient(to bottom right, ${theme.surfaceTint}, white)`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="h-3 w-24 rounded-full bg-slate-200" />
                      <div
                        className="h-8 w-24 rounded-xl"
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

          {/* Stats */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="card soft-shadow">
                <p className="text-3xl font-semibold text-slate-900">{stat.value}</p>
                <p className="mt-2 text-sm text-slate-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="section pt-0">
        <div className="container-custom grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="card-glass soft-shadow">
            <div
              className="mb-5 inline-flex items-center rounded-full px-4 py-1.5 text-sm border"
              style={{
                backgroundColor: "white",
                borderColor: "#e2e8f0",
                color: "#475569",
              }}
            >
              About this business
            </div>

            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              {aboutTitle}
            </h2>

            <p className="mt-5 text-base leading-7 text-slate-600">
              {aboutDescription}
            </p>
          </div>

          <div className="card soft-shadow">
            <h3 className="text-xl font-semibold text-slate-900">What stands out</h3>
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

      {/* Services */}
      <section className="section pt-0">
        <div className="container-custom">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {servicesTitle}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <div key={service.title} className="card-glass soft-shadow">
                <div
                  className="mb-4 h-1.5 w-20 rounded-full"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientTo})`,
                  }}
                />
                <h3 className="text-xl font-semibold text-slate-900">{service.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section pt-0">
        <div className="container-custom">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {processTitle}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {processSteps.map((step, index) => (
              <div key={step.title} className="card soft-shadow">
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-2xl text-white text-sm font-semibold"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientTo})`,
                  }}
                >
                  {index + 1}
                </div>

                <h3 className="mt-5 text-xl font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section pt-0">
        <div className="container-custom">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {testimonialSectionTitle}
            </h2>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={`${testimonial.name}-${testimonial.quote}`} className="card-glass soft-shadow">
                <p className="text-base leading-7 text-slate-600">
                  “{testimonial.quote}”
                </p>

                <div className="mt-6">
                  <p className="font-semibold text-slate-900">{testimonial.name}</p>
                  {testimonial.role && (
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section pt-0">
        <div className="container-custom">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {faqTitle}
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="card soft-shadow">
                <h3 className="text-lg font-semibold text-slate-900">{faq.question}</h3>
                <p className="mt-3 text-slate-600 leading-7">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section pt-0">
        <div className="container-custom">
          <div
            className="overflow-hidden rounded-[2rem] border border-slate-200 px-8 py-12 text-center soft-shadow sm:px-12"
            style={{
              background: `linear-gradient(to right, white, ${theme.surfaceTint}, white)`,
            }}
          >
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              {finalCtaTitle}
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">
              {finalCtaDescription}
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                to="/contact"
                className="text-center text-white"
                style={{
                  backgroundImage: `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientVia}, ${theme.gradientTo})`,
                  borderRadius: "0.75rem",
                  padding: "0.75rem 1.4rem",
                  fontWeight: 500,
                }}
              >
                {finalCtaPrimaryText}
              </Link>

              <Link to="/demos" className="btn-secondary text-center">
                {finalCtaSecondaryText}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}