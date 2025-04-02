"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertBanner } from "@/components/dashboard/AlertBanner";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { Globe, Server, User, Shield, AlertTriangle, Settings } from "lucide-react";
import { useDomains } from "@/lib/api/domains";
import { userStorage } from "@/lib/api/users";
import { useCountPermutations } from "@/lib/api/permuatations";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const router = useRouter();
  const { userId } = userStorage.getCurrentUser();
  const { data: domains, isLoading: domainsLoading, error: domainsError } = useDomains(userId);
  
  const { data: permutationsCount } = useCountPermutations(userId);
  
  // State for alerts (dummy data for now)
  const [alertsCount] = useState<number>(3);

  const handleManageDomain = (domainName: string) => {
    localStorage.setItem('selectedDomain', domainName);
    router.push('/domains');
  };
  
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatusCard 
          title="Domains" 
          value={domainsLoading ? "Loading..." : domains?.length || 0} 
          icon={<Globe className="h-4 w-4" />} 
          description="Active domains under monitoring" 
          variant="default"
        />
        
        <StatusCard 
          title="Permutations" 
          value={domainsLoading ? "Loading..." : permutationsCount ?? 0} 
          icon={<Server className="h-4 w-4" />} 
          description="Potential impersonation attempts" 
          variant="default"
        />
        
        <StatusCard 
          title="Alerts" 
          value={alertsCount} 
          icon={<AlertTriangle className="h-4 w-4" />}
          description="Impersonations requiring attention"
          variant="warning"
        />
      </div>

      {/* Domain List and Upcoming Runs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 -mx-4 px-4 h-[calc(80vh-12rem)]">
        {/* Domain List Card */}
        <div className="glass-card rounded-lg shadow-sm h-full">
          <div className="p-4 border-b border-border/50">
            <h2 className="text-lg font-medium">Domain List</h2>
          </div>
          <div className="p-4 h-[calc(100%-4rem)]">
            {domainsLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : domainsError ? (
              <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                Error loading domains
              </div>
            ) : domains?.length === 0 ? (
              <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                No domains added yet
              </div>
            ) : (
              <div className="space-y-2 h-full overflow-y-auto">
                {domains?.map((domain) => (
                  <div
                    key={domain.domain_name}
                    className="flex items-center justify-between p-2 rounded-md bg-background/50 border border-border/50"
                  >
                    <span className="text-md">{domain.domain_name}</span>
                    <div className="flex items-center gap-2">
                      {domain.ip_address && (
                        <span className="text-xs text-muted-foreground">
                          {domain.ip_address}
                        </span>
                      )}
                      {domain.last_scan && (
                        <span className="text-xs text-muted-foreground">
                          Last scan: {new Date(domain.last_scan).toLocaleDateString()}
                        </span>
                      )}
                      <Button
                        variant="default"
                        size="sm"
                        className="h-8 px-3 text-sm bg-primary/10 text-primary hover:bg-primary/20"
                        onClick={() => handleManageDomain(domain.domain_name)}
                      >
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Runs Card */}
        <div className="glass-card rounded-lg shadow-sm h-full">
          <div className="p-4 border-b border-border/50">
            <h2 className="text-lg font-medium">Upcoming Runs</h2>
          </div>
          <div className="p-4 h-[calc(100%-4rem)]">
            <div className="text-center text-muted-foreground h-full flex items-center justify-center">
              No upcoming runs scheduled
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}