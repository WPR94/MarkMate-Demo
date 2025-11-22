import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

function pingApi(): Promise<boolean> {
  return fetch('/api/ping', { cache: 'no-store' })
    .then((res) => res.ok)
    .catch(() => false);
}

export function useAvailability() {
  const { data: apiUp, isLoading } = useQuery(['availability', 'api'], pingApi, {
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    retry: 1,
    staleTime: 15_000,
  });

  // Also consider browser offline state
  const browserOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  const available = useMemo(() => {
    if (!browserOnline) return false;
    if (isLoading) return true; // don't flash banner on first load
    return !!apiUp;
  }, [apiUp, browserOnline, isLoading]);

  return { available, browserOnline, apiUp, isLoading };
}
