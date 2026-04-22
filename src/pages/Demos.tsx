import { ArrowRight, Compass, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import DemoPreview from "../components/demos/DemoPreview"
import Hero from "../components/sections/Hero"
import { demoCatalog } from "../demos/catalog"
import type { DemoTheme } from "../types/demo"

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

export default function Demos() {
  return (
    <>
      <Hero
        eyebrow="Explore tailored business demo directions"
        title="Browse demos that feel built for each niche"
        gradientWord="built for each niche"
        description="These refreshed demos use more purposeful mockups, service-specific branding cues, and stronger visual storytelling so it is easier to picture how your own custom site could come together."
        primaryCtaText="Contact"
        primaryCtaTo="/contact"
        secondaryCtaText="Read Reviews"
        secondaryCtaTo="/reviews"
        align="center"
        compact
      />

      <section className="section pt-8 sm:pt-10">
        <div className="container-custom">
          <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="section-kicker">
                <Compass className="h-3.5 w-3.5" strokeWidth={2} />
                Demo library
              </div>
              <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.05em] text-slate-950 sm:text-4xl md:text-5xl">
                Find a style that feels close to <span className="gradient-text">your business</span>
              </h2>
              <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
                Each concept now acts more like a branded mini-mockup instead of
                a generic placeholder. Even if your exact industry is not
                listed, this library is here to show how the tone, sections, and
                visuals can shift once the site is actually tailored to your
                service.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/82 px-5 py-4 text-sm leading-7 text-slate-500 shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
              <div className="font-extrabold tracking-[-0.03em] text-slate-950">
                {demoCatalog.length} niche directions
              </div>
              <div className="mt-1">
                Refreshed with richer previews, stronger branding cues, and
                more tailored detail.
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {demoCatalog.map((demo) => {
              const cardStyle = buildCardStyle(demo.data.theme)
              const arrowStyle = buildArrowStyle(demo.data.theme)
              const stripeStyle = buildStripeStyle(demo.data.theme)

              return (
                <Link
                  key={demo.slug}
                  to={`/demos/${demo.slug}`}
                  className="group relative block overflow-hidden rounded-[1.85rem] border border-slate-200/80 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_70px_rgba(15,23,42,0.12)] sm:p-6"
                  style={cardStyle}
                >
                  <div
                    className="absolute inset-x-6 top-0 h-1 rounded-b-full opacity-95"
                    style={stripeStyle}
                  />

                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="mb-3 inline-flex rounded-full bg-slate-100/88 px-3 py-1 text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-slate-500">
                        <Sparkles className="mr-2 h-3.5 w-3.5" strokeWidth={2} />
                        Tailored concept
                      </div>
                      <h3 className="text-2xl font-extrabold tracking-[-0.04em] text-slate-950">
                        {demo.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {demo.description}
                      </p>
                    </div>

                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/80 transition group-hover:-translate-y-0.5"
                      style={arrowStyle}
                    >
                      <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
                    </div>
                  </div>

                  <DemoPreview compact {...demo.data} />

                  <div className="mt-5 flex flex-col gap-3 border-t border-white/70 pt-5 text-sm sm:flex-row sm:items-center sm:justify-between">
                    <span className="font-semibold text-slate-900">
                      Open {demo.data.businessName}
                    </span>
                    <span className="rounded-full bg-white/82 px-3 py-1 text-center text-slate-500">
                      View full demo
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
