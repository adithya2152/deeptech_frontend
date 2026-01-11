import { useQuery } from '@tanstack/react-query';
import { usersApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export function useUserReviews(userId: string, role?: 'buyer' | 'expert') {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['user-reviews', userId, role],
    queryFn: async () => {
      const response = await usersApi.getReviews(userId, token || undefined, role);
      return response.data;
    },
    enabled: !!userId,
  });
}