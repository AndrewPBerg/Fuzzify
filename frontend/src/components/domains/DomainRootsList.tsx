"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDomains, useDeleteDomain } from "@/lib/api/domains";
import { userStorage } from "@/lib/api/users";
import { useGeneratePermutations } from "@/lib/api/permuatations";

export function DomainRootsList() {
  const [domainRoots, setDomainRoots] = useState<string[]>([]);
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
            const apiDomainRoots = result.data.map(domain => domain.domain_name);
            setDomainRoots(apiDomainRoots);
            // Update localStorage with fresh API data
            localStorage.setItem("domainRoots", JSON.stringify(apiDomainRoots));
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
      setDomainRoots(storedRoots);
      setIsLoading(false);
    };
    
    loadDomains();
  }, [userId, refetch]);
  
  // Handle storage events and loading state updates
  useEffect(() => {
    // Update from localStorage when it changes in other tabs/components
    const handleStorageChange = () => {
      const updatedRoots = JSON.parse(localStorage.getItem("domainRoots") || "[]");
      setDomainRoots(updatedRoots);
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleDeleteRoot = async (root: string) => {
    try {
      // Delete from API first
      if (userId) {
        await deleteDomainMutation.mutateAsync({
          userId,
          domain_name: root
        });
      } else {
        // If no userId (shouldn't happen), just update localStorage
        const updatedRoots = domainRoots.filter(item => item !== root);
        localStorage.setItem("domainRoots", JSON.stringify(updatedRoots));
        setDomainRoots(updatedRoots);
        
        toast({
          title: "Deleted",
          description: `Domain root "${root}" has been removed`,
        });
      }
    } catch (error) {
      console.error("Error deleting domain:", error);
      // toast({
      //   title: "Error",
      //   description: `Failed to delete domain "${root}". Please try again.`,
      //   variant: "destructive"
      // });
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

  if (domainRoots.length === 0) {
    return (
      <div className="text-sm text-muted-foreground italic mt-4">
        No domain roots added yet. Add one above to get started.
      </div>
    );
  }

  // Debug output right before rendering
  console.log("DomainRootsList: About to render domains:", domains);

  // Render domains list
  return (
    <div className="mt-4 space-y-2">
      <h3 className="text-sm font-medium">Saved Domain Roots ({domains.length})</h3>
      <ul className="space-y-2">
        {domainRoots.map((root) => (
          <li key={root} className="flex items-center justify-between bg-background/50 p-2 rounded-md border border-border/50">
            <span className="text-sm">{root}</span>
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 text-muted-foreground hover:text-primary"
                onClick={() => handleGeneratePermutations(root)}
                disabled={generatePermutationsMutation.isPending}
              >
                {generatePermutationsMutation.isPending && generatePermutationsMutation.variables?.domainName === root ? (
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
                onClick={() => handleDeleteRoot(root)}
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
