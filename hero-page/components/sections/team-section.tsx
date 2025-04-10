"use client"

import { useEffect, useRef, useState } from "react"
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

interface TeamSectionProps {
  id?: string
}

export default function TeamSection({ id }: TeamSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const cardContainerRef = useRef<HTMLDivElement>(null)
  const memberRefs = useRef<HTMLDivElement[]>([])
  const [isClient, setIsClient] = useState(false)

  // Function to initialize animations
  const initAnimations = () => {
    // Clear any existing animations first
    gsap.killTweensOf([titleRef.current, subtitleRef.current])
    memberRefs.current.forEach(card => {
      gsap.killTweensOf(card)
    })
    
    // ScrollTrigger may not be registered yet
    if (!ScrollTrigger.getAll) {
      gsap.registerPlugin(ScrollTrigger)
    } else {
      // Clear existing ScrollTriggers for this section
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === titleRef.current || 
            trigger.vars.trigger === subtitleRef.current ||
            trigger.vars.trigger === cardContainerRef.current ||
            trigger.vars.trigger === sectionRef.current) {
          trigger.kill()
        }
      })
    }
    
    // Reset styles to ensure clean animation
    gsap.set([titleRef.current, subtitleRef.current], { clearProps: "all" })
    memberRefs.current.forEach(card => {
      gsap.set(card, { clearProps: "all" })
    })

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
      
      // Clean up ScrollTriggers for this section only
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === titleRef.current || 
            trigger.vars.trigger === subtitleRef.current ||
            trigger.vars.trigger === cardContainerRef.current ||
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
      memberRefs.current = []
    }
  }, [isClient])

  // Add team members to refs
  const addToRefs = (el: HTMLDivElement) => {
    if (el && !memberRefs.current.includes(el)) {
      memberRefs.current.push(el)
    }
  }

  const team: TeamMember[] = [
    {
      name: "Andrew Berg",
      role: "B.A. Computer Science",
      avatar: "andrew-fuzzify-team.jpg",
      bio: "",
      social: {
        github: "https://github.com/AndrewPBerg",
        linkedin: "https://www.linkedin.com/in/andrew-berg-0822132b2/",
      },
    },
    {
      name: "Laura Zalewska",
      role: "B.S. Computer Science",
      avatar: "laura-fuzzify-team.png",
      bio: "",
      social: {
        github: "https://github.com/laurazal",
        linkedin: "https://www.linkedin.com/in/laura-zalewska-3b0410304/",
      },
    },
    {
      name: "Joseph Heindel",
      role: "B.A. Computer Science",
      avatar: "joeseph-fuzzify-team.png",
      bio: "",
      social: {
        github: "https://github.com/jheindel525",
        linkedin: "https://www.linkedin.com/in/heindeljah/",
      },
    },
    {
      name: "Mia Glover",
      role: "B.S. Data Science",
      avatar: "mia-fuzzify-team2.jpg",
      bio: "",
      social: {
        github: "https://github.com/miahamm44",
        linkedin: "https://www.linkedin.com/in/mia-glover-3222ba24b/",
      },
    },
    
  ]

  return (
    <div ref={sectionRef} id={id} className="py-20 md:py-32 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <h2 ref={titleRef} className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-6 text-white">
          Our Experts
        </h2>
{/* 
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p ref={subtitleRef} className="text-lg text-white/80">
            Meet the specialists who built <span className="font-aclonica">Fuzzify</span>
          </p>
        </div> */}

        <div ref={cardContainerRef} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {team.map((member, index) => (
            <Card 
              key={member.name} 
              ref={addToRefs}
              className="overflow-hidden bg-white/10 backdrop-blur-md border border-white/10 team-card"
            >
              <CardHeader className="p-0">
                <div className="aspect-square w-full bg-white/5 flex items-center justify-center">
                  <Avatar className="h-64 w-64 rounded Avatar-image">
                    <AvatarImage src={member.avatar} alt={member.name} loading="lazy" className="object-cover" />
                    <AvatarFallback className="bg-white/10 text-white rounded-none">
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
                <p className="text-sm text-center text-white/80">{member.bio}</p>
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

