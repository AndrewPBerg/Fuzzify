"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, AlertTriangle, BarChart3 } from "lucide-react"

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const mainCardRef = useRef<HTMLDivElement>(null)
  const card1Ref = useRef<HTMLDivElement>(null)
  const card2Ref = useRef<HTMLDivElement>(null)
  const listItems1Ref = useRef<HTMLUListElement>(null)
  const listItems2Ref = useRef<HTMLUListElement>(null)
  
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    
    // Title animation
    gsap.fromTo(titleRef.current,
      { y: 40, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.8,
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top bottom-=100",
          toggleActions: "play none none reverse"
        }
      }
    )
    
    // Main card animation
    gsap.fromTo(mainCardRef.current,
      { y: 50, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.8,
        scrollTrigger: {
          trigger: mainCardRef.current,
          start: "top bottom-=50",
          toggleActions: "play none none reverse"
        }
      }
    )
    
    // Secondary cards animation with stagger
    gsap.fromTo([card1Ref.current, card2Ref.current],
      { y: 30, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        stagger: 0.25,
        duration: 0.7,
        scrollTrigger: {
          trigger: card1Ref.current,
          start: "top bottom-=50",
          toggleActions: "play none none reverse"
        }
      }
    )
    
    // List item animations
    const animateListItems = (listRef: React.RefObject<HTMLUListElement | null>) => {
      if (listRef.current) {
        const items = listRef.current.querySelectorAll('li')
        
        gsap.fromTo(items,
          { x: 15, opacity: 0 },
          { 
            x: 0, 
            opacity: 1, 
            stagger: 0.1,
            duration: 0.5,
            scrollTrigger: {
              trigger: listRef.current,
              start: "top bottom-=30",
              toggleActions: "play none none reverse"
            }
          }
        )
      }
    }
    
    animateListItems(listItems1Ref)
    animateListItems(listItems2Ref)
    
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <div ref={sectionRef} className="py-20 md:py-32 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <h2 ref={titleRef} className="text-3xl md:text-4xl font-bold text-center mb-16 text-white">
          About <span className="font-aclonica">Fuzzify</span>
        </h2>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card ref={mainCardRef} className="border-primary/20 bg-white/10 backdrop-blur-md border border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Shield className="h-6 w-6 text-primary" />
                What is <span className="font-aclonica">Fuzzify</span>?
              </CardTitle>
              <CardDescription className="text-white/70">Protecting your brand from domain impersonation threats</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed text-white/80">
                Fuzzify is an advanced security tool that uses DNS fuzzing to proactively detect malicious lookalike domains. 
                Our system continuously scans for newly registered domains that could impersonate your brand, analyzes them for 
                malicious intent, and classifies each potential threat on a comprehensive risk scale.
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card ref={card1Ref} className="bg-white/10 backdrop-blur-md border border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  Threat Detection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul ref={listItems1Ref} className="space-y-2 text-white/80">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Identifies typosquatting domains (e.g., amazom.com, g00gle.com)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Detects homograph attacks using similar-looking characters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Monitors for combosquatting domains (e.g., google-login.com)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Alerts on bitsquatting domains targeting bit-flip errors</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card ref={card2Ref} className="bg-white/10 backdrop-blur-md border border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Threat Classification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-white/80">
                  Fuzzify doesn't just find suspicious domains—it analyzes their potential threat level. 
                  Our proprietary threat scoring system evaluates each domain based on multiple factors:
                </p>
                <ul ref={listItems2Ref} className="space-y-2 text-white/80 mt-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Visual similarity to legitimate domains</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Suspicious hosting or registration patterns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Content analysis for phishing indicators</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Comprehensive risk score with actionable remediation</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

