import { BrushCleaning, LayoutTemplate, MessageSquareQuote, Rocket } from "lucide-react"
import Seo from "../components/seo/Seo"
import PricingPreview from "../components/pricing/PricingPreview"
import Hero from "../components/sections/Hero"
import {
  buildOrganizationStructuredData,
  buildWebPageStructuredData,
  buildWebsiteStructuredData,
} from "../seo/site"

const pillars = [
  {
    icon: BrushCleaning,
    title: "Clear visual direction",
    description:
      "Every page should feel designed on purpose, not assembled from generic blocks.",
  },
  {
    icon: LayoutTemplate,
    title: "Structure that helps convert",
    description:
      "The layout should guide attention cleanly so people understand what you do fast.",
  },
  {
    icon: MessageSquareQuote,
    title: "Trust cues in the right places",
    description:
      "Reviews, contact paths, and supporting details should reinforce credibility without clutter.",
  },
  {
    icon: Rocket,
    title: "Launch-ready polish",
    description:
      "Fast, responsive, and tidy enough that the site feels good before anyone clicks twice.",
  },
]

const pageTitle = "Custom Websites for Service Businesses"
const pageDescription =
  "Levamen Tech builds custom websites for service businesses with clean branding, responsive layouts, clear structure, and conversion-focused polish."

const homeStructuredData = [
  buildWebsiteStructuredData(),
  buildOrganizationStructuredData(pageDescription),
  buildWebPageStructuredData({
    path: "/",
    title: pageTitle,
    description: pageDescription,
  }),
]

export default function Home() {
  return (
    <>
      <Seo
        title={pageTitle}
        description={pageDescription}
        path="/"
        keywords={[
          "custom websites for service businesses",
          "small business web design",
          "website design for contractors",
          "service business website development",
        ]}
        structuredData={homeStructuredData}
      />
      <Hero
        eyebrow="Premium websites for service businesses"
        title="Custom websites with a sunset-to-sea feel"
        gradientWord="sunset-to-sea"
        description="Levamen Tech builds modern, high-converting websites for businesses that want something cleaner, faster, and more memorable than a template."
        primaryCtaText="View Demos"
        primaryCtaTo="/demos"
        secondaryCtaText="Get in Touch"
        secondaryCtaTo="/contact"
      />

      <section className="section pt-8 sm:pt-10">
        <div className="container-custom">
          <div className="mb-8 max-w-3xl sm:mb-10">
            <div className="section-kicker">How the work should feel</div>
            <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.05em] text-slate-950 sm:text-4xl md:text-5xl">
              Clean, confident, and built with <span className="gradient-text">real intention</span>
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">
              The goal is not just a nicer homepage. It&apos;s a full site that feels
              cohesive, premium, and easy for your clients to trust from the
              first glance through the final click.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {pillars.map((pillar) => {
              const Icon = pillar.icon

              return (
                <article key={pillar.title} className="card-glass h-full">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(255,122,24,0.12),rgba(75,140,255,0.14))] text-slate-900">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>

                  <h3 className="mt-5 text-xl font-extrabold tracking-[-0.04em] text-slate-950">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {pillar.description}
                  </p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <PricingPreview />
    </>
  )
}
