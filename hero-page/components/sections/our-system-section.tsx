"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldAlert, ShieldCheck, ShieldQuestion, AlertTriangle, ArrowRight, Search, ScanText, Image } from "lucide-react"

interface OurSystemSectionProps {
  id: string
}

// Helper function to render threat level badges
const renderThreatBadge = (level: 'Critical' | 'High' | 'Medium' | 'Low' | 'Safe' | 'Unknown') => {
  switch (level) {
    case 'Critical':
      return <Badge variant="destructive" className="gap-2 pl-2 text-lg"><ShieldAlert className="h-4 w-4" />Critical</Badge>
    case 'High':
      return <Badge variant="destructive" className="gap-2 pl-2 text-lg bg-orange-600 hover:bg-orange-700"><ShieldAlert className="h-4 w-4" />High</Badge>
    case 'Medium':
      return <Badge variant="secondary" className="gap-2 pl-2 text-lg bg-yellow-500 hover:bg-yellow-600 text-black"><AlertTriangle className="h-4 w-4" />Medium</Badge>
    case 'Low':
        return <Badge variant="secondary" className="gap-2 pl-2 text-lg bg-yellow-300 hover:bg-yellow-400 text-black"><AlertTriangle className="h-4 w-4" />Low</Badge>
    case 'Safe':
      return <Badge variant="outline" className="gap-2 pl-2 text-lg text-green-500 border-green-500"><ShieldCheck className="h-4 w-4" />Safe</Badge>
    case 'Unknown':
      return <Badge variant="outline" className="gap-2 pl-2 text-lg text-blue-500 border-blue-500"><ShieldQuestion className="h-4 w-4" />Unknown</Badge>
    default:
      return null
  }
}

export default function OurSystemSection({ id }: OurSystemSectionProps) {
  return (
    <div id={id} className="py-20 md:py-32 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 sm:mb-16 text-white">
          How <span className="font-aclonica">Fuzzify</span> Works
        </h2>
        
        <div className="relative flex flex-col items-center gap-8 md:flex-row md:gap-4">
          {/* Dashed line for larger screens */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 border-t-2 border-dashed border-primary/50 -translate-y-1/2" style={{zIndex: 0}}></div>

          {/* Step 1 */}
          <Card className="relative border-primary/30 bg-white/10 backdrop-blur-md w-full md:w-1/4 z-10">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white text-xl sm:text-2xl">
                <Search className="h-6 w-6 sm:h-7 sm:w-7 text-primary shrink-0" />
                1. Generate & Find
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Removed paragraph text */}
            </CardContent>
          </Card>
          
          <ArrowRight className="hidden md:block h-8 w-8 text-primary/70 shrink-0 z-10" />

          {/* Step 2 */}
          <Card className="relative border-primary/30 bg-white/10 backdrop-blur-md w-full md:w-1/4 z-10">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white text-xl sm:text-2xl">
                <ScanText className="h-6 w-6 sm:h-7 sm:w-7 text-primary shrink-0" />
                2. Code Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Removed paragraph text */}
            </CardContent>
          </Card>

          <ArrowRight className="hidden md:block h-8 w-8 text-primary/70 shrink-0 z-10" />

          {/* Step 3 */}
          <Card className="relative border-primary/30 bg-white/10 backdrop-blur-md w-full md:w-1/4 z-10">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white text-xl sm:text-2xl">
                <Image className="h-6 w-6 sm:h-7 sm:w-7 text-primary shrink-0" />
                3. Visual Check
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Removed paragraph text */}
            </CardContent>
          </Card>

          <ArrowRight className="hidden md:block h-8 w-8 text-primary/70 shrink-0 z-10" />

          {/* Step 4 */}
          <Card className="relative border-primary/30 bg-white/10 backdrop-blur-md w-full md:w-1/4 z-10">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white text-xl sm:text-2xl">
                <ShieldCheck className="h-6 w-6 sm:h-7 sm:w-7 text-primary shrink-0" />
                4. Rank Threat
              </CardTitle>
            </CardHeader>
            <CardContent>
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