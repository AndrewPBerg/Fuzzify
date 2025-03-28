"use client"

import { useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function ContactSection() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)

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
    if (formRef.current) observer.observe(formRef.current)
    if (footerRef.current) observer.observe(footerRef.current)

    return () => {
      if (titleRef.current) observer.unobserve(titleRef.current)
      if (formRef.current) observer.unobserve(formRef.current)
      if (footerRef.current) observer.unobserve(footerRef.current)
    }
  }, [])

  return (
    <section className="py-20 md:py-32 px-6 md:px-10 relative">
      <div className="max-w-3xl mx-auto">
        <h2 ref={titleRef} className="text-3xl md:text-4xl font-bold text-white text-center mb-10 opacity-0">
          Get in Touch
        </h2>

        <form
          ref={formRef}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/10 mb-16 opacity-0"
        >
          <div className="grid gap-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-white/80">
                  Name
                </label>
                <Input
                  id="name"
                  placeholder="Your name"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#788EAC]"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-white/80">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Your email"
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#788EAC]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium text-white/80">
                Subject
              </label>
              <Input
                id="subject"
                placeholder="How can we help?"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#788EAC]"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium text-white/80">
                Message
              </label>
              <Textarea
                id="message"
                placeholder="Your message"
                className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#788EAC]"
              />
            </div>
            <Button className="bg-white text-[#17345A] hover:bg-white/90 w-full">Send Message</Button>
          </div>
        </form>

        <footer ref={footerRef} className="text-center text-white/60 text-sm opacity-0">
          <p>© {new Date().getFullYear()} Parallax Design. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>
        </footer>
      </div>
    </section>
  )
}

