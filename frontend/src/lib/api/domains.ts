import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface RiskCounts {
  high: number;
  medium: number;
  low: number;
  unknown: number;
}

export interface Domain {
  domain_name: string;
  user_id: string;
  last_scan?: string | null;
  total_scans: number;
  ip_address?: string | null;
  server?: string | null;
  mail_server?: string | null;
  risk_counts?: RiskCounts;
}

export interface DomainsResponse {
  domains: Domain[];
  user_risk_counts: RiskCounts;
}

interface CreateDomainResponse {
  message: string;
  domain_name: string;
}

// API functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10001';

const fetchDomains = async (userId: string): Promise<DomainsResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/${userId}/domain`);
  if (!response.ok) {
    throw new Error("Failed to fetch domains");
  }
  
  try {
    const data = await response.json();
    
    // Store domains in localStorage
    localStorage.setItem("domainRoots", JSON.stringify(data.domains.map((d: Domain) => d.domain_name)));
    
    return {
      domains: data.domains,
      user_risk_counts: data.user_risk_counts || {
        high: 0,
        medium: 0,
        low: 0,
        unknown: 0
      }
    };
  } catch (error) {
    console.error("JSON parsing error:", error);
    throw new Error("Invalid response format from server");
  }
};

const createDomain = async ({ userId, domain_name }: { userId: string, domain_name: string }): Promise<CreateDomainResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/${userId}/domain`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ domain_name }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to add domain");
  }
  
  // Update local storage on success
  const existingRootsStr = localStorage.getItem("domainRoots");
  const existingRoots = existingRootsStr ? JSON.parse(existingRootsStr) : [];
  
  if (!existingRoots.includes(domain_name)) {
    const updatedRoots = [...existingRoots, domain_name];
    localStorage.setItem("domainRoots", JSON.stringify(updatedRoots));
    
    // Dispatch storage event to update other components
    window.dispatchEvent(new Event('storage'));
  }
  
  return response.json();
};

const deleteDomain = async ({ userId, domain_name }: { userId: string, domain_name: string }): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/${userId}/domain`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ domain_name }),
  });
  
  if (!response.ok) {
    throw new Error("Failed to delete domain");
  }
  
  // Remove from localStorage on success
  const existingRootsStr = localStorage.getItem("domainRoots");
  const existingRoots = existingRootsStr ? JSON.parse(existingRootsStr) : [];
  const updatedRoots = existingRoots.filter((root: string) => root !== domain_name);
  localStorage.setItem("domainRoots", JSON.stringify(updatedRoots));
  
  // Dispatch storage event to update other components
  window.dispatchEvent(new Event('storage'));
};

// Query hooks
export function useDomains(userId: string) {
  return useQuery({
    queryKey: ["domains", userId],
    queryFn: () => fetchDomains(userId),
    staleTime: 60000, // Data remains fresh for 1 minute
    gcTime: 300000, // Keep cached data for 5 minutes
    enabled: !!userId, // Only run query if userId is provided
  });
}

export function useCreateDomain() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDomain,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["domains", variables.userId] });
      toast.success("Domain added successfully", {
        description: `Domain "${variables.domain_name}" has been saved`,
      });
    },
    onError: (error) => {
      toast.error("Error adding domain", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    },
  });
}

export function useDeleteDomain() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteDomain,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["domains", variables.userId] });
      toast.success("Domain deleted successfully", {
        description: `Domain "${variables.domain_name}" has been removed`,
      });
    },
    onError: (error) => {
      toast.error("Error deleting domain", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    },
  });
}

/* *OLD CODE:*



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
  } 
*/