import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectStatus } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useUpdateProjectStatus, useDeleteProject } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';
import {
  PlayCircle,
  CheckCircle,
  Trash2,
  Edit,
  Loader2,
  Save,
  XCircle,
  Info,
} from 'lucide-react';

interface ProjectStatusControlsProps {
  projectId: string;
  currentStatus: ProjectStatus;
  isOwner: boolean;
  isLockedByContract?: boolean;
  proposalCount?: number;
  hasActiveContract?: boolean;
}

/**
 * Production-level status transition rules for freelancing platform
 * 
 * Status Flow:
 * - draft → open (publish)
 * - draft → archived (only if no proposals)
 * - open → draft (ONLY if no proposals)
 * - open → closed (close to new proposals)
 * - closed → open (reopen)
 * - closed → archived
 * - active → completed (only when all contracts done - typically auto)
 * - active → paused (pause work)
 * - paused → active (resume)
 * - completed → (final state)
 * - archived → (final state)
 */
function getAllowedTransitions(
  currentStatus: ProjectStatus,
  proposalCount: number = 0,
  hasActiveContract: boolean = false
): { status: ProjectStatus; label: string; disabled?: boolean; reason?: string }[] {
  const transitions: Record<ProjectStatus, { status: ProjectStatus; label: string; disabled?: boolean; reason?: string }[]> = {
    draft: [
      { status: 'open', label: 'Open for Bids' },
      { status: 'archived', label: 'Archive' },
    ],
    open: [
      {
        status: 'draft',
        label: 'Revert to Draft',
        disabled: proposalCount > 0,
        reason: proposalCount > 0 ? `Cannot revert: ${proposalCount} proposal(s) submitted` : undefined
      },
      { status: 'closed', label: 'Close to Bids' },
      {
        status: 'archived',
        label: 'Archive',
        disabled: proposalCount > 0,
        reason: proposalCount > 0 ? 'Close project first before archiving' : undefined
      },
    ],
    closed: [
      { status: 'open', label: 'Reopen for Bids' },
      { status: 'archived', label: 'Archive' },
    ],
    active: [
      {
        status: 'completed',
        label: 'Mark Complete',
        disabled: hasActiveContract,
        reason: hasActiveContract ? 'Finish all contracts first' : undefined
      },
      { status: 'paused', label: 'Pause Project' },
    ],
    paused: [
      { status: 'active', label: 'Resume Project' },
      { status: 'closed', label: 'Close Project' },
    ],
    completed: [], // Final state - no transitions
    archived: [], // Final state - no transitions
  };

  return transitions[currentStatus] || [];
}

export function ProjectStatusControls({
  projectId,
  currentStatus,
  isOwner,
  isLockedByContract,
  proposalCount = 0,
  hasActiveContract = false,
}: ProjectStatusControlsProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const updateStatus = useUpdateProjectStatus();
  const deleteProject = useDeleteProject();

  const [isEditing, setIsEditing] = useState(false);
  const [editedStatus, setEditedStatus] = useState<ProjectStatus | null>(null);

  // Dialog States
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Get allowed transitions based on current state
  const allowedTransitions = useMemo(() =>
    getAllowedTransitions(currentStatus, proposalCount, hasActiveContract),
    [currentStatus, proposalCount, hasActiveContract]
  );

  if (!isOwner) return null;

  if (isLockedByContract) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Info className="h-3.5 w-3.5" />
        <span>Status changes disabled while contract is active.</span>
      </div>
    );
  }

  // Final states - no changes allowed
  if (currentStatus === 'completed' || currentStatus === 'archived') {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <CheckCircle className="h-3.5 w-3.5 text-green-500" />
        <span>Project is {currentStatus}.</span>
      </div>
    );
  }

  const handleStatusChange = async () => {
    if (!editedStatus || editedStatus === currentStatus) {
      setIsEditing(false);
      return;
    }

    // Check if this transition is allowed
    const transition = allowedTransitions.find(t => t.status === editedStatus);
    if (transition?.disabled) {
      toast({
        title: 'Status Change Blocked',
        description: transition.reason || 'This transition is not allowed.',
        variant: 'destructive',
      });
      setIsEditing(false);
      return;
    }

    try {
      await updateStatus.mutateAsync({ id: projectId, status: editedStatus });
      toast({
        title: 'Status Updated',
        description: `Project is now ${editedStatus}.`,
      });
      setIsEditing(false);
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e.message || 'Failed to update status.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProject.mutateAsync(projectId);
      toast({
        title: 'Project Deleted',
        description: 'Permanently removed.',
      });
      navigate('/projects');
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Could not delete project.',
        variant: 'destructive',
      });
      throw e;
    }
  };

  return (
    <div className="flex gap-2">
      {isEditing ? (
        <div className="flex gap-2 items-center">
          <Select
            value={editedStatus || currentStatus}
            onValueChange={(v) => setEditedStatus(v as ProjectStatus)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {/* Current status (disabled) */}
              <SelectItem value={currentStatus} disabled>
                {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)} (current)
              </SelectItem>

              {/* Allowed transitions */}
              {allowedTransitions.map((transition) => (
                <TooltipProvider key={transition.status}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <SelectItem
                          value={transition.status}
                          disabled={transition.disabled}
                          className={transition.disabled ? 'opacity-50' : ''}
                        >
                          {transition.label}
                          {transition.disabled && ' ⚠️'}
                        </SelectItem>
                      </div>
                    </TooltipTrigger>
                    {transition.reason && (
                      <TooltipContent>
                        <p>{transition.reason}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              ))}
            </SelectContent>
          </Select>

          <Button
            size="sm"
            onClick={handleStatusChange}
            disabled={updateStatus.isPending || editedStatus === currentStatus}
          >
            {updateStatus.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <>
          {allowedTransitions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditing(true);
                setEditedStatus(currentStatus);
              }}
            >
              <Edit className="h-3.5 w-3.5 mr-2" /> Change Status
            </Button>
          )}

          {/* Contextual Quick Actions */}
          {currentStatus === 'draft' && (
            <>
              <Button
                size="sm"
                onClick={() => setShowActivateDialog(true)}
              >
                <PlayCircle className="h-3.5 w-3.5 mr-2" /> Publish
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}

          {currentStatus === 'open' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCloseDialog(true)}
            >
              <XCircle className="h-3.5 w-3.5 mr-2" /> Close to Bids
            </Button>
          )}

          {currentStatus === 'active' && !hasActiveContract && (
            <Button
              size="sm"
              onClick={() => setShowCompleteDialog(true)}
            >
              <CheckCircle className="h-3.5 w-3.5 mr-2" /> Mark Complete
            </Button>
          )}
        </>
      )}

      {/* Dialogs */}
      <ConfirmDialog
        open={showActivateDialog}
        onOpenChange={setShowActivateDialog}
        title="Publish Project?"
        desc="Your project will be visible on the marketplace and experts can submit proposals."
        action={async () => {
          try {
            await updateStatus.mutateAsync({
              id: projectId,
              status: 'open',
            });
            toast({
              title: 'Project Published',
              description: 'Now accepting proposals from experts.',
            });
          } catch (e: any) {
            toast({
              title: 'Error',
              description: e.message || 'Failed to publish project.',
              variant: 'destructive',
            });
            throw e;
          }
        }}
      />
      <ConfirmDialog
        open={showCloseDialog}
        onOpenChange={setShowCloseDialog}
        title="Close to New Bids?"
        desc="No new proposals can be submitted. You can reopen later."
        action={async () => {
          try {
            await updateStatus.mutateAsync({
              id: projectId,
              status: 'closed',
            });
            toast({
              title: 'Project Closed',
              description: 'No longer accepting new proposals.',
            });
          } catch (e: any) {
            toast({
              title: 'Error',
              description: e.message || 'Failed to close project.',
              variant: 'destructive',
            });
            throw e;
          }
        }}
      />
      <ConfirmDialog
        open={showCompleteDialog}
        onOpenChange={setShowCompleteDialog}
        title="Complete Project?"
        desc="This marks the project as finished. All contracts should be completed first."
        action={async () => {
          try {
            await updateStatus.mutateAsync({
              id: projectId,
              status: 'completed',
            });
            toast({
              title: 'Project Completed',
              description: 'Project has been marked as complete.',
            });
          } catch (e: any) {
            toast({
              title: 'Error',
              description: e.message || 'Failed to complete project.',
              variant: 'destructive',
            });
            throw e;
          }
        }}
      />
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Project?"
        desc="This cannot be undone. The project will be permanently removed."
        destructive
        action={handleDelete}
      />
    </div>
  );
}

// Helper Sub-component for Dialogs
function ConfirmDialog({
  open,
  onOpenChange,
  title,
  desc,
  action,
  destructive,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  desc: string;
  action: () => Promise<any>;
  destructive?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await action();
      onOpenChange(false);
    } catch {
      // error already handled by caller; keep dialog open
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{desc}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className={destructive ? 'bg-destructive hover:bg-destructive/90' : ''}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Confirm'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
