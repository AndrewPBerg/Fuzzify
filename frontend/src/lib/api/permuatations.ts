import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface Permutation {
  permutation_name: string;  // Primary key
  domain_name: string;  // Foreign key to domain
  fuzzer: string;  // Fuzzing method used
  server: string | null;  // Web server for variation
  mail_server: string | null;  // Mail server for variation
  risk: number | null;  // Risk score (numeric)
  risk_level: 'Unknown' | 'low' | 'medium' | 'high';  // Risk level category
  ip_address: string | null;  // Associated IP address
  tlsh: number | null;  // TLSH similarity score
  phash: number | null;  // Perceptual hash similarity score
  mx_spy?: boolean | null;  // Optional MX spy flag
}

// API functions
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10001';

const fetchPermutations = async ({ userId, domainName }: { userId: string, domainName: string }): Promise<Permutation[]> => {
  const response = await fetch(`${API_BASE_URL}/api/${userId}/${domainName}/permutations`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch permutations");
  }
  
  const data = await response.json();
  // Handle both direct array responses and responses with a permutations property
  return Array.isArray(data) ? data : data.permutations || [];
};

const countPermutations = async ({ userId }: { userId: string }): Promise<number> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/${userId}/permutations-count`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch permutations count");
    }
    
    const data = await response.json();
    return data.count;
  } catch (error) {
    console.error("Error counting permutations:", error);
    throw new Error("An error occurred while counting permutations. Please try again later.");
  }
};

const generatePermutations = async ({ userId, domainName }: { userId: string, domainName: string }): Promise<{ message: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/${userId}/${domainName}/permutations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    }
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to generate permutations");
  }
  
  return response.json();
};


export function useCountPermutations(userId: string) {
  return useQuery({
    queryKey: ["permutations-count", userId],
    queryFn: () => countPermutations({ userId }),
    staleTime: 300000, // Data remains fresh for 5 minutes
    gcTime: 600000, // Keep cached data for 10 minutes
    enabled: !!userId, // Only run query if userId is provided
  });
}

// Query hooks
export function usePermutations(userId: string, domainName: string) {
  return useQuery({
    queryKey: ["permutations", userId, domainName],
    queryFn: () => fetchPermutations({ userId, domainName }),
    staleTime: 300000, // Data remains fresh for 5 minutes
    gcTime: 600000, // Keep cached data for 10 minutes
    enabled: !!userId && !!domainName, // Only run query if both userId and domainName are provided
  });
}

export function useGeneratePermutations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generatePermutations,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["permutations", variables.userId, variables.domainName] });
      // Also invalidate domains query to refresh risk counts and other domain data
      queryClient.invalidateQueries({ queryKey: ["domains", variables.userId] });
      toast.success("Permutations generated", {
        description: `Domain permutations for "${variables.domainName}" have been generated`,
      });
    },
    onError: (error) => {
      toast.error("Error generating permutations", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    },
  });
}

