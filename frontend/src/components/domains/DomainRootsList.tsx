"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useDomains } from "@/hooks/useDomains";
import { useUser } from "@/contexts/UserContext";

interface Domain {
  domain_name: string;
  user_id?: string;
  username?: string;
  total_scans?: number;
}

// Custom event name for domain updates
const DOMAIN_UPDATED_EVENT = "domain-list-updated";

// Helper function to trigger domain update events
export const triggerDomainUpdate = () => {
  window.dispatchEvent(new Event(DOMAIN_UPDATED_EVENT));
};

export function DomainRootsList() {
  const { currentUser } = useUser();
  const { domains, isLoading, error, fetchDomains, deleteDomain } = useDomains();

  useEffect(() => {
    // Log that we're fetching domains
    console.log("DomainRootsList: Fetching domains for user", currentUser?.user_id);
    
    // Force a fresh fetch whenever the component mounts
    if (currentUser) {
      fetchDomains();
      
      // Timeout safety to prevent infinite loading state
      const timeoutId = setTimeout(() => {
        if (isLoading) {
          console.warn("DomainRootsList: Loading timeout triggered - resetting loading state");
          // This will force the component to render the empty state instead of loading indefinitely
          triggerDomainUpdate();
        }
      }, 5000); // 5 second timeout
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentUser, fetchDomains, isLoading]);
  
  // Listen for domain update events
  useEffect(() => {
    const handleDomainUpdate = () => {
      console.log("DomainRootsList: Detected domain update event, refreshing...");
      fetchDomains();
    };
    
    // Listen for custom domain update events
    window.addEventListener(DOMAIN_UPDATED_EVENT, handleDomainUpdate);
    
    // Also listen for storage events (for backward compatibility)
    window.addEventListener("storage", handleDomainUpdate);
    
    return () => {
      window.removeEventListener(DOMAIN_UPDATED_EVENT, handleDomainUpdate);
      window.removeEventListener("storage", handleDomainUpdate);
    };
  }, [fetchDomains]);

  // Debug the domains data structure
  useEffect(() => {
    console.log("DomainRootsList: Raw domains data:", domains);
    console.log("DomainRootsList: Type of domains:", typeof domains);
    console.log("DomainRootsList: Is array?", Array.isArray(domains));
    console.log("DomainRootsList: Length:", domains?.length);
  }, [domains]);

  const handleDeleteDomain = async (domainName: string) => {
    console.log(`DomainRootsList: Attempting to delete domain: ${domainName}`);
    
    if (!currentUser) {
      console.error("DomainRootsList: Cannot delete domain - no user logged in");
      toast.error("Please login to delete domains");
      return;
    }
    
    try {
      const success = await deleteDomain(domainName);
      
      if (success) {
        console.log(`DomainRootsList: Successfully deleted domain: ${domainName}`);
        toast.success(`Domain "${domainName}" has been removed`);
        
        // Trigger event to update other components
        triggerDomainUpdate();
      } else {
        throw new Error("Failed to delete domain");
      }
    } catch (err) {
      console.error("DomainRootsList: Error deleting domain:", err);
      toast.error("Failed to delete domain. Please try again.");
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground mt-4">
        Loading domain roots...
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive mt-4">
        <AlertCircle size={16} />
        <span>Error loading domains: {error}</span>
      </div>
    );
  }

  // Render empty state
  if (!domains || !Array.isArray(domains) || domains.length === 0) {
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
        {domains.map((domain, index) => {
          const domainName = typeof domain === 'string' ? domain : domain.domain_name;
          
          if (!domainName) {
            console.error("DomainRootsList: Invalid domain entry:", domain);
            return null;
          }
          
          return (
            <li key={`${domainName}-${index}`} className="flex items-center justify-between bg-background/50 p-2 rounded-md border border-border/50">
              <span className="text-sm">{domainName}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => handleDeleteDomain(domainName)}
              >
                <Trash2 size={14} />
                <span className="sr-only">Delete</span>
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
