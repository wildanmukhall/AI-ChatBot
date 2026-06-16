import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';

/**
 * ProtectedRoute — Hanya bisa diakses user yang sudah login
 * 
 * Jika belum login, redirect ke /login
 */
export function ProtectedRoute({ children }) {
  const token = useAuthStore((state) => state.token);
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

/**
 * GuestRoute — Hanya bisa diakses user yang BELUM login
 * 
 * Jika sudah login, redirect ke /dashboard
 */
export function GuestRoute({ children }) {
  const token = useAuthStore((state) => state.token);

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
