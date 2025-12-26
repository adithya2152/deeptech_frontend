import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, MessageSquare, AlertCircle } from 'lucide-react';

interface EscrowSummaryProps {
  total: number;
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
  onStartChat: () => void;
  isChatLoading: boolean;
  otherUserName: string;
}

const formatAmount = (value: number | undefined | null) =>
  `$${Number(value || 0).toFixed(2)}`;

export function ContractSidebar({
  progressStats,
  escrow,
  onStartChat,
  isChatLoading,
  otherUserName,
}: ContractSidebarProps) {
  return (
    <div className="space-y-6">
      {/* Progress card */}
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
              style={{ width: `${Math.min(progressStats.value, 100)}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Escrow card */}
      {escrow && (
        <Card className="border-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">
              Escrow & Payments
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-1.5 text-sm pb-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contract value</span>
              <span className="font-medium">
                {formatAmount(escrow.total)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Escrow funded</span>
              <span className="font-medium">
                {formatAmount(escrow.funded)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Released</span>
              <span className="font-medium text-green-600">
                {formatAmount(escrow.released)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Remaining</span>
              <span className="font-medium text-amber-600">
                {formatAmount(escrow.remaining)}
              </span>
            </div>

            {/* Fund Escrow button (UI only) */}
            <Button
              className="w-full h-9 mt-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-xs"
              size="sm"
              onClick={() => window.alert('TODO: Connect Stripe to fund escrow')}
            >
              💰 Fund Escrow ({formatAmount(escrow.remaining)})
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Actions card */}
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
        </CardContent>
      </Card>
    </div>
  );
}
