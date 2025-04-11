"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, Play, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDomains, useDeleteDomain, Domain } from "@/lib/api/domains";
import { userStorage } from "@/lib/api/users";
import { useGeneratePermutations } from "@/lib/api/permuatations";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function DomainRootsList() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { userId } = userStorage.getCurrentUser();
  const { data: domainData, isLoading: isLoadingDomains, refetch } = useDomains(userId);
  const deleteDomainMutation = useDeleteDomain();
  const generatePermutationsMutation = useGeneratePermutations();

  // Initial data load - prioritize API data on page load/reload
  useEffect(() => {
    const loadDomains = async () => {
      setIsLoading(true);
      
      if (userId) {
        // Always try to fetch fresh data from the API first on initial load
        try {
          const result = await refetch();
          if (result.data) {
            setDomains(result.data.domains);
            // Update localStorage with fresh API data
            localStorage.setItem("domainRoots", JSON.stringify(result.data.domains.map(domain => domain.domain_name)));
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error("Error fetching domains:", error);
          // Continue to fallback to localStorage if API request fails
        }
      }
      
      // Fallback to localStorage if API request fails or there's no userId
      const storedRoots = JSON.parse(localStorage.getItem("domainRoots") || "[]");
      // Convert string array to Domain array with minimal info
      const domainObjects = storedRoots.map((root: string) => ({ 
        domain_name: root, 
        user_id: userId || '',
        total_scans: 0
      }));
      setDomains(domainObjects);
      setIsLoading(false);
    };
    
    loadDomains();
  }, [userId, refetch]);
  
  // Handle storage events and loading state updates
  useEffect(() => {
    // Update from localStorage when it changes in other tabs/components
    const handleStorageChange = () => {
      if (domainData) {
        setDomains(domainData.domains);
      } else {
        const updatedRoots = JSON.parse(localStorage.getItem("domainRoots") || "[]");
        // Convert string array to Domain array with minimal info
        const domainObjects = updatedRoots.map((root: string) => ({ 
          domain_name: root, 
          user_id: userId || '',
          total_scans: 0
        }));
        setDomains(domainObjects);
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [domainData, userId]);

  const handleDeleteRoot = async (domain: Domain) => {
    try {
      // Delete from API first
      if (userId) {
        await deleteDomainMutation.mutateAsync({
          userId,
          domain_name: domain.domain_name
        });
      } else {
        // If no userId (shouldn't happen), just update localStorage
        const updatedDomains = domains.filter(item => item.domain_name !== domain.domain_name);
        localStorage.setItem("domainRoots", JSON.stringify(updatedDomains.map(d => d.domain_name)));
        setDomains(updatedDomains);
        
        toast({
          title: "Deleted",
          description: `Domain root "${domain.domain_name}" has been removed`,
        });
      }
    } catch (error) {
      console.error("Error deleting domain:", error);
    }
  };

  const handleGeneratePermutations = async (domainName: string) => {
    try {
      await generatePermutationsMutation.mutateAsync({
        userId,
        domainName
      });
    } catch (error) {
      // Error handling is already done in the mutation hook
      console.error("Error generating permutations:", error);
    }
  };

  if (isLoading || isLoadingDomains) {
    return (
      <div className="flex items-center justify-center mt-4 h-10">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (domains.length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic mt-4">
        No domain roots added yet. Add one above to get started.
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      <h3 className="text-sm font-medium">Saved Domain Roots</h3>
      <ul className="space-y-2">
        {domains.map((domain) => (
          <li key={domain.domain_name} className="flex items-center justify-between bg-background/50 p-3 rounded-md border border-border/50">
            <div className="flex flex-col">
              <span className="text-sm font-medium">{domain.domain_name}</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {domain.ip_address && <span>{domain.ip_address}</span>}
                {domain.last_scan && (
                  <span>
                    {domain.ip_address && '· '}Last scan: {new Date(domain.last_scan).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {domain.risk_counts && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 pr-2 border-r border-border/50">
                        {domain.risk_counts.high > 0 ? (
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-red-500"></div>
                            <span className="text-xs font-medium">{domain.risk_counts.high}</span>
                          </div>
                        ) : null}
                        
                        {domain.risk_counts.medium > 0 ? (
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                            <span className="text-xs font-medium">{domain.risk_counts.medium}</span>
                          </div>
                        ) : null}
                        
                        {domain.risk_counts.low > 0 ? (
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <span className="text-xs font-medium">{domain.risk_counts.low}</span>
                          </div>
                        ) : null}
                        
                        {domain.risk_counts.unknown > 0 ? (
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                            <span className="text-xs font-medium">{domain.risk_counts.unknown}</span>
                          </div>
                        ) : null}
                        
                        {domain.risk_counts.high === 0 && 
                         domain.risk_counts.medium === 0 && 
                         domain.risk_counts.low === 0 &&
                         domain.risk_counts.unknown === 0 ? (
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                            <span className="text-xs font-medium text-muted-foreground">No risks</span>
                          </div>
                        ) : null}
                        
                        <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="text-xs p-1">
                        <div className="font-semibold mb-1">Risk Distribution</div>
                        <div className="flex items-center gap-1 mb-1">
                          <div className="h-2 w-2 rounded-full bg-red-500"></div>
                          <span>High Risk</span>
                        </div>
                        <div className="flex items-center gap-1 mb-1">
                          <div className="h-2 w-2 rounded-full bg-amber-500"></div>
                          <span>Medium Risk</span>
                        </div>
                        <div className="flex items-center gap-1 mb-1">
                          <div className="h-2 w-2 rounded-full bg-green-500"></div>
                          <span>Low Risk</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          <span>Unknown Risk</span>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                onClick={() => handleGeneratePermutations(domain.domain_name)}
                disabled={generatePermutationsMutation.isPending}
              >
                {generatePermutationsMutation.isPending && generatePermutationsMutation.variables?.domainName === domain.domain_name ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Play size={14} />
                )}
                <span className="sr-only">Run Now</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => handleDeleteRoot(domain)}
              >
                <Trash2 size={14} />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
