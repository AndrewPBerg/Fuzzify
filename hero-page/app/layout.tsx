"use client"

import type React from "react"
import { Inter, Aclonica } from "next/font/google"
import { usePathname } from "next/navigation"
import "./globals.css"
import { CustomCursor } from "@/components/ui/custom-cursor"

const inter = Inter({ subsets: ["latin"] })
const aclonica = Aclonica({ 
  weight: "400",
  subsets: ["latin"],
  variable: "--font-aclonica" 
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  
  return (
    <html lang="en" data-path={pathname}>
      <body className={`${inter.className} ${aclonica.variable}`}>
        <CustomCursor />
        {children}
      </body>
    </html>
  )
}



import './globals.css'