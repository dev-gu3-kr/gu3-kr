import type { Metadata } from "next"

export const SITE_NAME = "구로3동성당"
export const SITE_DESCRIPTION =
  "천주교 서울대교구 구로3동성당의 미사 시간, 본당 소식, 주보와 신앙생활 정보를 안내합니다."
export const SITE_URL = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://gu3.kr",
)

type PageMetadataInput = {
  readonly title: string
  readonly description: string
  readonly path: `/${string}` | "/"
}

// 공개 페이지마다 고유한 검색 제목과 대표 URL을 일관된 형식으로 제공한다.
export function createPageMetadata({
  title,
  description,
  path,
}: PageMetadataInput): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      type: "website",
      locale: "ko_KR",
      siteName: SITE_NAME,
      title,
      description,
      url: path,
      images: ["/apple-touch-icon.png"],
    },
    twitter: {
      card: "summary",
      title,
      description,
      images: ["/apple-touch-icon.png"],
    },
  }
}

export const PUBLIC_SITEMAP_ROUTES = [
  "/",
  "/parish/about",
  "/parish/pastoral-goal",
  "/parish/priests",
  "/parish/nuns",
  "/parish/salesians",
  "/parish/directions",
  "/parish/facilities",
  "/notice/notices",
  "/notice/mass-times",
  "/notice/weekly-bulletin",
  "/notice/parish-calendar",
  "/notice/gallery",
  "/office/catechumen-class",
  "/office/infant-baptism",
  "/office/marriage",
  "/office/anointing",
  "/office/funeral-guide",
  "/office/office-guide",
  "/community/about",
  "/community/pastoral-council",
  "/community/district-map",
  "/community/inquiry",
  "/youth/about",
  "/youth/blog",
  "/faith/catholic-doctrine",
  "/faith/prayers",
] as const
