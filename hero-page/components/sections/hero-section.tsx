"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { GradientText } from "@/components/ui/gradient-text"
import { Shield } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

interface HeroSectionProps {
  id?: string
}

export default function HeroSection({ id }: HeroSectionProps) {
  const [isMounted, setIsMounted] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subheadingRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const hotspot1Ref = useRef<HTMLDivElement>(null)
  const hotspot2Ref = useRef<HTMLDivElement>(null)
  const shieldRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger)
    setIsMounted(true)

    // GSAP timeline for entrance animations
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } })
    
    tl.set([headingRef.current, subheadingRef.current, ctaRef.current, imageRef.current], { 
      opacity: 0,
    })
    
    tl.fromTo(headingRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, delay: 0.2 }
    )
      .fromTo(subheadingRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.4"
      )
      .fromTo(ctaRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        "-=0.4"
      )
      .fromTo(imageRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1 },
        "-=0.6"
      )

    // Shield pulsing animation
    if (shieldRef.current) {
      gsap.to(shieldRef.current, {
        scale: 1.05,
        opacity: 0.8,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      })
    }
    
    // Hotspot animations
    gsap.fromTo([hotspot1Ref.current, hotspot2Ref.current],
      { scale: 0, opacity: 0 },
      { 
        scale: 1, 
        opacity: 1, 
        duration: 0.4, 
        stagger: 0.2,
        delay: 1.2,
        ease: "back.out(1.7)"
      }
    )

    // Parallax effect for image
    if (imageRef.current && sectionRef.current) {
      gsap.to(imageRef.current, {
        y: "20%",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true
        }
      })
    }

    return () => {
      // Clean up ScrollTrigger
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  // Mouse follow effect for the shield background
  useEffect(() => {
    if (!isMounted) return
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!imageRef.current) return
      
      // Don't apply effect on mobile devices with touch
      if (window.matchMedia('(max-width: 768px)').matches) return
      
      const rect = imageRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      // Calculate distance from center (normalized)
      const moveX = (e.clientX - centerX) / window.innerWidth * 15
      const moveY = (e.clientY - centerY) / window.innerHeight * 15
      
      gsap.to(imageRef.current, {
        rotationY: moveX,
        rotationX: -moveY,
        transformPerspective: 1000,
        duration: 1.5,
        ease: "power2.out"
      })
    }
    
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [isMounted])

  return (
    <div ref={sectionRef} id={id} className="min-h-[90vh] sm:min-h-screen flex flex-col justify-center pt-20 pb-10 px-4 sm:px-6 md:px-10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 lg:gap-20 items-center">
        <div className="order-2 md:order-1 mt-8 md:mt-0">
          <h1
            ref={headingRef}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight"
          >
            <GradientText className="font-aclonica">Fuzzify</GradientText>
            <span className="text-white block mt-2">Find Your Domain Doppelgänger</span>
          </h1>
          <p
            ref={subheadingRef}
            className="mt-4 sm:mt-6 text-xl sm:text-2xl md:text-3xl text-white/80 max-w-lg leading-relaxed"
          >
            Fuzzify protects your website from phishing and impersonation attacks by rating impersonation sites.
          </p>
          <div 
            ref={ctaRef} 
            className="mt-6 sm:mt-8 md:mt-10 flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4"
          >
          </div>
        </div>

        <div ref={imageRef} className="order-1 md:order-2 relative flex justify-center">
          <div className="relative w-full max-w-[80%] sm:max-w-[70%] md:max-w-md aspect-square transform-3d">
            <div className="absolute inset-0 bg-gradient-to-br from-[#788EAC]/30 to-[#17345A]/30 rounded-3xl backdrop-blur-sm border border-white/20"></div>
            <div ref={shieldRef} className="absolute inset-0 flex items-center justify-center">
              <Shield className="w-3/5 h-3/5 text-[#14B8A6]/70" />
            </div>

            {/* Interactive hotspots */}
            <div className="hidden sm:flex">
              <div ref={hotspot1Ref} className="absolute top-1/4 left-1/4 w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center cursor-pointer group">
                <span className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-primary group-hover:animate-pulse"></span>
                <div className="absolute left-full ml-2 bg-background/90 backdrop-blur-sm p-2 rounded text-sm w-32 sm:w-40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Real-time domain monitoring and alerts
                </div>
              </div>

              <div ref={hotspot2Ref} className="absolute bottom-1/4 right-1/4 w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center cursor-pointer group">
                <span className="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-primary group-hover:animate-pulse"></span>
                <div className="absolute right-full mr-2 bg-background/90 backdrop-blur-sm p-2 rounded text-sm w-32 sm:w-40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Advanced Algorithmic Threat Detection
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

