"use client";

import { useState } from "react";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { Globe, Server, User, Shield, AlertTriangle } from "lucide-react";
import { useDomains } from "@/lib/api/domains";
import { userStorage } from "@/lib/api/users";

export default function HomePage() {
  const { userId } = userStorage.getCurrentUser();
  const { data: domains, isLoading: domainsLoading, error: domainsError } = useDomains(userId);
  
  // Calculate permutations count from domains data
  const permutationsCount = domains?.reduce((count, domain) => {
    // This is a placeholder. In a real app, you might want to fetch permutations
    // count from an API or calculate it from your data store
    return count + (domain.total_scans || 0);
  }, 0) || 0;
  
  // State for alerts (dummy data for now)
  const [alertsCount] = useState<number>(3);
  
  return (
    <div className="page-container">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
         One click away from protecting your brand
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatusCard 
          title="Domains" 
          value={domainsLoading ? "Loading..." : domains?.length || 0} 
          icon={<Globe className="h-4 w-4" />} 
          description="Total domain roots" 
          variant="default"
        />
        
        <StatusCard 
          title="Permutations" 
          value={domainsLoading ? "Loading..." : permutationsCount} 
          icon={<Server className="h-4 w-4" />} 
          description="Total domain permutations" 
          variant="default"
        />
        
        <StatusCard 
          title="Alerts" 
          value={alertsCount} 
          icon={<AlertTriangle className="h-4 w-4" />}
          description="Active security alerts"
          variant="warning"
        />
      </div>

    </div>
  );
}