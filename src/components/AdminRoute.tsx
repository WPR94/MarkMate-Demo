import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';

interface AdminRouteProps {
  children: React.ReactNode;
}

/**
 * AdminRoute - Protects admin-only routes
 * Redirects non-admin users to dashboard
 */
export function AdminRoute({ children }: AdminRouteProps) {
  const { user, profile, loading, signOut } = useAuth();
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    if (loading) {
      const t = setTimeout(() => setStuck(true), 5000);
      return () => clearTimeout(t);
    } else {
      setStuck(false);
    }
  }, [loading]);

  // Debug logging to help diagnose spinner issues
  if (typeof window !== 'undefined') {
    // Only log once per render cycle
    console.debug('[AdminRoute] state', { userId: user?.id, loading, profile });
  }

  // Show nothing while loading
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-sm text-gray-600 dark:text-gray-300">Loading admin access…</p>
        {!stuck && (
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md">
            Checking your profile & permissions…
          </p>
        )}
        {stuck && (
          <div className="text-xs text-red-600 dark:text-red-400 max-w-md space-y-1">
            <p>Stuck fetching profile (likely RLS or missing row).</p>
            <p>Run a profile SELECT manually and ensure RLS uses <code>user_id</code>.</p>
          </div>
        )}
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 text-sm"
          >
            Retry
          </button>
          <button
            onClick={() => signOut()}
            className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
          >
            Force Sign Out
          </button>
          <button
            onClick={() => {
              try {
                Object.keys(localStorage).forEach(k => { if (k.startsWith('sb-')) localStorage.removeItem(k); });
              } catch {}
              window.location.href = '/auth';
            }}
            className="px-3 py-1.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm"
          >
            Clear Session
          </button>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to dashboard if not admin
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6 text-center">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Profile not found</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md">
          Your profile row is missing. Run the SQL migration and insert your profile or refresh after logging out/in.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (!profile.is_admin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6 text-center">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Admin Access Required</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md">
          Your account is not marked as admin. Update <code>is_admin</code> to TRUE for your user in the <code>profiles</code> table.
        </p>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Back to Dashboard
          </Link>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>
    );
  }

  // User is admin, render the protected content
  return <>{children}</>;
}
