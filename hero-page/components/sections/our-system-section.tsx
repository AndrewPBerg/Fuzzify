"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, ScanText, Image, ShieldCheck, ArrowRight } from "lucide-react"
import { motion } from "motion/react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface OurSystemSectionProps {
  id: string
}

interface SystemStep {
  icon: React.ReactNode
  title: string
  step: number
}

export default function OurSystemSection({ id }: OurSystemSectionProps) {
  const [activeStep, setActiveStep] = useState<number | null>(null)
  const [showConnections, setShowConnections] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      // Reset animation sequence
      setActiveStep(null)
      setShowConnections(false)
      
      // Animate steps appearing one by one
      const stepNumbers = [1, 2, 3, 4];
      stepNumbers.forEach((step: number, index: number) => {
        setTimeout(() => {
          setActiveStep(step)
        }, index * 400)
      })
      
      // Show connections after all steps are added
      setTimeout(() => {
        setShowConnections(true)
      }, stepNumbers.length * 400 + 300)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])
  
  const steps: SystemStep[] = [
    {
      icon: <Search className="h-10 w-10 text-primary" />,
      title: "Generate & Find",
      step: 1
    },
    {
      icon: <ScanText className="h-10 w-10 text-primary" />,
      title: "Code Comparison",
      step: 2
    },
    {
      icon: <Image className="h-10 w-10 text-primary" />,
      title: "Visual Check",
      step: 3
    },
    {
      icon: <ShieldCheck className="h-10 w-10 text-primary" />,
      title: "Rank Threat",
      step: 4
    }
  ]
  
  return (
    <div id={id} className="py-20 md:py-32 px-6 md:px-10">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-12 sm:mb-16 text-white">
          How <span className="font-aclonica">Fuzzify</span> Works
        </h2>
        
        <div className="relative py-10 md:py-16 overflow-hidden">
          {/* Background element */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 -z-10"></div>
          
          {/* Flow diagram */}
          <div className="relative flex flex-col md:flex-row items-center justify-center gap-6 md:gap-3 min-h-[300px] px-4 md:px-10">
            {steps.map((step, index) => (
              <React.Fragment key={step.step}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={activeStep !== null && activeStep >= step.step ? { 
                          opacity: 1,
                          scale: 1,
                        } : { opacity: 0, scale: 0 }}
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: "0 0 15px rgba(255, 255, 255, 0.3)",
                          transition: { duration: 0.2 }
                        }}
                        transition={{ 
                          duration: 0.5, 
                          type: "spring", 
                          stiffness: 200,
                          damping: 20
                        }}
                        className="relative z-10 flex flex-col items-center justify-center w-36 h-32 md:w-48 md:h-40 bg-blue-dark/80 backdrop-blur-md rounded-xl shadow-lg border-2 border-white/20 cursor-pointer"
                      >
                        <div className="absolute -top-3 -right-3 flex items-center justify-center w-8 h-8 text-xs font-bold text-white bg-primary rounded-full border border-white/30">
                          {step.step}
                        </div>
                        {step.icon}
                        <span className="mt-3 text-sm md:text-base font-medium text-white text-center px-2">{step.title}</span>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-blue-dark/90 backdrop-blur-md border border-white/20 text-white">
                      <p>Step {step.step}: {step.title}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {/* Arrow between steps (except after the last step) */}
                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={showConnections ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
                    transition={{ 
                      duration: 0.4,
                      delay: 0.2,
                      type: "spring"
                    }}
                    className="hidden md:flex items-center justify-center z-10"
                  >
                    <ArrowRight className="h-10 w-10 text-primary" />
                  </motion.div>
                )}
                
                {/* Vertical arrow for mobile */}
                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={showConnections ? { opacity: 1, scaleY: 1 } : { opacity: 0, scaleY: 0 }}
                    transition={{ 
                      duration: 0.4,
                      delay: 0.2
                    }}
                    className="flex md:hidden items-center justify-center h-8 z-10"
                    style={{ transformOrigin: "center top" }}
                  >
                    <div className="w-0.5 h-full bg-primary rounded-full"></div>
                  </motion.div>
                )}
              </React.Fragment>
            ))}
          </div>
          
          {/* Floating elements for visual flair */}
          <motion.div
            animate={{
              y: [0, -10, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="absolute top-20 left-[10%] w-12 h-12 rounded-full bg-primary/30 blur-xl -z-5"
          />
          
          <motion.div
            animate={{
              y: [0, 10, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="absolute bottom-20 right-[15%] w-16 h-16 rounded-full bg-blue-medium/20 blur-xl -z-5"
          />
        </div>
      </div>
    </div>
  )
} 