"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface FuzzedDomain {
  domainName: string;
  fuzzMethod?: string;
  registered?: boolean;
}

interface DNSFuzzVisualizerProps {
  originalDomain: string;
  fuzzedDomains: FuzzedDomain[];
  className?: string;
}

export function DNSFuzzVisualizer({ 
  originalDomain, 
  fuzzedDomains,
  className
}: DNSFuzzVisualizerProps) {
  const [domains, setDomains] = useState<FuzzedDomain[]>([]);
  const [showEdges, setShowEdges] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  // Calculate positions for the nodes
  const calculateNodePositions = (index: number, total: number, radius: number) => {
    // For mobile, use a smaller and more vertical layout
    const adjustedRadius = isMobile 
      ? { x: radius * 0.6, y: radius * 0.9 }  // Elliptical shape on mobile
      : { x: radius, y: radius };             // Circular on larger screens
    
    // Calculate positions in a circular arrangement
    const angle = (index / total) * 2 * Math.PI;
    const x = adjustedRadius.x * Math.cos(angle);
    const y = adjustedRadius.y * Math.sin(angle);
    
    return { x, y };
  };
  
  // Animate domains appearing one by one
  useEffect(() => {
    const timer = setTimeout(() => {
      setDomains([]);
      setShowEdges(false);
      
      // Add domains one by one with a delay
      fuzzedDomains.forEach((domain, index) => {
        setTimeout(() => {
          setDomains(prev => [...prev, domain]);
        }, index * 120); // Staggered animation delay
      });
      
      // Show edges after all domains are added
      setTimeout(() => {
        setShowEdges(true);
      }, fuzzedDomains.length * 120 + 300);
      
    }, 500); // Initial delay
    
    return () => clearTimeout(timer);
  }, [fuzzedDomains]);
  
  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative w-full aspect-[1.5/2] sm:aspect-[2/1] md:aspect-[3/2] max-h-[350px] sm:max-h-[400px] flex items-center justify-center mt-3 sm:mt-6", 
        className
      )}
    >
      {/* Central node (original domain) */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.5, 
          type: "spring", 
          stiffness: 200 
        }}
        className="absolute z-10 flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 text-[11px] sm:text-xs md:text-sm font-bold text-white bg-emerald-600 rounded-full shadow-lg border-2 border-white/30"
      >
        {originalDomain}
      </motion.div>
      
      {/* Fuzzed domain nodes */}
      {domains.map((domain, index) => {
        const radius = isMobile ? 130 : 175;
        const position = calculateNodePositions(index, fuzzedDomains.length, radius);
        
        return (
          <TooltipProvider key={domain.domainName}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    x: position.x, 
                    y: position.y 
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    boxShadow: "0 0 15px rgba(255, 255, 255, 0.3)",
                    transition: { duration: 0.2 }
                  }}
                  transition={{ 
                    duration: 0.7, 
                    type: "spring", 
                    stiffness: 100,
                    damping: 10
                  }}
                  className={cn(
                    "absolute z-10 flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 md:w-22 md:h-22 text-[9px] sm:text-[10px] md:text-xs font-medium text-white rounded-full shadow-md backdrop-blur-sm cursor-pointer border border-white/20",
                    domain.registered ? "bg-blue-dark" : "bg-blue-medium"
                  )}
                >
                  {domain.domainName}
                </motion.div>
              </TooltipTrigger>
              <TooltipContent className="bg-blue-dark/90 backdrop-blur-md border border-white/20 text-white text-xs sm:text-sm">
                <p><strong>Domain:</strong> {domain.domainName}</p>
                {domain.fuzzMethod && (
                  <p><strong>Method:</strong> {domain.fuzzMethod}</p>
                )}
                <p><strong>Status:</strong> {domain.registered ? "Registered" : "Available"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
      
      {/* Connection lines */}
      <svg className="absolute w-full h-full pointer-events-none top-0 left-0">
        <g className="translate-x-1/2 translate-y-1/2">
          {/* Lines from center to each node */}
          {domains.map((domain, index) => {
            const radius = isMobile ? 130 : 175;
            const position = calculateNodePositions(index, fuzzedDomains.length, radius);
            
            return (
              <motion.line
                key={`center-${domain.domainName}`}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.85 }}
                transition={{ duration: 0.8, delay: index * 0.12 }}
                x1="0"
                y1="0"
                x2={position.x}
                y2={position.y}
                stroke={domain.registered ? "#17345A" : "#4D6A8F"}
                strokeWidth={isMobile ? "1.5" : "2"}
                strokeDasharray="4 2"
              />
            );
          })}
          
          {/* Lines between adjacent nodes */}
          {showEdges && domains.length > 1 && domains.map((domain, index) => {
            const radius = isMobile ? 130 : 175;
            const currentPosition = calculateNodePositions(index, fuzzedDomains.length, radius);
            const nextIndex = (index + 1) % domains.length;
            const nextPosition = calculateNodePositions(nextIndex, fuzzedDomains.length, radius);
            
            return (
              <motion.line
                key={`edge-${index}-${nextIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.9 }}
                transition={{ duration: 0.5 }}
                x1={currentPosition.x}
                y1={currentPosition.y}
                x2={nextPosition.x}
                y2={nextPosition.y}
                stroke={domain.registered ? "#17345A" : "#4D6A8F"}
                strokeWidth={isMobile ? "1.5" : "2.5"}
                strokeDasharray="5 3"
              />
            );
          })}
        </g>
      </svg>

      {/* Create a visual debug node to ensure the diagram is rendered */}
      {showEdges && domains.length > 1 && (
        <div className="absolute right-2 bottom-2 w-0 h-0 opacity-0">
          Debug node to trigger rendering
        </div>
      )}
    </div>
  );
}

// Example usage in other components:
/*
import { DNSFuzzVisualizer } from '@/components/diagrams/dns-fuzzing-diagram';

export default function DNSFuzzingExample() {
  const sampleData = {
    originalDomain: "example.com",
    fuzzedDomains: [
      { domainName: "examp1e.com", fuzzMethod: "homoglyph", registered: true },
      { domainName: "example.net", fuzzMethod: "TLD swap", registered: true },
      { domainName: "exampl3.com", fuzzMethod: "homoglyph", registered: false },
      { domainName: "example-secure.com", fuzzMethod: "addition", registered: false },
      { domainName: "examplecom.co", fuzzMethod: "TLD addition", registered: true },
      { domainName: "exarnple.com", fuzzMethod: "homoglyph", registered: true },
      { domainName: "example.org", fuzzMethod: "TLD swap", registered: false },
      { domainName: "exampie.com", fuzzMethod: "typo", registered: true },
    ]
  };

  return (
    <div className="p-8">
      <h2 className="mb-8 text-2xl font-bold">DNS Fuzzing Visualization</h2>
      <DNSFuzzVisualizer 
        originalDomain={sampleData.originalDomain} 
        fuzzedDomains={sampleData.fuzzedDomains} 
      />
    </div>
  );
}
*/
