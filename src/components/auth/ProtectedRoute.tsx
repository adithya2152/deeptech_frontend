import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

type ProtectedRouteProps = {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requireVerifiedExpert?: boolean;
};

export function ProtectedRoute({
  children,
  allowedRoles,
  requireVerifiedExpert,
}: ProtectedRouteProps) {
  const location = useLocation();
  const { isLoading, isAuthenticated, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role as UserRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireVerifiedExpert && user.role === 'expert') {
    const expertStatus = String((user as any).expert_status || '').toLowerCase();
    if (expertStatus !== 'verified') {
      return <Navigate to="/profile" replace state={{ needsVerification: true }} />;
    }
  }

  return <>{children}</>;
}
