"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const handleAddDomainRoot = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!domainRoot.trim()) {
      toast({
        title: "Error",
        description: "Please enter a domain root",
        variant: "destructive",
      });
      return;
    }
    
    if (!isValidDomain(domainRoot)) {
      toast({
        title: "Error",
        description: "Please enter a valid domain (e.g., example.com)",
        variant: "destructive",
      });
      return;
    }
    
    // In a real application, this would save to a database or state management
    const existingRoots = JSON.parse(localStorage.getItem("domainRoots") || "[]");
    
    if (existingRoots.includes(domainRoot)) {
      toast({
        title: "Error",
        description: "This domain root already exists",
        variant: "destructive",
      });
      return;
    }
    
    const updatedRoots = [...existingRoots, domainRoot];
    localStorage.setItem("domainRoots", JSON.stringify(updatedRoots));
    
    toast({
      title: "Success",
      description: `Domain root "${domainRoot}" has been saved`,
    });
    
    setDomainRoot("");
  };

  return (
    <form onSubmit={handleAddDomainRoot} className="flex items-center gap-2">
      <Input
        type="text"
        placeholder="example.com"
        value={domainRoot}
        onChange={(e) => setDomainRoot(e.target.value)}
        className="max-w-xs bg-background/50"
      />
      <Button type="submit" size="sm" className="flex items-center gap-1">
        <Plus size={16} />
        <span>Add Root</span>
      </Button>
    </form>
  );
}
