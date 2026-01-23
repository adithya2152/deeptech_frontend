import { Card, CardContent } from '@/components/ui/card';
import { useCurrency } from '@/hooks/useCurrency';
import { DollarSign, Clock, TrendingUp, Target, FileText } from 'lucide-react';

// Using any for Contract here to ensure it works without the full type definition file
type Contract = any;

interface ContractStatsProps {
  contract: Contract;
  invoiceCount: number;
}

export function ContractStats({ contract, invoiceCount }: ContractStatsProps) {
  const { convertAndFormat } = useCurrency();
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <DollarSign className="h-4 w-4" />
            <span className="text-xs">Total Funded</span>
          </div>
          <p className="text-2xl font-bold">
            {convertAndFormat(Number(contract.escrow_funded_total ?? 0), contract.currency)}
          </p>
        </CardContent>
      </Card>

      {/* Dynamic Rate Card */}
      {contract.engagement_model === 'daily' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Daily Rate</span>
            </div>
            <p className="text-2xl font-bold">{convertAndFormat(contract.payment_terms?.rate || contract.payment_terms?.daily_rate || 0, contract.currency)}/day</p>
          </CardContent>
        </Card>
      )}

      {contract.engagement_model === 'sprint' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs">Sprint Rate</span>
            </div>
            {/* Fallback logic for mock data structure vs real data */}
            <p className="text-2xl font-bold">{convertAndFormat(contract.payment_terms?.sprint_rate || contract.payment_terms?.total_amount / 2 || 0, contract.currency)}/sprint</p>
          </CardContent>
        </Card>
      )}

      {contract.engagement_model === 'fixed' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Target className="h-4 w-4" />
              <span className="text-xs">Project Budget</span>
            </div>
            <p className="text-2xl font-bold">{convertAndFormat(contract.payment_terms?.total_amount, contract.currency)}</p>
          </CardContent>
        </Card>
      )}

      {contract.engagement_model === 'hourly' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs">Hourly Rate</span>
            </div>
            <p className="text-2xl font-bold">{convertAndFormat(Number(contract.payment_terms?.hourly_rate || 0), contract.currency)}/hr</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <FileText className="h-4 w-4" />
            <span className="text-xs">Invoices</span>
          </div>
          <p className="text-2xl font-bold">{invoiceCount}</p>
        </CardContent>
      </Card>
    </div>
  );
}