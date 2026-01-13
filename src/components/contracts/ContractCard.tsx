import { Contract } from '@/types';
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
import { formatDistanceToNow } from 'date-fns';

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

  const statusConfig: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
    pending: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-600',
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      label: 'Pending'
    },
    active: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-600',
      icon: <Zap className="h-3.5 w-3.5" />,
      label: 'Active'
    },
    paused: {
      bg: 'bg-zinc-500/10',
      text: 'text-zinc-500',
      icon: <PauseCircle className="h-3.5 w-3.5" />,
      label: 'Paused'
    },
    completed: {
      bg: 'bg-sky-500/10',
      text: 'text-sky-600',
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      label: 'Completed'
    },
    disputed: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-600',
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      label: 'Disputed'
    },
    declined: {
      bg: 'bg-zinc-500/10',
      text: 'text-zinc-400',
      icon: <XCircle className="h-3.5 w-3.5" />,
      label: 'Declined'
    },
  };

  const status = statusConfig[contract.status] || statusConfig.pending;

  const getRateDisplay = () => {
    const terms = (contract.payment_terms as {
      daily_rate?: number;
      sprint_rate?: number;
      total_amount?: number;
    }) || {};
    switch (contract.engagement_model) {
      case 'daily':
        return { rate: `$${terms.daily_rate || 0}`, unit: '/day' };
      case 'sprint':
        return { rate: `$${terms.sprint_rate || 0}`, unit: '/sprint' };
      case 'fixed':
        return { rate: `$${(terms.total_amount || 0).toLocaleString()}`, unit: ' total' };
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
      <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-900 dark:to-zinc-800/50">
        {/* Status indicator bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${status.bg}`}>
          <div className={`h-full ${status.text.replace('text-', 'bg-')} w-full opacity-60`} />
        </div>

        <div className="p-5 pt-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-11 w-11 border-2 border-background shadow-sm shrink-0">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/5 text-primary font-semibold text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h3 className="font-bold text-base truncate group-hover:text-primary transition-colors">
                  {contract.project_title || 'Untitled Project'}
                </h3>
                <p className="text-xs text-muted-foreground truncate">
                  {counterpartyRole}: <span className="font-medium text-foreground/70">{counterpartyName}</span>
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className={`shrink-0 ${status.bg} ${status.text} border-0 gap-1 font-semibold`}
            >
              {status.icon}
              {status.label}
            </Badge>
          </div>

          {/* Price & Model */}
          <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-muted/30">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">
                Contract Value
              </p>
              <p className="text-xl font-bold text-foreground">
                {rate}<span className="text-sm font-normal text-muted-foreground">{unit}</span>
              </p>
            </div>
            <Badge variant="outline" className="capitalize text-xs px-3 py-1">
              {contract.engagement_model}
            </Badge>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/20">
              <div className="p-2 rounded-md bg-primary/5">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Paid
                </p>
                <p className="text-sm font-bold">
                  ${Number(contract.total_amount || 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/20">
              <div className="p-2 rounded-md bg-primary/5">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  Started
                </p>
                <p className="text-sm font-bold">
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
              {contract.nda_signed_at ? (
                <span className="text-emerald-600 font-medium">NDA Signed</span>
              ) : (
                <span className="text-amber-600 font-medium">NDA Required</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
              View Details
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
