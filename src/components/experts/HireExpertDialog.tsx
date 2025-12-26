import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { contractsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/hooks/useProjects'; 
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, DollarSign, Clock, Briefcase, RefreshCcw, Calendar } from 'lucide-react';

interface HireExpertDialogProps {
  expert: {
    id: string;
    name: string;
    hourly_rate_advisory: number;
  };
  trigger?: React.ReactNode; 
  defaultProjectId?: string;
}

export function HireExpertDialog({ expert, trigger, defaultProjectId }: HireExpertDialogProps) {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  
  const { data: projects } = useProjects('active'); 

  const [projectId, setProjectId] = useState<string>(defaultProjectId || '');
  
  const [model, setModel] = useState('daily');
  const [rate, setRate] = useState(expert.hourly_rate_advisory || 150); 
  const [duration, setDuration] = useState('30'); 
  const [sprintCount, setSprintCount] = useState('4');

  useEffect(() => {
    if (defaultProjectId) {
      setProjectId(defaultProjectId);
    }
  }, [defaultProjectId]);

  const createContractMutation = useMutation({
    mutationFn: (data: any) => contractsApi.create(data, token!),
    onSuccess: (response) => {
      setOpen(false);
      toast({ 
        title: 'Contract Created', 
        description: `You have successfully hired ${expert.name}.` 
      });
      
      navigate(`/contracts/${response.data.id}`); 
    },
    onError: (err: any) => {
      toast({ 
        title: 'Error', 
        description: err.message || 'Failed to create contract', 
        variant: 'destructive' 
      });
    }
  });

  const getTotalEstimate = () => {
    const r = Number(rate) || 0;
    if (model === 'daily') return r * Number(duration);
    if (model === 'sprint') return r * Number(sprintCount);
    return r; 
  };

  const handleHire = () => {
    if (!user || !projectId) {
      toast({ title: 'Project Required', description: 'Please select a project.', variant: 'destructive' });
      return;
    }

    let payment_terms: any = {};
    const rateNum = Number(rate);

    if (model === 'daily') {
      payment_terms = { daily_rate: rateNum };
    } else if (model === 'sprint') {
      payment_terms = {
        sprint_rate: rateNum,
        sprint_duration_days: 14,
        total_sprints: parseInt(sprintCount)
      };
    } else {
      payment_terms = { total_amount: rateNum };
    }

    const contractData = {
      expert_id: expert.id,
      project_id: projectId,
      engagement_model: model, 
      payment_terms,
      start_date: new Date().toISOString(),
    };

    createContractMutation.mutate(contractData);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Hire Now</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Hire {expert.name}</DialogTitle>
          <DialogDescription>
            Define the engagement model and terms.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-5 py-4">
          <div className="space-y-2">
            <Label>Project Context</Label>
            <Select value={projectId} onValueChange={setProjectId} disabled={!!defaultProjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a project..." />
              </SelectTrigger>
              <SelectContent>
                {projects?.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                ))}
                {(!projects || projects.length === 0) && (
                  <SelectItem value="none" disabled>No active projects found</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
             <Label>Engagement Model</Label>
             <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Rate (Time & Materials)</SelectItem>
                  <SelectItem value="sprint">Sprint-Based (Retainer)</SelectItem>
                  <SelectItem value="fixed">Fixed Price (Milestones)</SelectItem>
                </SelectContent>
             </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                {model === 'daily' ? 'Daily Rate' : 
                 model === 'sprint' ? 'Price per Sprint' : 
                 'Total Project Price'}
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-9" 
                  type="number"
                  value={rate} 
                  onChange={(e) => setRate(Number(e.target.value))} 
                />
              </div>
            </div>

            {model === 'sprint' ? (
              <div className="space-y-2">
                <Label>Est. Sprints</Label>
                <div className="relative">
                  <RefreshCcw className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    className="pl-9" 
                    type="number"
                    value={sprintCount} 
                    onChange={(e) => setSprintCount(e.target.value)} 
                  />
                </div>
              </div>
            ) : (
               <div className="space-y-2">
                <Label>Est. Duration (Days)</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    className="pl-9" 
                    type="number"
                    value={duration} 
                    onChange={(e) => setDuration(e.target.value)} 
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className="rounded-md bg-muted/50 p-4 border flex justify-between items-center">
             <div className="text-sm">
                <p className="text-muted-foreground">Estimated Total Value</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                   {model === 'daily' ? `${duration} days @ $${rate}/day` :
                    model === 'sprint' ? `${sprintCount} sprints @ $${rate}/sprint` :
                    'Fixed price project'}
                </p>
             </div>
             <p className="text-xl font-bold text-primary">${getTotalEstimate().toLocaleString()}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleHire} disabled={createContractMutation.isPending || !projectId}>
            {createContractMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Contract Offer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}