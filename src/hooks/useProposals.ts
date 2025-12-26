import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { projectsApi } from '@/lib/api';
import { Proposal } from '@/types/index';

export function useProposals(projectId: string) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['proposals', projectId],
    queryFn: async () => {
      if (!token || !projectId) return [];
      const response = await projectsApi.getProposals(projectId, token);
      return response.data as Proposal[];
    },
    enabled: !!token && !!projectId,
  });
}

export function useSubmitProposal() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ projectId, data }: { projectId: string; data: any }) => {
      if (!token) throw new Error('Not authenticated');
      return await projectsApi.submitProposal(projectId, data, token);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['proposals', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['marketplace-projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
    },
  });
}