"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Play, Shield, AlertTriangle, BarChart3, CalendarCheck } from "lucide-react"
import Link from "next/link"

interface DemoSectionProps {
  id?: string
}

export default function DemoSection({ id }: DemoSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subheadingRef = useRef<HTMLParagraphElement>(null)
  const card1Ref = useRef<HTMLDivElement>(null)
  const card2Ref = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLUListElement>(null)
  
  // Add a state for the dashboard URL
  const [dashboardUrl, setDashboardUrl] = useState("http://localhost:10002/")
  
  useEffect(() => {
    // Determine if we're running locally or in production
    const isLocalhost = window.location.hostname === "localhost" || 
                        window.location.hostname === "127.0.0.1";
    
    // Set the appropriate URL
    if (!isLocalhost) {
      // Use the current origin with /demo-app path
      const baseUrl = window.location.origin;
      setDashboardUrl(`${baseUrl}/demo-app`);
    }
    
    gsap.registerPlugin(ScrollTrigger)
    
    // Heading animations
    gsap.fromTo([headingRef.current, subheadingRef.current],
      { y: 30, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.7,
        stagger: 0.2,
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top bottom-=100",
          toggleActions: "play none none reverse"
        }
      }
    )
    
    // Card animations
    gsap.fromTo(card1Ref.current,
      { x: -50, opacity: 0 },
      { 
        x: 0, 
        opacity: 1, 
        duration: 0.8,
        scrollTrigger: {
          trigger: card1Ref.current,
          start: "top bottom-=50",
          toggleActions: "play none none reverse"
        }
      }
    )
    
    gsap.fromTo(card2Ref.current,
      { x: 50, opacity: 0 },
      { 
        x: 0, 
        opacity: 1, 
        duration: 0.8,
        scrollTrigger: {
          trigger: card2Ref.current,
          start: "top bottom-=50",
          toggleActions: "play none none reverse"
        }
      }
    )
    
    // Video box hover effect
    if (videoRef.current) {
      const playButton = videoRef.current.querySelector('button')
      
      if (playButton) {
        videoRef.current.addEventListener('mouseenter', () => {
          gsap.to(playButton, {
            scale: 1.1,
            duration: 0.3,
            ease: "power2.out"
          })
        })
        
        videoRef.current.addEventListener('mouseleave', () => {
          gsap.to(playButton, {
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
          })
        })
      }
    }
    
    // Features list animation
    if (featuresRef.current) {
      const items = featuresRef.current.querySelectorAll('li')
      
      gsap.fromTo(items,
        { x: 20, opacity: 0 },
        { 
          x: 0, 
          opacity: 1, 
          stagger: 0.15,
          duration: 0.5,
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top bottom-=30",
            toggleActions: "play none none reverse"
          }
        }
      )
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  return (
    <div ref={sectionRef} id={id} className="py-20 md:py-32 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <h2 ref={headingRef} className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-6 text-white">
          Try <span className="font-aclonica">Fuzzify</span>
        </h2>

        {/* <div className="text-center max-w-2xl mx-auto mb-16">
          <p ref={subheadingRef} className="text-lg text-white/80">
            See how <span className="font-aclonica">Fuzzify</span> can identify and classify domain threats in real-time
          </p>
        </div> */}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card ref={card1Ref} className="border-primary/20 bg-white/10 backdrop-blur-md border border-white/10">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-xl sm:text-2xl md:text-3xl">
                <BarChart3 className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                Threat Classification Demo
              </CardTitle>
              <CardDescription className="text-white/60">
                Watch how <span className="font-aclonica">Fuzzify</span> analyzes and scores domain-based threats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div ref={videoRef} className="aspect-video bg-white/5 rounded-md flex items-center justify-center">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src="https://www.youtube.com/embed/T0IThoxi1rc" 
                  title="Fuzzify 2025 Capstone Video" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  referrerPolicy="strict-origin-when-cross-origin" 
                  allowFullScreen 
                ></iframe>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-center w-full">
            <Card ref={card2Ref} className="bg-white/10 backdrop-blur-md border border-white/10 max-w-xl w-full">
              <CardHeader>
                <CardTitle className="text-white text-center text-xl sm:text-2xl md:text-3xl">
                  Threat Dashboard
                </CardTitle>
                <CardDescription className="text-white/60 text-center">
                  Experience <span className="font-aclonica">Fuzzify</span> completely free
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-base text-white/80 text-center">
                  Our advanced threat dashboard provides comprehensive monitoring of potential domain imposters and classifies 
                  each threat on our proprietary risk scale.
                </p>
                <p className="text-base text-white/80 text-center">Features in the full application:</p>
                <ul ref={featuresRef} className="space-y-2 text-base text-white/80 max-w-md mx-auto">
                  <li className="flex items-start gap-2">
                    <Shield className="h-4 w-4 text-primary mt-0.5" />
                    <span>Domain Monitoring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-primary mt-0.5" />
                    <span>Impersonation Detection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <BarChart3 className="h-4 w-4 text-primary mt-0.5" />
                    <span>Risk Scoring</span>
                  </li>
                <li className="flex items-start gap-2">
                  <CalendarCheck className="h-4 w-4 text-primary mt-0.5" />
                  <span>Scheduling</span>
                </li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full bg-white text-[#17345A] hover:bg-white/90 transition-all duration-200">
                  <Link href={dashboardUrl} target="_blank" className="flex items-center justify-center">
                    <span>Launch Threat Dashboard</span>
                    <ExternalLink className="h-4 w-4 ml-2 relative -top-px" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

