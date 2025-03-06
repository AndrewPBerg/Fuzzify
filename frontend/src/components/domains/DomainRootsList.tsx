"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DomainRootsList() {
  const [domainRoots, setDomainRoots] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const storedRoots = JSON.parse(localStorage.getItem("domainRoots") || "[]");
    setDomainRoots(storedRoots);
    
    // Add event listener for storage changes
    const handleStorageChange = () => {
      const updatedRoots = JSON.parse(localStorage.getItem("domainRoots") || "[]");
      setDomainRoots(updatedRoots);
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleDeleteRoot = (root: string) => {
    const updatedRoots = domainRoots.filter(item => item !== root);
    localStorage.setItem("domainRoots", JSON.stringify(updatedRoots));
    setDomainRoots(updatedRoots);
    
    toast({
      title: "Deleted",
      description: `Domain root "${root}" has been removed`,
    });
  };

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
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
              onClick={() => handleDeleteRoot(root)}
            >
              <Trash2 size={14} />
              <span className="sr-only">Delete</span>
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
