import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield } from "lucide-react"

export function About() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            What is DNS Fuzzing?
          </CardTitle>
          <CardDescription>Protecting your brand from domain imposters</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg leading-relaxed">
            DNS Fuzzing is an advanced security tool designed to detect and prevent domain name impersonation attacks.
            By analyzing potential typosquatting, homograph attacks, and other domain spoofing techniques, we help
            organizations protect their brand identity and customers from phishing attempts.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Real-time monitoring of domain registrations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Advanced algorithms to detect visual similarities</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Automated alerts for potential domain threats</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>Comprehensive reporting and threat analysis</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Why It Matters</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed">
              Domain impersonation attacks are increasingly sophisticated, targeting both users and organizations. DNS
              Fuzzing provides the proactive protection needed to identify and mitigate these threats before they can
              cause damage.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

