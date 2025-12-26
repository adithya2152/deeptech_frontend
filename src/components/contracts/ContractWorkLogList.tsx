import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock,
  Link as LinkIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { EditWorkLogModal } from '@/components/contracts/EditWorkLogModal';

type WorkLog = any;

const valueTagLabels: Record<string, string> = {
  decision_made: 'Decision Made',
  risk_avoided: 'Risk Avoided',
  path_clarified: 'Path Clarified',
  knowledge_transferred: 'Knowledge Transferred',
  problem_solved: 'Problem Solved',
};

interface ContractWorkLogListProps {
  logs: WorkLog[];
  isBuyer: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  isApproving: boolean;
  isRejecting: boolean;
}

export function ContractWorkLogList({
  logs,
  isBuyer,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
}: ContractWorkLogListProps) {
  if (!Array.isArray(logs) || logs.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/10">
        <Clock className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">No work logged yet.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {logs.map((rawLog) => {
        const log = {
          ...rawLog,
          status: rawLog.status ?? 'submitted',
          log_date: rawLog.log_date ?? rawLog.created_at,
          description:
            rawLog.description ??
            rawLog.evidence?.summary ??
            '',
          checklist: rawLog.checklist ?? [],
          value_tags: rawLog.value_tags ?? {},
        };

        return (
          <Card
            key={log.id}
            className={
              log.status === 'submitted' && isBuyer
                ? 'border-primary/50 bg-primary/5'
                : ''
            }
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {log.type === 'daily_log' && (
                      <Badge variant="outline">Day Log</Badge>
                    )}
                    {log.type === 'sprint_submission' && (
                      <Badge>Sprint #{log.sprint_number}</Badge>
                    )}
                    {log.type === 'milestone_request' && (
                      <Badge>Milestone Request</Badge>
                    )}

                    <Badge
                      variant={
                        log.status === 'approved'
                          ? 'secondary'
                          : 'outline'
                      }
                      className="capitalize"
                    >
                      {log.status}
                    </Badge>

                    <span className="text-xs text-muted-foreground ml-auto">
                      {log.log_date
                        ? format(new Date(log.log_date), 'MMM d')
                        : '—'}
                    </span>
                  </div>

                  {/* Description - read only */}
                  {log.description && (
                    <p className="text-sm text-foreground/80 leading-relaxed mb-3 mt-2">
                      {log.description}
                    </p>
                  )}

                  {log.checklist.length > 0 && (
                    <div className="mt-3 mb-3 space-y-2 border-l-2 border-muted pl-3">
                      <p className="text-xs font-semibold text-muted-foreground">
                        Checklist
                      </p>
                      <div className="grid gap-1.5">
                        {log.checklist.map((item: any, i: number) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-sm"
                          >
                            {item.status === 'done' ? (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-muted-foreground/50" />
                            )}
                            <span
                              className={
                                item.status === 'done'
                                  ? 'line-through text-muted-foreground'
                                  : ''
                              }
                            >
                              {item.task}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {log.problems_faced && (
                    <div className="mt-3 mb-3 p-3 bg-yellow-50/50 border border-yellow-100 rounded-md">
                      <div className="flex items-center gap-2 text-yellow-800 mb-1">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-xs font-semibold">
                          Blockers / Issues
                        </span>
                      </div>
                      <p className="text-sm text-yellow-900/80">
                        {log.problems_faced}
                      </p>
                    </div>
                  )}

                  {log.evidence?.links?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 p-2 bg-muted/30 rounded border border-dashed">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground w-full">
                        Proof of Work
                      </span>
                      {log.evidence.links.map((link: any, idx: number) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-600 hover:underline"
                        >
                          <LinkIcon className="h-3 w-3" />
                          {link.label || 'View Link'}
                        </a>
                      ))}
                    </div>
                  )}

                  {Object.keys(log.value_tags).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {Object.keys(log.value_tags).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-[10px] text-muted-foreground bg-muted/50"
                        >
                          {valueTagLabels[tag] || tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Expert: Edit submitted logs via modal */}
                {!isBuyer && log.status === 'submitted' && (
                  <EditWorkLogModal
                    log={log}
                    contractId={log.contract_id}
                    trigger={
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                      >
                        Edit
                      </Button>
                    }
                  />
                )}

                {/* Buyer: Approve / Reject */}
                {log.status === 'submitted' && isBuyer && (
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      className="h-8"
                      onClick={() => onApprove(log.id)}
                      disabled={isApproving}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-destructive border-destructive/20"
                      onClick={() => {
                        const reason = prompt('Reason for rejection:');
                        if (reason) onReject(log.id, reason);
                      }}
                      disabled={isRejecting}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
