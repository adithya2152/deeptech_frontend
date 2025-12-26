import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Project } from '../../types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, DollarSign, Calendar, RefreshCcw } from 'lucide-react';

interface BidDialogProps {
  project: Project;
}

interface BidFormData {
  engagement_model: string;
  rate: string;
  duration_days: string;
  sprint_count: string;
  message: string;
}

export function BidDialog({ project }: BidDialogProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  
  const [formData, setFormData] = useState<BidFormData>({
    engagement_model: 'fixed',
    rate: '',
    duration_days: '',
    sprint_count: '',
    message: '',
  });

  const calculateTotalValue = () => {
    const r = Number(formData.rate) || 0;
    if (formData.engagement_model === 'daily') {
      return r * (Number(formData.duration_days) || 0);
    }
    if (formData.engagement_model === 'sprint') {
      return r * (Number(formData.sprint_count) || 0);
    }
    return r;
  };

  const submitMutation = useMutation({
    mutationFn: (data: BidFormData) => {
      const payload = {
        project_id: project.id,
        engagement_model: data.engagement_model,
        rate: Number(data.rate),
        duration_days: Number(data.duration_days) || 1,
        sprint_count: data.engagement_model === 'sprint' ? Number(data.sprint_count) : undefined,
        quote_amount: calculateTotalValue(),
        message: data.message,
      };

      return projectsApi.submitProposal(project.id, payload, token!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
      queryClient.invalidateQueries({ queryKey: ['marketplace-projects'] });
      toast({
        title: 'Proposal Submitted',
        description: 'The buyer has been notified of your interest.',
      });
      setOpen(false);
      setFormData({ 
        engagement_model: 'fixed', 
        rate: '', 
        duration_days: '', 
        sprint_count: '', 
        message: '' 
      });
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Could not submit proposal.';
      const isDuplicate = errorMessage.includes('already exists') || errorMessage.includes('duplicate');
      
      toast({
        title: isDuplicate ? 'Already Submitted' : 'Submission Failed',
        description: isDuplicate 
          ? 'You have already submitted a proposal for this project.' 
          : errorMessage,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full h-12 text-lg font-bold rounded-xl shadow-lg shadow-primary/20">
          Submit Proposal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-3xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl">Submit Technical Proposal</DialogTitle>
            <DialogDescription>
              Propose your engagement terms for: <br />
              <span className="font-semibold text-foreground">{project.title}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-6">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-widest font-bold">Engagement Model</Label>
              <Select 
                value={formData.engagement_model} 
                onValueChange={(val) => setFormData({ ...formData, engagement_model: val })}
              >
                <SelectTrigger className="h-11 bg-muted/30">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Rate</SelectItem>
                  <SelectItem value="sprint">Sprint-Based</SelectItem>
                  <SelectItem value="fixed">Fixed Price</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rate" className="text-xs uppercase tracking-widest font-bold">
                  {formData.engagement_model === 'fixed' ? 'Total Amount ($)' : 'Rate ($)'}
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="rate"
                    type="number"
                    placeholder="0"
                    className="pl-9 h-11 bg-muted/30"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                    required
                  />
                </div>
              </div>

              {formData.engagement_model === 'sprint' ? (
                <div className="space-y-2">
                  <Label htmlFor="sprints" className="text-xs uppercase tracking-widest font-bold">
                    Est. Sprints
                  </Label>
                  <div className="relative">
                    <RefreshCcw className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="sprints"
                      type="number"
                      placeholder="4"
                      className="pl-9 h-11 bg-muted/30"
                      value={formData.sprint_count}
                      onChange={(e) => setFormData({ ...formData, sprint_count: e.target.value })}
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-xs uppercase tracking-widest font-bold">
                    Duration (Days)
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="duration"
                      type="number"
                      placeholder="30"
                      className="pl-9 h-11 bg-muted/30"
                      value={formData.duration_days}
                      onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-primary/5 p-3 rounded-lg flex justify-between items-center border border-primary/10">
              <span className="text-sm text-muted-foreground">Estimated Contract Value</span>
              <span className="text-lg font-bold text-primary">${calculateTotalValue().toLocaleString()}</span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="text-xs uppercase tracking-widest font-bold">
                Technical Pitch
              </Label>
              <Textarea
                id="message"
                placeholder="Briefly explain your approach and expertise..."
                className="min-h-[120px] bg-muted/30 resize-none"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              className="w-full h-12 font-bold text-md"
              disabled={submitMutation.isPending}
            >
              {submitMutation.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Proposal
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}