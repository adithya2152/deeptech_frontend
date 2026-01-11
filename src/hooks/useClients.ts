import { useQuery } from '@tanstack/react-query';
import { clientsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export function useClient(clientId: string) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const [profileRes, statsRes] = await Promise.all([
        clientsApi.getById(clientId, token || undefined),
        clientsApi.getPublicStats(clientId, token || undefined).catch(() => ({ data: {} }))
      ]);
      
      return {
        ...profileRes.data,
        stats: statsRes.data
      };
    },
    enabled: !!clientId,
  });
}