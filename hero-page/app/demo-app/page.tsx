"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { userStorage } from "@/lib/demo-data/user";
import { Domain } from "@/lib/demo-data/domains";

export default function DemoHomePage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Static data loading with useEffect to ensure client-side only
  useEffect(() => {
    try {
      // Fetch domains data from our static source
      const domainsData = userStorage.getDomains();
      setDomains(domainsData);
      setLoading(false);
    } catch (error) {
      console.error("Error loading domain data:", error);
      setLoading(false);
    }
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Domain Security Dashboard</h1>
      <p className="text-muted-foreground">
        Welcome to the static demo of the Domain Security Dashboard.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Domains</CardTitle>
            <CardDescription>Your registered domains</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{domains.length}</div>
            <p className="text-sm text-muted-foreground mt-2">
              {loading ? "Loading..." : "Domains under monitoring"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Permutations</CardTitle>
            <CardDescription>Domain permutations discovered</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? "..." : userStorage.getAllPermutations().length}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Potential impersonation attempts
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Risk Level</CardTitle>
            <CardDescription>Current threat assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">Medium</div>
            <p className="text-sm text-muted-foreground mt-2">
              Based on active permutations
            </p>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-2xl font-bold mt-8">Recent Domains</h2>
      <div className="grid grid-cols-1 gap-4 mt-4">
        {loading ? (
          <p>Loading domains...</p>
        ) : domains.length === 0 ? (
          <p>No domains found</p>
        ) : (
          domains.map(domain => (
            <Card key={domain.domain_name}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{domain.domain_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Last scan: {domain.last_scan ? new Date(domain.last_scan).toLocaleDateString() : "Never"}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 