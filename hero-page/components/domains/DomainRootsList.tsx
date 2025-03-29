"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { userStorage } from "@/lib/demo-data/user";
import domainsData from "@/lib/demo-data/domains";
import { toast as sonnerToast } from "sonner";

export function DomainRootsList() {
  const [domainRoots, setDomainRoots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const currentUser = userStorage.getCurrentUser();
  const [isPendingDelete, setIsPendingDelete] = useState<string | null>(null);
  const [isPendingGenerate, setIsPendingGenerate] = useState<string | null>(null);

  // Load demo domains on component mount
  useEffect(() => {
    const loadDomains = () => {
      setIsLoading(true);
      
      try {
        // Get domains from demo data
        const domains = domainsData.getDomainsByUserId(currentUser.user_id);
        const domainNames = domains.map(domain => domain.domain_name);
        
        // Set the domain roots
        setDomainRoots(domainNames);
      } catch (error) {
        console.error("Error loading domains:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDomains();
  }, [currentUser.user_id]);

  const handleDeleteRoot = async (root: string) => {
    setIsPendingDelete(root);
    
    // Simulate network delay
    setTimeout(() => {
      try {
        // In a real app, we would remove this from a database
        // For demo, we'll filter it locally and show a success message
        const updatedRoots = domainRoots.filter(item => item !== root);
        setDomainRoots(updatedRoots);
        
        toast({
          title: "Deleted",
          description: `Domain root "${root}" has been removed`,
        });
      } catch (error) {
        console.error("Error deleting domain:", error);
        toast({
          title: "Error",
          description: `Failed to delete domain "${root}". Please try again.`,
          variant: "destructive"
        });
      } finally {
        setIsPendingDelete(null);
      }
    }, 800);
  };

  const handleGeneratePermutations = async (domainName: string) => {
    setIsPendingGenerate(domainName);
    
    // Simulate network delay
    setTimeout(() => {
      try {
        // In a real app, this would trigger permutation generation
        // For demo, just show success message
        sonnerToast.success("Permutations Generated", {
          description: `Generated permutations for ${domainName}`,
        });
      } catch (error) {
        sonnerToast.error("Error", {
          description: `Failed to generate permutations for ${domainName}`,
        });
      } finally {
        setIsPendingGenerate(null);
      }
    }, 1500);
  };

  if (isLoading) {
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

  return (
    <div className="mt-4 space-y-2">
      <h3 className="text-sm font-medium">Saved Domain Roots</h3>
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
                disabled={isPendingGenerate === root}
              >
                {isPendingGenerate === root ? (
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
                disabled={isPendingDelete === root}
              >
                {isPendingDelete === root ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
