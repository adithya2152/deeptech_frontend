import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Loader2 } from 'lucide-react';
import { ClientProfileEditor } from './ClientProfileEditor';
import ExpertProfileEditor from './ExpertProfileEditor';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-zinc-50/50">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {user?.role === 'expert' ? (
            <ExpertProfileEditor />
          ) : (
            <ClientProfileEditor />
          )}
        </div>
      </div>
    </Layout>
  );
}
