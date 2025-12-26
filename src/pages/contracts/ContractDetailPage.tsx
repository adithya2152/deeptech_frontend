import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  useApproveWorkLog,
  useContract,
  useContractInvoices,
  useContractWorkLogs,
  useDeclineContract,
  useFinishSprint,
  useLogWork,
  useRejectWorkLog,
  useSignNda,
} from "@/hooks/useContracts";
import { useStartConversation } from "@/hooks/useMessages";
import { Layout } from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Loader2 } from "lucide-react";
import { ContractStats } from "@/components/contracts/ContractStats";
import { ContractSidebar } from "@/components/contracts/ContractSidebar";
import { Button } from "@/components/ui/button";
import { ContractHeader } from "@/components/contracts/ContractHeader";
import { NdaPendingSection } from "@/components/contracts/NdaPendingSection";
import { ContractTabs } from "@/components/contracts/ContractTabs";

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: contract, isLoading: loadingContract } = useContract(id!);
  const { data: workLogs } = useContractWorkLogs(id!);
  const { data: invoices = [] } = useContractInvoices(id!);

  const signNdaMutation = useSignNda();
  const logWorkMutation = useLogWork();
  const approveWorkMutation = useApproveWorkLog();
  const rejectWorkMutation = useRejectWorkLog();
  const finishSprintMutation = useFinishSprint();
  const startConversation = useStartConversation();
  const declineContract = useDeclineContract();

  const [showLogDialog, setShowLogDialog] = useState(false);
  const [showNdaDialog, setShowNdaDialog] = useState(false);
  const [signature, setSignature] = useState("");

  const isBuyer = user?.role === "buyer";
  const isExpert = user?.role === "expert";

  const isPending = contract?.status === "pending";
  const isDeclined = contract?.status === "declined";
  const isNdaSigned = !!contract?.nda_signed_at;

  const otherUserId = useMemo(() => {
    if (!contract) return null;
    return isBuyer ? contract.expert_id : contract.buyer_id;
  }, [contract, isBuyer]);

  // escrow from real contract fields
  const escrow = useMemo(() => {
    if (!contract) return undefined;
    const total = contract.total_amount || 0;
    const remaining = contract.escrow_balance || 0;
    const released = Math.max(total - remaining, 0);
    return { total, funded: total, released, remaining };
  }, [contract]);

  const showFinishSprintButton = useMemo(() => {
    return (
      isBuyer &&
      contract?.engagement_model === "sprint" &&
      contract?.status === "active" &&
      !!contract?.payment_terms?.current_sprint_number
    );
  }, [isBuyer, contract]);

  const handleDecline = async () => {
    try {
      await declineContract.mutateAsync({ contractId: id! });
      toast({
        title: "Contract Declined",
        description: "You have declined this contract.",
      });
      navigate("/contracts");
    } catch (e: any) {
      toast({
        title: "Error",
        description: e.message,
        variant: "destructive",
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
      title: "Contract Activated",
      description:
        "NDA signed successfully. You can now view project details.",
    });
  };

  const handleSubmission = async (formData: any) => {
    await logWorkMutation.mutateAsync({ contractId: id!, data: formData });
    setShowLogDialog(false);
    toast({ title: "Success", description: "Update submitted successfully." });
  };

  const handleFinishSprint = async () => {
    await finishSprintMutation.mutateAsync(
      { contractId: id! },
      {
        onSuccess: (updatedContract) => {
          // TODO backend: POST /contracts/:id/invoices/from-sprint
          // body: { sprintNumber: previousSprintNumber }
          // endpoint will:
          //  - look up sprint data
          //  - create invoice for that sprint
        },
      } as any
    );
    toast({
      title: "Sprint Completed!",
      description: `Sprint ${contract?.payment_terms?.current_sprint_number || 1
        } finished. Next sprint started.`,
    });
  };

  const handleStartChat = () => {
    if (!otherUserId) return;
    startConversation.mutate(otherUserId, {
      onSuccess: (conversation) =>
        navigate(`/messages?id=${conversation.id}`),
    });
  };

  const progressStats = useMemo(() => {
    if (!contract) {
      return { label: "Utilization", value: 0, display: "0%", subtext: "" };
    }

    if (contract.engagement_model === "sprint") {
      const current = contract.payment_terms?.current_sprint_number || 1;
      const total = contract.payment_terms?.total_sprints || current;
      const value = total ? (current / total) * 100 : 0;

      return {
        label: "Sprint Progress",
        value,
        display: `${current}/${total} sprints`,
        subtext: `Current sprint ${current}`,
      };
    }

    return {
      label: "Utilization",
      value: 0,
      display: "0%",
      subtext: "",
    };
  }, [contract, workLogs]);

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
          <Button onClick={() => navigate("/contracts")}>
            Back to Contracts
          </Button>
        </div>
      </Layout>
    );

  const otherUserName = isBuyer
    ? contract.expert_first_name || "Expert"
    : contract.buyer_first_name || "Buyer";

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto py-8 px-4">
        <ContractHeader
          contract={contract}
          isNdaSigned={isNdaSigned}
          onBack={() => navigate("/contracts")}
        />

        {isPending && !isNdaSigned ? (
          <div className="space-y-4">
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
            />
          </div>
        ) : isDeclined ? (
          <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
            <h2 className="text-2xl font-bold">Contract Declined</h2>
            <p className="text-muted-foreground">
              This contract was declined and will not move forward. You can
              review the project details or start a new contract if
              circumstances change.
            </p>
            <Button variant="outline" onClick={() => navigate("/contracts")}>
              Back to Contracts
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <ContractStats
                contract={contract}
                invoiceCount={invoices.length}
              />

              <ContractTabs
                contract={contract}
                workLogs={workLogs || []}
                invoices={invoices}
                isBuyer={!!isBuyer}
                isExpert={!!isExpert}
                showLogDialog={showLogDialog}
                setShowLogDialog={setShowLogDialog}
                onLogSubmit={handleSubmission}
                logWorkLoading={logWorkMutation.isPending}
                showFinishSprintButton={showFinishSprintButton}
                onFinishSprint={handleFinishSprint}
                finishSprintLoading={finishSprintMutation.isPending}
                onApprove={(logId) =>
                  approveWorkMutation.mutate(
                    { logId },
                    {
                      onSuccess: (log) => {
                        // TODO backend: POST /contracts/:contractId/invoices/daily-from-log
                        // body: { logId }
                        // this endpoint will:
                        //  - mark the log approved (if not already)
                        //  - compute daily amount
                        //  - create invoice row linked to contract & log
                      },
                    }
                  )
                }
                onReject={(logId, reason) =>
                  rejectWorkMutation.mutate({ contractId: id!, logId, reason })
                }
                isApproving={approveWorkMutation.isPending}
                isRejecting={rejectWorkMutation.isPending}
                isNdaSigned={isNdaSigned}
              />
            </div>

            <div className="space-y-6">
              <ContractSidebar
                progressStats={progressStats}
                escrow={escrow}
                onStartChat={handleStartChat}
                isChatLoading={startConversation.isPending}
                otherUserName={otherUserName}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
