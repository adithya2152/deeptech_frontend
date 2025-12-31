import { useMutation, useQueryClient } from '@tanstack/react-query';
import { disputesApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export function useRaiseDispute() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      contractId, 
      reason, 
      description,
      evidence 
    }: { 
      contractId: string; 
      reason: string; 
      description: string;
      evidence?: any[] 
    }) => {
      if (!token) throw new Error("You must be logged in to raise a dispute");
      
      return disputesApi.create({
        contract_id: contractId,
        reason,
        description,
        evidence
      }, token);
    },
    onSuccess: () => {
      toast({
        title: "Dispute Raised",
        description: "Admin team has been notified. The contract is now paused pending review.",
      });
      queryClient.invalidateQueries({ queryKey: ['contract'] });
    },
    onError: (error: any) => {
      console.error(error);
      toast({
        title: "Failed to Raise Dispute",
        description: error.message || "Something went wrong.",
        variant: "destructive"
      });
    }
  });
}