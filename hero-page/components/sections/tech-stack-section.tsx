"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TechStackSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

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

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

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
        { name: "DNS Analysis Engine", description: "Custom domain analysis algorithms" },
        { name: "Machine Learning", description: "Intelligent threat pattern recognition" },
        { name: "Python", description: "Core fuzzing and analysis algorithms" },
        { name: "Elasticsearch", description: "High-speed threat data storage and query" },
      ],
    },
    {
      category: "Monitoring & Detection",
      items: [
        { name: "Domain Registration API", description: "Real-time domain monitoring" },
        { name: "NLP Processing", description: "Text similarity and pattern matching" },
        { name: "Computer Vision", description: "Visual similarity detection" },
        { name: "Threat Intelligence", description: "Integration with global threat databases" },
      ],
    },
    {
      category: "User Interface & Reports",
      items: [
        { name: "Next.js Dashboard", description: "Real-time threat monitoring UI" },
        { name: "Data Visualization", description: "Comprehensive threat reporting" },
        { name: "Alert System", description: "Multi-channel notification system" },
        { name: "Threat Scoring API", description: "Categorizes threats by severity level" },
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

