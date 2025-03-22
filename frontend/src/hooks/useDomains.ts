import { useState, useCallback, useRef, useEffect } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useFetchWithCache } from './useFetchWithCache';

interface Domain {
  domain_name: string;
  user_id: string;
  username: string;
  total_scans: number;
}

interface UseDomainResult {
  domains: Domain[];
  isLoading: boolean;
  error: string | null;
  fetchDomains: () => Promise<void>;
  addDomain: (domainName: string) => Promise<void>;
}

export function useDomains(): UseDomainResult {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useUser();
  const { fetchWithCache, invalidateCache } = useFetchWithCache<Domain[]>();
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
      return;
    }

    // Don't set loading to true for cached responses
    if (force) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const url = `/api/user/${currentUser.user_id}/domain`;
      const data = await fetchWithCache(
        url,
        undefined,
        { cacheDuration: force ? 0 : 30000 } // Cache for 30 seconds unless force=true
      );
      
      setDomains(data);
    } catch (err) {
      setError('Failed to fetch domains');
      console.error('Error fetching domains:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, fetchWithCache]);

  const addDomain = useCallback(async (domainName: string) => {
    if (!currentUser) {
      setError('No user logged in');
      return;
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
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      // Invalidate domains cache for this user
      invalidateCache(url);
      
      // Refresh domains after adding
      await fetchDomains(true);
    } catch (err) {
      setError('Failed to add domain');
      console.error('Error adding domain:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, fetchDomains, invalidateCache]);

  return {
    domains,
    isLoading,
    error,
    fetchDomains: () => fetchDomains(false),
    addDomain,
  };
} 