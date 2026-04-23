import { ArrowRight, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"

type HeroProps = {
  eyebrow?: string
  title: string
  gradientWord?: string
  description: string
  primaryCtaText?: string
  primaryCtaTo?: string
  secondaryCtaText?: string
  secondaryCtaTo?: string
  align?: "left" | "center"
  compact?: boolean
}

export default function Hero({
  eyebrow = "Modern websites for growing businesses",
  title,
  gradientWord,
  description,
  primaryCtaText = "View Demos",
  primaryCtaTo = "/demos",
  secondaryCtaText = "Contact",
  secondaryCtaTo = "/contact",
  align = "left",
  compact = false,
}: HeroProps) {
  const isCentered = align === "center"

  const renderTitle = () => {
    if (!gradientWord || !title.includes(gradientWord)) {
      return title
    }

    const [before, after] = title.split(gradientWord)

    return (
      <>
        {before}
        <span className="gradient-text">{gradientWord}</span>
        {after}
      </>
    )
  }

  return (
    <section className="relative px-4 pt-6 sm:px-8 sm:pt-10 lg:px-12">
      <div className="container-custom">
        <div className="section-panel px-5 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-14">
          <div className="absolute -left-10 top-6 h-36 w-36 rounded-full bg-orange-200/50 blur-3xl sm:-left-16 sm:top-8 sm:h-44 sm:w-44" />
          <div className="absolute right-0 top-0 h-44 w-44 rounded-full bg-blue-200/40 blur-3xl sm:h-56 sm:w-56" />

          <div
            className={[
              "relative grid items-center gap-8 sm:gap-10",
              compact || isCentered ? "lg:grid-cols-1" : "lg:grid-cols-[1.1fr_0.9fr]",
            ].join(" ")}
          >
            <div
              className={
                isCentered
                  ? "hero-enter mx-auto min-w-0 max-w-3xl text-center"
                  : "hero-enter min-w-0 max-w-3xl"
              }
            >
              <div className="section-kicker">
                <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
                {eyebrow}
              </div>

              <h1 className="hero-heading mt-6 text-4xl font-extrabold tracking-[-0.06em] text-slate-950 sm:text-5xl md:text-6xl md:leading-[1.02]">
                {renderTitle()}
              </h1>

              <p
                className={[
                  "mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg",
                  isCentered ? "mx-auto" : "",
                ].join(" ")}
              >
                {description}
              </p>

              <div
                className={[
                  "mt-8 flex flex-col gap-3 sm:flex-row",
                  isCentered ? "justify-center" : "",
                ].join(" ")}
              >
                <Link to={primaryCtaTo} className="btn-primary !w-full sm:!w-auto">
                  {primaryCtaText}
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to={secondaryCtaTo}
                  className="btn-secondary !w-full sm:!w-auto"
                >
                  {secondaryCtaText}
                </Link>
              </div>

              <div
                className={[
                  "mt-8 grid gap-3 text-sm text-slate-500 sm:flex sm:flex-wrap",
                  isCentered ? "justify-center" : "",
                ].join(" ")}
              >
                <span className="rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-center">
                  Custom visual direction
                </span>
                <span className="rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-center">
                  Responsive from the start
                </span>
                <span className="rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-center">
                  Built to feel premium
                </span>
              </div>
            </div>

            {!compact && !isCentered && (
              <div className="hero-enter-side relative min-w-0">
                <div className="card-glass relative mx-auto max-w-lg overflow-hidden p-5 sm:p-6">
                  <div className="absolute inset-x-0 top-0 h-1 gradient-bg" />

                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Launch-ready site
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Design, structure, and trust cues working together
                      </p>
                    </div>
                    <div className="rounded-full border border-slate-200/80 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-600">
                      Live preview
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/90 p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="h-3 w-28 rounded-full bg-slate-200" />
                          <div className="h-2 w-44 rounded-full bg-slate-100" />
                        </div>
                        <div className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                          Conversion-focused
                        </div>
                      </div>
                      <div className="mt-4 h-24 rounded-[1.25rem] bg-[linear-gradient(135deg,rgba(255,122,24,0.12),rgba(255,179,71,0.08),rgba(75,140,255,0.14))]" />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="metric-card p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                          Visual tone
                        </p>
                        <p className="mt-3 text-xl font-bold tracking-[-0.04em] text-slate-950">
                          Warm + clean
                        </p>
                      </div>

                      <div className="metric-card p-4">
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                          Client feel
                        </p>
                        <p className="mt-3 text-xl font-bold tracking-[-0.04em] text-slate-950">
                          Easy to trust
                        </p>
                      </div>
                    </div>

                    <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/90 p-4">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="h-3 w-24 rounded-full bg-slate-200" />
                        <div className="h-10 w-28 rounded-full gradient-bg opacity-95" />
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
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
