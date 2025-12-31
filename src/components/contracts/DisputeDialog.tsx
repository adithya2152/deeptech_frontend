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
import { AlertTriangle, Loader2, Gavel } from "lucide-react";
import { useRaiseDispute } from '@/hooks/useDisputes';

interface DisputeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
}

export function DisputeDialog({ 
  open, 
  onOpenChange, 
  contractId 
}: DisputeDialogProps) {
  const raiseDispute = useRaiseDispute();
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState('');

  const handleSubmit = async () => {
    if (!reason || !description) return;

    await raiseDispute.mutateAsync({
      contractId,
      reason,
      description,
    });
    
    setReason('');
    setDescription('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Gavel className="h-5 w-5" />
            Raise Formal Dispute
          </DialogTitle>
          <DialogDescription>
            This action will <strong>pause the contract</strong> and freeze escrow funds. 
            An admin will review evidence from both parties to reach a binding resolution.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex gap-3 text-amber-800 text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p>Only raise a dispute if you cannot resolve the issue directly with the other party. Frivolous disputes may lead to account penalties.</p>
          </div>

          <div className="space-y-2">
            <Label>Reason for Dispute</Label>
            <Select onValueChange={setReason} value={reason}>
              <SelectTrigger>
                <SelectValue placeholder="Select primary reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Incomplete Work">Incomplete Work / Non-Delivery</SelectItem>
                <SelectItem value="Low Quality">Low Quality / Does not meet Spec</SelectItem>
                <SelectItem value="Unresponsive">Unresponsive / Ghosting</SelectItem>
                <SelectItem value="Payment Issue">Payment / Release Issue</SelectItem>
                <SelectItem value="Scope Creep">Scope Creep / Out of Contract</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Detailed Description</Label>
            <Textarea 
              placeholder="Describe the issue in detail. Include dates, specific deliverables missing, or communication breakdowns..." 
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
            disabled={!reason || !description || raiseDispute.isPending}
          >
            {raiseDispute.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Submit Dispute
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}