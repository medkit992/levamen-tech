import { ArrowRight, Compass, Sparkles } from "lucide-react"
import { Link } from "react-router-dom"
import Hero from "../components/sections/Hero"

const demoCategories = [
  {
    title: "Landscaping",
    description:
      "Clean outdoor-service branding with stronger visuals, tighter sections, and trust-focused CTAs.",
    slug: "landscaping",
  },
  {
    title: "Plumbing",
    description:
      "A direct, trust-first layout designed for service calls, fast contact, and local credibility.",
    slug: "plumbing",
  },
  {
    title: "HVAC",
    description:
      "Reliable, professional structure for heating and cooling businesses that need clear lead flow.",
    slug: "hvac",
  },
  {
    title: "Electrician",
    description:
      "Straightforward, high-trust direction centered on service highlights, safety, and booking intent.",
    slug: "electrician",
  },
  {
    title: "Roofing",
    description:
      "Bold presentation built to make estimates, before-and-after visuals, and authority stand out.",
    slug: "roofing",
  },
  {
    title: "Cleaning Services",
    description:
      "A lighter, polished demo style with recurring-service appeal and easy quote-request flow.",
    slug: "cleaning-services",
  },
  {
    title: "Pressure Washing",
    description:
      "Visual, satisfying service direction that works well with transformations and local promotions.",
    slug: "pressure-washing",
  },
  {
    title: "Auto Detailing",
    description:
      "Glossy, premium concept built around service packages, results, and appointment booking.",
    slug: "auto-detailing",
  },
  {
    title: "Restaurants",
    description:
      "A modern restaurant approach with featured menu sections, atmosphere, and reservation emphasis.",
    slug: "restaurants",
  },
  {
    title: "Cafes / Coffee Shops",
    description:
      "Warm, inviting layout with personality, product highlights, and neighborhood brand feel.",
    slug: "cafes-coffee-shops",
  },
  {
    title: "Barbershops",
    description:
      "Sharp and stylish direction built around branding, services, and appointment-driven design.",
    slug: "barbershops",
  },
  {
    title: "Salons",
    description:
      "Soft, premium presentation for beauty businesses that want elegance without feeling generic.",
    slug: "salons",
  },
  {
    title: "Fitness / Personal Training",
    description:
      "Energetic layout focused on programs, credibility, testimonials, and personal-brand presence.",
    slug: "fitness-personal-training",
  },
  {
    title: "Real Estate",
    description:
      "A professional agent or agency-style demo with listings, trust, and lead capture in mind.",
    slug: "real-estate",
  },
  {
    title: "Photography",
    description:
      "Portfolio-first direction that highlights imagery while still feeling polished and commercial.",
    slug: "photography",
  },
  {
    title: "Dental / Medical",
    description:
      "Clean, reassuring structure for practices that need professionalism and approachable trust.",
    slug: "dental-medical",
  },
  {
    title: "Law Firm",
    description:
      "Minimal, authoritative design built to feel credible, clear, and conversion-focused.",
    slug: "law-firm",
  },
  {
    title: "Construction",
    description:
      "Strong business-forward structure for showcasing projects, capabilities, and reliability.",
    slug: "construction",
  },
  {
    title: "Moving Company",
    description:
      "Simple and direct direction for service areas, pricing confidence, and easy contact.",
    slug: "moving-company",
  },
  {
    title: "Home Remodeling",
    description:
      "Premium renovation demo with a stronger emphasis on craftsmanship and before-and-after results.",
    slug: "home-remodeling",
  },
]

export default function Demos() {
  return (
    <>
      <Hero
        eyebrow="Explore business demo categories"
        title="Browse demos built for real business niches"
        gradientWord="real business niches"
        description="These demos show how Levamen Tech can adapt tone, structure, and visual style to different industries while still keeping everything clean, modern, and intentional."
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
                Even if your exact industry is not listed, these demos are here
                to show range. The point is to help you picture how your own
                custom site could feel once it&apos;s tailored to your brand.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/82 px-5 py-4 text-sm leading-7 text-slate-500 shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
              <div className="font-extrabold tracking-[-0.03em] text-slate-950">
                {demoCategories.length} niche directions
              </div>
              <div className="mt-1">Built to show breadth without losing cohesion.</div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {demoCategories.map((demo) => (
              <Link
                key={demo.slug}
                to={`/demos/${demo.slug}`}
                className="group relative block overflow-hidden rounded-[1.85rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,250,255,0.88))] p-5 shadow-[0_18px_60px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_70px_rgba(15,23,42,0.12)] sm:p-6"
              >
                <div className="absolute inset-x-6 top-0 h-1 rounded-b-full gradient-bg opacity-90" />

                <div className="mb-8 flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-[0.7rem] font-extrabold uppercase tracking-[0.2em] text-slate-500">
                      <Sparkles className="mr-2 h-3.5 w-3.5" strokeWidth={2} />
                      Demo concept
                    </div>
                    <h3 className="text-2xl font-extrabold tracking-[-0.04em] text-slate-950">
                      {demo.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {demo.description}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-slate-700 transition group-hover:border-slate-300 group-hover:bg-slate-50 group-hover:text-slate-950">
                    <ArrowRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <span className="font-semibold text-slate-900">View demo</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-center text-slate-500">
                    {demo.title} preview
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
