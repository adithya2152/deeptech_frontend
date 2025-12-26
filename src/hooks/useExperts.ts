import { useQuery } from '@tanstack/react-query';
import { expertsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Domain, Expert } from '@/types';

interface ExpertFilters {
  domains?: Domain[];
  rateMin?: number;
  rateMax?: number;
  onlyVerified?: boolean;
  searchQuery?: string;
}

export function useExperts(filters: ExpertFilters = {}) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['experts', filters],
    queryFn: async () => {
      const response = await expertsApi.getAll(token, filters);
      return (response.data || []) as Expert[];
    },
    placeholderData: [],
  });
}

export function useExpert(id: string) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['expert', id],
    queryFn: async () => {
      const response = await expertsApi.getById(id, token);
      return response.data as Expert;
    },
    enabled: !!id,
  });
}