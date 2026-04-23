import { mkdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

const site = {
  name: "Levamen Tech",
  url: "https://levamentech.com",
  email: "admin@levamentech.com",
  phone: "+18645108711",
  defaultImagePath: "/og-default.svg",
}

const planOffers = [
  {
    name: "Starter Website Package",
    price: 149,
    monthlyPrice: 39,
    description:
      "A clean one-page website package for businesses that need a professional online presence.",
  },
  {
    name: "Growth Website Package",
    price: 299,
    monthlyPrice: 79,
    description:
      "A multi-page custom website package for most local service businesses.",
  },
  {
    name: "Premium Website Package",
    price: 499,
    monthlyPrice: 149,
    description:
      "A more advanced custom website package for businesses that want premium polish and flexibility.",
  },
]

const demoCatalog = [
  {
    slug: "landscaping",
    title: "Landscaping",
    description:
      "Outdoor-service branding with cleaner hierarchy, premium trust cues, and before-and-after energy.",
  },
  {
    slug: "plumbing",
    title: "Plumbing",
    description:
      "A direct, trust-first direction built for urgent calls, fast scanning, and local credibility.",
  },
  {
    slug: "hvac",
    title: "HVAC",
    description:
      "Reliable heating-and-cooling presentation with clearer service pathways and strong seasonal confidence.",
  },
  {
    slug: "electrician",
    title: "Electrician",
    description:
      "A sharper service layout centered on safety, expertise, and booking intent for residential leads.",
  },
  {
    slug: "roofing",
    title: "Roofing",
    description:
      "A bold, estimate-ready demo where project proof, authority, and premium presentation stand out.",
  },
  {
    slug: "cleaning-services",
    title: "Cleaning Services",
    description:
      "A polished recurring-service concept with approachable branding and easy quote-request flow.",
  },
  {
    slug: "pressure-washing",
    title: "Pressure Washing",
    description:
      "A visually satisfying direction tailored for transformations, curb appeal, and strong neighborhood promotions.",
  },
  {
    slug: "auto-detailing",
    title: "Auto Detailing",
    description:
      "Glossy, package-driven positioning that makes results, upgrades, and premium care feel intentional.",
  },
  {
    slug: "restaurants",
    title: "Restaurants",
    description:
      "A mood-forward dining concept built around featured dishes, atmosphere, and reservation momentum.",
  },
  {
    slug: "cafes-coffee-shops",
    title: "Cafes / Coffee Shops",
    description:
      "A warm neighborhood-brand direction with drink highlights, personality, and repeat-visit energy.",
  },
  {
    slug: "barbershops",
    title: "Barbershops",
    description:
      "A crisp, stylish demo built around strong identity, service menus, and appointment-driven design.",
  },
  {
    slug: "salons",
    title: "Salons",
    description:
      "A softer premium look for beauty brands that want elegance, polish, and clearer service storytelling.",
  },
  {
    slug: "fitness-personal-training",
    title: "Fitness / Personal Training",
    description:
      "An energetic personal-brand layout focused on programs, proof, testimonials, and transformation goals.",
  },
  {
    slug: "real-estate",
    title: "Real Estate",
    description:
      "A polished agent-style demo built to showcase listings, trust signals, and lead capture with intention.",
  },
  {
    slug: "photography",
    title: "Photography",
    description:
      "A portfolio-first concept that still feels commercial, premium, and clear about the booking path.",
  },
  {
    slug: "dental-medical",
    title: "Dental / Medical",
    description:
      "A reassuring, clean demo for practices that need professionalism, clarity, and approachable trust.",
  },
  {
    slug: "law-firm",
    title: "Law Firm",
    description:
      "A more authoritative direction that balances credibility, clarity, and consultation-focused structure.",
  },
  {
    slug: "construction",
    title: "Construction",
    description:
      "A business-forward buildout for showcasing capabilities, larger projects, and operational reliability.",
  },
  {
    slug: "moving-company",
    title: "Moving Company",
    description:
      "A direct service concept that highlights pricing clarity, service areas, and fast customer outreach.",
  },
  {
    slug: "home-remodeling",
    title: "Home Remodeling",
    description:
      "A premium renovation demo with stronger craftsmanship cues and more purposeful before-and-after storytelling.",
  },
]

const corePages = [
  {
    path: "/",
    title: "Custom Websites for Service Businesses | Levamen Tech",
    description:
      "Levamen Tech designs and builds custom websites for service businesses, with niche demos, responsive builds, clear pricing, and conversion-focused structure.",
    image: "/og-home.svg",
    keywords: [
      "custom websites for service businesses",
      "small business web design",
      "service business website development",
      "contractor website design",
    ],
    bodyHeading: "Custom websites for service businesses",
    bodyCopy:
      "Levamen Tech designs and builds modern websites for service businesses that want clean branding, stronger trust cues, and a smoother path to conversion.",
    bullets: [
      "Responsive builds from the first draft",
      "Niche demos for local service industries",
      "Clear pricing and direct contact options",
    ],
    links: [
      { href: "/demos", label: "Browse demos" },
      { href: "/pricing", label: "See pricing" },
      { href: "/contact", label: "Start a project" },
    ],
    structuredData: [
      buildWebsiteStructuredData(
        "Levamen Tech designs and builds custom websites for service businesses."
      ),
      buildOrganizationStructuredData(
        "Levamen Tech designs and builds custom websites for service businesses."
      ),
      buildWebPageStructuredData({
        path: "/",
        title: "Custom Websites for Service Businesses | Levamen Tech",
        description:
          "Levamen Tech designs and builds custom websites for service businesses, with niche demos, responsive builds, clear pricing, and conversion-focused structure.",
      }),
    ],
    changefreq: "weekly",
    priority: "1.0",
  },
  {
    path: "/demos",
    title: "Website Demos for Service Businesses | Levamen Tech",
    description:
      "Browse niche website demos for landscapers, plumbers, HVAC companies, electricians, restaurants, salons, law firms, and other service businesses.",
    image: "/og-demos.svg",
    keywords: [
      "website demos for service businesses",
      "small business website examples",
      "service business web design inspiration",
      "contractor website demos",
    ],
    bodyHeading: "Website demos for service businesses",
    bodyCopy:
      "Browse niche-specific website directions to see how Levamen Tech approaches structure, tone, and conversion strategy for different service industries.",
    bullets: [
      "Landscaping, plumbing, HVAC, roofing, and cleaning demos",
      "Hospitality, salon, barbershop, and fitness demos",
      "Professional service demos for law, dental, and real estate",
    ],
    links: [
      { href: "/contact", label: "Talk about your project" },
      { href: "/pricing", label: "Compare packages" },
      { href: "/", label: "Back home" },
    ],
    structuredData: [
      buildWebPageStructuredData({
        path: "/demos",
        title: "Website Demos for Service Businesses | Levamen Tech",
        description:
          "Browse niche website demos for landscapers, plumbers, HVAC companies, electricians, restaurants, salons, law firms, and other service businesses.",
        pageType: "CollectionPage",
      }),
      buildBreadcrumbStructuredData([
        { name: "Home", path: "/" },
        { name: "Demos", path: "/demos" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Levamen Tech demo library",
        itemListElement: demoCatalog.map((demo, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: demo.title,
          url: absoluteUrl(`/demos/${demo.slug}`),
          description: demo.description,
        })),
      },
    ],
    changefreq: "weekly",
    priority: "0.9",
  },
  {
    path: "/pricing",
    title: "Website Pricing and Packages for Service Businesses | Levamen Tech",
    description:
      "Compare Levamen Tech website packages, customize your plan with add-ons, and send a project request for review before any payment is collected.",
    image: "/og-pricing.svg",
    keywords: [
      "website pricing for service businesses",
      "small business website packages",
      "web design pricing",
      "website maintenance plans",
    ],
    bodyHeading: "Website pricing and packages",
    bodyCopy:
      "Compare Starter, Growth, and Premium website packages, then customize your project details and send a request for review before any payment is collected.",
    bullets: [
      "Clear setup pricing and monthly maintenance pricing",
      "Optional add-ons for SEO, booking, forms, and support",
      "Project details reviewed before billing",
    ],
    links: [
      { href: "/contact", label: "Ask a question" },
      { href: "/demos", label: "See examples" },
      { href: "/", label: "Back home" },
    ],
    structuredData: [
      buildWebPageStructuredData({
        path: "/pricing",
        title: "Website Pricing and Packages for Service Businesses | Levamen Tech",
        description:
          "Compare Levamen Tech website packages, customize your plan with add-ons, and send a project request for review before any payment is collected.",
      }),
      buildBreadcrumbStructuredData([
        { name: "Home", path: "/" },
        { name: "Pricing", path: "/pricing" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "Custom website design and development",
        description:
          "Levamen Tech offers website packages for service businesses, including responsive design, maintenance, and SEO support.",
        provider: {
          "@id": `${site.url}/#organization`,
        },
        areaServed: "United States",
        offers: planOffers.map((offer) => ({
          "@type": "Offer",
          name: offer.name,
          priceCurrency: "USD",
          price: offer.price,
          description: `${offer.description} Monthly maintenance starts at ${offer.monthlyPrice} per month.`,
        })),
      },
    ],
    changefreq: "monthly",
    priority: "0.9",
  },
  {
    path: "/reviews",
    title: "Client Reviews and Testimonials | Levamen Tech",
    description:
      "Read Levamen Tech client reviews and testimonials, and see how service businesses describe the website design and launch experience.",
    keywords: [
      "web design testimonials",
      "client website reviews",
      "service business website testimonials",
      "Levamen Tech reviews",
    ],
    bodyHeading: "Client reviews and testimonials",
    bodyCopy:
      "See how clients describe the Levamen Tech process, from first direction to final launch, and browse the public testimonial page.",
    bullets: [
      "Public testimonials from real client work",
      "Review submission flow with approval before publishing",
      "A growing library of post-launch feedback",
    ],
    links: [
      { href: "/contact", label: "Start your project" },
      { href: "/pricing", label: "View packages" },
      { href: "/", label: "Back home" },
    ],
    structuredData: [
      buildWebPageStructuredData({
        path: "/reviews",
        title: "Client Reviews and Testimonials | Levamen Tech",
        description:
          "Read Levamen Tech client reviews and testimonials, and see how service businesses describe the website design and launch experience.",
        pageType: "CollectionPage",
      }),
      buildBreadcrumbStructuredData([
        { name: "Home", path: "/" },
        { name: "Reviews", path: "/reviews" },
      ]),
    ],
    changefreq: "monthly",
    priority: "0.8",
  },
  {
    path: "/contact",
    title: "Contact Levamen Tech | Web Design for Service Businesses",
    description:
      "Reach out to Levamen Tech about a custom website project, pricing questions, demo requests, or a new service business site.",
    image: "/og-contact.svg",
    keywords: [
      "contact web designer",
      "service business website designer",
      "custom website project inquiry",
      "Levamen Tech contact",
    ],
    bodyHeading: "Contact Levamen Tech",
    bodyCopy:
      "Talk directly with Levamen Tech about a custom website, a service-business redesign, demo ideas, or pricing questions.",
    bullets: [
      "Direct email and phone contact",
      "Custom website project conversations",
      "Remote-first workflow for service businesses",
    ],
    links: [
      { href: "/pricing", label: "See pricing" },
      { href: "/demos", label: "Browse demos" },
      { href: "/", label: "Back home" },
    ],
    structuredData: [
      buildWebPageStructuredData({
        path: "/contact",
        title: "Contact Levamen Tech | Web Design for Service Businesses",
        description:
          "Reach out to Levamen Tech about a custom website project, pricing questions, demo requests, or a new service business site.",
        pageType: "ContactPage",
      }),
      buildBreadcrumbStructuredData([
        { name: "Home", path: "/" },
        { name: "Contact", path: "/contact" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: `${site.name} contact page`,
        url: absoluteUrl("/contact"),
        description:
          "Reach out to Levamen Tech about a custom website project, pricing questions, demo requests, or a new service business site.",
        mainEntity: {
          "@id": `${site.url}/#organization`,
        },
      },
    ],
    changefreq: "monthly",
    priority: "0.8",
  },
]

const demoPages = demoCatalog.map((demo) => ({
  path: `/demos/${demo.slug}`,
  title: `${demo.title} Website Demo | Levamen Tech`,
  description: `${demo.description} Explore this ${demo.title.toLowerCase()} website demo from Levamen Tech.`,
  image:
    demo.slug === "landscaping"
      ? "/og-demo-landscaping.svg"
      : demo.slug === "plumbing"
        ? "/og-demo-plumbing.svg"
        : demo.slug === "hvac"
          ? "/og-demo-hvac.svg"
          : "/og-demos.svg",
  keywords: [
    `${demo.title.toLowerCase()} website demo`,
    `${demo.title.toLowerCase()} website design`,
    "service business website example",
    "small business website demo",
  ],
  bodyHeading: `${demo.title} website demo`,
  bodyCopy: `${demo.description} Explore how Levamen Tech approaches ${demo.title.toLowerCase()} websites with conversion-focused structure, responsive layouts, and niche-specific sections.`,
  bullets: [
    "Industry-specific structure and copy direction",
    "Responsive design built for modern service businesses",
    "A direct path to compare demos or start a project",
  ],
  links: [
    { href: "/contact", label: "Start a project" },
    { href: "/demos", label: "Browse all demos" },
    { href: "/pricing", label: "View pricing" },
  ],
  structuredData: [
    buildWebPageStructuredData({
      path: `/demos/${demo.slug}`,
      title: `${demo.title} Website Demo | Levamen Tech`,
      description: `${demo.description} Explore this ${demo.title.toLowerCase()} website demo from Levamen Tech.`,
    }),
    buildBreadcrumbStructuredData([
      { name: "Home", path: "/" },
      { name: "Demos", path: "/demos" },
      { name: demo.title, path: `/demos/${demo.slug}` },
    ]),
  ],
  changefreq: "monthly",
  priority: "0.7",
}))

const utilityPages = [
  {
    path: "/privacy",
    title: "Privacy Policy | Levamen Tech",
    description: "Privacy policy for Levamen Tech website visitors and clients.",
    bodyHeading: "Privacy policy",
    bodyCopy:
      "This page explains how Levamen Tech handles contact details, inquiries, reviews, and billing-related data.",
    links: [{ href: "/", label: "Back home" }],
    structuredData: [],
    noindex: true,
  },
  {
    path: "/terms",
    title: "Terms of Service | Levamen Tech",
    description: "Terms of service for Levamen Tech website visitors and clients.",
    bodyHeading: "Terms of service",
    bodyCopy:
      "This page covers the terms that apply to Levamen Tech website visitors, demo viewers, inquiries, and client work.",
    links: [{ href: "/", label: "Back home" }],
    structuredData: [],
    noindex: true,
  },
  {
    path: "/admin",
    title: "Admin Dashboard | Levamen Tech",
    description: "Levamen Tech internal admin dashboard.",
    bodyHeading: "Admin dashboard",
    bodyCopy: "This route is for internal use only.",
    links: [{ href: "/", label: "Back home" }],
    structuredData: [],
    noindex: true,
  },
  {
    path: "/success",
    title: "Payment Success | Levamen Tech",
    description: "Levamen Tech payment confirmation page.",
    bodyHeading: "Payment success",
    bodyCopy: "This confirmation route is not intended for search indexing.",
    links: [{ href: "/", label: "Back home" }],
    structuredData: [],
    noindex: true,
  },
  {
    path: "/failure",
    title: "Payment Cancelled | Levamen Tech",
    description: "Levamen Tech checkout cancellation page.",
    bodyHeading: "Payment cancelled",
    bodyCopy: "This checkout route is not intended for search indexing.",
    links: [{ href: "/", label: "Back home" }],
    structuredData: [],
    noindex: true,
  },
  {
    path: "/unsubscribe",
    title: "Unsubscribe from Outreach | Levamen Tech",
    description: "Email preference update page for Levamen Tech outreach.",
    bodyHeading: "Unsubscribe from outreach",
    bodyCopy: "This email preference route is not intended for search indexing.",
    links: [{ href: "/", label: "Back home" }],
    structuredData: [],
    noindex: true,
  },
  {
    path: "/demos/cafe",
    canonicalPath: "/demos/cafes-coffee-shops",
    title: "Cafes / Coffee Shops Website Demo | Levamen Tech",
    description:
      "A warm neighborhood-brand direction with drink highlights, personality, and repeat-visit energy. Explore this cafes and coffee shops website demo from Levamen Tech.",
    bodyHeading: "Cafes and coffee shops website demo",
    bodyCopy:
      "This alias route points to the main cafes and coffee shops demo page and is not intended to be indexed separately.",
    links: [{ href: "/demos/cafes-coffee-shops", label: "Open the canonical demo" }],
    structuredData: [],
    noindex: true,
  },
]

const pages = [...corePages, ...demoPages, ...utilityPages]

function absoluteUrl(routePath) {
  return new URL(routePath, site.url).toString()
}

function buildWebsiteStructuredData(description) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    url: site.url,
    name: site.name,
    description,
    publisher: {
      "@id": `${site.url}/#organization`,
    },
  }
}

function buildOrganizationStructuredData(description) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${site.url}/#organization`,
    name: site.name,
    url: site.url,
    email: site.email,
    telephone: site.phone,
    image: absoluteUrl(site.defaultImagePath),
    logo: absoluteUrl(site.defaultImagePath),
    description,
    areaServed: "United States",
  }
}

function buildWebPageStructuredData({
  path: routePath,
  title,
  description,
  pageType = "WebPage",
}) {
  const url = absoluteUrl(routePath)

  return {
    "@context": "https://schema.org",
    "@type": pageType,
    "@id": `${url}#webpage`,
    url,
    name: title,
    description,
    isPartOf: {
      "@id": `${site.url}/#website`,
    },
    about: {
      "@id": `${site.url}/#organization`,
    },
  }
}

function buildBreadcrumbStructuredData(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function buildNoscript(page) {
  const bullets = page.bullets?.length
    ? `<ul style="margin:24px 0 0;padding-left:20px;color:#475569;line-height:1.8;">${page.bullets
        .map((bullet) => `<li>${escapeHtml(bullet)}</li>`)
        .join("")}</ul>`
    : ""

  const links = page.links?.length
    ? `<p style="margin:28px 0 0;font-size:16px;line-height:1.7;">${page.links
        .map(
          (link) =>
            `<a href="${escapeHtml(link.href)}" style="color:#0F172A;font-weight:700;text-decoration:underline;">${escapeHtml(link.label)}</a>`
        )
        .join(' <span style="color:#94A3B8;">&middot;</span> ')}</p>`
    : ""

  return `<main style="max-width:960px;margin:0 auto;padding:48px 20px 64px;color:#0F172A;font-family:Verdana,DejaVu Sans,sans-serif;">
  <p style="margin:0 0 14px;font-size:13px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:#64748B;">Levamen Tech</p>
  <h1 style="margin:0;font-size:44px;line-height:1.1;">${escapeHtml(page.bodyHeading || page.title)}</h1>
  <p style="margin:20px 0 0;max-width:780px;font-size:19px;line-height:1.7;color:#475569;">${escapeHtml(page.bodyCopy || page.description)}</p>
  ${bullets}
  ${links}
</main>`
}

function buildHeadBlock(page) {
  const canonicalUrl = absoluteUrl(page.canonicalPath ?? page.path)
  const pageImage = absoluteUrl(page.image ?? site.defaultImagePath)
  const jsonLd = page.structuredData
    .map(
      (item) =>
        `    <script type="application/ld+json">${JSON.stringify(item).replaceAll(
          "<",
          "\\u003c"
        )}</script>`
    )
    .join("\n")
  const keywords = page.keywords?.length
    ? `    <meta name="keywords" content="${escapeHtml(page.keywords.join(", "))}" />\n`
    : ""

  const robots = page.noindex
    ? "noindex,nofollow"
    : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"

  return [
    `    <meta name="description" content="${escapeHtml(page.description)}" />`,
    `    <meta name="robots" content="${robots}" />`,
    keywords.trimEnd(),
    `    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
    `    <meta property="og:title" content="${escapeHtml(page.title)}" />`,
    `    <meta property="og:description" content="${escapeHtml(page.description)}" />`,
    `    <meta property="og:type" content="website" />`,
    `    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
    `    <meta property="og:site_name" content="${escapeHtml(site.name)}" />`,
    `    <meta property="og:image" content="${escapeHtml(pageImage)}" />`,
    `    <meta property="og:image:width" content="1200" />`,
    `    <meta property="og:image:height" content="630" />`,
    `    <meta name="twitter:card" content="summary_large_image" />`,
    `    <meta name="twitter:title" content="${escapeHtml(page.title)}" />`,
    `    <meta name="twitter:description" content="${escapeHtml(page.description)}" />`,
    `    <meta name="twitter:image" content="${escapeHtml(pageImage)}" />`,
    jsonLd,
  ]
    .filter(Boolean)
    .join("\n")
}

function renderPageHtml(template, page) {
  const withHead = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(page.title)}</title>`)
    .replace(
      /<meta name="viewport" content="width=device-width, initial-scale=1\.0" \/>/,
      `<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n${buildHeadBlock(page)}`
    )

  return withHead.replace(
    '<div id="root"></div>',
    `<div id="root"></div>\n    <noscript>\n${buildNoscript(page)}\n    </noscript>`
  )
}

function buildSitemapXml(routePages) {
  const today = new Date().toISOString().slice(0, 10)
  const urls = routePages
    .map(
      (page) => `  <url>
    <loc>${absoluteUrl(page.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    )
    .join("\n")

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

async function writeRoutePage(distDir, template, page) {
  const outputPath =
    page.path === "/"
      ? path.join(distDir, "index.html")
      : path.join(distDir, ...page.path.split("/").filter(Boolean), "index.html")

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, renderPageHtml(template, page), "utf8")
}

async function main() {
  const distDir = path.join(process.cwd(), "dist")
  const templatePath = path.join(distDir, "index.html")
  const template = await readFile(templatePath, "utf8")

  for (const page of pages) {
    await writeRoutePage(distDir, template, page)
  }

  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /success
Disallow: /failure
Disallow: /unsubscribe

Sitemap: ${site.url}/sitemap.xml
`

  const sitemapPages = pages.filter((page) => !page.noindex)

  await writeFile(path.join(distDir, "robots.txt"), robotsTxt, "utf8")
  await writeFile(
    path.join(distDir, "sitemap.xml"),
    buildSitemapXml(sitemapPages),
    "utf8"
  )
}

await main()
