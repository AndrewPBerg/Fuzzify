"use client"

import { useEffect, useRef } from "react"
import { Layers, Zap, Shield, Sparkles } from "lucide-react"

const features = [
  {
    icon: Layers,
    title: "Parallax Depth",
    description: "Create immersive experiences with multi-layered parallax effects that respond to user scrolling.",
  },
  {
    icon: Zap,
    title: "GSAP Animations",
    description: "Leverage the power of GSAP for smooth, high-performance animations that enhance user engagement.",
  },
  {
    icon: Shield,
    title: "Optimized Performance",
    description: "Enjoy silky-smooth interactions without sacrificing loading times or device compatibility.",
  },
  {
    icon: Sparkles,
    title: "Modern Aesthetics",
    description: "Embrace Apple-inspired design principles with clean typography and thoughtful white space.",
  },
]

export default function FeaturesSection() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const featureRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    // Simple fade-in animation for title
    if (titleRef.current) {
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

      observer.observe(titleRef.current)

      return () => {
        if (titleRef.current) observer.unobserve(titleRef.current)
      }
    }
  }, [])

  useEffect(() => {
    // Simple fade-in animation for features
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

    featureRefs.current.forEach((feature) => {
      if (feature) observer.observe(feature)
    })

    return () => {
      featureRefs.current.forEach((feature) => {
        if (feature) observer.unobserve(feature)
      })
    }
  }, [])

  return (
    <section className="py-20 md:py-32 px-6 md:px-10 relative">
      <div className="max-w-7xl mx-auto">
        <h2 ref={titleRef} className="text-3xl md:text-4xl font-bold text-white text-center mb-16 opacity-0">
          Designed for Modern Experiences
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              ref={(el) => (featureRefs.current[index] = el)}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all hover:translate-y-[-5px] group opacity-0"
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#788EAC] to-[#17345A] flex items-center justify-center mb-5">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-white/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

