"use client"

import { useState, useEffect } from "react"
import { motion } from "motion/react"
import { Code, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface SimilarityData {
  type: "code" | "visual";
  percentage: number;
  icon: React.ReactNode;
}

export default function FuzzyHashingDiagram() {
  const [showConnections, setShowConnections] = useState(false);
  const [showScores, setShowScores] = useState(false);
  
  const similarityData: SimilarityData[] = [
    {
      type: "code",
      percentage: 85,
      icon: <Code className="h-5 w-5 text-white" />
    },
    {
      type: "visual",
      percentage: 70,
      icon: <ImageIcon className="h-5 w-5 text-white" />
    }
  ];
  
  // Animation sequence
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setShowConnections(true);
      
      const timer2 = setTimeout(() => {
        setShowScores(true);
      }, 600);
      
      return () => clearTimeout(timer2);
    }, 800);
    
    return () => clearTimeout(timer1);
  }, []);
  
  return (
    <div className="relative w-full max-h-[450px] mt-6 flex flex-col items-center">
      {/* Nodes Container - Flex row for side by side layout */}
      <div className="flex justify-center items-center w-full gap-4 md:gap-8 mb-10 md:mb-12">
        {/* Original Site Node */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.5, 
            type: "spring", 
            stiffness: 200 
          }}
          className="flex flex-col w-36 h-36 md:w-44 md:h-44 text-white bg-emerald-600 rounded-2xl shadow-lg border-2 border-white/30"
        >
          <div className="h-full w-full p-4 flex flex-col">
            <div className="text-xs md:text-sm font-bold mb-2 text-center">Original</div>
            <div className="flex-1 bg-white/10 rounded-lg p-3 flex flex-col space-y-3">
              {/* Header-like element */}
              <div className="h-2.5 bg-white/60 rounded-full w-full"></div>
              
              {/* Logo and navigation-like elements */}
              <div className="flex justify-between items-center">
                <div className="h-4 w-4 bg-white/80 rounded-sm"></div>
                <div className="flex space-x-1.5">
                  <div className="h-2.5 w-6 bg-white/60 rounded-full"></div>
                  <div className="h-2.5 w-6 bg-white/60 rounded-full"></div>
                </div>
              </div>
              
              {/* Main content */}
              <div className="h-2.5 bg-white/40 rounded-full w-11/12"></div>
              <div className="h-2.5 bg-white/40 rounded-full w-full"></div>
              
              {/* Button-like element */}
              <div className="self-start h-3 w-8 bg-white/70 rounded-md"></div>
            </div>
          </div>
        </motion.div>
        
        {/* Connection Line - Only visible when showConnections is true */}
        {showConnections && (
          <motion.div 
            initial={{ opacity: 0, width: 0 }} 
            animate={{ opacity: 0.8, width: "50px" }}
            transition={{ duration: 0.8 }}
            className="h-1 bg-blue-medium"
            style={{ 
              backgroundImage: "linear-gradient(to right, #4D6A8F 50%, transparent 50%)",
              backgroundSize: "10px 1px",
              backgroundRepeat: "repeat-x"
            }}
          />
        )}
        
        {/* Lookalike Site Node */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.5, 
            type: "spring", 
            stiffness: 200,
            delay: 0.2
          }}
          className="flex flex-col w-36 h-36 md:w-44 md:h-44 text-white bg-blue-dark rounded-2xl shadow-lg border border-white/20"
        >
          <div className="h-full w-full p-4 flex flex-col">
            <div className="text-xs md:text-sm font-bold mb-2 text-center">Lookalike</div>
            <div className="flex-1 bg-white/10 rounded-lg p-3 flex flex-col space-y-3">
              {/* Header-like element - similar but different */}
              <div className="h-2.5 bg-white/60 rounded-full w-11/12"></div>
              
              {/* Logo and navigation-like elements - different layout */}
              <div className="flex justify-between items-center">
                <div className="h-4 w-4 bg-white/80 rounded-full"></div>
                <div className="flex space-x-1.5">
                  <div className="h-2.5 w-4 bg-white/60 rounded-full"></div>
                  <div className="h-2.5 w-7 bg-white/60 rounded-full"></div>
                </div>
              </div>
              
              {/* Main content - slightly different width */}
              <div className="h-2.5 bg-white/40 rounded-full w-10/12"></div>
              <div className="h-2.5 bg-white/40 rounded-full w-full"></div>
              
              {/* Button-like element - different position */}
              <div className="self-end h-3 w-7 bg-white/70 rounded-md"></div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Similarity Scores */}
      <div className="w-[85%] max-w-md rounded-xl bg-blue-dark/40 backdrop-blur-sm p-4 border border-white/10 mb-4">
        {similarityData.map((data, index) => (
          <div key={data.type} className={cn("flex items-center", index === 0 ? "mb-4" : "mb-0")}>
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: showScores ? 1 : 0, scale: showScores ? 1 : 0 }}
              transition={{ duration: 0.3, delay: 0.8 + (index * 0.2) }}
              className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-medium/80 mr-3"
            >
              {data.icon}
            </motion.div>
            
            <div className="flex-1">
              <div className="flex justify-between text-xs md:text-sm text-white mb-1.5">
                <span>{data.type === "code" ? "Code (TLSH)" : "Visual (pHash)"}</span>
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: showScores ? 1 : 0 }}
                  transition={{ duration: 0.5, delay: 1.5 + (index * 0.2) }}
                  className="font-bold"
                >
                  {data.percentage}%
                </motion.span>
              </div>
              
              <div className="h-3 bg-white/20 rounded-full w-full">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: showScores ? `${data.percentage}%` : 0 }}
                  transition={{ duration: 1, delay: 1.2 + (index * 0.2) }}
                  className="h-full rounded-full bg-red-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 