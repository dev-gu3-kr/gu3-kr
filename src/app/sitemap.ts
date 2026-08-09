import type { MetadataRoute } from "next"

import { PUBLIC_SITEMAP_ROUTES, SITE_URL } from "@/lib/seo"

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_SITEMAP_ROUTES.map((path) => ({
    url: new URL(path, SITE_URL).toString(),
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7,
  }))
}
