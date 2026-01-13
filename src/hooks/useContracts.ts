import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { contractsApi } from '../lib/api';
import { Contract } from '../types';

const transformContract = (contract: any): Contract => ({
  ...contract,
  total_amount: Number(contract.total_amount) || 0,
  total_hours_logged: Number(contract.total_hours_logged) || 0,
  nda_signed: !!contract.nda_signed_at,
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
      qc.invalidateQueries({ queryKey: ['notificationCounts'] });
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
      qc.invalidateQueries({ queryKey: ['notificationCounts'] });
    },
  });
}

export function useUpdateNda() {
  const { token } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ contractId, content }: { contractId: string; content: string }) =>
      contractsApi.updateNda(contractId, content, token!),
    onSuccess: (_, v) => {
      qc.invalidateQueries({ queryKey: ['contracts'] });
      qc.invalidateQueries({ queryKey: ['contract', v.contractId] });
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
   CONTRACT ACTIONS (NEW)
========================= */
export function useFundEscrow() {
  const { token } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ contractId, amount }: { contractId: string; amount: number }) =>
      contractsApi.fundEscrow(contractId, amount, token!),
    onSuccess: (_, { contractId }) => {
      qc.invalidateQueries({ queryKey: ['contract', contractId] });
      qc.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
}

export function useFinishSprint() {
  const { token } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ contractId }: { contractId: string }) =>
      contractsApi.finishSprint(contractId, token!),
    onSuccess: (_, { contractId }) => {
      qc.invalidateQueries({ queryKey: ['contract', contractId] });
      qc.invalidateQueries({ queryKey: ['contracts'] });
      qc.invalidateQueries({ queryKey: ['invoices', contractId] });
      qc.invalidateQueries({ queryKey: ['workLogs', contractId] });
    },
  });
}

export function useCompleteContract() {
  const { token } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ contractId }: { contractId: string }) =>
      contractsApi.complete(contractId, token!),
    onSuccess: (_, { contractId }) => {
      qc.invalidateQueries({ queryKey: ['contract', contractId] });
      qc.invalidateQueries({ queryKey: ['contracts'] });
      qc.invalidateQueries({ queryKey: ['notificationCounts'] });
    },
  });
}