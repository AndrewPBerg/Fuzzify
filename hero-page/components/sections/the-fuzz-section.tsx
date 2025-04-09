"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dna, Hash, Fingerprint } from "lucide-react"
import { DNSFuzzVisualizer } from "../diagrams/dns-fuzzing-diagram"
import FuzzyHashDiagram from "../diagrams/fuzzy-hashing-diagram"

interface TheFuzzSectionProps {
  id: string
}

export default function TheFuzzSection({ id }: TheFuzzSectionProps) {
  return (
    <div id={id} className="py-20 md:py-32 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 sm:mb-16 text-white">
          The Technology Behind <span className="font-aclonica">Fuzzify</span>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* DNS Fuzzing Card */}
          <Card className="border-primary/20 bg-white/10 backdrop-blur-md border border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white text-xl sm:text-2xl md:text-3xl">
                <Dna className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                DNS Fuzzing: Finding Lookalikes
              </CardTitle>
              <CardDescription className="text-white/70 text-sm sm:text-base pt-1">
                Uncovering potential domain impersonators.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-white/80 text-base sm:text-lg">
                <li>Generates variations of your domain (typos, dashes, TLDs)</li>
                <li>Tests which variations exist online</li>
                <li>Finds sites potentially impersonating your brand</li>
              </ul>
              <DNSFuzzVisualizer originalDomain="example.com" fuzzedDomains={[{domainName: "example1.com", fuzzMethod: "DNS Fuzzing", registered: true}, {domainName: "example.co", fuzzMethod: "DNS Fuzzing", registered: true}
                , {domainName: "exampl.com", fuzzMethod: "DNS Fuzzing", registered: true}]} />
            </CardContent>
          </Card>

          {/* Fuzzy Hashing Card */}
          <Card className="border-primary/20 bg-white/10 backdrop-blur-md border border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white text-xl sm:text-2xl md:text-3xl">
                <Fingerprint className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                Fuzzy Hashing: Comparing Similarity
              </CardTitle>
              <CardDescription className="text-white/70 text-sm sm:text-base pt-1">
                Measuring content and visual similarity between sites.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside mt-2 space-y-2 text-white/80 text-base sm:text-lg">
                <li><strong className="text-primary/90">TLSH:</strong> Fingerprints <span className="italic">source code</span> to detect code copying</li>  
                <li><strong className="text-primary/90">pHash:</strong> Fingerprints <span className="italic">visual appearance</span> to detect visual mimicry</li>
              </ul>
              <FuzzyHashDiagram />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 