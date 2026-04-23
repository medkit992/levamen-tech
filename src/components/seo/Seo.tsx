import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import {
  buildPageTitle,
  siteConfig,
  toAbsoluteUrl,
  type StructuredData,
} from "../../seo/site"

type SeoProps = {
  title: string
  description: string
  path?: string
  image?: string
  keywords?: string[]
  noindex?: boolean
  type?: "website" | "article"
  structuredData?: StructuredData | StructuredData[]
}

function upsertMeta(
  selector: string,
  attributes: Record<string, string>
) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)

  if (!element) {
    element = document.createElement("meta")
    document.head.appendChild(element)
  }

  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value)
  }
}

function upsertLink(
  selector: string,
  attributes: Record<string, string>
) {
  let element = document.head.querySelector<HTMLLinkElement>(selector)

  if (!element) {
    element = document.createElement("link")
    document.head.appendChild(element)
  }

  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value)
  }
}

function removeElement(selector: string) {
  document.head.querySelector(selector)?.remove()
}

export default function Seo({
  title,
  description,
  path,
  image,
  keywords,
  noindex = false,
  type = "website",
  structuredData,
}: SeoProps) {
  const location = useLocation()

  useEffect(() => {
    const resolvedPath = path ?? location.pathname
    const canonicalUrl = toAbsoluteUrl(resolvedPath)
    const resolvedTitle = buildPageTitle(title)
    const resolvedImage = toAbsoluteUrl(image ?? siteConfig.defaultImagePath)
    const robotsContent = noindex
      ? "noindex,nofollow"
      : "index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1"

    document.title = resolvedTitle
    document.documentElement.lang = "en"

    upsertMeta('meta[name="description"]', {
      name: "description",
      content: description,
    })
    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: robotsContent,
    })
    upsertMeta('meta[property="og:title"]', {
      property: "og:title",
      content: resolvedTitle,
    })
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: description,
    })
    upsertMeta('meta[property="og:type"]', {
      property: "og:type",
      content: type,
    })
    upsertMeta('meta[property="og:url"]', {
      property: "og:url",
      content: canonicalUrl,
    })
    upsertMeta('meta[property="og:site_name"]', {
      property: "og:site_name",
      content: siteConfig.name,
    })
    upsertMeta('meta[property="og:image"]', {
      property: "og:image",
      content: resolvedImage,
    })
    upsertMeta('meta[name="twitter:card"]', {
      name: "twitter:card",
      content: "summary_large_image",
    })
    upsertMeta('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: resolvedTitle,
    })
    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: description,
    })
    upsertMeta('meta[name="twitter:image"]', {
      name: "twitter:image",
      content: resolvedImage,
    })
    upsertLink('link[rel="canonical"]', {
      rel: "canonical",
      href: canonicalUrl,
    })

    if (keywords?.length) {
      upsertMeta('meta[name="keywords"]', {
        name: "keywords",
        content: keywords.join(", "),
      })
    } else {
      removeElement('meta[name="keywords"]')
    }

    document.head
      .querySelectorAll('script[data-seo-managed="true"]')
      .forEach((element) => element.remove())

    const items = structuredData
      ? Array.isArray(structuredData)
        ? structuredData
        : [structuredData]
      : []

    for (const item of items) {
      const script = document.createElement("script")
      script.type = "application/ld+json"
      script.dataset.seoManaged = "true"
      script.textContent = JSON.stringify(item)
      document.head.appendChild(script)
    }
  }, [description, image, keywords, location.pathname, noindex, path, structuredData, title, type])

  return null
}
