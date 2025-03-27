"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useCreateDomain } from "@/lib/api/domains";
import { userStorage } from "@/lib/api/users";

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
  const createDomainMutation = useCreateDomain();

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
    
    const currentUser = userStorage.getCurrentUser();
    
    // Use the mutation from domains.ts
    createDomainMutation.mutate(
      { 
        userId: currentUser.userId, 
        domain_name: domainRoot 
      },
      {
        onSuccess: () => {
          setDomainRoot("");
        }
      }
    );
  };

  return (
    <form onSubmit={handleAddDomainRoot} className="flex items-center gap-2">
      <Input
        type="text"
        placeholder="example.com"
        value={domainRoot}
        onChange={(e) => setDomainRoot(e.target.value)}
        className="max-w-xs bg-background/50"
        disabled={createDomainMutation.isPending}
      />
      <Button 
        type="submit" 
        size="sm" 
        className="flex items-center gap-1"
        disabled={createDomainMutation.isPending}
      >
        <Plus size={16} />
        <span>{createDomainMutation.isPending ? "Adding..." : "Add Root"}</span>
      </Button>
    </form>
  );
}
