import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { contractsApi, workLogsApi } from '../lib/api';
import { Contract } from '../types';

const transformContract = (contract: any): Contract => ({
  ...contract,
  total_amount: Number(contract.total_amount) || 0,
  total_hours_logged: Number(contract.total_hours_logged) || 0,
  nda_signed: !!contract.nda_signed_at,
});

const transformWorkLog = (log: any) => ({
  ...log,
  description: log.description || log.summary || '',
  evidence: log.evidence || { links: log.links || [] },
  checklist: log.checklist || [],
  value_tags: log.value_tags || {},
});

/* =========================
   CONTRACTS
========================= */

export function useContracts(status?: string) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['contracts', status],
    queryFn: async () => {
      if (!token) return [];
      const res = await contractsApi.getAll(token, status);
      return (res.data || []).map(transformContract);
    },
    enabled: !!token,
  });
}

export function useContract(id: string) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['contract', id],
    queryFn: async () => {
      if (!token || !id) throw new Error('Missing token or id');
      const res = await contractsApi.getById(id, token);
      return transformContract(res.data);
    },
    enabled: !!token && !!id,
  });
}

export function useProjectContracts(projectId: string) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['projectContracts', projectId],
    queryFn: async () => {
      if (!token || !projectId) return [];
      const res = await contractsApi.getByProject(projectId, token);
      return (res.data || []).map(transformContract);
    },
    enabled: !!token && !!projectId,
  });
}

export function useDeclineContract() {
  const { token } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ contractId }: { contractId: string }) =>
      contractsApi.decline(contractId, token!),
    onSuccess: (data, v) => {
      qc.invalidateQueries({ queryKey: ['contracts'] });
      qc.invalidateQueries({ queryKey: ['contract', v.contractId] });
      if (data?.projectId) {
        qc.invalidateQueries({ queryKey: ['project-proposals', data.projectId] });
      }
    },
  });
}

export function useSignNda() {
  const { token } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ contractId, signatureName }: { contractId: string; signatureName: string }) =>
      contractsApi.acceptAndSignNda(contractId, signatureName, token!),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['contracts'] });
      qc.invalidateQueries({ queryKey: ['contract', v.contractId] });
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

/* =========================
   CONTRACT INVOICES
========================= */

export function useContractInvoices(contractId: string) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['invoices', contractId],
    queryFn: async () => {
      if (!token || !contractId) return [];
      const res = await contractsApi.getInvoices(contractId, token!);
      return res.data || [];
    },
    enabled: !!token && !!contractId,
  });
}

/* =========================
   WORK LOGS
========================= */

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

export function useContractWorkLogs(contractId: string) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['workLogs', contractId],
    queryFn: async () => {
      if (!token) return [];
      const res = await workLogsApi.getByContract(contractId, token);
      const rows = Array.isArray(res) ? res : (res as any).data || [];
      return rows.map(transformWorkLog);
    },
    enabled: !!token && !!contractId,
  });
}

export function useUpdateWorkLog() {
  const { token } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      contractId,
      logId,
      data,
    }: {
      contractId: string;
      logId: string;
      data: any;
    }) => workLogsApi.update(logId, data, token!),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['workLogs', variables.contractId] });
    },
  });
}

export function useApproveWorkLog() {
  const { token } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ logId }: { logId: string }) =>
      workLogsApi.approve(logId, token!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['workLogs'] });
    },
  });
}

export function useRejectWorkLog() {
  const { token } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      contractId,
      logId,
      reason,
    }: {
      contractId: string;
      logId: string;
      reason: string;
    }) =>
      workLogsApi.reject(logId, reason, token!),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['workLogs', v.contractId] });
    },
  });
}

/* =========================
   ✅ NEW: FINISH SPRINT (BUYER ONLY)
========================= */
export function useFinishSprint() {
  const { token } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ contractId }: { contractId: string }) =>
      workLogsApi.finishSprint(contractId, token!),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['contract', variables.contractId] });
      qc.invalidateQueries({ queryKey: ['workLogs', variables.contractId] });
      qc.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
}
