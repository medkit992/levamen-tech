export type StructuredData = Record<string, unknown>

export const siteConfig = {
  name: "Levamen Tech",
  url: "https://levamentech.com",
  email: "admin@levamentech.com",
  phoneDisplay: "(864) 510-8711",
  phoneE164: "+18645108711",
  defaultTitle: "Custom Websites for Service Businesses",
  defaultDescription:
    "Levamen Tech designs and builds custom websites for service businesses, with niche demos, responsive builds, clear pricing, and conversion-focused structure.",
  defaultImagePath: "/og-default.svg",
} as const

export function buildPageTitle(title: string) {
  return title.includes(siteConfig.name) ? title : `${title} | ${siteConfig.name}`
}

export function toAbsoluteUrl(pathOrUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl
  }

  const normalizedPath = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`
  return new URL(normalizedPath, siteConfig.url).toString()
}

export function buildWebsiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.defaultDescription,
    publisher: {
      "@id": `${siteConfig.url}/#organization`,
    },
  } satisfies StructuredData
}

export function buildOrganizationStructuredData(
  description: string = siteConfig.defaultDescription
) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: toAbsoluteUrl(siteConfig.defaultImagePath),
    image: toAbsoluteUrl(siteConfig.defaultImagePath),
    email: siteConfig.email,
    telephone: siteConfig.phoneE164,
    description,
    areaServed: "United States",
    serviceType: [
      "Website design",
      "Website development",
      "Small business websites",
      "Service business websites",
      "SEO setup",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "sales",
        email: siteConfig.email,
        telephone: siteConfig.phoneE164,
        availableLanguage: "English",
      },
    ],
  } satisfies StructuredData
}

export function buildWebPageStructuredData({
  path,
  title,
  description,
  pageType = "WebPage",
}: {
  path: string
  title: string
  description: string
  pageType?: string
}) {
  const url = toAbsoluteUrl(path)

  return {
    "@context": "https://schema.org",
    "@type": pageType,
    "@id": `${url}#webpage`,
    url,
    name: buildPageTitle(title),
    description,
    isPartOf: {
      "@id": `${siteConfig.url}/#website`,
    },
    about: {
      "@id": `${siteConfig.url}/#organization`,
    },
  } satisfies StructuredData
}

export function buildBreadcrumbStructuredData(
  items: Array<{
    name: string
    path: string
  }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path),
    })),
  } satisfies StructuredData
}

export function buildFaqStructuredData(
  faqs: Array<{
    question: string
    answer: string
  }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  } satisfies StructuredData
}
