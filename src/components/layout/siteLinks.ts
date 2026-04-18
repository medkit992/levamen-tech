export type SiteLink = {
  label: string
  to: string
  description?: string
}

export const primaryNavItems: SiteLink[] = [
  {
    label: "Home",
    to: "/",
    description: "Overview, positioning, and featured sections.",
  },
  {
    label: "Demos",
    to: "/demos",
    description: "Explore niche-specific site concepts and layouts.",
  },
  {
    label: "Pricing",
    to: "/pricing",
    description: "Build a package and send over project details.",
  },
  {
    label: "Reviews",
    to: "/reviews",
    description: "Read client feedback and leave a review.",
  },
  {
    label: "Contact",
    to: "/contact",
    description: "Reach out directly to start a project.",
  },
]

export const legalNavItems: SiteLink[] = [
  {
    label: "Terms of Service",
    to: "/terms",
    description: "Service terms for Levamen Tech website visitors and clients.",
  },
  {
    label: "Privacy Policy",
    to: "/privacy",
    description: "How contact, inquiry, review, and payment data is handled.",
  },
]

export const footerContactLinks = [
  {
    label: "Email",
    value: "admin@levamentech.com",
    href: "mailto:admin@levamentech.com",
  },
  {
    label: "Phone",
    value: "(864) 510-8711",
    href: "tel:+18645108711",
  },
  {
    label: "Availability",
    value: "Remote-first, Monday through Friday",
  },
]

export const footerHighlights = [
  "Responsive design from the first draft",
  "Clear structure for small-business conversions",
  "Custom visuals instead of generic templates",
]

export const independentStudioNote =
  "Levamen Tech is currently an independent studio operated by an individual founder, not a registered LLC."
