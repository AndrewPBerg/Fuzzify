import { useState, useCallback, useRef, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useFetchWithCache } from './useFetchWithCache';

// Define the Domain interface based on backend response
interface Domain {
  domain_name: string;
  user_id?: string;
  username?: string;
  total_scans?: number;
}

interface DomainResponse {
  success: boolean;
  isDuplicate?: boolean;
  data?: any;
  error?: unknown;
}

interface UseDomainResult {
  domains: Domain[];
  isLoading: boolean;
  error: string | null;
  fetchDomains: () => Promise<void>;
  addDomain: (domainName: string) => Promise<DomainResponse | undefined>;
  deleteDomain: (domainName: string) => Promise<boolean>;
}

export function useDomains(): UseDomainResult {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useUser();
  const { fetchWithCache, invalidateCache } = useFetchWithCache<any>(); // <-- Changed to any
  const hasInitiallyFetched = useRef(false);

  // Initial fetch when the component mounts or when user changes
  useEffect(() => {
    if (currentUser && !hasInitiallyFetched.current) {
      fetchDomains(false);
      hasInitiallyFetched.current = true;
    }
  }, [currentUser]);

  const fetchDomains = useCallback(async (force: boolean = false) => {
    if (!currentUser) {
      setError('No user logged in');
      setIsLoading(false); // Ensure loading state is reset
      return;
    }

    // Always set loading to true to fix the state management
    setIsLoading(true);
    setError(null);

    try {
      const url = `/api/user/${currentUser.user_id}/domain`;
      console.log(`[useDomains] Fetching domains from: ${url}`);
      
      const response = await fetchWithCache(
        url,
        undefined,
        { cacheDuration: force ? 0 : 15000 } // Shorter cache time
      );
      
      console.log('[useDomains] Raw API response:', response);
      
      // Handle different API response formats
      let domainsData: Domain[] = [];
      
      if (Array.isArray(response)) {
        // Direct array of domains
        domainsData = response;
      } else if (response && typeof response === 'object') {
        // If response has a domains property (matches our API format)
        if (Array.isArray(response.domains)) {
          domainsData = response.domains;
        } else if (Array.isArray(response.data)) {
          domainsData = response.data;
        } else if (response.domains && !Array.isArray(response.domains)) {
          // Single domain object
          domainsData = [response.domains];
        }
      }
      
      console.log('[useDomains] Processed domains data:', domainsData);
      setDomains(Array.isArray(domainsData) ? domainsData : []);
    } catch (err) {
      console.error('[useDomains] Error fetching domains:', err);
      setError('Failed to fetch domains');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, fetchWithCache]);

  const addDomain = useCallback(async (domainName: string) => {
    if (!currentUser) {
      setError('No user logged in');
      return { success: false, error: 'No user logged in' };
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = `/api/user/${currentUser.user_id}/domain`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain_name: domainName,
        }),
      });
      
      // Read the response body
      const data = await response.json();
      
      // Check for API errors
      if (!response.ok) {
        throw new Error(data.error || `Error: ${response.status}`);
      }
      
      // Handle duplicate domain case (still a successful response)
      const isDuplicate = data.message === "Domain already exists";
      
      // Always invalidate cache and refresh after any operation
      invalidateCache(url);
      fetchDomains(true);
      
      return { success: true, isDuplicate, data };
    } catch (err) {
      setError('Failed to add domain');
      console.error('[useDomains] Error adding domain:', err);
      return { success: false, error: err };
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, fetchDomains, invalidateCache]);

  const deleteDomain = useCallback(async (domainName: string): Promise<boolean> => {
    if (!currentUser) {
      setError('No user logged in');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = `/api/user/${currentUser.user_id}/domain`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain_name: domainName,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Error: ${response.status}`);
      }
      
      // Always invalidate cache and refresh after deletion
      invalidateCache(url);
      
      // Update local state immediately by filtering out the deleted domain
      setDomains(prev => prev.filter(d => d.domain_name !== domainName));
      
      // Also do a fresh fetch to ensure we're in sync with server
      fetchDomains(true);
      
      return true;
    } catch (err) {
      setError('Failed to delete domain');
      console.error('[useDomains] Error deleting domain:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, fetchDomains, invalidateCache]);

  return {
    domains,
    isLoading,
    error,
    fetchDomains: () => fetchDomains(true), // Always force fresh data
    addDomain,
    deleteDomain,
  };
} 