"use client"

import React from "react"
import { motion } from "motion/react"
import { Code, Image as ImageIcon } from "lucide-react"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" } 
  },
}

const scoreVariants = {
  hidden: { opacity: 0, width: 0 },
  visible: (custom: number) => ({
    opacity: 1,
    width: `${custom}%`,
    transition: { duration: 1, delay: 0.8, ease: "easeInOut" },
  }),
}

const textVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 0.5, delay: 1.2 } 
  },
}

export default function FuzzyHashingDiagram() {
  const siteWidth = 120
  const siteHeight = 80
  const siteSpacing = 50
  const totalWidth = siteWidth * 2 + siteSpacing
  const startX = (350 - totalWidth) / 2 // Center the diagram roughly

  const codeSimilarity = 85 // Example percentage
  const visualSimilarity = 70 // Example percentage

  return (
    <motion.svg
      viewBox="0 0 350 300"
      width="100%"
      height="300px" // Increased height
      preserveAspectRatio="xMidYMid meet"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      className="mt-6"
    >
      {/* Original Site Mockup - Glassy */}
      <motion.g variants={itemVariants}>
        <rect
          x={startX}
          y={30}
          width={siteWidth}
          height={siteHeight}
          rx={5}
          fill="hsl(var(--background) / 0.7)" // Correct light background, glassy
          stroke="hsl(var(--border) / 0.5)"    // Correct light border, subtle
          strokeWidth={1}
        />
        <text
          x={startX + siteWidth / 2}
          y={20}
          textAnchor="middle"
          fill="hsl(var(--foreground))" // Correct light foreground
          fontSize="10px"
        >
          Original Site
        </text>
        {/* Mock content - Blue Accents */}
        <rect x={startX + 10} y={45} width={siteWidth - 20} height={8} rx={2} fill="#3b82f680" /> {/* Blue hex with 50% opacity */}
        <rect x={startX + 10} y={60} width={siteWidth - 40} height={8} rx={2} fill="#3b82f680" /> {/* Blue hex with 50% opacity */}
        <rect x={startX + 10} y={75} width={siteWidth - 20} height={8} rx={2} fill="#3b82f680" /> {/* Blue hex with 50% opacity */}
        <circle cx={startX + siteWidth - 20} cy={95} r={8} fill="#3b82f6" /> {/* Solid Blue hex */}
      </motion.g>

      {/* Lookalike Site Mockup - Glassy */}
      <motion.g variants={itemVariants}>
        <rect
          x={startX + siteWidth + siteSpacing}
          y={30}
          width={siteWidth}
          height={siteHeight}
          rx={5}
          fill="hsl(var(--background) / 0.7)" // Correct light background, glassy
          stroke="hsl(var(--border) / 0.5)"    // Correct light border, subtle
          strokeWidth={1}
        />
        <text
          x={startX + siteWidth + siteSpacing + siteWidth / 2}
          y={20}
          textAnchor="middle"
          fill="hsl(var(--foreground))" // Correct light foreground
          fontSize="10px"
        >
          Lookalike Site
        </text>
        {/* Slightly different mock content - Blue Accents */}
        <rect x={startX + siteWidth + siteSpacing + 10} y={45} width={siteWidth - 20} height={8} rx={2} fill="#3b82f680" /> {/* Blue hex with 50% opacity */}
        <rect x={startX + siteWidth + siteSpacing + 10} y={60} width={siteWidth - 50} height={8} rx={2} fill="#3b82f680" /> {/* Blue hex with 50% opacity */}
        <rect x={startX + siteWidth + siteSpacing + 10} y={75} width={siteWidth - 20} height={8} rx={2} fill="#3b82f680" /> {/* Blue hex with 50% opacity */}
        <circle cx={startX + siteWidth + siteSpacing + siteWidth - 20} cy={95} r={8} fill="#3b82f6" /> {/* Solid Blue hex */}
      </motion.g>

      {/* Similarity Scores Area */}
      <g transform={`translate(0, ${siteHeight + 60})`}> 
        {/* Code Similarity (TLSH) - Blue Accent */}
        <foreignObject x="20" y="0" width="30" height="30">
          <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
             <Code className="h-5 w-5 text-[#3b82f6]/90" /> {/* Blue hex text color */}
          </motion.div>
        </foreignObject>
        <text x="55" y="15" fontSize="10px" fill="hsl(var(--foreground))">Code (TLSH)</text>
        <rect x="55" y="25" width={200} height={10} rx={5} fill="hsl(var(--muted))" />
        <motion.rect
          x="55"
          y="25"
          height={10}
          rx={5}
          fill="#3b82f6" // Blue hex bar
          variants={scoreVariants}
          custom={codeSimilarity}
        />
        <motion.text 
          x={265} 
          y={35} 
          fontSize="11px" 
          fill="#3b82f6" // Blue hex text
          fontWeight="bold"
          variants={textVariants}
        >
          {codeSimilarity}%
        </motion.text>

        {/* Visual Similarity (pHash) - Blue Accent */}
        <foreignObject x="20" y="50" width="30" height="30">
           <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
             <ImageIcon className="h-5 w-5 text-[#3b82f6]/90" /> {/* Blue hex text color */}
          </motion.div>
        </foreignObject>
        <text x="55" y="65" fontSize="10px" fill="hsl(var(--foreground))">Visual (pHash)</text>
        <rect x="55" y="75" width={200} height={10} rx={5} fill="hsl(var(--muted))" />
        <motion.rect
          x="55"
          y="75"
          height={10}
          rx={5}
          fill="#3b82f6" // Blue hex bar
          variants={scoreVariants}
          custom={visualSimilarity}
        />
         <motion.text 
          x={265} 
          y={85} 
          fontSize="11px" 
          fill="#3b82f6" // Blue hex text
          fontWeight="bold"
          variants={textVariants}
        >
          {visualSimilarity}%
        </motion.text>
      </g>
    </motion.svg>
  )
} 