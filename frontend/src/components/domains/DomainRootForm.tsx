"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useDomains } from "@/hooks/useDomains";
import { useUser } from "@/contexts/UserContext";
import { triggerDomainUpdate } from "./DomainRootsList";

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
  const { currentUser } = useUser();
  const { addDomain, isLoading: isSubmitting } = useDomains();
  
  const handleAddDomainRoot = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error("Please login first");
      return;
    }
    
    // Validate domain before submitting
    if (!domainRoot.trim()) {
      toast.error("Please enter a domain root");
      return;
    }

    if (!isValidDomain(domainRoot)) {
      toast.error("Please enter a valid domain root");
      return;
    }

    try {
      const result = await addDomain(domainRoot.trim());
      
      if (result?.success) {
        if (result.isDuplicate) {
          toast.warning(`Domain "${domainRoot}" already exists`);
        } else {
          toast.success("Domain root added successfully");
          // Trigger domain update event to refresh lists
          triggerDomainUpdate();
        }
        setDomainRoot(""); // Clear the input
      } else {
        throw new Error(result?.error ? String(result.error) : "Unknown error");
      }
    } catch (error) {
      console.error('Error adding domain root:', error);
      toast.error(error instanceof Error ? error.message : "Failed to add domain root. Please try again.");
    }
  };

  return (
    <form onSubmit={handleAddDomainRoot} className="flex items-center gap-2">
      <Input
        type="text"
        placeholder="example.com"
        value={domainRoot}
        onChange={(e) => setDomainRoot(e.target.value)}
        className="max-w-xs bg-background/50"
        disabled={isSubmitting}
      />
      <Button 
        type="submit" 
        size="sm" 
        className="flex items-center gap-1"
        disabled={isSubmitting}
      >
        <Plus size={16} />
        <span>{isSubmitting ? "Adding..." : "Add Root"}</span>
      </Button>
    </form>
  );
}
