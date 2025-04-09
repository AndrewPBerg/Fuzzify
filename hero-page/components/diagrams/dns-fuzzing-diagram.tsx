"use client"

import React from "react"
import { motion } from "motion/react"

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
  hidden: { opacity: 0, pathLength: 0 },
  visible: { 
    opacity: 1, 
    pathLength: 1,
    transition: { duration: 1, ease: "easeInOut" } 
  },
}

const textVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, delay: 0.8 } // Delay text appearance
  },
}

export default function DnsFuzzingDiagram() {
  const originalDomain = "yourbrand.com"
  const variations = [
    { name: "yourbrand.co", x: 250, y: 50 },
    { name: "yourbrond.com", x: 280, y: 150 },
    { name: "your-brand.com", x: 200, y: 250 },
    { name: "yourbrandd.com", x: 50, y: 220 },
    { name: "yourbrand.net", x: 0, y: 100 },
  ]
  const centerX = 150
  const centerY = 150

  return (
    <motion.svg
      viewBox="0 0 350 300"
      width="100%"
      height="300px"
      preserveAspectRatio="xMidYMid meet"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
      className="mt-6"
    >
      {/* Central Domain - Glassy */}
      <motion.rect
        x={centerX - 50}
        y={centerY - 20}
        width={100}
        height={40}
        rx={5}
        fill="hsl(var(--background) / 0.7)" // Correct light background, glassy
        stroke="hsl(var(--border) / 0.5)"    // Correct light border, subtle
        strokeWidth={1}
        variants={itemVariants}
      />
      <motion.text
        x={centerX}
        y={centerY + 5}
        textAnchor="middle"
        fill="hsl(var(--foreground))" // Correct light foreground
        fontSize="12px"
        fontWeight="bold"
        variants={textVariants}
      >
        {originalDomain}
      </motion.text>

      {/* Fuzzed Variations */}
      {variations.map((variation, index) => (
        <React.Fragment key={index}>
          {/* Connecting Line - Blue Accent */}
          <motion.line
            x1={centerX}
            y1={centerY}
            x2={variation.x}
            y2={variation.y}
            stroke="#3b82f6" // Direct blue hex code for accent
            strokeWidth={1.5}
            variants={itemVariants}
          />
          {/* Variation Text */}
          <motion.text
            x={variation.x}
            y={variation.y + 15}
            fill="hsl(var(--foreground))" // Correct light foreground
            fontSize="11px"
            variants={textVariants}
          >
            {variation.name}
          </motion.text>
        </React.Fragment>
      ))}
    </motion.svg>
  )
} 