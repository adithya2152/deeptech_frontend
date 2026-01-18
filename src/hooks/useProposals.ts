import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { projectsApi } from '../lib/api';
import { Proposal } from '../types/index';

// Fetch proposals for a specific project (Buyer View)
export function useProposals(projectId: string, options?: { enabled?: boolean }) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['proposals', projectId],
    queryFn: async () => {
      if (!token || !projectId) return [];
      const response = await projectsApi.getProposals(projectId, token);
      return response.data as Proposal[];
    },
    enabled: (options?.enabled ?? true) && !!token && !!projectId,
  });
}

// Fetch proposals received by the current Expert (Expert View)
export function useExpertProposals() {
  const { token, user } = useAuth();

  return useQuery({
    queryKey: ['expert-proposals', user?.id],
    queryFn: async () => {
      if (!token) return [];
      // Assuming API endpoint: GET /experts/me/proposals or similar
      const response = await projectsApi.getExpertProposals(token); 
      return response.data as Proposal[];
    },
    enabled: !!token && user?.role === 'expert',
  });
}