import { DNSFuzzVisualizer } from "@/components/diagrams/dns-fuzzing-diagram";

export default function DNSFuzzingDemo() {
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
    <div className="container py-12">
      <h1 className="mb-8 text-3xl font-bold">DNS Fuzzing Visualization</h1>
      <p className="mb-8 text-lg">
        This demo shows how potential domain impersonations can be visualized. 
        The central node represents the original domain, while surrounding nodes 
        are variants created using different DNS fuzzing techniques.
      </p>
      
      <div className="p-6 border rounded-lg shadow-sm bg-background">
        <DNSFuzzVisualizer 
          originalDomain={sampleData.originalDomain} 
          fuzzedDomains={sampleData.fuzzedDomains} 
        />
      </div>
      
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">Color Legend</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded-full"></div>
            <span>Original Domain</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span>Registered Impersonation (Potential Threat)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
            <span>Available Domain</span>
          </div>
        </div>
      </div>
    </div>
  );
} 