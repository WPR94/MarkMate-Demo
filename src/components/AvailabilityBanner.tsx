import React from 'react';
import { useAvailability } from '../hooks/useAvailability';

export default function AvailabilityBanner() {
  const { available, browserOnline, isLoading } = useAvailability();

  if (isLoading || available) return null;

  const reason = !browserOnline ? 'You appear to be offline.' : 'Service is temporarily unavailable.';

  return (
    <div className="w-full bg-yellow-100 border-b border-yellow-300 text-yellow-900 text-sm">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>⚠️</span>
          <span>{reason} Some features may not work. We’ll retry automatically.</span>
        </div>
        <button
          className="px-3 py-1 bg-yellow-200 hover:bg-yellow-300 rounded border border-yellow-400"
          onClick={() => window.location.reload()}
        >
          Retry now
        </button>
      </div>
    </div>
  );
}
