import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Calendar, DollarSign, User, Clock, CheckCircle, XCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface ProjectDetailsDialogProps {
  project: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isActing: boolean;
}

export function ProjectDetailsDialog({
  project,
  open,
  onOpenChange,
  onApprove,
  onReject,
  isActing
}: ProjectDetailsDialogProps) {
  if (!project) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold leading-tight">
                {project.title}
              </DialogTitle>
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {project.buyer_name}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Posted {formatDistanceToNow(new Date(project.created_at))} ago
                </span>
              </div>
            </div>
            <Badge variant={
              project.status === 'active' ? 'default' : 
              project.status === 'pending' ? 'secondary' : 
              project.status === 'completed' ? 'outline' : 'destructive'
            }>
              {project.status.toUpperCase()}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-100 space-y-1">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Budget Range</span>
                <div className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                  {project.budget_min?.toLocaleString()} - {project.budget_max?.toLocaleString()}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-100 space-y-1">
                <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Deadline</span>
                <div className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-zinc-900">Description</h4>
              <p className="text-zinc-600 leading-relaxed whitespace-pre-wrap">
                {project.description}
              </p>
            </div>

            {project.skills && project.skills.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-zinc-900">Required Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary" className="bg-zinc-100 text-zinc-700 hover:bg-zinc-200">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {project.attachments && project.attachments.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-zinc-900">Attachments</h4>
                <div className="grid grid-cols-2 gap-2">
                  {project.attachments.map((file: any, index: number) => (
                    <a 
                      key={index} 
                      href={file.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded border border-zinc-200 hover:bg-zinc-50 transition-colors text-sm text-zinc-600"
                    >
                      <span className="truncate">{file.name || `Attachment ${index + 1}`}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator />
        
        <DialogFooter className="p-6 bg-zinc-50/50">
          <div className="flex w-full justify-between items-center gap-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            {project.status === 'pending' && (
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    onReject(project.id);
                    onOpenChange(false);
                  }}
                  disabled={isActing}
                  className="gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </Button>
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700 gap-2"
                  onClick={() => {
                    onApprove(project.id);
                    onOpenChange(false);
                  }}
                  disabled={isActing}
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve Project
                </Button>
              </div>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}