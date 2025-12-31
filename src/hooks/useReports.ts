import { useMutation } from '@tanstack/react-query';
import { reportsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export function useSubmitReport() {
  const { toast } = useToast();
  const { token } = useAuth();
  
  return useMutation({
    mutationFn: async ({ 
      reportedId, 
      type, 
      description, 
      evidence 
    }: { 
      reportedId: string; 
      type: string; 
      description: string; 
      evidence?: any[] 
    }) => {
      if (!token) throw new Error("You must be logged in to submit a report");

      return reportsApi.create({
        reported_id: reportedId,
        type,
        description,
        evidence
      }, token);
    },
    onSuccess: () => {
      toast({
        title: "Report Submitted",
        description: "Our safety team has received your report and will investigate.",
      });
    },
    onError: (error: any) => {
      console.error(error);
      toast({
        title: "Submission Failed",
        description: error.message || "Could not submit report. Please try again.",
        variant: "destructive"
      });
    }
  });
}