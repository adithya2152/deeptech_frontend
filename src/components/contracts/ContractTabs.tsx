import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { WorkLogForm } from '@/components/contracts/WorkSubmissionForms';
import { ContractWorkLogList } from '@/components/contracts/ContractWorkLogList';
import { HourlyTimesheet } from '@/components/contracts/HourlyTimesheet';
import { Loader2, Plus, FastForward, Play, CheckCircle2, AlertCircle, FileText, ArrowRight, Wallet, Building2, Download } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ContractTabsProps {
  contract: any;
  summaries: any[];
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
  onApproveSummary: (summaryId: string) => void;
  onRejectSummary: (summaryId: string, reason: string) => void;
  isApproving: boolean;
  isRejecting: boolean;
  onEditLog?: (logId: string, data: any) => Promise<void>;
  isEditingLog?: boolean;
  isNdaSigned: boolean;
  onPayInvoice: (invoiceId: string) => void;
  isPayingInvoice: boolean;
  finishSprintOpen: boolean;
  setFinishSprintOpen: (open: boolean) => void;
}

export function ContractTabs({
  contract,
  summaries,
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
  onApproveSummary,
  onRejectSummary,
  isApproving,
  isRejecting,
  onEditLog,
  isEditingLog,
  isNdaSigned,
  onPayInvoice,
  isPayingInvoice,
  finishSprintOpen,
  setFinishSprintOpen,
}: ContractTabsProps) {
  const { toast } = useToast();

  // 1. Calculate Unpaid (Pending + Overdue)
  const unpaidInvoices = invoices.filter((inv: any) => ['pending', 'overdue'].includes(inv.status));
  const unpaidCount = unpaidInvoices.length;

  // Memoize sorted invoices for periodic counting
  const sortedInvoices = useMemo(() =>
    [...invoices].sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [invoices]);

  // Memoize sorted sprint invoices
  // FIX: Now includes invoices that are 'sprint' type OR if the contract is sprint and the invoice isn't explicitly something else
  const sprintInvoices = useMemo(() =>
    invoices
      .filter((inv: any) =>
        inv.invoice_type === 'sprint' ||
        (contract.engagement_model === 'sprint' && inv.invoice_type !== 'daily' && inv.invoice_type !== 'fixed')
      )
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
    [invoices, contract.engagement_model]);

  // Memoize sorted daily work summaries to map IDs/Dates to Day 1, Day 2 etc.
  const dailySummaryMap = useMemo(() => {
    if (contract.engagement_model !== 'daily') return {};
    const sorted = [...summaries].sort((a: any, b: any) => new Date(a.work_date).getTime() - new Date(b.work_date).getTime());
    const map: Record<string, { index: number, date: string }> = {};
    sorted.forEach((s, i) => {
      // Map by ID
      map[s.id] = { index: i + 1, date: s.work_date };
      // Map by Date (as fallback)
      map[s.work_date] = { index: i + 1, date: s.work_date };
    });
    return map;
  }, [summaries, contract.engagement_model]);

  const switchToInvoicesTab = () => {
    const invoicesTabTrigger = document.querySelector('[role="tab"][data-value="invoices"]') as HTMLElement;
    if (invoicesTabTrigger) {
      invoicesTabTrigger.click();
      setTimeout(() => {
        // Scroll to first pending or overdue
        const firstUnpaid = document.querySelector('[data-status="pending"], [data-status="overdue"]') as HTMLElement;
        firstUnpaid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    }
  };

  const getInvoiceDescription = (inv: any) => {
    // SPRINT MODEL LOGIC
    // Check if it's explicitly a sprint invoice OR if the contract is in sprint mode
    if (inv.invoice_type === 'sprint' || (contract.engagement_model === 'sprint' && inv.invoice_type !== 'daily' && inv.invoice_type !== 'fixed')) {
      const index = sprintInvoices.findIndex((i: any) => i.id === inv.id);
      const sprintNum = index !== -1 ? index + 1 : (contract.payment_terms?.current_sprint_number || 1);
      return { title: `Sprint #${sprintNum} Invoice`, subtext: `Sprint Payment` };
    }

    // DAILY MODEL LOGIC
    if (contract.engagement_model === 'daily') {
      let info = inv.source_id ? dailySummaryMap[inv.source_id] : null;

      if (!info) {
        const dateKey = inv.week_start_date || (inv.created_at ? inv.created_at.split('T')[0] : '');
        if (dateKey) info = dailySummaryMap[dateKey];
      }

      if (info) {
        return {
          title: `Day ${info.index} Invoice`,
          subtext: format(new Date(info.date), 'MMM d, yyyy')
        };
      }

      try {
        const date = new Date(inv.created_at);
        return { title: `Daily Invoice`, subtext: format(date, 'MMM d, yyyy') };
      } catch (e) {
        return { title: 'Daily Invoice', subtext: 'Daily Payment' };
      }
    }

    // FIXED / GENERAL MODEL (No "Milestones" text)
    if (inv.invoice_type === 'fixed' || contract.engagement_model === 'fixed') {
      return { title: `Invoice`, subtext: 'Project Payment' };
    }

    // Default Fallback
    return { title: `Contract Invoice`, subtext: 'Services' };
  };

  const handleDownloadInvoice = (inv: any) => {
    const invoiceId = inv.id;
    const amount = Number(inv.amount || inv.total_amount || 0);
    const date = new Date(inv.created_at || Date.now());
    const status = inv.status;
    const { title, subtext } = getInvoiceDescription(inv);

    try {
      const content = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invoice ${invoiceId}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #f3f4f6; }
            .brand { font-size: 24px; font-weight: bold; color: #10b981; }
            .invoice-details { text-align: right; }
            .invoice-title { font-size: 32px; font-weight: bold; color: #111; margin: 0; }
            .invoice-meta { margin-top: 10px; color: #666; }
            .addresses { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .addr-label { font-size: 11px; text-transform: uppercase; color: #9ca3af; letter-spacing: 1px; margin-bottom: 8px; font-weight: 600; }
            .addr-value { font-size: 16px; font-weight: 500; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            th { text-align: left; padding: 12px; background: #f9fafb; border-bottom: 1px solid #e5e7eb; font-size: 12px; text-transform: uppercase; color: #6b7280; }
            td { padding: 16px 12px; border-bottom: 1px solid #f3f4f6; }
            .amount-col { text-align: right; }
            .summary { display: flex; justify-content: flex-end; }
            .summary-box { width: 300px; }
            .summary-row { display: flex; justify-content: space-between; padding: 8px 0; color: #6b7280; }
            .total-row { border-top: 2px solid #e5e7eb; margin-top: 8px; padding-top: 16px; font-weight: bold; color: #111; font-size: 18px; }
            .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #f3f4f6; text-align: center; color: #9ca3af; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">Escrow Platform</div>
            <div class="invoice-details">
              <h1 class="invoice-title">INVOICE</h1>
              <div class="invoice-meta">#${invoiceId.slice(0, 8).toUpperCase()}</div>
              <div class="invoice-meta">Date: ${date.toLocaleDateString()}</div>
              <div class="invoice-meta">Status: ${status.toUpperCase()}</div>
            </div>
          </div>

          <div class="addresses">
            <div>
              <div class="addr-label">Bill To</div>
              <div class="addr-value">${contract.buyer_name || 'Client'}</div>
            </div>
            <div>
              <div class="addr-label">Bill From</div>
              <div class="addr-value">${contract.expert_name || 'Expert Provider'}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th class="amount-col">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${title}</strong><br><span style="font-size:12px;color:#666">${subtext}</span></td>
                <td class="amount-col">$${amount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-box">
              <div class="summary-row total-row">
                <span>Total</span>
                <span>$${amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <p>This is a computer-generated document. No signature is required.</p>
          </div>
        </body>
        </html>
      `;

      const blob = new Blob([content], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_${invoiceId.slice(0, 8)}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: `Invoice #${invoiceId.slice(0, 8).toUpperCase()} is downloading.`,
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not generate invoice file.",
        variant: "destructive",
      });
    }
  };

  return (
    <Tabs defaultValue="work_logs" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-zinc-100/80 p-1">
        <TabsTrigger
          value="work_logs"
          className="data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm transition-all"
        >

          {/* Always show 'Work Logs' */}
          {contract.engagement_model === 'hourly' ? 'Timesheets' : 'Work Logs'}
        </TabsTrigger>
        <TabsTrigger
          value="invoices"
          className="data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm transition-all"
        >
          Invoices

          {isBuyer && unpaidCount > 0 && (
            <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
              {unpaidCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger
          value="details"
          className="data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm transition-all"
        >
          Details
        </TabsTrigger>
      </TabsList>

      {/* WORK LOGS TAB */}
      <TabsContent value="work_logs" className="space-y-6 pt-6">
        {contract.engagement_model === 'hourly' ? (
          <HourlyTimesheet contract={contract} isExpert={isExpert} isBuyer={isBuyer} />
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-zinc-900">Submission History</h3>
                <p className="text-xs text-zinc-500">Track milestones and daily progress</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Redirect Button for Unpaid Invoices */}
                {isBuyer && unpaidCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 transition-colors"
                    onClick={switchToInvoicesTab}
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    {unpaidCount} Pending Invoice{unpaidCount !== 1 ? 's' : ''}
                  </Button>
                )}

                {/* BUTTON 1: Log Work - Expert only */}
                {isExpert && contract.status === 'active' && (
                  <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm">
                        <Plus className="h-4 w-4 mr-2" /> Log Work
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl w-full max-h-[85vh] flex flex-col">
                      <DialogHeader>
                        <DialogTitle>Log Work</DialogTitle>
                        <DialogDescription>
                          Submit your work summary for buyer approval.
                        </DialogDescription>
                      </DialogHeader>
                      <WorkLogForm
                        mode={contract.engagement_model}
                        contract={contract}
                        onSubmit={onLogSubmit}
                        isLoading={logWorkLoading}
                      />
                    </DialogContent>
                  </Dialog>
                )}

                {/* BUTTON 2: Finish Sprint - Buyer only */}
                {showFinishSprintButton && (
                  <Dialog open={finishSprintOpen} onOpenChange={setFinishSprintOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-100 transition-all"
                      >
                        <FastForward className="h-4 w-4 mr-2" />
                        Finish Sprint #{contract.payment_terms?.current_sprint_number || 1}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Complete Current Sprint</DialogTitle>
                        <DialogDescription>
                          Mark Sprint #{contract.payment_terms?.current_sprint_number} as complete and start the next sprint.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setFinishSprintOpen(false)}
                          disabled={finishSprintLoading}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
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
                              Finish Sprint & Start Next
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </div>

            <ContractWorkLogList
              logs={summaries || []}
              isBuyer={isBuyer}
              isExpert={isExpert}
              mode={contract.engagement_model === 'daily'
                ? 'daily'
                : contract.engagement_model === 'sprint'
                  ? 'sprint'
                  : 'fixed'}
              onApprove={onApproveSummary}
              onReject={onRejectSummary}
              onEdit={onEditLog || (async () => { })}
              isApproving={isApproving}
              isRejecting={isRejecting}
              isEditing={!!isEditingLog}
            />
          </>
        )}
      </TabsContent>

      {/* INVOICES TAB */}
      <TabsContent value="invoices" className="pt-6">
        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
            <div className="h-12 w-12 bg-zinc-100 rounded-full flex items-center justify-center mb-3">
              <AlertCircle className="h-6 w-6 text-zinc-400" />
            </div>
            <p className="text-sm font-medium text-zinc-900">No invoices generated yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv: any) => {
              const amount = Number(inv.amount || inv.total_amount || 0);
              const isPending = ['pending', 'overdue'].includes(inv.status);
              const invoiceDate = inv.created_at ? new Date(inv.created_at) : new Date();
              const { title, subtext } = getInvoiceDescription(inv);

              const escrowBalance = Number(contract.escrow_balance || 0);
              const hasEscrowFunds = escrowBalance > 0;

              return (
                <Card
                  key={inv.id}
                  data-status={inv.status}
                  className={`transition-all ${isPending ? 'border-l-4 border-l-amber-400 border-y-zinc-200 border-r-zinc-200 shadow-sm' : 'border-zinc-200'}`}
                >
                  <CardContent className="p-4 flex items-center justify-between text-sm gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${isPending ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        {isPending ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                      </div>
                      <div>
                        <div className="font-bold text-base text-zinc-900">
                          {title}
                        </div>
                        <div className="text-xs text-zinc-500 font-medium mt-0.5">
                          {subtext ? subtext : `$${amount.toLocaleString()}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        variant={isPending ? 'outline' : 'secondary'}
                        className={`capitalize ${isPending ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}
                      >
                        {inv.status}
                      </Badge>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-9 hover:bg-zinc-100 hover:text-black text-zinc-600">
                            <FileText className="h-4 w-4 mr-2" />
                            View Invoice
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white gap-0">
                          {/* Real-life Invoice UI */}
                          <div className="p-8 bg-white">
                            <div className="flex justify-between items-start mb-10">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <Building2 className="h-6 w-6 text-zinc-900" />
                                  <span className="font-bold text-xl tracking-tight">INVOICE</span>
                                </div>
                                <Badge variant="outline" className={`ml-1 ${isPending ? 'text-amber-600 border-amber-200 bg-amber-50' : 'text-emerald-600 border-emerald-200 bg-emerald-50'}`}>
                                  {inv.status.toUpperCase()}
                                </Badge>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-zinc-500 mb-1">Invoice #</p>
                                <p className="font-mono font-medium text-zinc-900">{inv.id.slice(0, 8).toUpperCase()}</p>
                                <p className="text-sm text-zinc-500 mt-2 mb-1">Date Issued</p>
                                <p className="font-medium text-zinc-900">{format(invoiceDate, 'PPP')}</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-12 mb-12">
                              <div>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Bill From</p>
                                <p className="font-bold text-zinc-900 text-lg mb-1">{contract.expert_name || 'Expert Provider'}</p>
                                <p className="text-sm text-zinc-500">Service Provider</p>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Bill To</p>
                                <p className="font-bold text-zinc-900 text-lg mb-1">{contract.buyer_name || 'Client Company'}</p>
                                <p className="text-sm text-zinc-500">Client</p>
                              </div>
                            </div>

                            <div className="mb-10">
                              <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Description</p>
                              <div className="border border-zinc-200 rounded-lg overflow-hidden">
                                <table className="w-full text-sm text-left">
                                  <thead className="bg-zinc-50 text-zinc-500 font-medium border-b border-zinc-200">
                                    <tr>
                                      <th className="px-4 py-3">Item</th>
                                      <th className="px-4 py-3 text-right">Amount</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-zinc-100">
                                    <tr>
                                      <td className="px-4 py-4">
                                        <p className="font-medium text-zinc-900">
                                          {title}
                                        </p>
                                        <p className="text-zinc-500 text-xs mt-1">
                                          {subtext ? subtext : 'Services rendered as per contract terms.'}
                                        </p>
                                      </td>
                                      <td className="px-4 py-4 text-right font-mono text-zinc-900">
                                        ${amount.toLocaleString()}
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            <div className="flex justify-end mb-6">
                              <div className="w-1/2 space-y-3">
                                <Separator />
                                <div className="flex justify-between items-center pt-2">
                                  <span className="text-lg font-bold text-zinc-900">
                                    {inv.status === 'paid' ? 'Total Paid' : 'Total Due'}
                                  </span>
                                  <span className="text-2xl font-bold text-zinc-900">${amount.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Footer Actions */}
                          <div className="bg-zinc-50 p-6 border-t border-zinc-200 flex justify-between items-center">
                            <div className="text-xs text-zinc-500 flex items-center gap-2">
                              <Wallet className="h-4 w-4" />
                              {isPending ? 'Payment held in Escrow' : 'Payment Released'}
                            </div>

                            <div className="flex gap-3">
                              <Button variant="outline" onClick={() => handleDownloadInvoice(inv)} className="text-zinc-600 gap-2">
                                <Download className="h-4 w-4" />
                                Download
                              </Button>

                              <DialogTrigger asChild>
                                <Button variant="outline">Close</Button>
                              </DialogTrigger>
                              {isBuyer && isPending && (
                                <div className="flex flex-col items-end gap-1">
                                  <Button
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6"
                                    onClick={() => onPayInvoice(inv.id)}
                                    disabled={isPayingInvoice || !hasEscrowFunds}
                                  >
                                    {isPayingInvoice ? (
                                      <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Processing...
                                      </>
                                    ) : (
                                      <>
                                        Pay & Release Escrow
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                      </>
                                    )}
                                  </Button>
                                  {!hasEscrowFunds && (
                                    <span className="text-[10px] text-red-500 font-medium flex items-center gap-1">
                                      <AlertCircle className="h-3 w-3" /> Insufficient Escrow Balance
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </TabsContent>

      {/* DETAILS TAB */}
      <TabsContent value="details" className="pt-6 space-y-6">
        <Card className="border-zinc-200 shadow-sm">
          <CardHeader className="bg-zinc-50/50 border-b border-zinc-100 pb-4">
            <CardTitle className="text-base font-bold text-zinc-900">Contract Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">IP Ownership</span>
                <div className="font-medium text-zinc-900 capitalize p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                  {contract.ip_ownership === 'buyer_owns'
                    ? 'Buyer Owns All IP'
                    : contract.ip_ownership === 'shared'
                      ? 'Shared IP Rights'
                      : 'Expert Retains Rights'}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">NDA Required</span>
                <div className="flex items-center gap-2 p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                  <Badge
                    variant={contract.nda_required ? 'default' : 'secondary'}
                    className={contract.nda_required ? 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200' : 'bg-zinc-100 text-zinc-700 border-zinc-200'}
                  >
                    {contract.nda_required ? 'Yes' : 'No'}
                  </Badge>

                  {contract.nda_required && (
                    <Badge
                      variant={isNdaSigned ? 'default' : 'secondary'}
                      className={isNdaSigned ? 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-200'}
                    >
                      {isNdaSigned ? 'Signed & Active' : 'Signature Required'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}