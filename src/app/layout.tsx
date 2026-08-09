import type { Metadata } from "next"
import localFont from "next/font/local"
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo"
import "./globals.css"
import { Providers } from "./providers"

const pretendard = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: SITE_URL,
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  applicationName: SITE_NAME,
  category: "religion",
  icons: {
    icon: [
      { url: "/favicon.ico?v=3", type: "image/x-icon" },
      { url: "/icon.svg?v=3", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico?v=3",
    apple: "/apple-touch-icon.png?v=3",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: SITE_NAME,
    url: "/",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/apple-touch-icon.png"],
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/apple-touch-icon.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": new URL("/#organization", SITE_URL).toString(),
      name: SITE_NAME,
      alternateName: "천주교 서울대교구 구로3동성당",
      url: SITE_URL.toString(),
      logo: new URL("/apple-touch-icon.png", SITE_URL).toString(),
      email: "contact@gu3.kr",
      telephone: "+82-2-857-8541",
      address: {
        "@type": "PostalAddress",
        streetAddress: "디지털로27길 82",
        addressLocality: "구로구",
        addressRegion: "서울특별시",
        postalCode: "08375",
        addressCountry: "KR",
      },
      sameAs: ["https://www.youtube.com/@gu3kr"],
    },
    {
      "@type": "WebSite",
      "@id": new URL("/#website", SITE_URL).toString(),
      url: SITE_URL.toString(),
      name: SITE_NAME,
      alternateName: "구로3동 천주교회",
      inLanguage: "ko-KR",
      publisher: {
        "@id": new URL("/#organization", SITE_URL).toString(),
      },
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <head>
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: 사용자 입력이 없는 정적 JSON이며 HTML 문맥 문자를 치환한다.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c"),
          }}
        />
      </head>
      <body className={`${pretendard.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
