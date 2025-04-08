import type React from "react"
import type { Metadata } from "next"
import { Inter, Aclonica } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
const aclonica = Aclonica({ 
  weight: "400",
  subsets: ["latin"],
  variable: "--font-aclonica" 
})

export const metadata: Metadata = {
  title: "Fuzzify",
  description: "Experience the future of web design with smooth parallax effects and captivating animations",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${aclonica.variable}`}>{children}</body>
    </html>
  )
}



import './globals.css'