"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TechStackSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<HTMLDivElement[]>([])
  const [isClient, setIsClient] = useState(false)

  // Function to initialize animations
  const initAnimations = () => {
    // Clear any existing animations first
    cardRefs.current.forEach(card => {
      gsap.killTweensOf(card)
    })
    gsap.killTweensOf(titleRef.current)
    gsap.killTweensOf(sectionRef.current)
    
    // ScrollTrigger may not be registered yet
    if (!ScrollTrigger.getAll) {
      gsap.registerPlugin(ScrollTrigger)
    } else {
      // Clear existing ScrollTriggers for this section
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === titleRef.current || 
            trigger.vars.trigger === cardsRef.current ||
            trigger.vars.trigger === sectionRef.current) {
          trigger.kill()
        }
      })
    }

    // Reset styles to ensure clean animation
    gsap.set(titleRef.current, { clearProps: "all" })
    cardRefs.current.forEach(card => {
      gsap.set(card, { clearProps: "all" })
    })

    // Title animation
    gsap.fromTo(titleRef.current,
      { y: 50, opacity: 0 },
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

    // Cards animation with stagger
    if (cardRefs.current.length > 0) {
      gsap.fromTo(cardRefs.current,
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.2,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: cardsRef.current,
            start: "top bottom-=50",
            toggleActions: "play none none reverse"
          }
        }
      )
    }

    // Parallax effect for the entire section
    gsap.to(sectionRef.current, {
      backgroundPositionY: "30%",
      ease: "none",
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    })
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
    
    window.addEventListener('refreshAnimations', handleRefreshAnimations)
    
    return () => {
      window.removeEventListener('refreshAnimations', handleRefreshAnimations)
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === titleRef.current || 
            trigger.vars.trigger === cardsRef.current ||
            trigger.vars.trigger === sectionRef.current) {
          trigger.kill()
        }
      })
    }
  }, [])

  // Reset refs when coming back from presentation mode
  useEffect(() => {
    // Re-init animation when client-side rendering is confirmed
    if (isClient) {
      cardRefs.current = []
    }
  }, [isClient])

  // Add cards to refs
  const addToRefs = (el: HTMLDivElement) => {
    if (el && !cardRefs.current.includes(el)) {
      cardRefs.current.push(el)
    }
  }

  const technologies = [
    {
      category: "Core Technologies",
      items: [
        { name: "TODO", description: "TODO" },
        { name: "TODO", description: "TODO" },
        { name: "TODO", description: "TODO" },
        { name: "TODO", description: "TODO" },
      ],
    },
    {
      category: "Monitoring & Detection",
      items: [
        { name: "TODO", description: "TODO" },
        { name: "TODO", description: "TODO" },
        { name: "TODO", description: "TODO" },
        { name: "TODO", description: "TODO" },
      ],
    },
    {
      category: "User Interface & Reports",
      items: [
        { name: "TODO", description: "TODO" },
        { name: "TODO", description: "TODO" },
        { name: "TODO", description: "TODO" },
        { name: "TODO", description: "TODO" },
      ],
    },
  ]

  return (
    <div 
      ref={sectionRef} 
      className="py-20 md:py-32 px-6 md:px-10 relative"
    >
      <div className="max-w-7xl mx-auto">
        <h2 ref={titleRef} className="text-3xl md:text-4xl font-bold text-center mb-6 text-white">
          Technology Stack
        </h2>

        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-lg text-white/80">
            <span className="font-aclonica">Fuzzify</span> leverages cutting-edge technologies to provide industry-leading domain threat detection and classification
          </p>
        </div>

        <div ref={cardsRef} className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {technologies.map((tech, index) => (
            <Card 
              key={tech.category} 
              ref={addToRefs}
              className="overflow-hidden bg-white/10 backdrop-blur-md border border-white/10"
            >
              <CardHeader className="bg-white/5">
                <CardTitle className="text-white">
                  {tech.category}
                </CardTitle>
                <CardDescription className="text-white/60">Specialized technologies</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-4">
                  {tech.items.map((item) => (
                    <li key={item.name} className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-medium text-white border-white/20">
                          {item.name}
                        </Badge>
                      </div>
                      <p className="text-sm text-white/60">{item.description}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

