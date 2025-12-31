import { Contract } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar, DollarSign, Clock, FileText, User, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

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
  const isExpert = user?.role === 'expert';

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    active: 'bg-green-100 text-green-800 border-green-200',
    paused: 'bg-gray-100 text-gray-800 border-gray-200',
    completed: 'bg-blue-100 text-blue-800 border-blue-200',
    disputed: 'bg-red-100 text-red-800 border-red-200',
  };

  const getRateDisplay = () => {
    const terms =
      (contract.payment_terms as {
        daily_rate?: number;
        sprint_rate?: number;
        total_amount?: number;
      }) || {};
    switch (contract.engagement_model) {
      case 'daily':
        return `$${terms.daily_rate || 0}/day`;
      case 'sprint':
        return `$${terms.sprint_rate || 0}/sprint`;
      case 'fixed':
        return `$${terms.total_amount?.toLocaleString() || 0} Total`;
      default:
        return 'N/A';
    }
  };

  const getScheduleLabel = () => {
    switch (contract.engagement_model) {
      case 'daily':
        return 'Daily Check-in';
      case 'sprint':
        return `${contract.payment_terms?.sprint_duration_days || 14} Day Sprints`;
      case 'fixed':
        return 'Milestone Based';
      default:
        return 'Schedule';
    }
  };

  const getProgress = () => {
    if (contract.engagement_model === 'fixed') {
      const total = contract.payment_terms?.total_amount || 1;
      return ((contract.total_amount || 0) / total) * 100;
    }
    return 0;
  };

  const progressValue = getProgress();

  return (
    <Link to={`/contracts/${contract.id}`}>
      <Card className="group hover:shadow-md transition-all border-border/60 h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">
                {contract.project_title || 'Untitled Project'}
              </CardTitle>
              {counterpartyName && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1 truncate">
                  <User className="h-3 w-3" />
                  <span>
                    {counterpartyRole ? `${counterpartyRole}: ` : ''}
                    <span className="font-medium text-foreground/80">
                      {counterpartyName}
                    </span>
                  </span>
                </div>
              )}
            </div>
            <Badge
              variant="secondary"
              className={statusColors[contract.status as keyof typeof statusColors]}
            >
              {contract.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="font-normal capitalize">
              {contract.engagement_model} Model
            </Badge>
            <span className="font-bold text-primary">{getRateDisplay()}</span>
          </div>

          {contract.engagement_model === 'fixed' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Budget Used</span>
                <span className="font-medium text-muted-foreground">
                  {progressValue.toFixed(0)}%
                </span>
              </div>
              <Progress value={progressValue} className="h-1.5" />
            </div>
          ) : (
            <div className="h-8" />
          )}

          <div className="grid grid-cols-2 gap-4 py-3 border-y border-border/40 mt-auto">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-muted/50">
                {contract.engagement_model === 'fixed' ? (
                  <Target className="h-3.5 w-3.5 text-muted-foreground" />
                ) : (
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                  Structure
                </p>
                <p
                  className="text-sm font-semibold truncate max-w-[100px]"
                  title={getScheduleLabel()}
                >
                  {getScheduleLabel()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-muted/50">
                <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                  Paid
                </p>
                <p className="text-sm font-semibold">
                  ${Number(contract.total_amount || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {contract.start_date
                ? new Date(contract.start_date).toLocaleDateString()
                : 'Pending Start'}
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {contract.nda_signed_at
                ? 'NDA Signed'
                : 'NDA Required'}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
