import Hero from "../components/sections/Hero";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const demoCategories = [
  {
    title: "Landscaping",
    description: "Clean outdoor-service branding with strong visual sections and quote-focused calls to action.",
    slug: "landscaping",
  },
  {
    title: "Plumbing",
    description: "Trust-first layout built for service calls, fast contact, and clear local business credibility.",
    slug: "plumbing",
  },
  {
    title: "HVAC",
    description: "Professional structure for heating and cooling businesses that need reliability and lead generation.",
    slug: "hvac",
  },
  {
    title: "Electrician",
    description: "Straightforward, high-trust demo built around service highlights, safety, and booking intent.",
    slug: "electrician",
  },
  {
    title: "Roofing",
    description: "Bold service demo designed to make estimates, before-and-after visuals, and trust stand out.",
    slug: "roofing",
  },
  {
    title: "Cleaning Services",
    description: "Light, polished demo style with recurring-service appeal and easy quote-request flow.",
    slug: "cleaning-services",
  },
  {
    title: "Pressure Washing",
    description: "Visual, satisfying-style service demo that works well with transformations and local promotions.",
    slug: "pressure-washing",
  },
  {
    title: "Auto Detailing",
    description: "Glossy, premium demo concept made for service packages, results, and appointment booking.",
    slug: "auto-detailing",
  },
  {
    title: "Restaurants",
    description: "Modern restaurant homepage concept with featured menu sections, story, and reservation emphasis.",
    slug: "restaurants",
  },
  {
    title: "Cafes / Coffee Shops",
    description: "Warm, inviting layout with personality, product highlights, and neighborhood brand feel.",
    slug: "cafes-coffee-shops",
  },
  {
    title: "Barbershops",
    description: "Sharp and stylish demo built around branding, services, and appointment-driven design.",
    slug: "barbershops",
  },
  {
    title: "Salons",
    description: "Soft, premium presentation for beauty businesses that want elegance without feeling generic.",
    slug: "salons",
  },
  {
    title: "Fitness / Personal Training",
    description: "Energetic layout focused on programs, testimonials, and personal-brand credibility.",
    slug: "fitness-personal-training",
  },
  {
    title: "Real Estate",
    description: "Professional agent or agency-style demo with listings, trust, and lead capture in mind.",
    slug: "real-estate",
  },
  {
    title: "Photography",
    description: "Portfolio-first concept that highlights imagery while still feeling polished and commercial.",
    slug: "photography",
  },
  {
    title: "Dental / Medical",
    description: "Clean, reassuring layout for practices that need professionalism and approachable trust.",
    slug: "dental-medical",
  },
  {
    title: "Law Firm",
    description: "Minimal, authoritative demo designed to feel credible, clear, and conversion-focused.",
    slug: "law-firm",
  },
  {
    title: "Construction",
    description: "Strong business-forward structure for showcasing projects, capabilities, and reliability.",
    slug: "construction",
  },
  {
    title: "Moving Company",
    description: "Simple and direct demo built to communicate service areas, pricing confidence, and easy contact.",
    slug: "moving-company",
  },
  {
    title: "Home Remodeling",
    description: "Premium renovation demo with visual emphasis on craftsmanship and before-and-after results.",
    slug: "home-remodeling",
  },
];

export default function Demos() {
  return (
    <>
      <Hero
        eyebrow="Explore business demo categories"
        title="Browse demos built for real business niches"
        gradientWord="real business niches"
        description="These demo directions help show how Levamen Tech can adapt style, layout, and branding to different industries while still keeping everything clean, modern, and custom."
        primaryCtaText="Contact"
        primaryCtaTo="/contact"
        secondaryCtaText="Read Reviews"
        secondaryCtaTo="/reviews"
        align="center"
        compact
      />

      <section className="section pt-0">
        <div className="container-custom">
          <div className="mb-10 max-w-2xl">
            <div className="mb-4 inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 text-sm text-slate-600">
              Demo categories
            </div>

            <h2 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Find a style that feels close to your business
            </h2>

            <p className="mt-4 text-base leading-7 text-slate-600">
              Even if your industry is not listed exactly, these demos are meant to show range.
              The goal is to help you picture what your own custom site could look like.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {demoCategories.map((demo) => (
              <Link
                key={demo.slug}
                to={`/demos/${demo.slug}`}
                className="group card-glass soft-shadow block overflow-hidden border border-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-6 h-1 w-full rounded-full gradient-bg opacity-90" />

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 transition group-hover:text-slate-950">
                      {demo.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {demo.description}
                    </p>
                  </div>

                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition group-hover:border-slate-300 group-hover:bg-slate-50">
                    <ArrowRight size={18} className="transition group-hover:translate-x-0.5" />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between text-sm">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                    View demo
                  </span>

                  <span className="text-slate-400 transition group-hover:text-slate-600">
                    /demos/{demo.slug}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}