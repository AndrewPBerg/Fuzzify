"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    // Check if domain already exists in local storage
    const existingRoots = JSON.parse(localStorage.getItem("domainRoots") || "[]");
    
    if (existingRoots.includes(domainRoot)) {
      toast.error("Error", {
        description: "This domain root already exists",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Save domain root to backend via API
      const response = await fetch('/api/domains', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ domainRoot }),
      });

      if (!response.ok) {
        throw new Error('Failed to add domain root');
      }
      
      // Update local storage
      const updatedRoots = [...existingRoots, domainRoot];
      localStorage.setItem("domainRoots", JSON.stringify(updatedRoots));
      
      // Dispatch storage event to update other components
      window.dispatchEvent(new Event('storage'));
      
      toast.success("Success", {
        description: `Domain root "${domainRoot}" has been saved`,
      });
      
      setDomainRoot("");
    } catch (error) {
      console.error('Error adding domain root:', error);
      toast.error("Error", {
        description: "Failed to add domain root. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
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
