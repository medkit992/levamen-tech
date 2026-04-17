import { Link } from "react-router-dom";
import { ArrowRight, Check, Sparkles } from "lucide-react";

const plans = [
  {
    name: "Starter",
    badge: "Best for simple sites",
    setupPrice: 149,
    monthlyPrice: 39,
    description:
      "A clean, responsive website for businesses that need a strong online presence without extra complexity.",
    features: [
      "1-page static website",
      "Mobile responsive design",
      "Fast load speed",
      "Contact section or form",
      "Basic SEO setup",
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
      "A stronger business website with multiple sections or pages, better structure, and more flexibility for growth.",
    features: [
      "Up to 5 pages",
      "Custom layout and branding",
      "Mobile responsive design",
      "Contact form integration",
      "Basic SEO + performance optimization",
      "Hosting + maintenance included",
    ],
    highlighted: true,
  },
  {
    name: "Premium",
    badge: "For bigger business needs",
    setupPrice: 499,
    monthlyPrice: 149,
    description:
      "A more advanced custom site for businesses that want more pages, premium polish, and priority support.",
    features: [
      "Up to 10 pages",
      "Premium custom design",
      "Advanced sections and layouts",
      "Priority maintenance support",
      "Conversion-focused structure",
      "Hosting + maintenance included",
    ],
    highlighted: false,
  },
];

export default function PricingPreview() {
  return (
    <section className="section">
      <div className="container-custom">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-4 py-2 text-sm text-[var(--color-text-muted)] soft-shadow">
            <Sparkles size={16} />
            Simple pricing for local businesses
          </p>

          <h2 className="text-4xl font-semibold tracking-tight text-[var(--color-text)] md:text-5xl">
            Website plans built to <span className="gradient-text">fit your business</span>
          </h2>

          <p className="mt-4 text-lg text-[var(--color-text-muted)]">
            Every plan includes a modern build, mobile responsiveness, hosting,
            and ongoing maintenance. You can customize everything later with add-ons.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={[
                "relative flex h-full flex-col rounded-3xl border p-7 transition duration-300",
                plan.highlighted
                  ? "card-glass glow-blue scale-[1.01]"
                  : "card soft-shadow hover:-translate-y-1",
              ].join(" ")}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-sm font-medium text-white gradient-bg soft-shadow">
                  {plan.badge}
                </div>
              )}

              {!plan.highlighted && (
                <div className="mb-5 inline-flex w-fit rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-1 text-xs font-medium text-[var(--color-text-muted)]">
                  {plan.badge}
                </div>
              )}

              <div className="mb-4">
                <h3 className="text-2xl font-semibold text-[var(--color-text)]">
                  {plan.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--color-text-muted)]">
                  {plan.description}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold text-[var(--color-text)]">
                    ${plan.setupPrice}
                  </span>
                  <span className="pb-1 text-sm text-[var(--color-text-muted)]">
                    setup
                  </span>
                </div>

                <div className="mt-2 text-lg text-[var(--color-text-muted)]">
                  + ${plan.monthlyPrice}/month maintenance
                </div>
              </div>

              <ul className="mb-8 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-[var(--color-text-muted)]"
                  >
                    <span className="mt-0.5 rounded-full bg-[var(--color-bg)] p-1 text-[var(--color-ocean-3)]">
                      <Check size={14} />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <Link
                  to={`/pricing?plan=${plan.name.toLowerCase()}`}
                  className={plan.highlighted ? "btn-primary flex items-center justify-center gap-2" : "btn-secondary flex items-center justify-center gap-2"}
                >
                  Choose {plan.name}
                  <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-[var(--color-text-muted)]">
          Includes a <span className="font-medium text-[var(--color-text)]">7-day refund window</span> and a{" "}
          <span className="font-medium text-[var(--color-text)]">30-day grace period</span> before site suspension if maintenance billing fails.
        </div>
      </div>
    </section>
  );
}