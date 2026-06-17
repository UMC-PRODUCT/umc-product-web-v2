export const SITE_URL = "https://university.neordinary.com"
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`

export interface MetaOptions {
  canonical?: string
  ogImage?: string
  noindex?: boolean
}

interface MetaTag {
  title?: string
  name?: string
  property?: string
  content?: string
}

interface LinkTag {
  rel: string
  href: string
}

export interface RouteHead {
  meta: MetaTag[]
  links: LinkTag[]
}

export function createMeta(
  title: string,
  description: string,
  options: MetaOptions = {},
): RouteHead {
  const { canonical, ogImage, noindex = false } = options

  const meta: MetaTag[] = [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
  ]

  if (canonical) {
    meta.push({ property: "og:url", content: canonical })
  }

  if (ogImage) {
    meta.push({ property: "og:image", content: ogImage })
  }

  if (noindex) {
    meta.push({ name: "robots", content: "noindex, nofollow" })
  }

  const links: LinkTag[] = canonical
    ? [{ rel: "canonical", href: canonical }]
    : []

  return { meta, links }
}
