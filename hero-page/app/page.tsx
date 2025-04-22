import ParallaxBackground from "@/components/parallax-background"
import AnimatedBackground from "@/components/animated-background"
import MainContent from "@/components/main-content"

export default function Home() {
  const sections = [
    {
      id: "hero",
      title: "Home",
    },
    {
      id: "team",
      title: "Team",
    },
    {
      id: "stack",
      title: "Stack",
    },
    {
      id: "about",
      title: "About",
    },
    {
      id: "the-fuzz",
      title: "The Fuzz",
    },
    {
      id: "our-system",
      title: "Our System",
    },
    {
      id: "demo",
      title: "Demo",
    },
  ]

  return (
    <main className="min-h-screen bg-[#17345A] relative">
      <ParallaxBackground />
      <AnimatedBackground />
      <MainContent title="Fuzzify" sections={sections} />
    </main>
  )
}

