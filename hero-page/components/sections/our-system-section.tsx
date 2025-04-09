"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Search, ScanText, Image, ShieldCheck } from "lucide-react"

interface OurSystemSectionProps {
  id: string
}

export default function OurSystemSection({ id }: OurSystemSectionProps) {
  const cardClassName = "relative border-primary/20 bg-white/10 backdrop-blur-md w-full md:w-1/4 z-10 flex flex-col h-full min-h-[220px] border border-white/10"
  const iconClassName = "h-14 w-14 sm:h-16 sm:w-16 text-primary mb-4"
  
  return (
    <div id={id} className="py-20 md:py-32 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 sm:mb-16 text-white">
          How <span className="font-aclonica">Fuzzify</span> Works
        </h2>
        
        <div className="relative flex flex-col items-stretch gap-8 md:flex-row md:gap-4">
          {/* Step 1 */}
          <Card className={cardClassName}>
            <CardHeader className="flex flex-col items-center text-center pt-6">
              <Search className={iconClassName} />
              <CardTitle className="text-white text-xl sm:text-2xl md:text-3xl">
                1. Generate & Find
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow text-center">
              {/* Removed paragraph text */}
            </CardContent>
          </Card>
          
          <ArrowRight className="hidden md:block h-8 w-8 text-primary/70 shrink-0 z-10 self-center" />

          {/* Step 2 */}
          <Card className={cardClassName}>
            <CardHeader className="flex flex-col items-center text-center pt-6">
              <ScanText className={iconClassName} />
              <CardTitle className="text-white text-xl sm:text-2xl md:text-3xl">
                2. Code Comparison
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow text-center">
              {/* Removed paragraph text */}
            </CardContent>
          </Card>

          <ArrowRight className="hidden md:block h-8 w-8 text-primary/70 shrink-0 z-10 self-center" />

          {/* Step 3 */}
          <Card className={cardClassName}>
            <CardHeader className="flex flex-col items-center text-center pt-6">
              <Image className={iconClassName} />
              <CardTitle className="text-white text-xl sm:text-2xl md:text-3xl">
                3. Visual Check
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow text-center">
              {/* Removed paragraph text */}
            </CardContent>
          </Card>

          <ArrowRight className="hidden md:block h-8 w-8 text-primary/70 shrink-0 z-10 self-center" />

          {/* Step 4 */}
          <Card className={cardClassName}>
            <CardHeader className="flex flex-col items-center text-center pt-6">
              <ShieldCheck className={iconClassName} />
              <CardTitle className="text-white text-xl sm:text-2xl md:text-3xl">
                4. Rank Threat
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow text-center">
              {/* Removed paragraph text */}
              {/* <div className="flex flex-wrap gap-3">
                {renderThreatBadge('Critical')}
                {renderThreatBadge('High')}
                {renderThreatBadge('Medium')}
                {renderThreatBadge('Low')}
                {renderThreatBadge('Safe')}
                {renderThreatBadge('Unknown')}
              </div> */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 