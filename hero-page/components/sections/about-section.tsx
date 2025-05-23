"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, AlertTriangle, BarChart3 } from "lucide-react"

interface AboutSectionProps {
  id?: string
}

export default function AboutSection({ id }: AboutSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const mainCardRef = useRef<HTMLDivElement>(null)
  const card1Ref = useRef<HTMLDivElement>(null)
  const card2Ref = useRef<HTMLDivElement>(null)
  const listItems1Ref = useRef<HTMLUListElement>(null)
  const listItems2Ref = useRef<HTMLUListElement>(null)
  const [isClient, setIsClient] = useState(false)
  
  // Function to initialize animations
  const initAnimations = () => {
    // Clear any existing animations first
    gsap.killTweensOf([titleRef.current, mainCardRef.current, card1Ref.current, card2Ref.current])
    
    // ScrollTrigger may not be registered yet
    if (!ScrollTrigger.getAll) {
      gsap.registerPlugin(ScrollTrigger)
    } else {
      // Clear existing ScrollTriggers for this section
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === titleRef.current || 
            trigger.vars.trigger === mainCardRef.current ||
            trigger.vars.trigger === card1Ref.current ||
            trigger.vars.trigger === listItems1Ref.current ||
            trigger.vars.trigger === listItems2Ref.current) {
          trigger.kill()
        }
      })
    }
    
    // Reset styles to ensure clean animation
    gsap.set([titleRef.current, mainCardRef.current, card1Ref.current, card2Ref.current], { clearProps: "all" })
    
    // Determine if on mobile - adjust animation parameters
    const isMobile = window.innerWidth < 768
    const startOffset = isMobile ? 50 : 100
    
    // Title animation
    gsap.fromTo(titleRef.current,
      { y: 40, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: isMobile ? 0.6 : 0.8,
        scrollTrigger: {
          trigger: titleRef.current,
          start: `top bottom-=${startOffset}`,
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
        duration: isMobile ? 0.6 : 0.8,
        scrollTrigger: {
          trigger: mainCardRef.current,
          start: `top bottom-=${startOffset / 2}`,
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
        stagger: isMobile ? 0.15 : 0.25,
        duration: isMobile ? 0.5 : 0.7,
        scrollTrigger: {
          trigger: card1Ref.current,
          start: `top bottom-=${startOffset / 2}`,
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
            stagger: isMobile ? 0.07 : 0.1,
            duration: isMobile ? 0.4 : 0.5,
            scrollTrigger: {
              trigger: listRef.current,
              start: `top bottom-=${startOffset / 3}`,
              toggleActions: "play none none reverse"
            }
          }
        )
      }
    }
    
    animateListItems(listItems1Ref)
    animateListItems(listItems2Ref)
  }
  
  // Initialize animations on mount and handle animation refresh
  useEffect(() => {
    setIsClient(true)
    
    // First init
    initAnimations()
    
    // Listen for the custom refresh event
    const handleRefreshAnimations = () => {
      // Re-initialize all animations
      setTimeout(() => {
        initAnimations()
      }, 50)
    }
    
    // Listen for resize to adjust animations
    const handleResize = () => {
      initAnimations()
    }
    
    window.addEventListener('refreshAnimations', handleRefreshAnimations)
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('refreshAnimations', handleRefreshAnimations)
      window.removeEventListener('resize', handleResize)
      
      // Clean up ScrollTriggers for this section only
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === titleRef.current || 
            trigger.vars.trigger === mainCardRef.current ||
            trigger.vars.trigger === card1Ref.current ||
            trigger.vars.trigger === listItems1Ref.current ||
            trigger.vars.trigger === listItems2Ref.current) {
          trigger.kill()
        }
      })
    }
  }, [])

  return (
    <div ref={sectionRef} id={id} className="py-20 md:py-32 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <h2 ref={titleRef} className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-10 sm:mb-16 text-white">
          About <span className="font-aclonica">Fuzzify</span>
        </h2>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card ref={mainCardRef} className="border-primary/20 bg-white/10 backdrop-blur-md border border-white/10">
            <CardHeader className="pb-2 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-white text-xl sm:text-2xl md:text-3xl">
                <Shield className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                What is <span className="font-aclonica">Fuzzify</span>?
              </CardTitle>
              <CardDescription className="text-white/70 text-base sm:text-lg">Protecting your brand from domain impersonation threats</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1.5 sm:space-y-2 text-base sm:text-lg text-white/80">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span>Powerful domain security platform that identifies potential lookalike domains</span>
                </li>
                <li className="flex items-start gap-2">  
                  <span className="text-primary font-bold">•</span>
                  <span>Advanced DNS fuzzing engine to detect domain variations used for phishing or brand impersonation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>  
                  <span>Continuous domain monitoring and detailed risk assessments</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:gap-6">
            <Card ref={card1Ref} className="bg-white/10 backdrop-blur-md border border-white/10">
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl md:text-2xl">
                  <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  Threat Detection  
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul ref={listItems1Ref} className="space-y-1.5 sm:space-y-2 text-base sm:text-lg text-white/80">
                  {/* <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Finds active lookalikes of your domain</span>
                  </li> */}
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Finds active permutations of your domain</span>  
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card ref={card2Ref} className="bg-white/10 backdrop-blur-md border border-white/10">
              <CardHeader className="pb-2 sm:pb-4"> 
                <CardTitle className="text-white flex items-center gap-2 text-lg sm:text-xl md:text-2xl">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  Risk Scoring
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul ref={listItems2Ref} className="space-y-1.5 sm:space-y-2 text-base sm:text-lg text-white/80">  
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Compares the potential lookalikes to the original domain</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">•</span>
                    <span>Rates the risk of impersonation based on similarity and threat level</span>
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

