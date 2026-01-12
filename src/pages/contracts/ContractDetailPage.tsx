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
import { AlertCircle, Loader2, Clock, Star, CheckCircle2 } from 'lucide-react';
import { ContractStats } from '@/components/contracts/ContractStats';
import { ContractSidebar } from '@/components/contracts/ContractSidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContractHeader } from '@/components/contracts/ContractHeader';
import { NdaPendingSection } from '@/components/contracts/NdaPendingSection';
import { ContractTabs } from '@/components/contracts/ContractTabs';
import { ContractCompletionAction } from '@/components/contracts/ContractCompletionAction';
import { ReportDialog } from '@/components/shared/ReportDialog';
import { DisputeDialog } from '@/components/contracts/DisputeDialog';
import { ReviewModal } from '../../components/contracts/ReviewModal';
import { contractsApi } from '../../lib/api';
import { useQuery } from '@tanstack/react-query';

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { toast } = useToast();

  const { data: contract, isLoading: loadingContract, refetch: refetchContract } = useContract(id!);
  const { data: summariesRaw = [] } = useDayWorkSummaries(id!);
  const { data: workLogsRaw = [] } = useContractWorkLogs(id!);
  const { data: invoices = [] } = useContractInvoices(id!);

  // Fetch feedback to check if user already reviewed
  const { data: feedbackResponse, refetch: refetchFeedback } = useQuery({
    queryKey: ['contract-feedback', id],
    queryFn: () => contractsApi.getFeedback(id!, token!),
    enabled: !!id && !!token && contract?.status === 'completed'
  });

  const feedback = feedbackResponse?.data || [];

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
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [signature, setSignature] = useState('');
  const [finishSprintOpen, setFinishSprintOpen] = useState(false);

  const roleIsBuyer = user?.role === 'buyer';
  const roleIsExpert = user?.role === 'expert';

  // Use user account IDs for party detection (works across role switches)
  const partyIsBuyer = contract ? String(user?.id) === String(contract.buyer_user_id) : false;
  const partyIsExpert = contract ? String(user?.id) === String(contract.expert_user_id) : false;

  // Redirect if the current user is not a participant of this contract
  // or if they switched their role away from the role they held on this contract.
  useEffect(() => {
    if (!contract || !user) return;

    // If user is neither buyer nor expert on this contract -> redirect
    if (!partyIsBuyer && !partyIsExpert) {
      toast({
        title: "Access Restricted",
        description: "You are not a participant of this contract.",
        variant: "destructive",
      });
      navigate('/contracts');
      return;
    }

    // If user is a buyer on this contract but no longer has buyer role -> redirect
    if (partyIsBuyer && user.role !== 'buyer') {
      toast({
        title: "Access Restricted",
        description: "Switch to buyer mode to view this contract.",
        variant: "destructive",
      });
      navigate('/contracts');
      return;
    }

    // If user is an expert on this contract but no longer has expert role -> redirect
    if (partyIsExpert && user.role !== 'expert') {
      toast({
        title: "Access Restricted",
        description: "Switch to expert mode to view this contract.",
        variant: "destructive",
      });
      navigate('/contracts');
      return;
    }
  }, [contract, user, partyIsBuyer, partyIsExpert, navigate, toast]);

  const ndaStatus = contract?.nda_status || 'draft';
  const isNdaSent = ndaStatus === 'sent' || ndaStatus === 'signed';
  const isPending = contract?.status === 'pending';
  const isDeclined = contract?.status === 'declined';
  const isCompleted = contract?.status === 'completed';
  const isNdaSigned = !!contract?.nda_signed_at;

  // Check if current user has left a review
  const hasReviewed = useMemo(() => {
    return feedback.some((f: any) => f.giver_id === user?.id);
  }, [feedback, user?.id]);

  const summaries =
    contract?.engagement_model === 'daily' ? summariesRaw : workLogsRaw;

  const otherUserId = useMemo(() => {
    if (!contract) return null;
    // Use user account IDs for chat (not profile IDs)
    return partyIsBuyer ? contract.expert_user_id : contract.buyer_user_id;
  }, [contract, partyIsBuyer]);

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
    if (!partyIsBuyer || contract?.engagement_model !== 'sprint' || contract?.status !== 'active') {
      return false;
    }
    return sprintInvoicesCount < totalSprints;
  }, [partyIsBuyer, contract, sprintInvoicesCount, totalSprints]);

  const showCompleteContractAction = useMemo(() => {
    if (!partyIsBuyer || contract?.status !== 'active') return false;
    if (contract.engagement_model === 'sprint') {
      return sprintInvoicesCount >= totalSprints;
    }
    return true;
  }, [partyIsBuyer, contract, sprintInvoicesCount, totalSprints]);

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

  const handleSaveNda = async (content: string) => {
    if (!id) return;
    try {
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

  const otherUserName = partyIsBuyer
    ? contract.expert_first_name || 'Expert'
    : contract.buyer_first_name || 'Buyer';

  // Construct Full Names
  const buyerFullName = [contract.buyer_first_name, contract.buyer_last_name].filter(Boolean).join(' ') || 'Buyer';
  const expertFullName = [contract.expert_first_name, contract.expert_last_name].filter(Boolean).join(' ') || 'Expert';

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <ContractHeader
          contract={contract}
          isNdaSigned={isNdaSigned}
          onBack={() => navigate('/contracts')}
        />

        {isCompleted && (
          <div className="mb-6 p-6 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" /> Contract Completed
              </h3>
              <p className="text-emerald-700 text-sm mt-1">
                This contract has been successfully completed.
                {hasReviewed ? " You have submitted your review." : " Please leave a review for your counterpart."}
              </p>
            </div>
            {!hasReviewed ? (
              <Button onClick={() => setShowReviewModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-md">
                <Star className="h-4 w-4 mr-2" />
                Leave Review
              </Button>
            ) : (
              <Badge variant="outline" className="bg-white text-emerald-700 border-emerald-200 px-3 py-1">
                Review Submitted
              </Badge>
            )}
          </div>
        )}

        {isPending && !isNdaSigned ? (
          <div className="space-y-4">
            {partyIsExpert && !isNdaSent ? (
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
              <NdaPendingSection
                isExpert={!!partyIsExpert}
                showNdaDialog={showNdaDialog}
                setShowNdaDialog={setShowNdaDialog}
                signature={signature}
                setSignature={setSignature}
                onSignNda={handleSignNda}
                signing={signNdaMutation.isPending}
                onDecline={handleDecline}
                declining={declineContract.isPending}
                onSaveNda={partyIsBuyer ? handleSaveNda : undefined}
                initialNdaContent={contract.nda_custom_content}
                ndaStatus={ndaStatus}
                buyerName={buyerFullName}
                expertName={expertFullName}
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
                  isBuyer={!!partyIsBuyer}
                  isExpert={!!partyIsExpert}
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
                  isBuyer={!!partyIsBuyer}
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

      {id && (
        <ReviewModal
          open={showReviewModal}
          onOpenChange={setShowReviewModal}
          contractId={id}
          onSuccess={refetchFeedback}
          recipientName={''} />
      )}
    </Layout>
  );
}