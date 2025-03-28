"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"

export default function ProductSection() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const deviceRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simple fade-in animations using Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in")
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 },
    )

    if (titleRef.current) observer.observe(titleRef.current)
    if (textRef.current) observer.observe(textRef.current)
    if (deviceRef.current) observer.observe(deviceRef.current)

    return () => {
      if (titleRef.current) observer.unobserve(titleRef.current)
      if (textRef.current) observer.unobserve(textRef.current)
      if (deviceRef.current) observer.unobserve(deviceRef.current)
    }
  }, [])

  return (
    <section className="py-20 md:py-32 px-6 md:px-10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div>
            <h2 ref={titleRef} className="text-3xl md:text-4xl font-bold text-white mb-6 opacity-0">
              Seamless Experience Across All Devices
            </h2>
            <div ref={textRef} className="opacity-0">
              <p className="text-white/80 mb-6 leading-relaxed">
                Our design system ensures that your content looks stunning and performs flawlessly on every device, from
                desktop to mobile.
              </p>
              <p className="text-white/80 mb-8 leading-relaxed">
                With responsive animations and adaptive layouts, users will enjoy a consistent experience regardless of
                their screen size.
              </p>
              <button className="bg-white text-[#17345A] px-6 py-3 rounded-full font-medium hover:bg-white/90 transition-colors">
                Explore Products
              </button>
            </div>
          </div>

          <div className="relative">
            <div ref={deviceRef} className="relative mx-auto opacity-0" style={{ perspective: "1000px" }}>
              <div
                className="relative w-full max-w-md mx-auto rounded-[2.5rem] border-[8px] border-[#17345A] overflow-hidden shadow-2xl"
                style={{ transform: "rotateY(-5deg) rotateX(5deg)" }}
              >
                <div className="aspect-[9/16] bg-[#17345A]">
                  <Image
                    src="/placeholder.svg?height=800&width=450"
                    alt="Device mockup"
                    width={450}
                    height={800}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-gradient-to-r from-[#788EAC]/30 to-transparent blur-xl"></div>
              <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full bg-gradient-to-l from-[#4D6A8F]/40 to-transparent blur-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

