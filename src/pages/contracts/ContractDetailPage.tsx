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
  useSignContract,
  useActivateContract,
} from '@/hooks/useContracts';
import {
  useDayWorkSummaries,
  useSubmitWorkSummary,
  useApproveRejectWorkSummary,
  useContractWorkLogs,
  useLogWork,
  useEditWorkLog,
  useApproveWorkLog,
  useRejectWorkLog,
  usePayInvoice
} from '@/hooks/useLogs';
import { useStartDirectChat } from '@/hooks/useMessages';
import { Layout } from '@/components/layout/Layout';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/hooks/useCurrency';
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
import { ContractSigningSection } from '@/components/contracts/ContractSigningSection';
import { contractsApi, timeEntriesApi } from '../../lib/api';
import { useQuery } from '@tanstack/react-query';

export default function ContractDetailPage() {
    const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const { convertAndFormat } = useCurrency();

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
  const signContractMutation = useSignContract();
  const activateContractMutation = useActivateContract();
  const submitSummaryMutation = useSubmitWorkSummary();
  const approveRejectSummaryMutation = useApproveRejectWorkSummary();

  const logWorkMutation = useLogWork();
  const editWorkLogMutation = useEditWorkLog();
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

  const isBuyerSigned = !!contract?.buyer_signed_at;
  const isExpertSigned = !!contract?.expert_signed_at;
  const isFullySigned = isBuyerSigned && isExpertSigned;

  // NOTE: Feedback uses profile IDs, so we must compare against the user's profile ID for this contract
  const hasReviewed = useMemo(() => {
    const myProfileId = partyIsBuyer ? contract?.buyer_profile_id : (partyIsExpert ? contract?.expert_profile_id : null);
    if (!myProfileId) return false;
    return feedback.some((f: any) => f.giver_id === myProfileId);
  }, [feedback, partyIsBuyer, partyIsExpert, contract?.buyer_profile_id, contract?.expert_profile_id]);

  const summaries =
    (contract?.engagement_model === 'daily' || contract?.engagement_model === 'hourly')
      ? summariesRaw
      : workLogsRaw;

  const { data: hourlySummaryResponse } = useQuery({
    queryKey: ['time-entries-summary', id],
    queryFn: () => timeEntriesApi.getSummary(id!, token!),
    enabled: !!id && !!token && contract?.engagement_model === 'hourly',
  });

  const hourlySummary = (hourlySummaryResponse as any)?.data;

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

    if (contract.engagement_model === 'hourly') {
      const totalMinutes = Number(
        hourlySummary?.totalMinutes ?? hourlySummary?.total_minutes ?? 0
      );
      const approvedHours = Number(
        hourlySummary?.totalHours ?? hourlySummary?.total_hours
      ) || (totalMinutes > 0 ? totalMinutes / 60.0 : 0);
      const estimatedHours = Number(contract.payment_terms?.estimated_hours || 0);
      const value = estimatedHours > 0 ? Math.min((approvedHours / estimatedHours) * 100, 100) : 0;

      return {
        label: 'Hours Worked',
        value,
        display: `${approvedHours.toFixed(1)} hrs`,
        subtext: estimatedHours > 0
          ? `${approvedHours.toFixed(1)}/${estimatedHours} hrs approved`
          : 'Approved hours',
      };
    }

    return {
      label: 'Progress',
      value: 0,
      display: '0%',
      subtext: '',
    };
  }, [contract, summaries, sprintInvoicesCount, totalSprints, hourlySummary]);

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
      description: `Added ${convertAndFormat(amount, contract?.currency)} to escrow for this contract.`,
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
      title: 'NDA Signed',
      description: 'NDA signed successfully. Proceeding to contract activation.',
    });
  };

  const handleSignContract = async (signatureName: string) => {
    try {
      await signContractMutation.mutateAsync({ contractId: id!, signatureName });
      toast({ title: 'Agreement Signed', description: 'Proceeding to next stage' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleActivateContract = async () => {
    try {
      if (contract?.engagement_model === 'fixed' && escrow && escrow.remaining > 0) {
        // Require full funding for fixed? Or warning?
        // For now, let's just warn or block if balance is 0
        if (escrow.balance <= 0) {
          toast({ title: 'Escrow Required', description: 'Please fund the escrow before activating.', variant: 'destructive' });
          return;
        }
      }
      await activateContractMutation.mutateAsync({ contractId: id! });
      toast({ title: 'Contract Activated', description: 'Work can now begin.' });
    } catch (e: any) {
      toast({ title: 'Activation Failed', description: e.message, variant: 'destructive' });
    }
  };

  const handleSaveNda = async (content: string, status?: string) => {
    if (!id) return;
    try {
      const token = localStorage.getItem('token') || '';
      await contractsApi.updateNda(id, content, token, status);

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

    try {
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
    } catch (err) {
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as any).message)
          : 'Submission failed. Please try again.';

      toast({
        title: 'Submission failed',
        description: message,
        variant: 'destructive',
      });
    }
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
      const message =
        err && typeof err === 'object' && 'message' in err
          ? String((err as any).message)
          : 'Please try again.';
      toast({
        title: 'Error finishing sprint',
        description: message,
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
          <h2 className="text-2xl font-bold">{'Not Found'}</h2>
          <Button onClick={() => navigate('/contracts')}>{'Back To Contracts'}</Button>
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
                <CheckCircle2 className="h-5 w-5" /> {'Contract Completed'}
              </h3>
              <p className="text-emerald-700 text-sm mt-1">
                {'Successfully Completed'}
                {hasReviewed ? ` ${'Review Submitted'}` : ` ${'Please Review'}`}
              </p>
            </div>
            {!hasReviewed ? (
              <Button onClick={() => setShowReviewModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-md">
                <Star className="h-4 w-4 mr-2" />
                {'Leave Review'}
              </Button>
            ) : (
              <Badge variant="outline" className="bg-white text-emerald-700 border-emerald-200 px-3 py-1">
                Review Submitted
              </Badge>
            )}
          </div>
        )}

        {isPending ? (
          <div className="space-y-4">
            {!isFullySigned ? (
              ((partyIsBuyer && !isBuyerSigned) || (partyIsExpert && !isExpertSigned)) ? (
                <ContractSigningSection
                  contract={contract}
                  isBuyer={partyIsBuyer}
                  onSign={handleSignContract}
                  onDecline={handleDecline}
                  isProcessing={signContractMutation.isPending || declineContract.isPending}
                />
              ) : (
                <div className="max-w-2xl mx-auto py-16 text-center space-y-4 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                  <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <Clock className="h-8 w-8 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-zinc-900">{'Waiting For'} {partyIsBuyer ? 'Expert' : 'Buyer'}</h2>
                    <p className="text-zinc-500 mt-2">
                      {'Signed Agreement'} {'Waiting To Sign'}
                    </p>
                  </div>
                </div>
              )
            ) : !isNdaSigned && ndaStatus !== 'skipped' ? (
              // NDA PENDING SECTION (Existing Logic)
              isPending && !isNdaSigned ? ( /* We are in isPending block */
                partyIsExpert && !isNdaSent ? (
                  <div className="max-w-2xl mx-auto py-16 text-center space-y-4 bg-zinc-50 rounded-xl border border-dashed border-zinc-200">
                    <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                      <Clock className="h-8 w-8 text-amber-500 animate-pulse" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-zinc-900">{'Waiting For Buyer'}</h2>
                      <p className="text-zinc-500 mt-2 max-w-md mx-auto">
                        {'Finalizing Nda'}
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
                )
              ) : null
            ) : (
              // ACTIVATION / ESCROW SECTION
              <div className="grid md:grid-cols-2 gap-6 items-start">
                <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <CheckCircle2 className="text-green-500 h-5 w-5" />
                    {ndaStatus === 'skipped' ? 'Nda Waived' : 'Contracts Nda Signed'}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {'Ready For Activation'}
                  </p>
                  {partyIsBuyer && (
                    <div className="pt-4 border-t">
                      <h3 className="font-medium mb-3">{'Escrow Funding'}</h3>
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between text-sm">
                          <span>{'Contract Total'}:</span>
                          <span className="font-medium">{convertAndFormat(contract.total_amount, contract.currency)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>{'Current Escrow'}:</span>
                          <span className="font-medium">{convertAndFormat(contract.escrow_balance || 0, contract.currency)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          {escrow && escrow.remaining > 0 && (
                            <Button variant="outline" onClick={handleFundEscrow} disabled={fundEscrowMutation.isPending}>
                              {'Fund Escrow'}
                            </Button>
                          )}
                          <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleActivateContract} disabled={activateContractMutation.isPending}>
                            {'Activate Contract'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  {partyIsExpert && (
                    <div className="p-4 bg-muted/30 rounded-lg text-sm">
                      <p className="font-medium">{'Waiting For Buyer Activation'}</p>
                      <p className="text-muted-foreground">{'Buyer Needs Fund'}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {/* Show summary or helpful info */}
                  <ContractStats contract={contract} invoiceCount={invoices.length} />
                </div>
              </div>
            )}
          </div>
        ) : isDeclined ? (
          <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
            <h2 className="text-2xl font-bold">{'Contract Declined'}</h2>
            <p className="text-muted-foreground">
              {'Declined Message'}
            </p>
            <Button variant="outline" onClick={() => navigate('/contracts')}>
              {'Back To Contracts'}
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
                  onEditLog={async (logId, data) => {
                    await editWorkLogMutation.mutateAsync({ workLogId: logId, data });
                  }}
                  isEditingLog={editWorkLogMutation.isPending}
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