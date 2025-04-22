"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import type { StaticImageData } from "next/image"
import Image from "next/image"
import { GradientText } from "@/components/ui/gradient-text"

interface StackSectionProps {
  id: string
}

interface TechItem {
  name: string
  image: string
  alt: string
}

export default function StackSection({ id }: StackSectionProps) {
  const [isInView, setIsInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  // Tech stack data
  const techStack: TechItem[] = [
    {
      name: "MySQL",
      image: "/MySQL Logo.png",
      alt: "MySQL Logo",
    },
    {
      name: "React",
      image: "/React-logo.png",
      alt: "React Logo",
    },
    {
      name: "Next.js",
      image: "/nextjs-logo.png",
      alt: "Next.js Logo",
    },
    {
      name: "Python",
      image: "/Python Logo.png",
      alt: "Python Logo",
    },
    {
      name: "Pub/Sub",
      image: "/google-cloud-pub-sub-logo.svg",
      alt: "Google Cloud Pub/Sub Logo",
    },
  ]

  return (
    <section 
      id={id} 
      className="min-h-[60vh] py-24 relative overflow-hidden bg-gradient-to-b from-background to-blue-dark/10"
    >
      {/* Background elements */}
      {/* <div className="absolute inset-0 -z-10 opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-light/20 rounded-full filter blur-[100px]"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-primary/20 rounded-full filter blur-[80px]"></div>
      </div> */}

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Tech Stack
          </h2>
          {/* <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powered by modern technologies to deliver exceptional performance and security
          </p> */}
        </div>

        <div
          ref={ref}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8 max-w-5xl mx-auto"
        >
          {techStack.map((tech, index) => (
            <div
              key={tech.name}
              className="relative group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                transform: isInView 
                  ? `translateY(${Math.sin((index * 0.5) + Date.now() / 5000) * 12}px)` 
                  : "translateY(40px)",
                opacity: isInView ? 1 : 0,
                transition: `transform 5s ease-in-out, opacity ${0.5 + index * 0.1}s ease-out ${index * 0.1}s`,
              }}
            >
              <div 
                className={`
                  flex flex-col items-center p-6 rounded-xl 
                  backdrop-blur-lg border border-white/10
                  ${hoveredIndex === index 
                    ? 'bg-gradient-to-b from-blue-medium/30 to-blue-dark/40' 
                    : 'bg-background/30'
                  }
                  transition-all duration-300 ease-in-out
                  hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30
                  transform hover:-translate-y-2
                `}
              >
                <div 
                  className="relative w-24 h-24 md:w-30 md:h-30 mb-4"
                  style={{
                    transform: hoveredIndex === index ? 'scale(1.1)' : 'scale(1)',
                    transition: 'transform 0.3s ease-out'
                  }}
                >
                  <Image
                    src={tech.image}
                    alt={tech.alt}
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <h3 className="text-lg font-semibold text-center text-foreground">{tech.name}</h3>
              </div>
              
              {/* Glowing effect */}
              {/* <div 
                className={`
                  absolute inset-0 -z-10 rounded-xl opacity-0 
                  bg-gradient-to-r from-primary/40 to-blue-medium/40 
                  filter blur-md
                  group-hover:opacity-70 transition-opacity duration-300
                `}
              ></div> */}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
