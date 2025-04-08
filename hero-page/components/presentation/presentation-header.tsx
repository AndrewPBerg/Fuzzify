"use client"

import { Button } from "@/components/ui/button"
import { PresentationIcon as PresentationPlay, X } from "lucide-react"
import type { Section } from "./presentation"
import { cn } from "@/lib/utils"

interface PresentationHeaderProps {
  title: string
  subtitle: string
  sections: Section[]
  currentSectionIndex: number
  isPresentationMode: boolean
  onSectionClick: (index: number) => void
  onTogglePresentationMode: () => void
}

export function PresentationHeader({
  title,
  subtitle,
  sections,
  currentSectionIndex,
  isPresentationMode,
  onSectionClick,
  onTogglePresentationMode,
}: PresentationHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur transition-all duration-300",
        isPresentationMode ? "py-4" : "py-3",
      )}
    >
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div>
            <h1 className={cn("font-bold transition-all duration-300", isPresentationMode ? "text-2xl" : "text-xl")}>
              {title}
            </h1>
            <p className="text-muted-foreground text-sm">{subtitle}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className={cn("hidden md:flex items-center gap-6", isPresentationMode ? "text-lg" : "text-sm")}>
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => onSectionClick(index)}
              className={cn(
                "hover:text-primary transition-colors",
                currentSectionIndex === index && isPresentationMode ? "text-primary font-medium" : "",
              )}
            >
              {section.title}
            </button>
          ))}
        </nav>

        {/* Presentation mode toggle */}
        <Button
          variant={isPresentationMode ? "outline" : "default"}
          size="sm"
          onClick={onTogglePresentationMode}
          className="gap-2"
        >
          {isPresentationMode ? (
            <>
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Exit Presentation</span>
            </>
          ) : (
            <>
              <PresentationPlay className="h-4 w-4" />
              <span className="hidden sm:inline">Start Presentation</span>
            </>
          )}
        </Button>
      </div>
    </header>
  )
}

