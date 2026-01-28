import { useQuery } from '@tanstack/react-query';
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
      
      // --- FIX: Cast to 'any' to stop TypeScript errors & handle structure ---
      const rawData = response.data as any;

      // 1. If backend returns { data: [...] } (Your current Node/Python setup)
      if (rawData && Array.isArray(rawData.data)) {
        return rawData.data as Proposal[];
      }

      // 2. If backend returns plain array [...] (Fallback)
      if (Array.isArray(rawData)) {
        return rawData as Proposal[];
      }
      
      return [];
    },
    enabled: (options?.enabled ?? true) && !!token && !!projectId,
  });
}

// ... useExpertProposals remains the same ...

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