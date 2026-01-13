import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle2, AlertCircle, Receipt, CreditCard, ArrowRight, Download, Lock, Hourglass, ShieldCheck, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface ContractCompletionActionProps {
  contract: any;
  invoices: any[];
  summaries: any[]; // Used for counting approved days
  onPayInvoice: (invoiceId: string) => Promise<void>;
  onCompleteContract: () => Promise<void>;
  isPaying: boolean;
  isCompleting: boolean;
}

export function ContractCompletionAction({
  contract,
  invoices,
  summaries,
  onPayInvoice,
  onCompleteContract,
  isPaying,
  isCompleting,
}: ContractCompletionActionProps) {
  const { toast } = useToast();
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  // --- Financial Calculations ---
  const unpaidInvoices = useMemo(() => 
    invoices.filter((inv: any) => ['pending', 'overdue'].includes(inv.status)),
  [invoices]);
  
  const validInvoices = useMemo(() => 
    invoices
      .filter((inv: any) => !['rejected', 'draft', 'cancelled'].includes(inv.status))
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
  [invoices]);

  // Source of truth: Contract Total Amount
  const totalContractValue = Number(contract?.total_amount || 0);
  const escrowBalance = Number(contract?.escrow_balance || 0);
  
  const totalPaid = useMemo(() => 
    validInvoices
      .filter((inv: any) => inv.status === 'paid')
      .reduce((sum: number, inv: any) => sum + Number(inv.amount || inv.total_amount || 0), 0),
  [validInvoices]);

  const balanceDue = useMemo(() => 
    unpaidInvoices.reduce((sum: number, inv: any) => sum + Number(inv.amount || inv.total_amount || 0), 0),
  [unpaidInvoices]);

  // --- Completion Logic ---
  const completionStatus = useMemo(() => {
    // Fixed Model Logic
    if (contract.engagement_model === 'fixed') {
        const hasApprovedWork = summaries.some((s: any) => s.status === 'approved');
        
        // Requirement: Show only after minimum 1 log is approved
        if (!hasApprovedWork) {
            return null; 
        }

        const isPaidInFull = totalPaid >= totalContractValue;
        
        // Unlock if Escrow is Funded OR if already paid in full
        const isReady = escrowBalance > 0 || isPaidInFull; 

        return {
            isReady,
            label: isReady ? 'Project Completed' : 'Funding Required',
            details: isReady ? (isPaidInFull ? 'Full amount paid' : 'Funds in Escrow') : 'Escrow funding pending',
            percent: totalContractValue > 0 ? Math.min(100, Math.round((totalPaid / totalContractValue) * 100)) : 0,
            message: isReady 
                ? 'The project terms have been met. Proceed to release escrow funds and generate the final invoice.'
                : 'Please fund the escrow for the approved work. The final cumulative invoice and contract completion will only take place after funds are released.'
        };
    }

    // Sprint Model Logic
    if (contract.engagement_model === 'sprint') {
      const paymentTerms = contract?.payment_terms || {};
      const totalSprints = Number(paymentTerms?.total_sprints || 1);
      const sprintInvoicesCount = invoices.filter((inv: any) => inv.invoice_type === 'sprint').length;

      const isFullyInvoiced = sprintInvoicesCount >= totalSprints;
      const isPaidInFull = balanceDue <= 0;
      const isReady = isFullyInvoiced && isPaidInFull;

      const percent = totalSprints > 0 ? Math.min(100, Math.round((Math.min(sprintInvoicesCount, totalSprints) / totalSprints) * 100)) : 0;

      return {
        isReady,
        label: isReady ? 'Ready to Complete' : (!isFullyInvoiced ? 'Sprints Remaining' : 'Payment Pending'),
        details: !isFullyInvoiced ? `${sprintInvoicesCount}/${totalSprints} invoiced` : (isPaidInFull ? 'Paid' : 'Unpaid invoices'),
        percent,
        message: isReady
          ? 'All sprints are invoiced and paid. You can now close the contract.'
          : (!isFullyInvoiced
            ? 'Complete all sprints (and generate invoices) before closing the contract.'
            : 'Please pay pending invoices before closing the contract.'),
      };
    }

    // Daily Model Logic
    if (contract.engagement_model === 'daily') {
      const paymentTerms = contract?.payment_terms || {};
      const approvedDays = summaries.filter((s: any) => s.status === 'approved').length;
      const totalDays = Number(paymentTerms?.total_days || approvedDays || summaries.length || 1);

      const hasAnyApproved = approvedDays > 0;
      const isWorkCompleted = hasAnyApproved && approvedDays >= totalDays;
      const isPaidInFull = balanceDue <= 0;
      const isReady = isWorkCompleted && isPaidInFull;

      const percent = totalDays > 0 ? Math.min(100, Math.round((approvedDays / totalDays) * 100)) : 0;

      return {
        isReady,
        label: isReady ? 'Ready to Complete' : (!isWorkCompleted ? 'Work Remaining' : 'Payment Pending'),
        details: !isWorkCompleted ? `${approvedDays}/${totalDays} approved days` : (isPaidInFull ? 'Paid' : 'Unpaid invoices'),
        percent,
        message: isReady
          ? 'All planned work is approved and invoices are settled. You can now close the contract.'
          : (!isWorkCompleted
            ? 'Approve all required daily summaries before closing the contract.'
            : 'Please pay pending invoices before closing the contract.'),
      };
    }

    return null;
  }, [contract, summaries, invoices, totalPaid, totalContractValue, escrowBalance, balanceDue]);

  // Memoize daily summaries for mapping (Invoice Descriptions)
  const dailySummaryMap = useMemo(() => {
    if (contract.engagement_model !== 'daily') return {};
    const sorted = [...summaries].sort((a: any, b: any) => new Date(a.work_date).getTime() - new Date(b.work_date).getTime());
    const map: Record<string, { index: number, date: string }> = {};
    sorted.forEach((s, i) => {
        map[s.work_date] = { index: i + 1, date: s.work_date };
    });
    return map;
  }, [summaries, contract.engagement_model]);

  // Memoize sorted sprint invoices
  const sprintInvoices = useMemo(() => 
    invoices
        .filter((inv: any) => inv.invoice_type === 'sprint')
        .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()),
  [invoices]);

  const getInvoiceDescription = (inv: any) => {
    if (inv.invoice_type === 'sprint') {
        const index = sprintInvoices.findIndex((i: any) => i.id === inv.id);
        const sprintNum = index !== -1 ? index + 1 : '?';
        return { title: `Sprint #${sprintNum} Invoice`, subtext: `Sprint Payment` };
    }
    
    if (contract.engagement_model === 'daily') {
        const dateKey = inv.week_start_date || (inv.created_at ? inv.created_at.split('T')[0] : '');
        const info = dailySummaryMap[dateKey];

        if (info) {
            return { 
                title: `Day ${info.index} Invoice`, 
                subtext: format(new Date(info.date), 'MMM d, yyyy') 
            };
        }
        return { title: `Daily Invoice`, subtext: format(new Date(inv.created_at), 'MMM d, yyyy') };
    }

    if (contract.engagement_model === 'fixed' || inv.invoice_type === 'fixed') {
        return { title: `Work Log Invoice`, subtext: 'Project Payment' };
    }

    return { title: `Contract Invoice`, subtext: 'Services' };
  };

  const handleDownload = () => {
    try {
      const invoiceId = `FINAL-${contract.id.slice(0, 6)}`;
      const date = new Date().toLocaleDateString();
      const isFixed = contract.engagement_model === 'fixed';
      
      const invoiceRows = validInvoices.map((inv: any) => {
        const amount = Number(inv.amount || inv.total_amount || 0);
        const { title, subtext } = getInvoiceDescription(inv);

        return `
        <tr>
            <td>
                <strong>${title}</strong><br>
                <span style="color:#666; font-size: 11px;">${subtext}</span>
            </td>
            <td class="amount-col">$${amount.toLocaleString()}</td>
        </tr>
      `}).join('');

      // Custom Template for Fixed Model
      const invoiceTitle = isFixed ? "ESCROW RELEASE STATEMENT" : "CUMULATIVE INVOICE";
      const statusText = balanceDue > 0 ? "PAYMENT PENDING" : (isFixed ? "FUNDS RELEASED" : "PAID IN FULL");
      const statusClass = balanceDue > 0 ? 'status-due' : 'status-paid';
      
      const content = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>${invoiceTitle} ${invoiceId}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #333; }
            .header { display: flex; justify-content: space-between; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #f3f4f6; }
            .brand { font-size: 24px; font-weight: bold; color: #10b981; }
            .invoice-details { text-align: right; }
            .invoice-title { font-size: 24px; font-weight: bold; color: #111; margin: 0; text-transform: uppercase; }
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
            .status-paid { color: #10b981; border: 1px solid #10b981; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; display: inline-block; margin-top: 10px; }
            .status-due { color: #ef4444; border: 1px solid #ef4444; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; display: inline-block; margin-top: 10px; }
            .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #f3f4f6; text-align: center; color: #9ca3af; font-size: 12px; }
            .escrow-note { background: #f0fdf4; border: 1px solid #dcfce7; padding: 10px; font-size: 12px; color: #166534; margin-bottom: 20px; text-align: center; border-radius: 4px;}
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">Escrow Platform</div>
            <div class="invoice-details">
              <h1 class="invoice-title">${invoiceTitle}</h1>
              <div class="invoice-meta">#${invoiceId.toUpperCase()}</div>
              <div class="invoice-meta">Date: ${date}</div>
              <div class="${statusClass}">
                ${statusText}
              </div>
            </div>
          </div>

          ${isFixed ? `<div class="escrow-note">
             Funds for this project have been successfully released from the Secure Escrow account to the Expert Provider.
          </div>` : ''}

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
              ${invoiceRows}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-box">
              <div class="summary-row">
                <span>Total Contract Value</span>
                <span>$${totalContractValue.toLocaleString()}</span>
              </div>
              <div class="summary-row">
                <span>${isFixed ? 'Escrow Released' : 'Amount Paid'}</span>
                <span>-$${totalPaid.toLocaleString()}</span>
              </div>
              <div class="summary-row total-row">
                <span>Balance Due</span>
                <span>$${balanceDue.toLocaleString()}</span>
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
      link.download = `final_invoice_${contract.id.slice(0, 6)}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Started",
        description: "Your final invoice is downloading.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not generate invoice file.",
        variant: "destructive",
      });
    }
  };

  if (!completionStatus) return null;
  const isFixed = contract.engagement_model === 'fixed';

  return (
    <Card className="border-zinc-200 shadow-sm bg-zinc-50/50">
      <CardHeader className="pb-3 border-b border-zinc-100">
        <CardTitle className="text-base font-bold text-zinc-900 flex items-center gap-2">
          {completionStatus.isReady ? (
             <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : (
             <Hourglass className="h-5 w-5 text-zinc-400" />
          )}
          Contract Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="text-sm text-zinc-600">
            {/* Conditional Progress Message */}
            {!completionStatus.isReady ? (
                <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-zinc-700 text-xs uppercase tracking-wide">{completionStatus.label}</span>
                        <span className="text-xs text-zinc-500 font-mono">{completionStatus.details}</span>
                    </div>
                    <Progress value={completionStatus.percent} className="h-2" />
                    <p className="mt-2 text-xs text-zinc-500">
                        {completionStatus.message}
                    </p>
                </div>
            ) : (
                <p className="mb-2">
                    {completionStatus.message}
                </p>
            )}

            {balanceDue > 0 && completionStatus.isReady && (
                <div className="flex items-center gap-2 text-amber-600 font-medium text-xs bg-amber-50 p-2 rounded border border-amber-100">
                    <AlertCircle className="h-3 w-3" />
                    Pending Balance: ${balanceDue.toLocaleString()}
                </div>
            )}
          </div>
          
          <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
            <DialogTrigger asChild>
              <Button
                className={`w-full shadow-sm transition-all ${!completionStatus.isReady ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed hover:bg-zinc-100' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                disabled={!completionStatus.isReady}
              >
                {!completionStatus.isReady && <Lock className="h-4 w-4 mr-2" />}
                {isFixed ? 'Release Escrow & Close' : 'Complete Contract'}
                {completionStatus.isReady && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </DialogTrigger>
            
            {/* Only render content if actually ready to prevent bypassing disabled state */}
            {completionStatus.isReady && (
                <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white gap-0">
                    <div className="p-8 bg-white">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                {isFixed ? (
                                    <ShieldCheck className="h-6 w-6 text-zinc-900" />
                                ) : (
                                    <Receipt className="h-6 w-6 text-zinc-900" />
                                )}
                                <span className="font-bold text-xl tracking-tight">
                                    {isFixed ? 'ESCROW RELEASE STATEMENT' : 'CUMULATIVE INVOICE'}
                                </span>
                            </div>
                            <p className="text-sm text-zinc-500">
                                {isFixed ? 'Final Funds Release Authorization' : 'Final Contract Statement'}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="font-medium text-zinc-900">{format(new Date(), 'PPP')}</p>
                            {balanceDue > 0 ? (
                                <Badge variant="destructive" className="mt-2 text-white border-red-200">
                                    PAYMENT PENDING
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="mt-2 bg-emerald-50 text-emerald-700 border-emerald-200">
                                    {isFixed ? 'FUNDS RELEASED' : 'PAID IN FULL'}
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="mb-8 p-4 bg-zinc-50 rounded-lg border border-zinc-100">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-zinc-500">Client</span>
                            <span className="font-semibold text-zinc-900">{contract.buyer_name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-zinc-500">Provider</span>
                            <span className="font-semibold text-zinc-900">{contract.expert_name}</span>
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="flex justify-between items-center">
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Transaction Summary</p>
                        </div>
                        
                        <div className="border border-zinc-200 rounded-lg overflow-hidden max-h-[200px] overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-zinc-50 text-zinc-500 font-medium sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2">Invoice #</th>
                                        <th className="px-4 py-2">Status</th>
                                        <th className="px-4 py-2 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {validInvoices.map((inv: any) => {
                                    const amount = Number(inv.amount || inv.total_amount || 0);
                                    const { title, subtext } = getInvoiceDescription(inv);
                                    return (
                                        <tr key={inv.id} className={['pending', 'overdue'].includes(inv.status) ? 'bg-amber-50/50' : ''}>
                                        <td className="px-4 py-2">
                                            <p className="font-medium text-zinc-900">{title}</p>
                                            <p className="text-[10px] text-zinc-500 font-mono">{subtext}</p>
                                        </td>
                                        <td className="px-4 py-2">
                                            <Badge variant="outline" className={`text-[10px] h-5 ${['pending', 'overdue'].includes(inv.status) ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200'}`}>
                                                {inv.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-2 text-right font-medium text-zinc-900">${amount.toLocaleString()}</td>
                                        </tr>
                                    )
                                    })}
                                </tbody>
                            </table>
                        </div>
                        
                        <div className="flex flex-col gap-2 pt-2 px-1">
                            <div className="flex justify-between items-center text-zinc-600 text-sm">
                                <span>Total Contract Value</span>
                                <span className="font-semibold text-zinc-900">${totalContractValue.toLocaleString()}</span>
                            </div>
                            
                            {balanceDue > 0 && !isFixed && (
                                <div className="flex justify-between items-center text-zinc-500 text-sm">
                                    <span>Already Paid</span>
                                    <span>${totalPaid.toLocaleString()}</span>
                                </div>
                            )}

                            {/* --- ADDED FOR FIXED MODEL --- */}
                            {isFixed && escrowBalance > 0 && (
                                <div className="bg-emerald-50 border border-emerald-100 rounded p-2 mt-2">
                                    <div className="flex justify-between items-center text-emerald-700 text-sm font-semibold">
                                        <span className="flex items-center gap-2"><Wallet className="h-4 w-4"/> Releasing Now (Final)</span>
                                        <span>${escrowBalance.toLocaleString()}</span>
                                    </div>
                                    <p className="text-[10px] text-emerald-600 text-right mt-0.5">Deducted from Escrow Balance</p>
                                </div>
                            )}

                            <Separator className="my-1"/>
                            
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-lg text-zinc-900">
                                    {balanceDue > 0 ? 'Balance Due' : (isFixed ? 'Remaining Escrow' : 'Total Paid')}
                                </span>
                                <span className={`font-bold text-2xl ${balanceDue > 0 ? 'text-amber-600' : 'text-emerald-700'}`}>
                                    ${(balanceDue > 0 ? balanceDue : (isFixed ? 0 : totalPaid)).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {balanceDue > 0 ? (
                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-lg flex gap-3 items-start">
                            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-amber-900">Payment Required to Close</p>
                                <p className="text-sm text-amber-700 mt-1">
                                    Please clear the final balance of <strong>${balanceDue.toLocaleString()}</strong>. Once paid, the contract will be marked as complete.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3 items-start">
                            <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-blue-900">
                                    {isFixed ? 'Confirm Release of Funds?' : 'Ready to Finalize?'}
                                </p>
                                <p className="text-sm text-blue-700 mt-1">
                                    {isFixed 
                                        ? 'By clicking below, you will generate the final invoice for the records and immediately release funds from escrow to the expert.'
                                        : 'Generating this cumulative invoice will formally close the contract. This action cannot be undone.'
                                    }
                                </p>
                            </div>
                        </div>
                    )}
                    </div>

                    <div className="bg-zinc-50 p-6 border-t border-zinc-200 flex justify-between gap-3">
                    <Button variant="outline" onClick={handleDownload} className="text-zinc-600 gap-2">
                        <Download className="h-4 w-4" />
                        Download PDF
                    </Button>

                    <div className="flex gap-3">
                        <Button variant="ghost" onClick={() => setShowCompleteDialog(false)} disabled={isCompleting || isPaying}>
                            Cancel
                        </Button>
                        
                        {balanceDue > 0 ? (
                            <Button 
                                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                                onClick={async () => {
                                    if (unpaidInvoices.length > 0) {
                                        await onPayInvoice(unpaidInvoices[0].id);
                                    }
                                }}
                                disabled={isPaying}
                            >
                                {isPaying ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Pay & Close Contract
                                    </>
                                )}
                            </Button>
                        ) : (
                            <Button 
                                className="bg-zinc-900 text-white hover:bg-zinc-800"
                                onClick={async () => {
                                    await onCompleteContract();
                                    setShowCompleteDialog(false);
                                }}
                                disabled={isCompleting}
                            >
                                {isCompleting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        {isFixed ? 'Release Funds and Complete Contract' : 'Complete Contract'}
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                    </div>
                </DialogContent>
            )}
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}