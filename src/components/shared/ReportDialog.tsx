import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useSubmitReport } from '@/hooks/useReports';

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportedId: string;
  reportedName: string;
  type?: 'user' | 'project';
}

export function ReportDialog({ 
  open, 
  onOpenChange, 
  reportedId, 
  reportedName,
  type = 'user'
}: ReportDialogProps) {
  const submitReport = useSubmitReport();
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    if (!reason || !description) return;

    await submitReport.mutateAsync({
      reportedId,
      type: reason,
      description: `[Reported ${type === 'user' ? 'User' : 'Project'}: ${reportedName}] ${description}`,
    });
    
    setReason('');
    setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Report {type === 'user' ? 'User' : 'Project'}
          </DialogTitle>
          <DialogDescription>
            Report <strong>{reportedName}</strong> for violating community guidelines.
            This report will be reviewed by our safety team.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Reason for reporting</Label>
            <Select onValueChange={setReason} value={reason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="scam">Scam / Fraudulent Activity</SelectItem>
                <SelectItem value="harassment">Harassment / Abusive Behavior</SelectItem>
                <SelectItem value="spam">Spam / Advertising</SelectItem>
                <SelectItem value="inappropriate">Inappropriate Content</SelectItem>
                <SelectItem value="other">Other Violation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea 
              placeholder="Please provide specific details about the violation..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="h-32 resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            variant="destructive" 
            onClick={handleSubmit} 
            disabled={!reason || !description || submitReport.isPending}
          >
            {submitReport.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}