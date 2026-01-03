import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  useContract,
  useContractInvoices,
  useDeclineContract,
  useFinishSprint,
  useSignNda,
  useCompleteContract,
  useFundEscrow,
} from '@/hooks/useContracts';
import {
  useDayWorkSummaries,
  useSubmitWorkSummary,
  useApproveRejectWorkSummary,
  useContractWorkLogs,
  useLogWork,
  useApproveWorkLog,
  useRejectWorkLog,
  usePayInvoice
} from '@/hooks/useLogs';
import { useStartDirectChat } from '@/hooks/useMessages';
import { Layout } from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Loader2, Clock } from 'lucide-react';
import { ContractStats } from '@/components/contracts/ContractStats';
import { ContractSidebar } from '@/components/contracts/ContractSidebar';
import { Button } from '@/components/ui/button';
import { ContractHeader } from '@/components/contracts/ContractHeader';
import { NdaPendingSection } from '@/components/contracts/NdaPendingSection';
import { ContractTabs } from '@/components/contracts/ContractTabs';
import { ContractCompletionAction } from '@/components/contracts/ContractCompletionAction';
import { ReportDialog } from '@/components/shared/ReportDialog';
import { DisputeDialog } from '@/components/contracts/DisputeDialog';
import { contractsApi } from '@/lib/api'; 

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: contract, isLoading: loadingContract, refetch: refetchContract } = useContract(id!);
  const { data: summariesRaw = [] } = useDayWorkSummaries(id!);
  const { data: workLogsRaw = [] } = useContractWorkLogs(id!);
  const { data: invoices = [] } = useContractInvoices(id!);

  const signNdaMutation = useSignNda();
  const submitSummaryMutation = useSubmitWorkSummary();
  const approveRejectSummaryMutation = useApproveRejectWorkSummary();

  const logWorkMutation = useLogWork();
  const approveWorkMutation = useApproveWorkLog();
  const rejectWorkMutation = useRejectWorkLog();

  const finishSprintMutation = useFinishSprint();
  const startConversation = useStartDirectChat();
  const declineContract = useDeclineContract();
  const completeContractMutation = useCompleteContract();
  const payInvoiceMutation = usePayInvoice();

  const [showLogDialog, setShowLogDialog] = useState(false);
  const [showNdaDialog, setShowNdaDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [signature, setSignature] = useState('');
  const [finishSprintOpen, setFinishSprintOpen] = useState(false);

  const isBuyer = user?.role === 'buyer';
  const isExpert = user?.role === 'expert';

  // --- NDA LOGIC ---
  const ndaStatus = contract?.nda_status || 'draft';
  const isNdaSent = ndaStatus === 'sent' || ndaStatus === 'signed';
  const isPending = contract?.status === 'pending';
  const isDeclined = contract?.status === 'declined';
  const isNdaSigned = !!contract?.nda_signed_at;

  const summaries =
    contract?.engagement_model === 'daily' ? summariesRaw : workLogsRaw;

  const otherUserId = useMemo(() => {
    if (!contract) return null;
    return isBuyer ? contract.expert_id : contract.buyer_id;
  }, [contract, isBuyer]);

  const escrow = useMemo(() => {
    if (!contract) return undefined;

    const total = contract.payment_terms?.total_amount ?? contract.total_amount ?? 0;
    const escrowBalance = contract.escrow_balance ?? 0;
    const fundedTotal = contract.escrow_funded_total ?? 0;
    const remaining = Math.max(total - fundedTotal, 0);
    const released = contract.released_total ?? 0;

    return {
      total,
      balance: escrowBalance,
      funded: fundedTotal,
      released,
      remaining,
    };
  }, [contract]);

  const sprintInvoicesCount = useMemo(
    () => invoices.filter(inv => inv.invoice_type === 'sprint').length,
    [invoices]
  );

  const totalSprints = useMemo(() => contract?.payment_terms?.total_sprints || 1, [contract]);

  const showFinishSprintButton = useMemo(() => {
    if (!isBuyer || contract?.engagement_model !== 'sprint' || contract?.status !== 'active') {
      return false;
    }
    return sprintInvoicesCount < totalSprints;
  }, [isBuyer, contract, sprintInvoicesCount, totalSprints]);

  const showCompleteContractAction = useMemo(() => {
    if (!isBuyer || contract?.status !== 'active') return false;
    if (contract.engagement_model === 'sprint') {
      return sprintInvoicesCount >= totalSprints;
    }
    return true;
  }, [isBuyer, contract, sprintInvoicesCount, totalSprints]);

  const progressStats = useMemo(() => {
    if (!contract) {
      return { label: 'Progress', value: 0, display: '0%', subtext: '' };
    }

    const totalDays = contract.payment_terms?.total_days || 30;

    if (contract.engagement_model === 'daily') {
      const approvedDays = summaries.filter((s: any) => s.status === 'approved').length;
      const value = Math.min((approvedDays / totalDays) * 100, 100);
      return {
        label: 'Days Worked',
        value,
        display: `${approvedDays}/${totalDays} days`,
        subtext: approvedDays >= totalDays
          ? 'Contract duration completed'
          : `Day ${approvedDays + 1} in progress`,
      };
    }

    if (contract.engagement_model === 'sprint') {
      const currentSprint = contract.payment_terms?.current_sprint_number || 1;
      const displaySprint = Math.min(currentSprint, totalSprints);
      const value = Math.min((displaySprint / totalSprints) * 100, 100);
      const isCompleted = sprintInvoicesCount >= totalSprints;

      return {
        label: 'Sprint Progress',
        value,
        display: `${displaySprint}/${totalSprints} sprints`,
        subtext: isCompleted
          ? 'All sprints invoiced'
          : `Current sprint ${displaySprint}`,
      };
    }

    if (contract.engagement_model === 'fixed') {
      const approvedLogs = summaries.filter((s: any) => s.status === 'approved').length;
      const totalLogs = summaries.length;
      return {
        label: 'Activity',
        value: totalLogs > 0 ? 100 : 0,
        display: `${totalLogs} Submissions`,
        subtext: `${approvedLogs} Approved`,
      };
    }

    return {
      label: 'Progress',
      value: 0,
      display: '0%',
      subtext: '',
    };
  }, [contract, summaries, sprintInvoicesCount, totalSprints]);

  const fundEscrowMutation = useFundEscrow();

  const handleFundEscrow = async () => {
    if (!id || !escrow) return;
    const amount = escrow.remaining;
    if (amount <= 0) {
      toast({
        title: 'Nothing to fund',
        description: 'Escrow is already fully funded for this contract.',
      });
      return;
    }
    await fundEscrowMutation.mutateAsync({
      contractId: id,
      amount,
    });
    toast({
      title: 'Escrow funded',
      description: `Added $${amount.toFixed(2)} to escrow for this contract.`,
    });
  };

  const handleDecline = async () => {
    try {
      await declineContract.mutateAsync({ contractId: id! });
      toast({
        title: 'Contract Declined',
        description: 'You have declined this contract.',
      });
      navigate('/contracts');
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e.message,
        variant: 'destructive',
      });
    }
  };

  const handleSignNda = async () => {
    await signNdaMutation.mutateAsync({
      contractId: id!,
      signatureName: signature,
    });
    setShowNdaDialog(false);
    toast({
      title: 'Contract Activated',
      description: 'NDA signed successfully. You can now view project details.',
    });
  };

  // --- NEW: Handle Saving/Sending NDA by Buyer ---
  const handleSaveNda = async (content: string) => {
    if (!id) return;
    try {
      // Calls the API to update content and set status to 'sent'
      const token = localStorage.getItem('token') || '';
      await contractsApi.updateNda(id, content, token);
      
      await refetchContract(); 
      toast({
        title: 'NDA Sent',
        description: 'The Non-Disclosure Agreement has been updated and sent to the expert.',
      });
    } catch (error) {
      toast({
        title: 'Failed to send NDA',
        description: 'Could not update the agreement terms. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleSubmission = async (formData: any) => {
    if (!contract) return;

    if (contract.engagement_model === 'daily') {
      const work_date = formData.work_date || formData.date || new Date().toISOString().slice(0, 10);
      const total_hours = formData.total_hours || formData.hours || formData.totalHours || 0;

      await submitSummaryMutation.mutateAsync({
        contractId: id!,
        work_date,
        total_hours,
      });
      toast({
        title: 'Success',
        description: 'Work summary submitted successfully.',
      });
    } else {
      await logWorkMutation.mutateAsync({ contractId: id!, data: formData });
      toast({
        title: 'Success',
        description: 'Work log submitted successfully.',
      });
    }
    setShowLogDialog(false);
  };

  const handleFinishSprint = async () => {
    try {
      await finishSprintMutation.mutateAsync({ contractId: id! });
      const current = contract?.payment_terms?.current_sprint_number || 1;
      const total = contract?.payment_terms?.total_sprints || 1;
      const isLastSprint = current >= total;

      toast({
        title: 'Sprint Completed!',
        description: isLastSprint
          ? `Final Sprint ${current} finished. Invoice generated.`
          : `Sprint ${current} finished. Next sprint started.`,
      });
      setFinishSprintOpen(false);
    } catch (err) {
      toast({
        title: 'Error finishing sprint',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleStartChat = () => {
    if (!otherUserId) return;
    startConversation.mutate(otherUserId, {
      onSuccess: (chatId) => navigate(`/messages?id=${chatId}`)
    });
  };

  const handlePayInvoice = async (invoiceId: string) => {
    try {
      await payInvoiceMutation.mutateAsync({ invoiceId });
      toast({
        title: 'Invoice paid',
        description: 'Escrow has been released for this invoice.',
      });
    } catch (e: any) {
      toast({
        title: 'Payment failed',
        description: e.message,
        variant: 'destructive',
      });
    }
  };

  const handleCompleteContract = async () => {
    try {
      await completeContractMutation.mutateAsync({ contractId: id! });
      toast({
        title: 'Contract Completed',
        description: 'Contract has been finalized and closed.',
      });
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e.message,
        variant: 'destructive',
      });
    }
  };

  if (loadingContract)
    return (
      <Layout>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );

  if (!contract)
    return (
      <Layout>
        <div className="container py-16 text-center">
          <AlertCircle className="h-16 w-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold">Contract Not Found</h2>
          <Button onClick={() => navigate('/contracts')}>Back to Contracts</Button>
        </div>
      </Layout>
    );

  const otherUserName = isBuyer
    ? contract.expert_first_name || 'Expert'
    : contract.buyer_first_name || 'Buyer';

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <ContractHeader
          contract={contract}
          isNdaSigned={isNdaSigned}
          onBack={() => navigate('/contracts')}
        />

        {isPending && !isNdaSigned ? (
          <div className="space-y-4">
            {/* Logic for Expert Waiting State */}
            {isExpert && !isNdaSent ? (
              <div className="max-w-2xl mx-auto py-16 text-center space-y-4 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                   <Clock className="h-8 w-8 text-amber-500 animate-pulse" />
                </div>
                <div>
                   <h2 className="text-xl font-bold text-zinc-900">Waiting for Buyer</h2>
                   <p className="text-zinc-500 mt-2 max-w-md mx-auto">
                     The buyer is currently finalizing the Non-Disclosure Agreement terms. 
                     You will be notified once the NDA is ready for your signature.
                   </p>
                </div>
              </div>
            ) : (
              // Buyer Edit Flow OR Expert Sign Flow (if sent)
              <NdaPendingSection
                isExpert={!!isExpert}
                showNdaDialog={showNdaDialog}
                setShowNdaDialog={setShowNdaDialog}
                signature={signature}
                setSignature={setSignature}
                onSignNda={handleSignNda}
                signing={signNdaMutation.isPending}
                onDecline={handleDecline}
                declining={declineContract.isPending}
                onSaveNda={isBuyer ? handleSaveNda : undefined}
                initialNdaContent={contract.nda_custom_content}
                ndaStatus={ndaStatus}
                buyerName={contract.buyer_first_name || 'Buyer'}
                expertName={contract.expert_first_name || 'Expert'}
              />
            )}
          </div>
        ) : isDeclined ? (
          <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
            <h2 className="text-2xl font-bold">Contract Declined</h2>
            <p className="text-muted-foreground">
              This contract was declined and will not move forward.
            </p>
            <Button variant="outline" onClick={() => navigate('/contracts')}>
              Back to Contracts
            </Button>
          </div>
        ) : (
          <>
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <ContractStats
                  contract={contract}
                  invoiceCount={invoices.length}
                />
                <ContractTabs
                  contract={contract}
                  summaries={summaries || []}
                  invoices={invoices}
                  isBuyer={!!isBuyer}
                  isExpert={!!isExpert}
                  showLogDialog={showLogDialog}
                  setShowLogDialog={setShowLogDialog}
                  onLogSubmit={handleSubmission}
                  logWorkLoading={
                    contract.engagement_model === 'daily'
                      ? submitSummaryMutation.isPending
                      : logWorkMutation.isPending
                  }
                  showFinishSprintButton={showFinishSprintButton}
                  onFinishSprint={handleFinishSprint}
                  finishSprintLoading={finishSprintMutation.isPending}
                  onApproveSummary={summaryId =>
                    contract.engagement_model === 'daily'
                      ? approveRejectSummaryMutation.mutate({ summaryId, status: 'approved' })
                      : approveWorkMutation.mutate({ workLogId: summaryId })
                  }
                  onRejectSummary={(summaryId, reason) =>
                    contract.engagement_model === 'daily'
                      ? approveRejectSummaryMutation.mutate({ summaryId, status: 'rejected', reviewerComment: reason })
                      : rejectWorkMutation.mutate({ contractId: id!, workLogId: summaryId, reason })
                  }
                  isApproving={contract.engagement_model === 'daily' ? approveRejectSummaryMutation.isPending : approveWorkMutation.isPending}
                  isRejecting={contract.engagement_model === 'daily' ? approveRejectSummaryMutation.isPending : rejectWorkMutation.isPending}
                  isNdaSigned={isNdaSigned}
                  onPayInvoice={handlePayInvoice}
                  isPayingInvoice={payInvoiceMutation.isPending}
                  finishSprintOpen={finishSprintOpen}
                  setFinishSprintOpen={setFinishSprintOpen}
                />
              </div>

              <div className="space-y-6">
                {showCompleteContractAction && (
                  <ContractCompletionAction
                    contract={contract}
                    invoices={invoices}
                    summaries={summaries || []}
                    onPayInvoice={handlePayInvoice}
                    onCompleteContract={handleCompleteContract}
                    isPaying={payInvoiceMutation.isPending}
                    isCompleting={completeContractMutation.isPending}
                  />
                )}

                <ContractSidebar
                  progressStats={progressStats}
                  escrow={escrow}
                  onStartChat={handleStartChat}
                  isChatLoading={startConversation.isPending}
                  otherUserName={otherUserName}
                  isBuyer={!!isBuyer}
                  onFundEscrow={handleFundEscrow}
                  fundEscrowLoading={fundEscrowMutation.isPending}
                  onReportUser={() => setShowReportDialog(true)}
                  onRaiseDispute={() => setShowDisputeDialog(true)}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        reportedId={otherUserId || ''}
        reportedName={otherUserName || 'User'}
        type="user"
      />

      {id && (
        <DisputeDialog
          open={showDisputeDialog}
          onOpenChange={setShowDisputeDialog}
          contractId={id}
        />
      )}
    </Layout>
  );
}