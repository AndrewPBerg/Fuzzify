import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function TechStack() {
  const technologies = [
    {
      category: "Frontend",
      items: [
        { name: "Next.js", description: "React framework for production" },
        { name: "React", description: "JavaScript library for building user interfaces" },
        { name: "Tailwind CSS", description: "Utility-first CSS framework" },
        { name: "shadcn/ui", description: "Reusable component library" },
      ],
    },
    {
      category: "Backend",
      items: [
        { name: "Node.js", description: "JavaScript runtime" },
        { name: "PostgreSQL", description: "Advanced open source database" },
        { name: "Redis", description: "In-memory data structure store" },
        { name: "Prisma", description: "Next-generation ORM" },
      ],
    },
    {
      category: "DevOps & Infrastructure",
      items: [
        { name: "Docker", description: "Containerization platform" },
        { name: "GitHub Actions", description: "CI/CD automation" },
        { name: "Vercel", description: "Deployment and hosting platform" },
        { name: "AWS", description: "Cloud infrastructure services" },
      ],
    },
  ]

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <p className="text-lg text-muted-foreground">
          Built with modern technologies to ensure performance, scalability, and developer experience
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {technologies.map((tech) => (
          <Card key={tech.category} className="overflow-hidden border-primary/20">
            <CardHeader className="bg-muted/50">
              <CardTitle>{tech.category}</CardTitle>
              <CardDescription>Core technologies</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-4">
                {tech.items.map((item) => (
                  <li key={item.name} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-medium">
                        {item.name}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

