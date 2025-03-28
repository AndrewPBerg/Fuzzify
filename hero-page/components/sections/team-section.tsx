"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Github, Linkedin, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TeamMember {
  name: string
  role: string
  avatar: string
  bio: string
  social: {
    github?: string
    twitter?: string
    linkedin?: string
  }
}

export default function TeamSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const cardContainerRef = useRef<HTMLDivElement>(null)
  const memberRefs = useRef<HTMLDivElement[]>([])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    // Title and subtitle animations
    gsap.fromTo([titleRef.current, subtitleRef.current],
      { y: 50, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.8,
        stagger: 0.2,
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top bottom-=100",
          toggleActions: "play none none reverse"
        }
      }
    )

    // Member cards animation with stagger
    if (memberRefs.current.length > 0) {
      gsap.fromTo(memberRefs.current,
        { y: 80, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.7,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: cardContainerRef.current,
            start: "top bottom-=50",
            toggleActions: "play none none reverse"
          }
        }
      )
    }

    // Avatars hover effect
    memberRefs.current.forEach((card) => {
      const avatar = card.querySelector('.avatar-container')
      
      if (avatar) {
        card.addEventListener('mouseenter', () => {
          gsap.to(avatar, {
            y: -10,
            scale: 1.05,
            duration: 0.3,
            ease: "power2.out"
          })
        })
        
        card.addEventListener('mouseleave', () => {
          gsap.to(avatar, {
            y: 0,
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
          })
        })
      }
    })

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill())
    }
  }, [])

  // Add team members to refs
  const addToRefs = (el: HTMLDivElement) => {
    if (el && !memberRefs.current.includes(el)) {
      memberRefs.current.push(el)
    }
  }

  const team: TeamMember[] = [
    {
      name: "Alex Johnson",
      role: "Founder & DNS Expert",
      avatar: "/placeholder-user.jpg",
      bio: "Former ICANN security advisor with 15+ years in domain security and DNS infrastructure protection.",
      social: {
        github: "https://github.com",
        twitter: "https://twitter.com",
        linkedin: "https://linkedin.com",
      },
    },
    {
      name: "Sarah Chen",
      role: "Chief Threat Intelligence",
      avatar: "/placeholder-user.jpg",
      bio: "Previously led threat detection at Cloudflare, specializing in domain-based attack vectors and phishing prevention.",
      social: {
        github: "https://github.com",
        linkedin: "https://linkedin.com",
      },
    },
    {
      name: "Michael Rodriguez",
      role: "Machine Learning Lead",
      avatar: "/placeholder-user.jpg",
      bio: "PhD in AI Security, developed pattern recognition systems for identifying lookalike domains and predicting threat levels.",
      social: {
        github: "https://github.com",
        twitter: "https://twitter.com",
      },
    },
    {
      name: "Emma Wilson",
      role: "Threat Classification Expert",
      avatar: "/placeholder-user.jpg",
      bio: "Former cybersecurity analyst who specialized in developing risk scoring models for phishing domains and attack campaigns.",
      social: {
        github: "https://github.com",
        twitter: "https://twitter.com",
        linkedin: "https://linkedin.com",
      },
    },
  ]

  return (
    <div ref={sectionRef} className="py-20 md:py-32 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <h2 ref={titleRef} className="text-3xl md:text-4xl font-bold text-center mb-6 text-white">
          Our Experts
        </h2>

        <div className="text-center max-w-2xl mx-auto mb-16">
          <p ref={subtitleRef} className="text-lg text-white/80">
            Meet the specialists who built <span className="font-aclonica">Fuzzify</span>'s threat detection and classification engine
          </p>
        </div>

        <div ref={cardContainerRef} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member, index) => (
            <Card 
              key={member.name} 
              ref={addToRefs}
              className="overflow-hidden bg-white/10 backdrop-blur-md border border-white/10 team-card"
            >
              <CardHeader className="p-0">
                <div className="aspect-square w-full bg-white/5 flex items-center justify-center avatar-container">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={member.avatar} alt={member.name} loading="lazy" />
                    <AvatarFallback className="bg-white/10 text-white">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <h3 className="font-bold text-lg text-white">
                    {member.name}
                  </h3>
                  <p className="text-sm text-white/60">{member.role}</p>
                </div>
                <p className="text-sm text-white/80">{member.bio}</p>
              </CardContent>
              <CardFooter className="flex justify-center gap-2 pt-0">
                {member.social.github && (
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <a href={member.social.github} target="_blank" rel="noopener noreferrer">
                      <Github className="h-4 w-4" />
                      <span className="sr-only">GitHub</span>
                    </a>
                  </Button>
                )}
                {member.social.twitter && (
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <a href={member.social.twitter} target="_blank" rel="noopener noreferrer">
                      <Twitter className="h-4 w-4" />
                      <span className="sr-only">Twitter</span>
                    </a>
                  </Button>
                )}
                {member.social.linkedin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-4 w-4" />
                      <span className="sr-only">LinkedIn</span>
                    </a>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

