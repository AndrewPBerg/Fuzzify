import { useState, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';

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

  const fetchDomains = useCallback(async () => {
    if (!currentUser) {
      setError('No user logged in');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user/${currentUser.user_id}/domain`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      setDomains(data);
    } catch (err) {
      setError('Failed to fetch domains');
      console.error('Error fetching domains:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const addDomain = useCallback(async (domainName: string) => {
    if (!currentUser) {
      setError('No user logged in');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user/${currentUser.user_id}/domain`, {
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
      
      // Refresh domains after adding
      await fetchDomains();
    } catch (err) {
      setError('Failed to add domain');
      console.error('Error adding domain:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, fetchDomains]);

  return {
    domains,
    isLoading,
    error,
    fetchDomains,
    addDomain,
  };
} 