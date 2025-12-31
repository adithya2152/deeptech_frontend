import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useAdminStats() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const response = await adminApi.getStats(token!);
      return response.data;
    },
    enabled: !!token,
  });
}

export function useAdminUsers(search?: string, role?: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin-users', search, role],
    queryFn: async () => {
      const response = await adminApi.getUsers(token!, search, role);
      return response.data;
    },
    enabled: !!token,
  });
}

export function useAdminUser(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin-user', id],
    queryFn: async () => {
      const response = await adminApi.getUserById(id, token!);
      return response.data;
    },
    enabled: !!token && !!id,
  });
}

export function useAdminUserContracts(userId: string) {
    const { token } = useAuth();
    return useQuery({
       queryKey: ['admin-user-contracts', userId],
       queryFn: async () => {
           const response = await adminApi.getUserContracts(userId, token!);
           return response.data;
       },
       enabled: !!token && !!userId
    });
}

export function useAdminProjects() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin-projects'],
    queryFn: async () => {
      const response = await adminApi.getProjects(token!);
      return response.data;
    },
    enabled: !!token,
  });
}

export function useAdminContracts() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin-contracts'],
    queryFn: async () => {
      const response = await adminApi.getContracts(token!);
      return response.data;
    },
    enabled: !!token,
  });
}

export function useAdminDisputes() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin-disputes'],
    queryFn: async () => {
      const response = await adminApi.getDisputes(token!);
      return response.data;
    },
    enabled: !!token,
  });
}

export function useAdminReports() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin-reports'],
    queryFn: async () => {
      const response = await adminApi.getReports(token!);
      return response.data;
    },
    enabled: !!token,
  });
}

export function useAdminPayouts() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin-payouts'],
    queryFn: async () => {
      const response = await adminApi.getPayouts(token!);
      return response.data;
    },
    enabled: !!token,
  });
}

export function useAdminActions() {
  const { toast } = useToast();
  const [isActing, setIsActing] = useState(false);
  const { token } = useAuth(); 
  const queryClient = useQueryClient();

  const performAction = async (
    actionFn: () => Promise<any>,
    successMessage: string
  ) => {
    setIsActing(true);
    try {
      if (!token) throw new Error("No auth token");
      await actionFn();

      toast({
        title: "Action Successful",
        description: successMessage,
        variant: "default", 
      });

      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user'] });
      queryClient.invalidateQueries({ queryKey: ['admin-user-contracts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      queryClient.invalidateQueries({ queryKey: ['admin-contracts'] });
      queryClient.invalidateQueries({ queryKey: ['admin-disputes'] });
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin-payouts'] });

      return true;
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Action Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsActing(false);
    }
  };

  const banUser = (userId: string, reason: string) => 
    performAction(() => adminApi.banUser(userId, reason, token!), 'User banned successfully');

  const unbanUser = (userId: string) =>
    performAction(() => adminApi.unbanUser(userId, token!), 'User account reactivated successfully');
    
  const verifyExpert = (expertId: string) => 
    performAction(() => adminApi.verifyExpert(expertId, token!), 'Expert verified successfully');
  
  const inviteAdmin = (email: string) => 
    performAction(() => adminApi.inviteAdmin(email, token!), 'Invitation sent');
  
  const approveProject = (projectId: string) => 
    performAction(() => adminApi.approveProject(projectId, token!), 'Project approved');
  
  const rejectProject = (projectId: string) => 
    performAction(() => adminApi.rejectProject(projectId, token!), 'Project rejected');
  
  const resolveDispute = (disputeId: string, decision: string, note?: string) => 
    performAction(() => adminApi.resolveDispute(disputeId, decision, note, token!), 'Dispute resolved');

  const dismissReport = (reportId: string) => 
    performAction(() => adminApi.dismissReport(reportId, token!), 'Report dismissed');
  
  const takeActionOnReport = (reportId: string, action: string) => 
    performAction(() => adminApi.actionReport(reportId, action, token!), 'Report action taken');

  const processPayout = (payoutId: string) => 
    performAction(() => adminApi.processPayout(payoutId, token!), 'Payout processed');

  return {
    isActing,
    banUser,
    unbanUser,
    verifyExpert,
    inviteAdmin,
    approveProject,
    rejectProject,
    resolveDispute,
    dismissReport,
    takeActionOnReport,
    processPayout
  };
}