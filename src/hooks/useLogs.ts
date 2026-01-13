import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { contractsApi, dayWorkSummariesApi, workLogsApi } from '../lib/api';
import { DayWorkSummary, Invoice, WorkLog } from '../types';
import { toast } from '@/components/ui/use-toast';

/* =========================
   DAY WORK SUMMARIES (DAILY)
========================= */
export function useDayWorkSummaries(contractId: string) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['dayWorkSummaries', contractId],
    queryFn: async () => {
      if (!token || !contractId) return [];
      const res = await dayWorkSummariesApi.getByContract(contractId, token);
      return res.data || [];
    },
    enabled: !!token && !!contractId,
  });
}

export function useSubmitWorkSummary() {
  const { token } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      contractId,
      work_date,
      total_hours
    }: {
      contractId: string;
      total_hours: number;
      work_date: string;
    }) =>
      dayWorkSummariesApi.create(contractId, work_date, total_hours, token!),
    onSuccess: (_, { contractId }) => {
      qc.invalidateQueries({ queryKey: ['dayWorkSummaries', contractId] });
      qc.invalidateQueries({ queryKey: ['contract', contractId] });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit work summary",
        variant: "destructive",
      });
    },
  });
}

export function useApproveRejectWorkSummary() {
  const { token } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      summaryId,
      status,
      reviewerComment,
    }: {
      summaryId: string;
      status: 'approved' | 'rejected';
      reviewerComment?: string;
    }) =>
      dayWorkSummariesApi.approveOrReject(
        summaryId,
        status,
        reviewerComment,
        token!,
      ),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['dayWorkSummaries'] });
      qc.invalidateQueries({ queryKey: ['contract'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });

      if (variables?.status === 'approved') {
        toast({
          title: 'Approved',
          description: 'Work summary approved successfully',
        });
      }
    },
  });
}


/* =========================
   WORK LOGS (SPRINT + FIXED)
========================= */
export function useContractWorkLogs(contractId: string) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['workLogs', contractId],
    queryFn: async () => {
      if (!token || !contractId) return [];
      const res = await workLogsApi.getByContract(contractId, token);
      const rows = Array.isArray(res) ? res : (res as any).data || [];
      return rows as WorkLog[];
    },
    enabled: !!token && !!contractId,
  });
}

export function useLogWork() {
  const { token } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ contractId, data }: { contractId: string; data: any }) =>
      workLogsApi.create(contractId, data, token!),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['workLogs', v.contractId] });
      qc.invalidateQueries({ queryKey: ['contract', v.contractId] });
    },
  });
}

export function useEditWorkLog() {
  const { token } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ workLogId, data }: { workLogId: string; data: any }) =>
      workLogsApi.update(workLogId, data || {}, token!),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['workLogs'] });
      qc.invalidateQueries({ queryKey: ['contract'] });
      // If caller has contractId, they can invalidate more specifically.
    },
    onError: (error: any) => {
      toast({
        title: 'Update failed',
        description: error?.message || 'Failed to update work log',
        variant: 'destructive',
      });
    },
  });
}

export function useApproveWorkLog() {
  const { token } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ workLogId }: { workLogId: string }) =>
      workLogsApi.approve(workLogId, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workLogs'] });
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['contract'] });

      toast({
        title: 'Approved',
        description: 'Work log approved successfully',
      });
    },
  });
}

export function useRejectWorkLog() {
  const { token } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      contractId,
      workLogId,
      reason,
    }: {
      contractId: string;
      workLogId: string;
      reason: string;
    }) => workLogsApi.reject(workLogId, reason, token!),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['workLogs', v.contractId] });
    },
  });
}

/* =========================
   INVOICES
========================= */
export function useInvoice(invoiceId: string) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      if (!token || !invoiceId) return null;
      const res = await contractsApi.getInvoice(invoiceId, token);
      return res.data as Invoice;
    },
    enabled: !!token && !!invoiceId,
  });
}

export function usePayInvoice() {
  const { token } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ invoiceId }: { invoiceId: string }) =>
      contractsApi.payInvoice(invoiceId, token!),
    onSuccess: (_, { invoiceId }) => {
      qc.invalidateQueries({ queryKey: ['invoices'] });
      qc.invalidateQueries({ queryKey: ['invoice', invoiceId] });
      qc.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
}
