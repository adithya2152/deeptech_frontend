import { Contract } from '@/types';
import { useCurrency } from '@/hooks/useCurrency';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Calendar,
  DollarSign,
  Clock,
  FileCheck2,
  User2,
  Target,
  ArrowRight,
  Zap,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from '@/lib/dateUtils';

interface ContractCardProps {
  contract: Contract;
  counterpartyName?: string;
  counterpartyRole?: string;
  projectTitle?: string;
}

export function ContractCard({
  contract,
  counterpartyName,
  counterpartyRole,
}: ContractCardProps) {
  const { user } = useAuth();
  const { convertAndFormat } = useCurrency();

  const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
    pending: {
      bg: 'bg-muted',
      text: 'text-muted-foreground',
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      label: 'Pending'
    },
    active: {
      bg: 'bg-primary/10',
      text: 'text-primary',
      icon: <Zap className="h-3.5 w-3.5" />,
      label: 'Active'
    },
    paused: {
      bg: 'bg-muted',
      text: 'text-muted-foreground',
      icon: <PauseCircle className="h-3.5 w-3.5" />,
      label: 'Paused'
    },
    completed: {
      bg: 'bg-muted',
      text: 'text-foreground',
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      label: 'Completed'
    },
    disputed: {
      bg: 'bg-destructive/10',
      text: 'text-destructive',
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      label: 'Disputed'
    },
    declined: {
      bg: 'bg-muted',
      text: 'text-muted-foreground',
      icon: <XCircle className="h-3.5 w-3.5" />,
      label: 'Declined'
    },
  };

  const status = statusConfig[contract.status] || statusConfig.pending;

  const getRateDisplay = () => {
    const terms = (contract.payment_terms as {
      daily_rate?: number;
      sprint_rate?: number;
      hourly_rate?: number;
      total_amount?: number;
    }) || {};
    const currency = contract.currency || 'INR';
    switch (contract.engagement_model) {
      case 'hourly':
        return { rate: convertAndFormat(terms.hourly_rate || 0, currency), unit: '/hr' };
      case 'daily':
        return { rate: convertAndFormat(terms.daily_rate || 0, currency), unit: '/day' };
      case 'sprint':
        return { rate: convertAndFormat(terms.sprint_rate || 0, currency), unit: '/sprint' };
      case 'fixed':
        return { rate: convertAndFormat(terms.total_amount || 0, currency), unit: 'total' };
      default:
        return { rate: 'N/A', unit: '' };
    }
  };

  const getProgress = () => {
    if (contract.engagement_model === 'fixed') {
      const total = contract.payment_terms?.total_amount || 1;
      return Math.min(((contract.total_amount || 0) / total) * 100, 100);
    }
    return 0;
  };

  const { rate, unit } = getRateDisplay();
  const progressValue = getProgress();
  const initials = counterpartyName?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <Link to={`/contracts/${contract.id}`} className="block group">
      <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-sm hover:border-border border-border/50 bg-card">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-10 w-10 border border-border/50 shadow-sm shrink-0">
                <AvatarImage src="" />
                <AvatarFallback className="bg-muted text-muted-foreground font-medium text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h3 className="font-semibold text-base truncate group-hover:text-primary transition-colors">
                  {contract.project_title || 'Untitled Project'}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  {counterpartyRole}: <span className="font-medium">{counterpartyName}</span>
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={`shrink-0 ${status.bg} ${status.text} border-0 gap-1 font-medium text-xs`}
            >
              {status.icon}
              {status.label}
            </Badge>
          </div>

          {/* Price & Model */}
          <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-muted/30">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-0.5">
                {'Contract Value'}
              </p>
              <p className="text-lg font-semibold text-foreground">
                {rate}<span className="text-sm font-normal text-muted-foreground">{unit}</span>
              </p>
            </div>
            <Badge variant="outline" className="capitalize text-xs px-2.5 py-0.5 border-border/50">
              {contract.engagement_model}
            </Badge>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/20">
              <div className="p-1.5 rounded-md bg-muted">
                <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  {'Total Price'}
                </p>
                <p className="text-sm font-medium">
                  {convertAndFormat(contract.total_amount || 0, contract.currency)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/20">
              <div className="p-1.5 rounded-md bg-muted">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                  {'Started'}
                </p>
                <p className="text-sm font-medium">
                  {contract.start_date
                    ? formatDistanceToNow(new Date(contract.start_date), { addSuffix: true })
                    : 'Pending'}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <FileCheck2 className="h-3.5 w-3.5" />
              {contract.nda_status === 'skipped' ? (
                <span className="text-muted-foreground">{'NDA Skipped'}</span>
              ) : contract.nda_signed_at ? (
                <span className="text-foreground font-medium">{'NDA Signed'}</span>
              ) : (
                <span className="text-muted-foreground">{'NDA Pending'}</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              {'View Details'}
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
