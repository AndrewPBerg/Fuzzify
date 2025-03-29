"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { DEMO_DOMAIN_ROOTS } from "@/lib/demo-data/domain";

// Function to validate if a string is a valid domain
const isValidDomain = (domain: string): boolean => {
  // Remove protocol and path if present to focus on domain validation
  let domainToCheck = domain.trim();
  
  // Remove protocol if present
  domainToCheck = domainToCheck.replace(/^(https?:\/\/)?(www\.)?/i, '');
  
  // Remove path, query params, etc. if present
  domainToCheck = domainToCheck.split('/')[0];
  
  // Basic domain validation regex
  // Checks for valid domain name format with at least one dot
  const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  
  return domainRegex.test(domainToCheck);
};

export function DomainRootForm() {
  const [domainRoot, setDomainRoot] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleAddDomainRoot = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!domainRoot.trim()) {
      toast.error("Error", {
        description: "Please enter a domain root",
      });
      return;
    }
    
    if (!isValidDomain(domainRoot)) {
      toast.error("Error", {
        description: "Please enter a valid domain (e.g., example.com)",
      });
      return;
    }
    
    // Check if domain already exists in domain roots
    const domainExists = DEMO_DOMAIN_ROOTS.some(
      domain => domain.name.toLowerCase() === domainRoot.toLowerCase()
    );
    
    if (domainExists) {
      toast.error("Error", {
        description: "This domain already exists in the system.",
      });
      return;
    }
    
    setIsPending(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      try {
        // In a real app, we would store this in a database
        // For demo, we'll just show a success message
        toast.success("Domain Added", {
          description: `${domainRoot} has been added successfully.`,
        });
        
        // Clear the input field after successful submission
        setDomainRoot("");
      } catch (error) {
        toast.error("Error", {
          description: "Failed to add domain. Please try again.",
        });
      } finally {
        setIsPending(false);
      }
    }, 800); // Simulate network delay
  };

  return (
    <form onSubmit={handleAddDomainRoot} className="flex items-center gap-2">
      <Input
        type="text"
        placeholder="example.com"
        value={domainRoot}
        onChange={(e) => setDomainRoot(e.target.value)}
        className="max-w-xs bg-background/50"
        disabled={isPending}
      />
      <Button 
        type="submit" 
        size="sm" 
        className="flex items-center gap-1"
        disabled={isPending}
      >
        <Plus size={16} />
        <span>{isPending ? "Adding..." : "Add Root"}</span>
      </Button>
    </form>
  );
}
