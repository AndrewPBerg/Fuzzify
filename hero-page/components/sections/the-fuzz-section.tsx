"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dna, Hash, Fingerprint } from "lucide-react"
import DnsFuzzingDiagram from "../diagrams/dns-fuzzing-diagram"
import FuzzyHashingDiagram from "../diagrams/fuzzy-hashing-diagram"

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
          <Card className="border-primary/30 bg-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white text-xl sm:text-2xl">
                <Dna className="h-6 w-6 text-primary" />
                DNS Fuzzing: Finding Lookalikes
              </CardTitle>
              <CardDescription className="text-white/70 text-sm sm:text-base pt-1">
                Uncovering potential domain impersonators.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-base sm:text-lg leading-relaxed text-white/80 mb-4">
                Generates and tests variations of your domain to find potentially malicious lookalikes.
              </p>
              <ul className="list-disc list-inside space-y-2 text-white/80 text-base sm:text-lg">
                  <li>Modifies domain names (typos, dashes, different TLDs like .co).</li>
                  <li>Identifies which variations exist online.</li>
                  <li>Helps find sites potentially impersonating your brand.</li>
              </ul>
              {/* Visual Placeholder -> Replaced with Diagram */}
              <DnsFuzzingDiagram />
            </CardContent>
          </Card>

          {/* Fuzzy Hashing Card */}
          <Card className="border-primary/30 bg-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white text-xl sm:text-2xl">
                <Fingerprint className="h-6 w-6 text-primary" />
                Fuzzy Hashing: Comparing Similarity
              </CardTitle>
              <CardDescription className="text-white/70 text-sm sm:text-base pt-1">
                Measuring content and visual similarity between sites.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-base sm:text-lg leading-relaxed text-white/80 mb-4">
                Creates 'fuzzy' fingerprints to compare how <span className="italic">similar</span> sites are, even if not identical.
              </p>
              <p className="text-base sm:text-lg text-white/80 font-medium">We use two types:</p>
              <ul className="list-disc list-inside mt-2 space-y-2 text-white/80 text-base sm:text-lg">
                <li><strong className="text-primary/90">TLSH:</strong> Fingerprints <span className="italic">source code</span> (HTML, CSS, JS) to detect code copying.</li>
                <li><strong className="text-primary/90">pHash:</strong> Fingerprints <span className="italic">visual appearance</span> from screenshots to detect visual mimicry.</li>
              </ul>
               {/* Visual Placeholder -> Replaced with Diagram */}
              <FuzzyHashingDiagram />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 