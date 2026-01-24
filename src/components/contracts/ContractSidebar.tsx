import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare, AlertCircle, Flag, Gavel } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';

interface EscrowSummaryProps {
  total: number;
  balance: number;
  funded: number;
  released: number;
  remaining: number;
}

interface ContractSidebarProps {
  progressStats: {
    label: string;
    value: number;
    display: string;
    subtext: string;
  };
  escrow?: EscrowSummaryProps;
  currency?: string;
  onStartChat: () => void;
  isChatLoading: boolean;
  otherUserName: string;
  isBuyer: boolean;
  onReportUser?: () => void;
  onRaiseDispute?: () => void;
}

export function ContractSidebar({
  progressStats,
  escrow,
  currency,
  onStartChat,
  isChatLoading,
  otherUserName,
  isBuyer,
  onReportUser,
  onRaiseDispute
}: ContractSidebarProps) {
  const { convertAndFormat } = useCurrency();
  // Format amounts using the contract's currency (not hardcoded INR)
  const formatAmount = (value: number | undefined | null) =>
    convertAndFormat(value || 0, currency);

  return (
    <div className="space-y-6">
      <Card className="bg-primary/[0.02] border-primary/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold uppercase tracking-tight text-muted-foreground">
            {progressStats.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-end mb-2">
            <span className="text-2xl font-bold">{progressStats.display}</span>
            <span className="text-xs text-muted-foreground">
              {progressStats.subtext}
            </span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{
                width: `${Math.min(Math.max(progressStats.value, 0), 100)}%`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {escrow && (
        <Card className="border-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Escrow &amp; Payments
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-1.5 text-sm pb-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contract value</span>
              <span className="font-medium">
                {formatAmount(escrow.total)}
              </span>
            </div>

            {isBuyer ? (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Escrow Balance</span>
                  <span className="font-medium">
                    {formatAmount(escrow.balance)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Released</span>
                  <span className="font-medium text-green-600">
                    {formatAmount(escrow.released)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remaining to fund</span>
                  <span className="font-medium text-amber-600">
                    {formatAmount(escrow.remaining)}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Currently in escrow</span>
                  <span className="font-medium">
                    {formatAmount(escrow.balance)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Released to you</span>
                  <span className="font-medium text-green-600">
                    {formatAmount(escrow.released)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Remaining unpaid</span>
                  <span className="font-medium text-amber-600">
                    {formatAmount(escrow.total - escrow.released)}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          <Button
            className="w-full justify-start text-sm h-9"
            onClick={onStartChat}
            disabled={isChatLoading}
          >
            {isChatLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <MessageSquare className="h-4 w-4 mr-2" />
            )}
            Message {otherUserName}
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start text-sm h-9"
            onClick={() =>
              (window.location.href = 'mailto:support@deeptech.com')
            }
          >
            <AlertCircle className="h-4 w-4 mr-2 text-muted-foreground" />
            Contact Support
          </Button>

          <div className="pt-2 flex flex-col gap-2">
            {onRaiseDispute && (
              <Button
                variant="ghost"
                className="w-full justify-start text-sm h-8 text-destructive hover:text-destructive hover:bg-destructive/5"
                onClick={onRaiseDispute}
              >
                <Gavel className="h-4 w-4 mr-2" />
                Raise Dispute
              </Button>
            )}

            {onReportUser && (
              <Button
                variant="ghost"
                className="w-full justify-start text-sm h-8 text-muted-foreground hover:text-zinc-900"
                onClick={onReportUser}
              >
                <Flag className="h-4 w-4 mr-2" />
                Report {otherUserName}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}