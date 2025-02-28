import { useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  redirectPath?: string;
  requireAuth?: boolean;
}

/**
 * A component that protects routes requiring authentication
 * 
 * @param redirectPath - Where to redirect if not authenticated (default: /signin)
 * @param requireAuth - Whether authentication is required (default: true)
 */
export const AuthRoute = ({ 
  redirectPath = '/signin',
  requireAuth = true
}: ProtectedRouteProps) => {
  const { isAuthenticated, loading, refreshSession } = useAuth();
  const location = useLocation();

  // Attempt to refresh the session if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated && requireAuth) {
      refreshSession();
    }
  }, [loading, isAuthenticated, requireAuth, refreshSession]);

  // If still loading, show nothing (or could show a spinner)
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-tontine-purple"></div>
      </div>
    );
  }

  // For routes that require auth: redirect to login if not authenticated
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // For routes that require NO auth (like login page): redirect to dashboard if already authenticated
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // If all checks pass, render the Outlet (child routes)
  return <Outlet />;
};

export default AuthRoute;