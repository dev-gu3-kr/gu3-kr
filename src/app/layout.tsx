import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { Providers } from "./providers"

const metadataBaseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

const pretendard = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(metadataBaseUrl),
  title: "구로3동성당",
  description: "구로3동성당 홈페이지",
  icons: {
    icon: [
      { url: "/favicon.ico?v=3", type: "image/x-icon" },
      { url: "/icon.svg?v=3", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico?v=3",
    apple: "/icon.svg?v=3",
  },
  openGraph: {
    title: "구로3동성당",
    description: "구로3동성당 홈페이지",
    images: ["/icon.svg?v=3"],
  },
  twitter: {
    card: "summary",
    title: "구로3동성당",
    description: "구로3동성당 홈페이지",
    images: ["/icon.svg?v=3"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className={`${pretendard.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
