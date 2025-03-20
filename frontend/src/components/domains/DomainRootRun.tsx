"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DomainRootRunProps {
  domainRoot?: string;
  onSuccess?: () => void;
  className?: string;
  compact?: boolean;
}

const runDomainAnalysis = async (domainRoot: string) => {
  const response = await fetch('/api/domains/run', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ domainRoot }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to run domain analysis');
  }

  return response.json();
};

export function DomainRootRun({ domainRoot, onSuccess, className = "", compact = false }: DomainRootRunProps) {
  const [selectedDomainRoot, setSelectedDomainRoot] = useState<string | undefined>(domainRoot);
  const [domainRoots, setDomainRoots] = useState<string[]>([]);

  // Get domain roots from localStorage
  useEffect(() => {
    const storedRoots = JSON.parse(localStorage.getItem("domainRoots") || "[]");
    setDomainRoots(storedRoots);
    
    if (!domainRoot && storedRoots.length > 0) {
      setSelectedDomainRoot(storedRoots[0]);
    }
    
    // Add event listener for storage changes
    const handleStorageChange = () => {
      const updatedRoots = JSON.parse(localStorage.getItem("domainRoots") || "[]");
      setDomainRoots(updatedRoots);
      
      // Update selected root if not in the list or if no selection
      if (updatedRoots.length > 0 && (!selectedDomainRoot || !updatedRoots.includes(selectedDomainRoot))) {
        setSelectedDomainRoot(updatedRoots[0]);
      }
    };
    
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [domainRoot, selectedDomainRoot]);

  const { mutate, isPending } = useMutation({
    mutationFn: (domain: string) => runDomainAnalysis(domain),
    onSuccess: (data) => {
      toast.success("Success", {
        description: `Analysis started for domain root "${selectedDomainRoot}"`,
      });
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      toast.error("Error", {
        description: error.message || "Failed to run domain analysis. Please try again.",
      });
    }
  });

  const handleRunAnalysis = () => {
    if (!selectedDomainRoot) {
      toast.error("Error", {
        description: "No domain root selected for analysis",
      });
      return;
    }

    mutate(selectedDomainRoot);
  };

  // For compact mode, just return the button with tooltip
  if (compact) {
    return (
      <div className={className}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button 
                  onClick={handleRunAnalysis}
                  disabled={isPending || !selectedDomainRoot || domainRoots.length === 0}
                  className="flex items-center gap-1"
                  size="sm"
                  variant="secondary"
                >
                  <Play size={16} />
                  <span>{isPending ? "Running..." : "Run Analysis"}</span>
                </Button>
              </div>
            </TooltipTrigger>
            {domainRoots.length === 0 ? (
              <TooltipContent>
                <p>Add a domain root first to run analysis</p>
              </TooltipContent>
            ) : (
              <TooltipContent>
                <p>Run analysis for: {selectedDomainRoot}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  // Original full component
  return (
    <div className={`mt-6 mb-2 space-y-4 ${className}`}>
      <h3 className="text-sm font-medium">Run Domain Analysis</h3>
      <div className="flex items-center gap-2">
        {domainRoots.length > 1 ? (
          <Select
            value={selectedDomainRoot}
            onValueChange={setSelectedDomainRoot}
            disabled={isPending}
          >
            <SelectTrigger className="w-[180px] bg-background/50">
              <SelectValue placeholder="Select domain" />
            </SelectTrigger>
            <SelectContent>
              {domainRoots.map((root) => (
                <SelectItem key={root} value={root}>
                  {root}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : domainRoots.length === 1 ? (
          <div className="text-sm bg-background/50 px-3 py-2 rounded-md border border-border/50">
            {selectedDomainRoot}
          </div>
        ) : null}
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button 
                  onClick={handleRunAnalysis}
                  disabled={isPending || !selectedDomainRoot || domainRoots.length === 0}
                  className="flex items-center gap-1"
                  size="sm"
                >
                  <Play size={16} />
                  <span>{isPending ? "Running..." : "Run Analysis"}</span>
                </Button>
              </div>
            </TooltipTrigger>
            {domainRoots.length === 0 && (
              <TooltipContent>
                <p>Add a domain root first to run analysis</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
