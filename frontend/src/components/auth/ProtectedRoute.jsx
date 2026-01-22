import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

/**
 * Protected route component
 * Redirects to login if not authenticated
 * Optionally checks for specific roles
 */
export default function ProtectedRoute({ children, allowedRoles = null }) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role if allowedRoles specified
  if (allowedRoles && user) {
    const hasRequiredRole = Array.isArray(allowedRoles)
      ? allowedRoles.includes(user.role)
      : user.role === allowedRoles;

    // User doesn't have required role - redirect to jobs
    if (!hasRequiredRole) {
      return <Navigate to="/jobs" replace />;
    }
  }

  return children;
}
