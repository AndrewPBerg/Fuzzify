import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, Play } from "lucide-react"
import Link from "next/link"

export function Demo() {
  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto mb-8">
        <p className="text-lg text-muted-foreground">
          See DNS Fuzzing in action and discover how it can protect your domain
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Interactive Demo</CardTitle>
            <CardDescription>Try our interactive demo to see how DNS Fuzzing detects domain imposters</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
              <Button variant="outline" size="lg" className="gap-2">
                <Play className="h-4 w-4" />
                Play Demo Video
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              This demo showcases our core detection algorithms and reporting features
            </p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Try DNS Fuzzing</CardTitle>
            <CardDescription>Ready to see how DNS Fuzzing can protect your domain?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Our web application provides a comprehensive dashboard for monitoring potential domain threats and
              managing alerts.
            </p>
            <p>Features available in the full application:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Domain monitoring dashboard</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Real-time threat detection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Detailed threat analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Custom alert configurations</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full gap-2">
              <Link href="https://app.dnsfuzzing.com" target="_blank">
                Launch Application
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

