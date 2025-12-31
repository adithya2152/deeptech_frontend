import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Clock, CheckCircle2, XCircle, ExternalLink,
  Edit2, ChevronDown, ChevronUp,
  ChevronRight as ChevronRightIcon, Calendar, Timer, Link2, CheckSquare, Pencil, X,
  AlertTriangle, Tag, MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { DayWorkSummary, WorkLog } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { WorkLogForm } from './WorkSubmissionForms';

type Mode = 'daily' | 'sprint' | 'fixed';

interface ContractWorkLogListProps {
  logs: (DayWorkSummary | WorkLog)[];
  isBuyer: boolean;
  isExpert: boolean;
  mode: Mode;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onEdit: (logId: string, data: any) => Promise<void>;
  isApproving: boolean;
  isRejecting: boolean;
  isEditing: boolean;
}

const statusConfig: Record<string, any> = {
  pending: { 
    label: 'Pending Review', 
    className: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-100',
    icon: Clock 
  },
  approved: { 
    label: 'Approved', 
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-100',
    icon: CheckCircle2 
  },
  rejected: { 
    label: 'Rejected', 
    className: 'bg-red-50 text-red-700 border-red-200 ring-red-100',
    icon: XCircle 
  },
  submitted: { 
    label: 'Submitted', 
    className: 'bg-blue-50 text-blue-700 border-blue-200 ring-blue-100',
    icon: CheckCircle2 
  },
};

export function ContractWorkLogList({
  logs,
  isBuyer,
  isExpert,
  mode,
  onApprove,
  onReject,
  onEdit,
  isApproving,
  isRejecting,
  isEditing,
}: ContractWorkLogListProps) {
  const [selected, setSelected] = useState<any | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [expandedSprint, setExpandedSprint] = useState<string | null>(null);
  const { toast } = useToast();

  const groupedLogs = logs.reduce((acc: Record<string, (DayWorkSummary | WorkLog)[]>, log) => {
    if (mode === 'sprint' && 'sprint_number' in log && log.sprint_number) {
      const key = `sprint-${log.sprint_number}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(log);
    } else {
      const key = `log-${log.id}`;
      acc[key] = [log];
    }
    return acc;
  }, {} as Record<string, (DayWorkSummary | WorkLog)[]>);

  const sprintGroups = Object.entries(groupedLogs)
    .filter(([key]) => mode === 'sprint' ? key.startsWith('sprint-') : true)
    .map(([key, sprintLogs]) => {
      const firstLog = sprintLogs[0];
      return {
        id: key,
        sprint_number: parseInt(key.match(/sprint-(\d+)/)?.[1] || '0'),
        logs: sprintLogs,
        status: firstLog?.status || 'pending',
        logCount: sprintLogs.length,
      };
    });

  const logIndices = useMemo(() => {
    const sorted = [...logs].sort((a: any, b: any) => {
      const dateA = new Date(a.work_date || a.log_date || a.created_at).getTime();
      const dateB = new Date(b.work_date || b.log_date || b.created_at).getTime();
      return dateA - dateB;
    });

    const map: Record<string, number> = {};
    sorted.forEach((item, index) => {
      map[item.id] = index + 1;
    });
    return map;
  }, [logs]);

  const getPrimaryLabel = (item: any) => {
    if (mode === 'sprint') return `Sprint #${item.sprint_number || 1}`;
    const num = logIndices[item.id] || '?';
    if (mode === 'daily') return `Day ${num}`;
    return `Work Log ${num}`;
  };

  const getDialogTitle = () => {
    if (editMode) return 'Edit Submission';
    if (mode === 'daily') return 'Daily Work Summary';
    if (mode === 'sprint') return 'Sprint Submission';
    return 'Work Log Details'; 
  };

  const getApprovalButtonText = () => {
    if (mode === 'daily') return 'Approve Day';
    if (mode === 'sprint') return 'Approve Sprint';
    return 'Approve Log';
  };

  const handleEditClick = (e: React.MouseEvent, item: any) => {
    e.stopPropagation();
    if (['pending', 'submitted'].includes(item.status)) {
      setSelected(item);
      setEditMode(true);
    }
  };

  const handleUpdateLog = async (data: any) => {
    if (!selected?.id) return;
    try {
      await onEdit(selected.id, data);
      toast({ title: "Updated successfully!" });
      setEditMode(false);
      setSelected(null);
    } catch (error) {
      toast({
        title: "Update failed",
        variant: "destructive",
        description: "Please try again."
      });
    }
  };

  // Helper to parse value tags safely
  const getValueTags = (tags: any): string[] => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'object') return Object.keys(tags);
    return [];
  };

  if (!Array.isArray(logs) || logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-zinc-200 rounded-lg bg-zinc-50/50 text-center">
        <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-zinc-100">
          <Clock className="h-8 w-8 text-zinc-300" />
        </div>
        <h3 className="text-base font-semibold text-zinc-900">
          {mode === 'daily' ? 'No days logged yet' : mode === 'sprint' ? 'No sprints submitted' : 'No work logs submitted'}
        </h3>
        <p className="text-sm text-zinc-500 mt-2 max-w-xs mx-auto">
          When work is logged, it will appear here for review.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {mode === 'sprint' ? (
          sprintGroups.map((sprintGroup) => {
            const status = sprintGroup.status || 'pending';
            const config = statusConfig[status] || statusConfig.pending;
            const StatusIcon = config.icon;
            const isExpanded = expandedSprint === sprintGroup.id;

            return (
              <div key={sprintGroup.id} className="group">
                <Card
                  className="transition-all duration-200 shadow-sm border-zinc-200 cursor-pointer bg-white hover:border-zinc-300 hover:shadow-md overflow-hidden"
                  onClick={() => setExpandedSprint(isExpanded ? null : sprintGroup.id)}
                >
                  <CardContent className="p-0">
                    <div className="flex items-center justify-between p-5">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full flex items-center justify-center shrink-0 bg-zinc-50 border border-zinc-100 text-zinc-400">
                          <StatusIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-semibold text-zinc-900 flex items-center gap-2">
                            Sprint #{sprintGroup.sprint_number}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="text-sm text-zinc-500">
                                {sprintGroup.logCount} {sprintGroup.logCount === 1 ? 'log' : 'logs'} submitted
                             </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`h-8 w-8 text-zinc-400 transition-transform duration-200 ${isExpanded ? 'bg-zinc-100' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedSprint(isExpanded ? null : sprintGroup.id);
                          }}
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {isExpanded && (
                  <div className="ml-6 pl-6 pt-4 pb-2 border-l-2 border-zinc-200 space-y-3 relative before:absolute before:left-[-1px] before:top-0 before:h-4 before:w-4 before:border-l-2 before:border-b-2 before:border-zinc-200 before:rounded-bl-xl before:content-['']">
                    {sprintGroup.logs.map((log) => {
                      const logStatus = log.status || 'pending';
                      const logConfig = statusConfig[logStatus] || statusConfig.pending;
                      return (
                        <div 
                          key={log.id}
                          onClick={() => setSelected(log)}
                          className="relative flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 hover:shadow-sm cursor-pointer transition-all group/item"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${logStatus === 'approved' ? 'bg-emerald-500' : logStatus === 'rejected' ? 'bg-red-500' : 'bg-amber-400'}`} />
                            <span className="text-sm font-medium text-zinc-700 group-hover/item:text-zinc-900">
                              Log {sprintGroup.logs.indexOf(log) + 1}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className={`text-[10px] h-5 ${logConfig.className}`}>{logConfig.label}</Badge>
                            
                            {isExpert && ['pending', 'submitted'].includes(logStatus) && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-zinc-300 hover:text-blue-600 p-0.5"
                                  onClick={(e) => handleEditClick(e, log)}
                                  disabled={isEditing}
                                >
                                  <Edit2 className="h-3 w-3" />
                                </Button>
                            )}
                            <ChevronRightIcon className="h-4 w-4 text-zinc-300" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          logs.map((item: any) => {
            const status = item.status || 'pending';
            const config = statusConfig[status] || statusConfig.pending;
            const StatusIcon = config.icon;
            const dateValue = item.work_date || item.log_date || item.created_at;

            return (
              <Card
                key={item.id}
                className="transition-all duration-200 shadow-sm border-zinc-200 cursor-pointer bg-white hover:border-zinc-300 hover:shadow-md hover:-translate-y-0.5"
                onClick={() => setSelected(item)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full flex items-center justify-center shrink-0 bg-zinc-50 border border-zinc-100 text-zinc-400">
                        <StatusIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-zinc-900 tracking-tight">{getPrimaryLabel(item)}</h4>
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium bg-zinc-100 px-2 py-0.5 rounded-md">
                            <Calendar className="h-3 w-3" />
                            {dateValue ? format(new Date(dateValue), 'MMM d, yyyy') : 'No Date'}
                          </div>
                          {mode === 'daily' && item.total_hours && (
                            <div className="flex items-center gap-1.5 text-xs text-zinc-600 font-medium border border-zinc-200 px-2 py-0.5 rounded-md">
                              <Timer className="h-3 w-3" />
                              {item.total_hours} hrs
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isExpert && mode !== 'daily' && ['pending', 'submitted'].includes(status) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 hover:text-blue-600 hover:bg-blue-50"
                          onClick={(e) => handleEditClick(e, item)}
                          disabled={isEditing}
                          title="Edit log"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                      <ChevronRightIcon className="h-5 w-5 text-zinc-300" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) { setSelected(null); setEditMode(false); } }}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden bg-white rounded-xl gap-0 max-h-[85vh] flex flex-col">
          <DialogHeader className="p-6 border-b border-zinc-100 bg-zinc-50/50 space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-zinc-900">{getDialogTitle()}</DialogTitle>
              {selected && (
                <Badge variant="outline" className={`px-3 py-1 text-xs ${statusConfig[selected.status || 'pending'].className}`}>
                  {statusConfig[selected.status || 'pending'].label}
                </Badge>
              )}
            </div>
            {!editMode && (
                <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="font-medium">Date:</span> 
                        {selected ? format(new Date(selected.work_date || selected.created_at || selected.log_date), 'PPP') : ''}
                    </div>
                    {selected?.total_hours > 0 && (
                        <div className="flex items-center gap-1.5">
                            <Timer className="h-3.5 w-3.5" />
                            <span className="font-medium">Duration:</span> 
                            {selected.total_hours} Hours
                        </div>
                    )}
                </div>
            )}
          </DialogHeader>

          {/* CONTENT AREA */}
          <div className="flex-1 overflow-hidden flex flex-col">
              {isExpert && editMode && selected ? (
                // EDIT MODE
                <div className="flex-1 overflow-y-auto bg-zinc-50/30">
                    <div className="p-2">
                        <div className="flex justify-end px-4 pt-2">
                             <Button variant="ghost" size="sm" onClick={() => setEditMode(false)} className="h-8 text-muted-foreground">
                                <X className="h-4 w-4 mr-1" /> Cancel Editing
                             </Button>
                        </div>
                        <WorkLogForm 
                            mode={mode} 
                            initialData={selected} 
                            onSubmit={handleUpdateLog}
                            isLoading={isEditing}
                        />
                    </div>
                </div>
              ) : (
                // VIEW MODE
                <ScrollArea className="flex-1">
                    <div className="p-6 space-y-8">
                    
                    {/* Buyer Comment - High Priority if exists */}
                    {selected?.buyer_comment && (
                        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-2 mb-2">
                                <MessageSquare className="h-3 w-3" /> Buyer Feedback
                            </h4>
                            <div className="text-sm text-zinc-800 leading-relaxed">
                                {selected.buyer_comment}
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    {selected?.description && (
                        <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                            <Edit2 className="h-3 w-3" /> Description
                        </h4>
                        <div className="text-sm text-zinc-700 leading-relaxed bg-zinc-50 p-5 rounded-xl border border-zinc-100 whitespace-pre-wrap">
                            {selected.description}
                        </div>
                        </div>
                    )}

                    {/* Problems Faced */}
                    {selected?.problems_faced && (
                        <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-2">
                            <AlertTriangle className="h-3 w-3" /> Problems / Blockers
                        </h4>
                        <div className="text-sm text-zinc-700 leading-relaxed bg-amber-50/30 p-5 rounded-xl border border-amber-100/50 whitespace-pre-wrap">
                            {selected.problems_faced}
                        </div>
                        </div>
                    )}

                    {/* Value Tags */}
                    {getValueTags(selected?.value_tags).length > 0 && (
                        <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                            <Tag className="h-3 w-3" /> Value Tags
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {getValueTags(selected.value_tags).map((tag: string, i: number) => (
                                <Badge key={i} variant="secondary" className="px-2.5 py-1 bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-100 font-normal">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                        </div>
                    )}

                    {/* Checklist */}
                    {selected?.checklist && selected.checklist.length > 0 && (
                        <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                            <CheckSquare className="h-3 w-3" /> Tasks
                        </h4>
                        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
                            {selected.checklist.map((item: any, i: number) => (
                            <div key={i} className="flex items-start gap-3 p-3.5 border-b last:border-0 border-zinc-100">
                                <div className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center shrink-0 border ${item.status === 'done' ? 'bg-emerald-50 border-emerald-200' : 'bg-zinc-50 border-zinc-200'}`}>
                                {item.status === 'done' ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Clock className="h-3.5 w-3.5 text-zinc-400" />}
                                </div>
                                <span className={`text-sm leading-tight pt-0.5 ${item.status === 'done' ? 'text-zinc-900' : 'text-zinc-500'}`}>{item.task}</span>
                            </div>
                            ))}
                        </div>
                        </div>
                    )}

                    {/* Artifacts / Evidence */}
                    {selected?.evidence?.links && selected.evidence.links.length > 0 && (
                        <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                            <Link2 className="h-3 w-3" /> Artifacts
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                            {selected.evidence.links.map((link: any, i: number) => (
                            <a key={i} href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all bg-white group">
                                <div className="h-9 w-9 rounded-md bg-blue-50 flex items-center justify-center text-blue-500">
                                <ExternalLink className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-zinc-900 truncate group-hover:text-blue-700">{link.label || 'Link'}</p>
                                <p className="text-xs text-zinc-500 truncate font-mono">{link.url}</p>
                                </div>
                            </a>
                            ))}
                        </div>
                        </div>
                    )}
                    </div>
                </ScrollArea>
              )}
          </div>

          {/* FOOTER ACTIONS */}
          {/* Show Edit Trigger if expert, NOT edit mode, NOT daily, and status allows */}
          {isExpert && !editMode && mode !== 'daily' && ['pending', 'submitted'].includes(selected?.status || '') && (
             <div className="p-4 border-t border-zinc-100 bg-zinc-50 shrink-0">
                <Button
                   variant="outline"
                   className="w-full bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-700 shadow-sm"
                   onClick={() => setEditMode(true)}
                   disabled={isEditing}
                >
                   <Pencil className="h-3.5 w-3.5 mr-2" />
                   Edit Work Details
                </Button>
             </div>
          )}

          {isBuyer && !editMode && (selected?.status === 'pending' || selected?.status === 'submitted') && (
            <DialogFooter className="p-4 border-t border-zinc-200 bg-zinc-50 flex-col sm:flex-row gap-3 sm:gap-0 shrink-0">
               <div className="flex gap-3 w-full justify-end">
                <Button variant="outline" className="text-red-700 border-red-200" onClick={() => { const reason = prompt('Reason:'); if (reason) onReject(selected.id, reason); setSelected(null); }} disabled={isRejecting}>Reject</Button>
                <Button className="bg-emerald-600 text-white" onClick={() => { onApprove(selected.id); setSelected(null); }} disabled={isApproving}>
                  <CheckCircle2 className="h-4 w-4 mr-2" /> {getApprovalButtonText()}
                </Button>
              </div>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}