import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { BuyerDashboard } from './BuyerDashboard';
import { ExpertDashboard } from './ExpertDashboard';

export default function DashboardPage() {
  const { user, profile, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  // Determine role. Profile usually has more detailed info but user.role is the source of truth for auth.
  const is_buyer = (profile?.role || user?.role) === 'buyer';

  return (
    <Layout>
      {is_buyer ? <BuyerDashboard /> : <ExpertDashboard />}
    </Layout>
  );
}
