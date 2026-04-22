import type { CSSProperties, SVGProps } from "react"
import type { DemoPageData } from "../../types/demo"

type DemoPreviewProps = Pick<
  DemoPageData,
  | "businessName"
  | "industryLabel"
  | "location"
  | "heroTitle"
  | "heroDescription"
  | "primaryCtaText"
  | "secondaryCtaText"
  | "services"
  | "stats"
  | "theme"
> & {
  compact?: boolean
  className?: string
}

type PreviewPreset = {
  key: string
  heroLabel: string
  surfaceLabel: string
  supportLabel: string
  tagline: string
  keywords: string[]
}

type DemoIndustryMarkProps = {
  industryKey: string
  theme: DemoPageData["theme"]
}

const previewPresets: Record<string, PreviewPreset> = {
  landscaping: {
    key: "landscaping",
    heroLabel: "Outdoor brand direction",
    surfaceLabel: "Crew-ready homepage",
    supportLabel: "Project mood",
    tagline: "Structured to sell premium curb appeal, recurring care, and confident local trust.",
    keywords: ["Outdoor living", "Seasonal installs", "Local crews"],
  },
  plumbing: {
    key: "plumbing",
    heroLabel: "Urgent service flow",
    surfaceLabel: "Fast-call homepage",
    supportLabel: "Conversion intent",
    tagline: "Designed to feel dependable in seconds when someone needs service right now.",
    keywords: ["Same-day repairs", "Leak response", "Licensed team"],
  },
  hvac: {
    key: "hvac",
    heroLabel: "Comfort-first layout",
    surfaceLabel: "Seasonal service demo",
    supportLabel: "Brand direction",
    tagline: "Blends cooling confidence, maintenance upsell, and year-round booking clarity.",
    keywords: ["Cooling and heat", "Maintenance plans", "Year-round care"],
  },
  electrician: {
    key: "electrician",
    heroLabel: "Safety-forward presentation",
    surfaceLabel: "Service trust preview",
    supportLabel: "Lead positioning",
    tagline: "Tailored to communicate safety, expertise, and fast local response without clutter.",
    keywords: ["Panel upgrades", "Safety checks", "Trusted installs"],
  },
  roofing: {
    key: "roofing",
    heroLabel: "Estimate-ready showcase",
    surfaceLabel: "Project proof demo",
    supportLabel: "Authority cue",
    tagline: "Built to make inspections, storm claims, and craftsmanship feel premium and credible.",
    keywords: ["Storm repair", "Project proof", "Inspection flow"],
  },
  "cleaning-services": {
    key: "cleaning-services",
    heroLabel: "Recurring-service polish",
    surfaceLabel: "Quote-ready homepage",
    supportLabel: "Retention angle",
    tagline: "Leans into freshness, routine scheduling, and a softer residential-friendly brand voice.",
    keywords: ["Recurring plans", "Fresh spaces", "Easy quotes"],
  },
  "pressure-washing": {
    key: "pressure-washing",
    heroLabel: "Transformation-focused preview",
    surfaceLabel: "Satisfying visual demo",
    supportLabel: "Neighborhood appeal",
    tagline: "Makes before-and-after results feel exciting while keeping the booking path obvious.",
    keywords: ["Curb appeal", "Driveways", "Visible results"],
  },
  "auto-detailing": {
    key: "auto-detailing",
    heroLabel: "Premium finish concept",
    surfaceLabel: "Showroom-style mockup",
    supportLabel: "Package direction",
    tagline: "A glossier demo direction that sells upgrades, protective services, and polished presentation.",
    keywords: ["Ceramic coats", "Interior reset", "Premium add-ons"],
  },
  restaurant: {
    key: "restaurant",
    heroLabel: "Atmosphere-led storytelling",
    surfaceLabel: "Reservation-ready mockup",
    supportLabel: "Dining mood",
    tagline: "Structured to make the restaurant feel memorable before the first reservation happens.",
    keywords: ["Chef-led menu", "Reservations", "Private dining"],
  },
  cafe: {
    key: "cafe",
    heroLabel: "Neighborhood brand feel",
    surfaceLabel: "Coffeehouse preview",
    supportLabel: "Visit driver",
    tagline: "Built to sell vibe, signature drinks, and repeat visits in a calmer, cozier tone.",
    keywords: ["Signature drinks", "Seasonal menu", "Daily regulars"],
  },
  barbershop: {
    key: "barbershop",
    heroLabel: "Sharp identity system",
    surfaceLabel: "Appointment-led concept",
    supportLabel: "Style signal",
    tagline: "Pushes stronger brand identity, service clarity, and a more intentional appointment flow.",
    keywords: ["Skin fades", "Beard shaping", "Book ahead"],
  },
  salon: {
    key: "salon",
    heroLabel: "Soft premium presentation",
    surfaceLabel: "Beauty-service preview",
    supportLabel: "Brand tone",
    tagline: "Refined to feel elevated, polished, and editorial without losing service clarity.",
    keywords: ["Color sessions", "Luxury styling", "Beauty consults"],
  },
  "fitness-personal-training": {
    key: "fitness-personal-training",
    heroLabel: "Transformation-first demo",
    surfaceLabel: "Coach-brand homepage",
    supportLabel: "Offer framing",
    tagline: "Designed to sell programs, confidence, and proof with a stronger personal-brand edge.",
    keywords: ["Program offers", "Member wins", "Coach authority"],
  },
  "real-estate": {
    key: "real-estate",
    heroLabel: "Listing-led credibility",
    surfaceLabel: "Agent-style preview",
    supportLabel: "Lead intent",
    tagline: "A cleaner, higher-trust structure for listings, neighborhood expertise, and inquiry capture.",
    keywords: ["Featured listings", "Neighborhood trust", "Buyer leads"],
  },
  photography: {
    key: "photography",
    heroLabel: "Portfolio-forward art direction",
    surfaceLabel: "Visual brand mockup",
    supportLabel: "Booking mood",
    tagline: "Balances imagery, polish, and commercial clarity so the portfolio still feels easy to book.",
    keywords: ["Signature work", "Session types", "Editorial polish"],
  },
  "dental-medical": {
    key: "dental-medical",
    heroLabel: "Reassuring clinical clarity",
    surfaceLabel: "Practice-ready homepage",
    supportLabel: "Patient trust",
    tagline: "Crafted to feel calm, professional, and appointment-ready without reading as cold or generic.",
    keywords: ["Patient care", "Clear pathways", "Practice trust"],
  },
  "law-firm": {
    key: "law-firm",
    heroLabel: "Authority-focused messaging",
    surfaceLabel: "Consultation-ready preview",
    supportLabel: "Firm posture",
    tagline: "Structured to feel credible, clear, and composed for higher-stakes client inquiries.",
    keywords: ["Practice areas", "Consult requests", "Firm authority"],
  },
  construction: {
    key: "construction",
    heroLabel: "Capability-led structure",
    surfaceLabel: "Operations-forward demo",
    supportLabel: "Builder signal",
    tagline: "Built to showcase crews, project scale, and the reliability expected from serious contractors.",
    keywords: ["Project scale", "Bid confidence", "Crew capability"],
  },
  "moving-company": {
    key: "moving-company",
    heroLabel: "Fast-booking service flow",
    surfaceLabel: "Route-ready homepage",
    supportLabel: "Operations angle",
    tagline: "Designed to simplify estimates, service areas, and scheduling for customers in motion.",
    keywords: ["Quick estimates", "Service areas", "Stress-free moves"],
  },
  "home-remodeling": {
    key: "home-remodeling",
    heroLabel: "Craftsmanship-led showcase",
    surfaceLabel: "Renovation brand preview",
    supportLabel: "Project feel",
    tagline: "A richer renovation direction for premium finishes, project storytelling, and homeowner trust.",
    keywords: ["Before and after", "Custom finishes", "Design-build"],
  },
}

const defaultPreset: PreviewPreset = {
  key: "default",
  heroLabel: "Tailored demo preview",
  surfaceLabel: "Custom homepage concept",
  supportLabel: "Brand direction",
  tagline: "A more intentional mockup that shows how the service, tone, and conversion path can work together.",
  keywords: ["Branded layout", "Mobile-ready", "Lead-focused"],
}

function normalizeIndustryKey(industryLabel: string) {
  return industryLabel
    .toLowerCase()
    .replace(/\bdemo\b/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function getPreviewPreset(industryLabel: string) {
  return previewPresets[normalizeIndustryKey(industryLabel)] ?? defaultPreset
}

function trimCopy(copy: string, maxLength: number) {
  if (copy.length <= maxLength) {
    return copy
  }

  return `${copy.slice(0, maxLength - 1).trimEnd()}...`
}

function getFooterLabels(
  preset: PreviewPreset,
  services: DemoPageData["services"],
  compact: boolean,
) {
  return [
    ...preset.keywords.slice(0, compact ? 2 : 3),
    ...services.slice(0, compact ? 2 : 3).map((service) => service.title),
  ].slice(0, compact ? 4 : 5)
}

function buildOuterStyle(theme: DemoPageData["theme"]): CSSProperties {
  return {
    background: `
      radial-gradient(circle at top right, ${theme.surfaceTint}, transparent 30%),
      radial-gradient(circle at bottom left, ${theme.accentSoft}, transparent 34%),
      linear-gradient(180deg, rgba(255,255,255,0.97), rgba(247,250,255,0.88))
    `,
  }
}

function buildHeroStyle(theme: DemoPageData["theme"]): CSSProperties {
  return {
    background: `
      radial-gradient(circle at 78% 18%, ${theme.surfaceTint}, transparent 24%),
      radial-gradient(circle at 22% 86%, ${theme.accentSoft}, transparent 30%),
      linear-gradient(135deg, rgba(255,255,255,0.94), rgba(255,255,255,0.74))
    `,
  }
}

function buildSupportStyle(theme: DemoPageData["theme"]): CSSProperties {
  return {
    background: `
      linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.76)),
      linear-gradient(135deg, ${theme.accentSoft}, rgba(255,255,255,0))
    `,
  }
}

function buildGradientPillStyle(theme: DemoPageData["theme"]): CSSProperties {
  return {
    backgroundImage: `linear-gradient(to right, ${theme.gradientFrom}, ${theme.gradientVia}, ${theme.gradientTo})`,
  }
}

function DemoIndustryMark({ industryKey, theme }: DemoIndustryMarkProps) {
  const primary = theme.gradientFrom
  const secondary = theme.gradientTo
  const accent = theme.accentStrong
  const soft = theme.accentSoft
  const commonProps: SVGProps<SVGSVGElement> = {
    viewBox: "0 0 48 48",
    fill: "none",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    className: "h-full w-full",
  }

  switch (industryKey) {
    case "landscaping":
      return (
        <svg {...commonProps}>
          <path d="M10 36C18 28 25 20 31 10C35 15 37 21 37 27C37 34 31 39 24 39C18 39 13 37 10 36Z" fill={soft} stroke={primary} strokeWidth="2.4" />
          <path d="M23 36C23 26 24 18 29 12" stroke={secondary} strokeWidth="2.6" />
          <path d="M10 36H38" stroke={accent} strokeWidth="2.6" />
        </svg>
      )
    case "plumbing":
      return (
        <svg {...commonProps}>
          <path d="M13 12H27V21C27 24.9 30.1 28 34 28H35" stroke={primary} strokeWidth="4" />
          <path d="M20 12V7H31V12" stroke={secondary} strokeWidth="3.2" />
          <path d="M34 28V36" stroke={secondary} strokeWidth="4" />
          <circle cx="34" cy="39" r="2.5" fill={accent} />
        </svg>
      )
    case "hvac":
      return (
        <svg {...commonProps}>
          <circle cx="24" cy="24" r="5" fill={soft} stroke={primary} strokeWidth="2.4" />
          <path d="M24 10V18" stroke={primary} strokeWidth="3" />
          <path d="M24 30V38" stroke={secondary} strokeWidth="3" />
          <path d="M10 24H18" stroke={secondary} strokeWidth="3" />
          <path d="M30 24H38" stroke={primary} strokeWidth="3" />
          <path d="M15.5 15.5L20.5 20.5" stroke={accent} strokeWidth="2.8" />
          <path d="M32.5 32.5L27.5 27.5" stroke={accent} strokeWidth="2.8" />
          <path d="M32.5 15.5L27.5 20.5" stroke={accent} strokeWidth="2.8" />
          <path d="M15.5 32.5L20.5 27.5" stroke={accent} strokeWidth="2.8" />
        </svg>
      )
    case "electrician":
      return (
        <svg {...commonProps}>
          <path d="M26 6L14 25H23L20 42L34 21H25L26 6Z" fill={soft} stroke={primary} strokeWidth="2.6" />
          <path d="M12 13L9 16" stroke={secondary} strokeWidth="2.8" />
          <path d="M36 13L39 16" stroke={secondary} strokeWidth="2.8" />
          <path d="M11 26H7" stroke={secondary} strokeWidth="2.8" />
          <path d="M41 26H37" stroke={secondary} strokeWidth="2.8" />
        </svg>
      )
    case "roofing":
      return (
        <svg {...commonProps}>
          <path d="M8 24L24 10L40 24" stroke={primary} strokeWidth="3.4" />
          <path d="M13 22V37H35V22" stroke={secondary} strokeWidth="3" />
          <path d="M18 18H30L33 22H15L18 18Z" fill={soft} stroke={accent} strokeWidth="2.2" />
          <path d="M22 37V28H26V37" stroke={accent} strokeWidth="2.6" />
        </svg>
      )
    case "cleaning-services":
      return (
        <svg {...commonProps}>
          <path d="M24 8L26.9 17.1L36 20L26.9 22.9L24 32L21.1 22.9L12 20L21.1 17.1L24 8Z" fill={soft} stroke={primary} strokeWidth="2.4" />
          <circle cx="35.5" cy="12.5" r="3.5" fill={soft} stroke={secondary} strokeWidth="2" />
          <circle cx="13.5" cy="33.5" r="4.5" fill={soft} stroke={accent} strokeWidth="2" />
        </svg>
      )
    case "pressure-washing":
      return (
        <svg {...commonProps}>
          <path d="M10 31L22 19" stroke={primary} strokeWidth="3.2" />
          <path d="M22 19L30 19" stroke={secondary} strokeWidth="3.2" />
          <path d="M30 19L37 12" stroke={secondary} strokeWidth="3.2" />
          <path d="M28 24C31 24 34 22 37 18" stroke={accent} strokeWidth="2.8" />
          <circle cx="38.5" cy="11" r="2" fill={primary} />
          <circle cx="41" cy="16" r="1.7" fill={secondary} />
          <circle cx="43" cy="21" r="1.4" fill={accent} />
          <rect x="7.5" y="29" width="9" height="6.5" rx="2.5" fill={soft} stroke={primary} strokeWidth="2.2" />
        </svg>
      )
    case "auto-detailing":
      return (
        <svg {...commonProps}>
          <path d="M11 29C12.8 23.8 15.8 19 21 19H30C33.7 19 36.4 21 38 24.5L40 29H11Z" fill={soft} stroke={primary} strokeWidth="2.4" />
          <path d="M15 29V33.5C15 35.4 16.6 37 18.5 37H19.5C21.4 37 23 35.4 23 33.5V29" stroke={secondary} strokeWidth="2.6" />
          <path d="M28 29V33.5C28 35.4 29.6 37 31.5 37H32.5C34.4 37 36 35.4 36 33.5V29" stroke={secondary} strokeWidth="2.6" />
          <path d="M34 10L35.4 14.6L40 16L35.4 17.4L34 22L32.6 17.4L28 16L32.6 14.6L34 10Z" fill={soft} stroke={accent} strokeWidth="2" />
        </svg>
      )
    case "restaurant":
      return (
        <svg {...commonProps}>
          <path d="M12 28H36" stroke={accent} strokeWidth="2.8" />
          <path d="M16 28C16 20.3 19.6 15 24 12C28.4 15 32 20.3 32 28" fill={soft} stroke={primary} strokeWidth="2.6" />
          <path d="M20 32H28" stroke={secondary} strokeWidth="2.8" />
          <path d="M24 32V39" stroke={secondary} strokeWidth="2.8" />
        </svg>
      )
    case "cafe":
      return (
        <svg {...commonProps}>
          <path d="M14 20H30V28C30 32.4 26.4 36 22 36C17.6 36 14 32.4 14 28V20Z" fill={soft} stroke={primary} strokeWidth="2.6" />
          <path d="M30 23H34C36.2 23 38 24.8 38 27C38 29.2 36.2 31 34 31H30" stroke={secondary} strokeWidth="2.6" />
          <path d="M18 11C18 13 16.5 13.8 16.5 16" stroke={accent} strokeWidth="2.2" />
          <path d="M24 9C24 12 21.8 12.8 21.8 16" stroke={accent} strokeWidth="2.2" />
          <path d="M30 11C30 13 28.5 13.8 28.5 16" stroke={accent} strokeWidth="2.2" />
        </svg>
      )
    case "barbershop":
      return (
        <svg {...commonProps}>
          <path d="M16 10V33C16 37.4 19.6 41 24 41C28.4 41 32 37.4 32 33V10" stroke={primary} strokeWidth="3" />
          <path d="M16 17H32" stroke={secondary} strokeWidth="2.6" />
          <path d="M16 23H32" stroke={accent} strokeWidth="2.6" />
          <path d="M16 29H32" stroke={secondary} strokeWidth="2.6" />
          <path d="M20 7L24 11L28 7" stroke={primary} strokeWidth="2.6" />
        </svg>
      )
    case "salon":
      return (
        <svg {...commonProps}>
          <path d="M24 9C19.6 9 16 12.6 16 17C16 21.4 19.6 25 24 25C28.4 25 32 21.4 32 17C32 12.6 28.4 9 24 9Z" fill={soft} stroke={primary} strokeWidth="2.4" />
          <path d="M24 25V39" stroke={secondary} strokeWidth="2.8" />
          <path d="M17 18C15 21 13 24 13 28C13 33 17 36.5 24 39" stroke={accent} strokeWidth="2.4" />
          <path d="M31 18C33 21 35 24 35 28C35 33 31 36.5 24 39" stroke={accent} strokeWidth="2.4" />
        </svg>
      )
    case "fitness-personal-training":
      return (
        <svg {...commonProps}>
          <rect x="8" y="19" width="6" height="10" rx="2.4" fill={soft} stroke={primary} strokeWidth="2.2" />
          <rect x="34" y="19" width="6" height="10" rx="2.4" fill={soft} stroke={primary} strokeWidth="2.2" />
          <rect x="14" y="21.5" width="20" height="5" rx="2.4" fill={soft} stroke={secondary} strokeWidth="2.2" />
          <path d="M16 36C18.5 32.8 20.8 31 24 31C27.2 31 29.5 32.8 32 36" stroke={accent} strokeWidth="2.6" />
          <path d="M20 12L24 16L29 10" stroke={primary} strokeWidth="2.8" />
        </svg>
      )
    case "real-estate":
      return (
        <svg {...commonProps}>
          <path d="M10 23L24 11L38 23" stroke={primary} strokeWidth="3" />
          <path d="M14 21V37H34V21" stroke={secondary} strokeWidth="2.8" />
          <path d="M24 24C21.8 24 20 25.8 20 28C20 30.2 21.8 32 24 32C26.2 32 28 30.2 28 28C28 25.8 26.2 24 24 24Z" fill={soft} stroke={accent} strokeWidth="2" />
          <path d="M24 32V36" stroke={accent} strokeWidth="2.4" />
        </svg>
      )
    case "photography":
      return (
        <svg {...commonProps}>
          <rect x="9" y="14" width="30" height="21" rx="6" fill={soft} stroke={primary} strokeWidth="2.4" />
          <path d="M16 14L19 10H29L32 14" stroke={secondary} strokeWidth="2.4" />
          <circle cx="24" cy="24.5" r="6.5" stroke={accent} strokeWidth="2.4" />
          <circle cx="24" cy="24.5" r="3.2" fill={soft} stroke={secondary} strokeWidth="1.8" />
        </svg>
      )
    case "dental-medical":
      return (
        <svg {...commonProps}>
          <path d="M18 10C14 10 11 13.5 11 18C11 24 14 38 20 38C22.4 38 22 32 24 32C26 32 25.6 38 28 38C34 38 37 24 37 18C37 13.5 34 10 30 10C27.5 10 26.5 12 24 12C21.5 12 20.5 10 18 10Z" fill={soft} stroke={primary} strokeWidth="2.2" />
          <path d="M24 16V25" stroke={secondary} strokeWidth="2.6" />
          <path d="M19.5 20.5H28.5" stroke={secondary} strokeWidth="2.6" />
        </svg>
      )
    case "law-firm":
      return (
        <svg {...commonProps}>
          <path d="M24 9V37" stroke={primary} strokeWidth="2.8" />
          <path d="M15 14H33" stroke={secondary} strokeWidth="2.6" />
          <path d="M15 14L10.5 23H19.5L15 14Z" fill={soft} stroke={accent} strokeWidth="2" />
          <path d="M33 14L28.5 23H37.5L33 14Z" fill={soft} stroke={accent} strokeWidth="2" />
          <path d="M14 37H34" stroke={secondary} strokeWidth="2.8" />
        </svg>
      )
    case "construction":
      return (
        <svg {...commonProps}>
          <path d="M10 36H38" stroke={accent} strokeWidth="2.8" />
          <path d="M16 36V18H27L32 23V36" stroke={primary} strokeWidth="2.8" />
          <path d="M27 18V23H32" stroke={secondary} strokeWidth="2.4" />
          <path d="M12 18H22" stroke={secondary} strokeWidth="2.4" />
          <path d="M17 9V18" stroke={primary} strokeWidth="2.6" />
        </svg>
      )
    case "moving-company":
      return (
        <svg {...commonProps}>
          <path d="M13 15L24 10L35 15V31L24 36L13 31V15Z" fill={soft} stroke={primary} strokeWidth="2.4" />
          <path d="M13 15L24 21L35 15" stroke={secondary} strokeWidth="2.4" />
          <path d="M24 21V36" stroke={secondary} strokeWidth="2.4" />
          <path d="M37 24H42" stroke={accent} strokeWidth="2.6" />
          <path d="M39 21L42 24L39 27" stroke={accent} strokeWidth="2.6" />
        </svg>
      )
    case "home-remodeling":
      return (
        <svg {...commonProps}>
          <path d="M9 24L24 11L39 24" stroke={primary} strokeWidth="3" />
          <path d="M14 22V37H34V22" stroke={secondary} strokeWidth="2.8" />
          <path d="M29 13L33.5 17.5" stroke={accent} strokeWidth="2.8" />
          <path d="M33.5 17.5L28 23" stroke={accent} strokeWidth="2.8" />
          <path d="M16 31H26" stroke={accent} strokeWidth="2.6" />
        </svg>
      )
    default:
      return (
        <svg {...commonProps}>
          <circle cx="24" cy="24" r="14" fill={soft} stroke={primary} strokeWidth="2.4" />
          <path d="M24 12V36" stroke={secondary} strokeWidth="2.6" />
          <path d="M12 24H36" stroke={accent} strokeWidth="2.6" />
        </svg>
      )
  }
}

export default function DemoPreview({
  businessName,
  industryLabel,
  location,
  heroTitle,
  heroDescription,
  primaryCtaText,
  secondaryCtaText,
  services,
  stats,
  theme,
  compact = false,
  className = "",
}: DemoPreviewProps) {
  const preset = getPreviewPreset(industryLabel)
  const serviceCards = services.slice(0, compact ? 2 : 3)
  const statCards = stats.slice(0, 2)
  const heroTitleText = trimCopy(heroTitle, compact ? 64 : 86)
  const heroDescriptionText = trimCopy(heroDescription, compact ? 110 : 154)
  const footerLabels = getFooterLabels(preset, services, compact)
  const cleanIndustryLabel = industryLabel.replace(/\s*Demo$/, "")
  const outerStyle = buildOuterStyle(theme)
  const heroStyle = buildHeroStyle(theme)
  const supportStyle = buildSupportStyle(theme)
  const gradientPillStyle = buildGradientPillStyle(theme)

  return (
    <div
      className={`relative overflow-hidden rounded-[1.9rem] border border-white/75 shadow-[0_22px_70px_rgba(15,23,42,0.12)] ${compact ? "p-4" : "p-5 sm:p-6"} ${className}`.trim()}
      style={outerStyle}
    >
      <div
        className="absolute -left-12 bottom-0 h-28 w-28 rounded-full blur-3xl"
        style={{ backgroundColor: theme.accentSoft }}
      />
      <div
        className="absolute -right-10 top-0 h-32 w-32 rounded-full blur-3xl"
        style={{ backgroundColor: theme.surfaceTint }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.15rem] border border-white/75 bg-white/84 shadow-[0_12px_28px_rgba(15,23,42,0.10)] sm:h-14 sm:w-14">
              <div className="h-7 w-7 sm:h-8 sm:w-8">
                <DemoIndustryMark industryKey={preset.key} theme={theme} />
              </div>
            </div>

            <div className="min-w-0">
              <p className="truncate text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-slate-500">
                {preset.heroLabel}
              </p>
              <p className="truncate text-base font-extrabold tracking-[-0.03em] text-slate-950 sm:text-lg">
                {businessName}
              </p>
            </div>
          </div>

          <div className="rounded-full border border-white/80 bg-white/80 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {cleanIndustryLabel}
          </div>
        </div>

        <div
          className={`mt-5 grid gap-4 ${compact ? "" : "sm:grid-cols-[1.08fr_0.92fr] sm:items-start"}`}
        >
          <div
            className="relative overflow-hidden rounded-[1.55rem] border border-white/80 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.09)]"
            style={heroStyle}
          >
            <div
              className="absolute -bottom-8 -right-8 h-28 w-28 opacity-[0.12]"
              aria-hidden="true"
            >
              <DemoIndustryMark industryKey={preset.key} theme={theme} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between gap-3 rounded-full border border-white/80 bg-white/78 px-3 py-2 backdrop-blur-sm">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-100" />
                </div>

                <span className="truncate text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  {preset.surfaceLabel}
                </span>

                <span className="hidden rounded-full border border-slate-200/70 bg-white/88 px-2 py-1 text-[0.64rem] font-semibold uppercase tracking-[0.16em] text-slate-500 sm:inline-flex">
                  {location ?? "Arizona"}
                </span>
              </div>

              <div className="mt-5">
                <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-slate-500">
                  Demo homepage
                </p>
                <h3 className="mt-3 text-xl font-extrabold leading-tight tracking-[-0.04em] text-slate-950 sm:text-2xl">
                  {heroTitleText}
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">
                  {heroDescriptionText}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span
                  className="inline-flex rounded-full px-4 py-2 text-sm font-extrabold text-white shadow-[0_14px_28px_rgba(15,23,42,0.14)]"
                  style={gradientPillStyle}
                >
                  {primaryCtaText}
                </span>
                <span className="inline-flex rounded-full border border-slate-200/80 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-600">
                  {secondaryCtaText}
                </span>
              </div>

              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {footerLabels.slice(0, 2).map((label) => (
                  <div
                    key={label}
                    className="rounded-[1rem] border border-white/80 bg-white/78 px-3 py-3 text-sm font-semibold text-slate-600 shadow-[0_10px_22px_rgba(15,23,42,0.06)]"
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {serviceCards.map((service) => (
              <div
                key={service.title}
                className="rounded-[1.35rem] border border-white/75 bg-white/82 p-4 shadow-[0_14px_30px_rgba(15,23,42,0.07)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-slate-500">
                    Service focus
                  </p>
                  <span
                    className="h-2.5 w-16 rounded-full"
                    style={gradientPillStyle}
                  />
                </div>
                <h4 className="mt-3 text-lg font-extrabold tracking-[-0.03em] text-slate-950">
                  {service.title}
                </h4>
                {!compact && (
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {trimCopy(service.description, 84)}
                  </p>
                )}
              </div>
            ))}

            <div className="grid gap-3 sm:grid-cols-2">
              {statCards.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[1.25rem] border border-white/75 bg-white/82 px-4 py-4 shadow-[0_14px_30px_rgba(15,23,42,0.07)]"
                >
                  <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-slate-500">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-xl font-extrabold tracking-[-0.03em] text-slate-950">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div
              className="rounded-[1.35rem] border border-white/75 p-4 shadow-[0_14px_30px_rgba(15,23,42,0.07)]"
              style={supportStyle}
            >
              <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.2em] text-slate-500">
                {preset.supportLabel}
              </p>
              <p className="mt-3 text-base font-extrabold tracking-[-0.03em] text-slate-950">
                {preset.tagline}
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {location
                  ? `${location} concept with more branded detail, clearer service emphasis, and a stronger path into ${primaryCtaText.toLowerCase()}.`
                  : `A more branded demo direction with clearer service emphasis and a stronger path into ${primaryCtaText.toLowerCase()}.`}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {footerLabels.map((label) => (
            <span
              key={`footer-${label}`}
              className="rounded-full border border-white/75 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
