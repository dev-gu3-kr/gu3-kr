import { describe, expect, it } from "vitest"

import { createPageMetadata, PUBLIC_SITEMAP_ROUTES } from "./seo"

describe("SEO configuration", () => {
  it("keeps public sitemap routes unique and excludes private areas", () => {
    expect(new Set(PUBLIC_SITEMAP_ROUTES).size).toBe(
      PUBLIC_SITEMAP_ROUTES.length,
    )
    expect(PUBLIC_SITEMAP_ROUTES).not.toContain("/admin")
    expect(PUBLIC_SITEMAP_ROUTES).not.toContain("/api")
  })

  it("uses each public page path as its canonical URL", () => {
    const metadata = createPageMetadata({
      title: "미사 시간",
      description: "미사 시간 안내",
      path: "/notice/mass-times",
    })

    expect(metadata.alternates?.canonical).toBe("/notice/mass-times")
  })
})
