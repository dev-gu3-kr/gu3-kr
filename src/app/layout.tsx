import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { Providers } from "./providers"

const pretendard = localFont({
  src: "../../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
})

export const metadata: Metadata = {
  title: "구로3동성당",
  description: "구로3동성당 홈페이지",
  icons: {
    icon: [
      { url: "/favicon.ico?v=2", type: "image/x-icon" },
      { url: "/icon.svg?v=2", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico?v=2",
    apple: "/icon.svg?v=2",
  },
  openGraph: {
    title: "구로3동성당",
    description: "구로3동성당 홈페이지",
    images: ["/icon.svg?v=2"],
  },
  twitter: {
    card: "summary",
    title: "구로3동성당",
    description: "구로3동성당 홈페이지",
    images: ["/icon.svg?v=2"],
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
