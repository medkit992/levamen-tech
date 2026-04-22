import type { DemoPageData } from "../types/demo"
import { autoDetailingDemoData } from "./autoDetailingDemo"
import { barbershopDemoData } from "./barbershopDemo"
import { cafeDemoData } from "./cafeDemo"
import { cleaningServicesDemoData } from "./cleaningServicesDemo"
import { constructionDemoData } from "./constructionDemo"
import { dentalMedicalDemoData } from "./dentalMedicalDemo"
import { electricianDemoData } from "./electricianDemo"
import { fitnessDemoData } from "./fitnessDemo"
import { homeRemodelingDemoData } from "./homeRemodelingDemo"
import { hvacDemoData } from "./hvacDemo"
import { landscapingDemoData } from "./landscapingDemo"
import { lawFirmDemoData } from "./lawFirmDemo"
import { movingCompanyDemoData } from "./movingCompanyDemo"
import { photographyDemoData } from "./photographyDemo"
import { plumbingDemoData } from "./plumbingDemo"
import { pressureWashingDemoData } from "./pressureWashingDemo"
import { realEstateDemoData } from "./realEstateDemo"
import { restaurantsDemoData } from "./restaurantsDemo"
import { roofingDemoData } from "./roofingDemo"
import { salonDemoData } from "./salonDemo"

export type DemoCatalogEntry = {
  slug: string
  title: string
  description: string
  data: DemoPageData
}

export const demoCatalog: DemoCatalogEntry[] = [
  {
    slug: "landscaping",
    title: "Landscaping",
    description:
      "Outdoor-service branding with cleaner hierarchy, premium trust cues, and before-and-after energy.",
    data: landscapingDemoData,
  },
  {
    slug: "plumbing",
    title: "Plumbing",
    description:
      "A direct, trust-first direction built for urgent calls, fast scanning, and local credibility.",
    data: plumbingDemoData,
  },
  {
    slug: "hvac",
    title: "HVAC",
    description:
      "Reliable heating-and-cooling presentation with clearer service pathways and strong seasonal confidence.",
    data: hvacDemoData,
  },
  {
    slug: "electrician",
    title: "Electrician",
    description:
      "A sharper service layout centered on safety, expertise, and booking intent for residential leads.",
    data: electricianDemoData,
  },
  {
    slug: "roofing",
    title: "Roofing",
    description:
      "A bold, estimate-ready demo where project proof, authority, and premium presentation stand out.",
    data: roofingDemoData,
  },
  {
    slug: "cleaning-services",
    title: "Cleaning Services",
    description:
      "A polished recurring-service concept with approachable branding and easy quote-request flow.",
    data: cleaningServicesDemoData,
  },
  {
    slug: "pressure-washing",
    title: "Pressure Washing",
    description:
      "A visually satisfying direction tailored for transformations, curb appeal, and strong neighborhood promotions.",
    data: pressureWashingDemoData,
  },
  {
    slug: "auto-detailing",
    title: "Auto Detailing",
    description:
      "Glossy, package-driven positioning that makes results, upgrades, and premium care feel intentional.",
    data: autoDetailingDemoData,
  },
  {
    slug: "restaurants",
    title: "Restaurants",
    description:
      "A mood-forward dining concept built around featured dishes, atmosphere, and reservation momentum.",
    data: restaurantsDemoData,
  },
  {
    slug: "cafes-coffee-shops",
    title: "Cafes / Coffee Shops",
    description:
      "A warm neighborhood-brand direction with drink highlights, personality, and repeat-visit energy.",
    data: cafeDemoData,
  },
  {
    slug: "barbershops",
    title: "Barbershops",
    description:
      "A crisp, stylish demo built around strong identity, service menus, and appointment-driven design.",
    data: barbershopDemoData,
  },
  {
    slug: "salons",
    title: "Salons",
    description:
      "A softer premium look for beauty brands that want elegance, polish, and clearer service storytelling.",
    data: salonDemoData,
  },
  {
    slug: "fitness-personal-training",
    title: "Fitness / Personal Training",
    description:
      "An energetic personal-brand layout focused on programs, proof, testimonials, and transformation goals.",
    data: fitnessDemoData,
  },
  {
    slug: "real-estate",
    title: "Real Estate",
    description:
      "A polished agent-style demo built to showcase listings, trust signals, and lead capture with intention.",
    data: realEstateDemoData,
  },
  {
    slug: "photography",
    title: "Photography",
    description:
      "A portfolio-first concept that still feels commercial, premium, and clear about the booking path.",
    data: photographyDemoData,
  },
  {
    slug: "dental-medical",
    title: "Dental / Medical",
    description:
      "A reassuring, clean demo for practices that need professionalism, clarity, and approachable trust.",
    data: dentalMedicalDemoData,
  },
  {
    slug: "law-firm",
    title: "Law Firm",
    description:
      "A more authoritative direction that balances credibility, clarity, and consultation-focused structure.",
    data: lawFirmDemoData,
  },
  {
    slug: "construction",
    title: "Construction",
    description:
      "A business-forward buildout for showcasing capabilities, larger projects, and operational reliability.",
    data: constructionDemoData,
  },
  {
    slug: "moving-company",
    title: "Moving Company",
    description:
      "A direct service concept that highlights pricing clarity, service areas, and fast customer outreach.",
    data: movingCompanyDemoData,
  },
  {
    slug: "home-remodeling",
    title: "Home Remodeling",
    description:
      "A premium renovation demo with stronger craftsmanship cues and more purposeful before-and-after storytelling.",
    data: homeRemodelingDemoData,
  },
]
