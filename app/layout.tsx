import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _geist = Geist({ subsets: ["latin"] })
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _geistMono = Geist_Mono({ subsets: ["latin"] })
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _playfair = Playfair_Display({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Reserve Your Table | Fine Dining Reservations",
  description:
    "Book a table at our award-winning restaurants. Experience exceptional dining with personalized service.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
