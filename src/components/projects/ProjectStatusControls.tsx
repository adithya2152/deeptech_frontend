import { useState } from 'react';
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
import { useUpdateProjectStatus, useDeleteProject } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';
import {
  PlayCircle,
  CheckCircle,
  Trash2,
  Edit,
  Loader2,
  Save,
} from 'lucide-react';

interface ProjectStatusControlsProps {
  projectId: string;
  currentStatus: ProjectStatus;
  isOwner: boolean;
  isLockedByContract?: boolean;
}

export function ProjectStatusControls({
  projectId,
  currentStatus,
  isOwner,
  isLockedByContract,
}: ProjectStatusControlsProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const updateStatus = useUpdateProjectStatus();
  const deleteProject = useDeleteProject();

  const [isEditing, setIsEditing] = useState(false);
  const [editedStatus, setEditedStatus] = useState<ProjectStatus | null>(null);

  // Dialog States
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  if (!isOwner) return null;

  if (isLockedByContract) {
    return (
      <span className="text-xs text-muted-foreground">
        Status changes disabled while a contract is pending or active.
      </span>
    );
  }

  const handleStatusChange = async () => {
    if (!editedStatus || editedStatus === currentStatus) {
      setIsEditing(false);
      return;
    }

    // prevent manual transitions into 'active'
    if (editedStatus === 'active') {
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
    } catch (e) {
      toast({
        title: 'Error',
        description: 'Failed to update status.',
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
      throw e; // so dialog knows it failed
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
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
              <SelectItem value="active" disabled>
                Active (auto)
              </SelectItem>
            </SelectContent>
          </Select>

          <Button
            size="sm"
            onClick={handleStatusChange}
            disabled={updateStatus.isPending}
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

          {/* Contextual Buttons */}
          {currentStatus === 'draft' && (
            <>
              <Button
                size="sm"
                onClick={() => setShowActivateDialog(true)}
              >
                <PlayCircle className="h-3.5 w-3.5 mr-2" /> Activate
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

          {currentStatus === 'active' && (
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
        title="Activate Project?"
        desc="Experts will be able to see and bid on this project."
        action={async () => {
          try {
            await updateStatus.mutateAsync({
              id: projectId,
              status: 'open',
            });
            toast({
              title: 'Status Updated',
              description: 'Project is now open for bids.',
            });
          } catch (e) {
            toast({
              title: 'Error',
              description: 'Failed to open project for bids.',
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
        desc="This will close the project to new bids."
        action={async () => {
          try {
            await updateStatus.mutateAsync({
              id: projectId,
              status: 'completed',
            });
            toast({
              title: 'Status Updated',
              description: 'Project is now completed.',
            });
          } catch (e) {
            toast({
              title: 'Error',
              description: 'Failed to complete project.',
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
        desc="This cannot be undone."
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
            className={destructive ? 'bg-destructive' : ''}
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
