import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DailyLogForm, SprintSubmitForm, MilestoneRequestForm } from '@/components/contracts/WorkSubmissionForms';
import { ContractWorkLogList } from '@/components/contracts/ContractWorkLogList';
import { Loader2, Plus, FastForward, Play } from 'lucide-react';
import { format } from 'date-fns';

interface ContractTabsProps {
    contract: any;
    workLogs: any[];
    invoices: any[];
    isBuyer: boolean;
    isExpert: boolean;
    showLogDialog: boolean;
    setShowLogDialog: (open: boolean) => void;
    onLogSubmit: (data: any) => Promise<void>;
    logWorkLoading: boolean;
    showFinishSprintButton: boolean;
    onFinishSprint: () => Promise<void> | void;
    finishSprintLoading: boolean;
    onApprove: (logId: string) => void;
    onReject: (logId: string, reason: string) => void;
    isApproving: boolean;
    isRejecting: boolean;
    isNdaSigned: boolean;
}

export function ContractTabs({
    contract,
    workLogs,
    invoices,
    isBuyer,
    isExpert,
    showLogDialog,
    setShowLogDialog,
    onLogSubmit,
    logWorkLoading,
    showFinishSprintButton,
    onFinishSprint,
    finishSprintLoading,
    onApprove,
    onReject,
    isApproving,
    isRejecting,
    isNdaSigned,
}: ContractTabsProps) {
    return (
        <Tabs defaultValue="work_logs" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="work_logs">
                    {contract.engagement_model === "fixed" ? "Milestones" : "Work Logs"}
                </TabsTrigger>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="work_logs" className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Submission History</h3>

                    {isExpert && contract.status === 'active' && (
                        <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Plus className="h-4 w-4 mr-2" /> Log Work
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl w-full max-h-[85vh] flex flex-col">
                                <DialogHeader>
                                    <DialogTitle>Log Work</DialogTitle>
                                    <DialogDescription>
                                        Submit your work evidence for buyer approval.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="flex-1 overflow-y-auto p-2">
                                    {contract.engagement_model === 'daily' && (
                                        <DailyLogForm
                                            onSubmit={onLogSubmit}
                                            isLoading={logWorkLoading}
                                        />
                                    )}
                                    {contract.engagement_model === 'sprint' && (
                                        <SprintSubmitForm
                                            contract={contract}
                                            onSubmit={onLogSubmit}
                                            isLoading={logWorkLoading}
                                        />
                                    )}
                                    {contract.engagement_model === 'fixed' && (
                                        <MilestoneRequestForm
                                            contract={contract}
                                            onSubmit={onLogSubmit}
                                            isLoading={logWorkLoading}
                                        />
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}

                    {showFinishSprintButton && (
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    size="sm"
                                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 flex items-center gap-2 shadow-lg"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <FastForward className="h-4 w-4" />
                                    Finish Sprint #{contract.payment_terms.current_sprint_number}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Complete Current Sprint</DialogTitle>
                                    <DialogDescription>
                                        Mark Sprint #{contract.payment_terms.current_sprint_number} as
                                        complete and start the next sprint. Expert will be able to
                                        submit work for the new sprint.
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter>
                                    <Button
                                        variant="outline"
                                        onClick={onFinishSprint}
                                        disabled={finishSprintLoading}
                                    >
                                        {finishSprintLoading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Finishing...
                                            </>
                                        ) : (
                                            <>
                                                <Play className="mr-2 h-4 w-4" />
                                                Finish Sprint &amp; Start Next
                                            </>
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
                <ContractWorkLogList
                    logs={workLogs || []}
                    isBuyer={isBuyer}
                    onApprove={onApprove}
                    onReject={onReject}
                    isApproving={isApproving}
                    isRejecting={isRejecting}
                />
            </TabsContent>
            <TabsContent value="invoices" className="pt-4">
                {invoices.length === 0 ? (
                    <div className="py-10 text-center text-muted-foreground">
                        No invoices generated yet.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {invoices.map((inv: any) => (
                            <Card key={inv.id}>
                                <CardContent className="p-4 flex items-center justify-between text-sm">
                                    <div>
                                        <div className="font-medium">
                                            $
                                            {Number(
                                                inv.amount ?? inv.total_amount ?? 0
                                            ).toLocaleString()}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {inv.week_start_date && inv.week_end_date
                                                ? `${inv.week_start_date} → ${inv.week_end_date}`
                                                : format(new Date(inv.created_at), "MMM dd, yyyy")}
                                        </div>
                                    </div>
                                    <Badge variant="outline" className="capitalize">
                                        {inv.status}
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </TabsContent>
            <TabsContent value="details" className="pt-4 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Contract Terms</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">IP Ownership:</span>
                                <p className="font-medium capitalize ml-2">
                                    {contract.ip_ownership === 'buyer_owns'
                                        ? 'Buyer Owns All IP'
                                        : contract.ip_ownership === 'shared'
                                            ? 'Shared IP Rights'
                                            : 'Expert Retains Rights'}
                                </p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">NDA Status:</span>
                                <Badge
                                    variant={isNdaSigned ? 'default' : 'secondary'}
                                    className="ml-2"
                                >
                                    {isNdaSigned ? 'Signed' : 'Required'}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
