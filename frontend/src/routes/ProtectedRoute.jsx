import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import Spinner from "../components/common/Spinner";

/**
 * Wraps any admin route.
 * - While session is loading → show spinner (prevents flash of login page)
 * - Not authenticated OR not staff → redirect to /admin/login
 * - Authenticated staff → render children
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location          = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-navy flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user || !user.is_staff) {
    // Save the page they tried to visit so we can redirect back after login
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
}
