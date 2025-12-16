import { Contract, HourLog } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar, DollarSign, Clock, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ContractCardProps {
  contract: Contract;
  expertName?: string;
  projectTitle?: string;
}

export function ContractCard({ contract, expertName, projectTitle }: ContractCardProps) {
  const statusColors = {
    pending: 'bg-warning text-warning-foreground',
    active: 'bg-success text-success-foreground',
    paused: 'bg-muted text-muted-foreground',
    completed: 'bg-info text-info-foreground',
    disputed: 'bg-destructive text-destructive-foreground',
  };

  const engagementLabels = {
    advisory: 'Advisory',
    architecture_review: 'Architecture Review',
    hands_on_execution: 'Hands-on Execution',
  };

  const weeklyProgress = (contract.totalHoursLogged % contract.weeklyHourCap) / contract.weeklyHourCap * 100;

  return (
    <Link to={`/contracts/${contract.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-lg group-hover:text-primary transition-colors">
                {projectTitle || 'Project'}
              </CardTitle>
              {expertName && (
                <p className="text-sm text-muted-foreground mt-1">with {expertName}</p>
              )}
            </div>
            <Badge className={statusColors[contract.status]}>
              {contract.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              {engagementLabels[contract.engagementType]}
            </Badge>
            <span className="font-semibold">${contract.hourlyRate}/hr</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Weekly Hours</span>
              <span className="font-medium">
                {contract.totalHoursLogged % contract.weeklyHourCap} / {contract.weeklyHourCap}h
              </span>
            </div>
            <Progress value={weeklyProgress} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Total Hours</p>
                <p className="font-medium">{contract.totalHoursLogged}h</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Total Amount</p>
                <p className="font-medium">${contract.totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              Started {contract.startDate.toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              {contract.ndaSigned ? 'NDA Signed' : 'NDA Pending'}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
