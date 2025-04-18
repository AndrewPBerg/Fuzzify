"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { userStorage } from "@/lib/demo-data/user";
import { Domain } from "@/lib/demo-data/domains";
import Link from "next/link";

export default function DemoHomePage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRiskFilter, setSelectedRiskFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  
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

  // Calculate risk statistics
  const permutations = userStorage.getAllPermutations();
  const highRiskCount = permutations.filter(p => p.risk === true).length;
  const lowRiskCount = permutations.filter(p => p.risk === false).length;
  const unknownRiskCount = permutations.filter(p => p.risk === null).length;
  
  // Get highest risk domains
  const highRiskDomains = domains.filter(domain => 
    permutations.some(p => p.domain_name === domain.domain_name && p.risk === true)
  );

  return (
    <div className="p-3 sm:p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Domain Security Dashboard</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Monitor and protect your domains from impersonation attacks
          </p>
        </div>
        <Link href="/demo-app/domains/add">
          <Button className="w-full sm:w-auto">Add New Domains</Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mt-4 md:mt-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <span>Domains</span>
              <span className="text-xs md:text-sm font-normal text-muted-foreground">({domains.length})</span>
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Active domains under monitoring</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold">{domains.length}</div>
            <p className="text-xs md:text-sm text-muted-foreground mt-2">
              {loading ? "Loading..." : "Active domains"}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <span>Permutations</span>
              <span className="text-xs md:text-sm font-normal text-muted-foreground">({permutations.length})</span>
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Potential impersonation attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-muted-foreground">High Risk:</span>
                <span className="text-rose-500 font-medium">{highRiskCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-muted-foreground">Low Risk:</span>
                <span className="text-emerald-500 font-medium">{lowRiskCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm text-muted-foreground">Unknown:</span>
                <span className="text-blue-500 font-medium">{unknownRiskCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="sm:col-span-2 md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <span>High Risk Sites</span>
              <span className="text-xs md:text-sm font-normal text-muted-foreground">({highRiskDomains.length})</span>
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">Domains requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold text-rose-500">{highRiskDomains.length}</div>
            <p className="text-xs md:text-sm text-muted-foreground mt-2">
              {highRiskDomains.length > 0 
                ? `${highRiskDomains.length} high-risk domain${highRiskDomains.length !== 1 ? 's' : ''}`
                : "No high-risk domains detected"}
            </p>
          </CardContent>
        </Card>
      </div>
      
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-4">
        <div className="h-[400px] md:h-[600px]">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex-none pb-2 md:pb-3">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                <CardTitle className="text-lg md:text-xl">Domain List</CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={selectedRiskFilter === 'all' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedRiskFilter('all')}
                    className="text-xs h-7 px-2"
                  >
                    All
                  </Button>
                  <Button 
                    variant={selectedRiskFilter === 'high' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedRiskFilter('high')}
                    className="text-xs h-7 px-2"
                  >
                    High Risk
                  </Button>
                  <Button 
                    variant={selectedRiskFilter === 'medium' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedRiskFilter('medium')}
                    className="text-xs h-7 px-2"
                  >
                    Medium
                  </Button>
                  <Button 
                    variant={selectedRiskFilter === 'low' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedRiskFilter('low')}
                    className="text-xs h-7 px-2"
                  >
                    Low Risk
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-3 md:space-y-4 p-3 md:p-4">
              {loading ? (
                <p>Loading domains...</p>
              ) : domains.length === 0 ? (
                <p>No domains found</p>
              ) : (
                domains
                  .filter(domain => {
                    if (selectedRiskFilter === 'all') return true;
                    const domainPermutations = permutations.filter(p => p.domain_name === domain.domain_name);
                    const hasHighRisk = domainPermutations.some(p => p.risk === true);
                    const hasLowRisk = domainPermutations.some(p => p.risk === false);
                    const hasUnknownRisk = domainPermutations.some(p => p.risk === null);
                    
                    switch (selectedRiskFilter) {
                      case 'high': return hasHighRisk;
                      case 'medium': return hasUnknownRisk;
                      case 'low': return hasLowRisk;
                      default: return true;
                    }
                  })
                  .map(domain => {
                    const domainPermutations = permutations.filter(p => p.domain_name === domain.domain_name);
                    const hasHighRisk = domainPermutations.some(p => p.risk === true);
                    const hasLowRisk = domainPermutations.some(p => p.risk === false);
                    const hasUnknownRisk = domainPermutations.some(p => p.risk === null);
                    
                    return (
                      <Link key={domain.domain_name} href={`/demo-app/domains/${domain.domain_name}`}>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-3 md:p-4 rounded-lg border hover:bg-accent transition-colors">
                          <div className="space-y-1 mb-2 sm:mb-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-medium text-sm md:text-base">{domain.domain_name}</h3>
                              {hasHighRisk && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400">
                                  High Risk
                                </span>
                              )}
                              {hasUnknownRisk && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                                  Unknown
                                </span>
                              )}
                              {hasLowRisk && (
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                                  Low Risk
                                </span>
                              )}
                            </div>
                            <p className="text-xs md:text-sm text-muted-foreground">
                              Last scan: {domain.last_scan ? new Date(domain.last_scan).toLocaleDateString() : "Never"}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" className="text-xs w-full sm:w-auto">
                            View Details
                          </Button>
                        </div>
                      </Link>
                    );
                  })
              )}
            </CardContent>
          </Card>
        </div>

        <div className="h-[400px] md:h-[600px]">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex-none pb-2 md:pb-3">
              <CardTitle className="text-lg md:text-xl">Upcoming Runs</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-3 md:space-y-4 p-3 md:p-4">
              <Card>
                <CardHeader className="pb-2 md:pb-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                    <div>
                      <CardTitle className="text-base md:text-lg">Daily Scan</CardTitle>
                      <CardDescription className="text-xs md:text-sm">Runs every day at 2:00 AM UTC</CardDescription>
                    </div>
                    <Button size="sm" className="text-xs mt-2 sm:mt-0 w-full sm:w-auto">Run Now</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm text-muted-foreground">Next Run:</span>
                      <span className="text-xs md:text-sm font-medium">Tomorrow, 2:00 AM UTC</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm text-muted-foreground">Last Run:</span>
                      <span className="text-xs md:text-sm font-medium">Today, 2:00 AM UTC</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm text-muted-foreground">Status:</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                        On Schedule
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Weekly Deep Scan</CardTitle>
                      <CardDescription>Runs every Sunday at 4:00 AM UTC</CardDescription>
                    </div>
                    <Button size="sm">Run Now</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Next Run:</span>
                      <span className="font-medium">Sunday, 4:00 AM UTC</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Last Run:</span>
                      <span className="font-medium">Last Sunday, 4:00 AM UTC</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                        On Schedule
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 