import { ArrowRight, Check, Sparkles } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { trackCta } from "../../lib/analytics"

const plans = [
  {
    name: "Starter",
    badge: "Clean online presence",
    setupPrice: 149,
    monthlyPrice: 39,
    description:
      "A focused site for businesses that need something sharp, trustworthy, and fast without extra complexity.",
    features: [
      "1-page custom site",
      "Responsive layout",
      "Speed-conscious build",
      "Lead-friendly contact section",
      "Hosting + maintenance included",
    ],
    highlighted: false,
  },
  {
    name: "Growth",
    badge: "Most Popular",
    setupPrice: 299,
    monthlyPrice: 79,
    description:
      "A stronger business website with more structure, more content flexibility, and better room to scale.",
    features: [
      "Up to 5 pages",
      "Custom branding direction",
      "Contact form integration",
      "SEO + performance basics",
      "Hosting + maintenance included",
    ],
    highlighted: true,
  },
  {
    name: "Premium",
    badge: "Higher-polish build",
    setupPrice: 499,
    monthlyPrice: 149,
    description:
      "A bigger custom site for businesses that want standout presentation, more flexibility, and premium polish.",
    features: [
      "Up to 10 pages",
      "Premium layout direction",
      "Advanced sections",
      "Priority support",
      "Hosting + maintenance included",
    ],
    highlighted: false,
  },
]

export default function PricingPreview() {
  const location = useLocation()

  return (
      <section className="section pt-8 sm:pt-10">
      <div className="container-custom">
        <div className="mb-12 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="section-kicker">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
              Simple pricing structure
            </div>

            <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.05em] text-slate-950 sm:text-4xl md:text-5xl">
              Website plans built to <span className="gradient-text">fit your business</span>
            </h2>

            <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
              Every plan includes a modern build, responsive behavior, hosting,
              and ongoing maintenance. The difference is how much range and
              customization you want on top.
            </p>
          </div>

          <Link
            to="/pricing"
            className="btn-secondary !w-full sm:!w-auto"
            onClick={() =>
              trackCta("View full pricing", {
                from_path: location.pathname,
                to_path: "/pricing",
              })
            }
          >
            View full pricing
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={[
                "relative flex h-full flex-col overflow-hidden rounded-[1.9rem] border p-6 sm:p-7 transition duration-300",
                plan.highlighted
                  ? "border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,247,252,0.9))] shadow-[0_28px_80px_rgba(59,130,246,0.14)]"
                  : "border-slate-200/80 bg-white/88 shadow-[0_18px_50px_rgba(15,23,42,0.08)] hover:-translate-y-1",
              ].join(" ")}
            >
              {plan.highlighted && (
                <div className="absolute inset-x-8 top-0 h-1 rounded-b-full gradient-bg" />
              )}

              <div
                className={[
                  "mb-6 inline-flex w-fit rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em]",
                  plan.highlighted
                    ? "bg-[linear-gradient(135deg,rgba(255,122,24,0.12),rgba(75,140,255,0.12))] text-slate-800"
                    : "bg-slate-100 text-slate-500",
                ].join(" ")}
              >
                {plan.badge}
              </div>

              <div className="mb-5">
                <h3 className="text-2xl font-extrabold tracking-[-0.04em] text-slate-950">
                  {plan.name}
                </h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {plan.description}
                </p>
              </div>

              <div className="mb-7 rounded-[1.4rem] bg-slate-50/90 p-4">
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-extrabold tracking-[-0.04em] text-slate-950">
                    ${plan.setupPrice}
                  </span>
                  <span className="pb-1 text-sm text-slate-500">setup</span>
                </div>

                <div className="mt-2 text-base font-semibold text-slate-600">
                  + ${plan.monthlyPrice}/month maintenance
                </div>
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm text-slate-600">
                    <span className="mt-0.5 rounded-full bg-slate-100 p-1 text-slate-800">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <Link
                  to={`/pricing?plan=${plan.name.toLowerCase()}`}
                  className={plan.highlighted ? "btn-primary w-full" : "btn-secondary w-full"}
                  onClick={() =>
                    trackCta(`Choose ${plan.name}`, {
                      from_path: location.pathname,
                      to_path: `/pricing?plan=${plan.name.toLowerCase()}`,
                    })
                  }
                >
                  Choose {plan.name}
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-[1.5rem] border border-slate-200/80 bg-white/72 px-5 py-4 text-sm leading-7 text-slate-500 shadow-[0_12px_30px_rgba(15,23,42,0.05)]">
          Includes a <span className="font-semibold text-slate-900">7-day refund window</span> and a{" "}
          <span className="font-semibold text-slate-900">30-day grace period</span> before site
          suspension if maintenance billing fails.
        </div>
      </div>
    </section>
  )
}
