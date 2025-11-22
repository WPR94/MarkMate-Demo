import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Logo className="h-10" />
          <div className="h-2 w-40 bg-gray-200 rounded overflow-hidden">
            <div className="h-2 bg-brand-600 animate-pulse w-1/2" />
          </div>
          <p className="text-sm text-gray-500">Preparing your workspace…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
