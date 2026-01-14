import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { invitationsApi } from '@/lib/api';

export function useExpertInvitations() {
  const { token, user } = useAuth();

  return useQuery({
    queryKey: ['expert-invitations', user?.id],
    queryFn: async () => {
      if (!token) return [];
      const response = await invitationsApi.getMyInvitations(token);
      return response.data;
    },
    enabled: !!token && user?.role === 'expert',
  });
}

export function useSendInvitation() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      expertId,
      message,
      engagement_model,
      payment_terms
    }: {
      projectId: string;
      expertId: string;
      message: string;
      engagement_model?: string;
      payment_terms?: Record<string, any>;
    }) => {
      if (!token) throw new Error('Not authenticated');
      return await invitationsApi.send(projectId, expertId, message, token, engagement_model, payment_terms);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expert-invitations'] });
    },
  });
}

export function useRespondToInvitation() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ invitationId, status }: { invitationId: string; status: 'accepted' | 'declined' }) => {
      if (!token) throw new Error('Not authenticated');
      return await invitationsApi.updateStatus(invitationId, status, token);
    },
    onMutate: async ({ invitationId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['expert-invitations', user?.id] });

      const previousInvitations = queryClient.getQueryData<any[]>(['expert-invitations', user?.id]);

      queryClient.setQueryData<any[]>(['expert-invitations', user?.id], (current = []) =>
        current.map((inv) => (inv?.id === invitationId ? { ...inv, status } : inv))
      );

      return { previousInvitations };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousInvitations) {
        queryClient.setQueryData(['expert-invitations', user?.id], context.previousInvitations);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expert-invitations', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['notificationCounts'] });
    },
  });
}