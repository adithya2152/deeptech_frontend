import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUpdateWorkLog } from '@/hooks/useContracts';
import { DailyLogForm, SprintSubmitForm, MilestoneRequestForm } from '@/components/contracts/WorkSubmissionForms';
import { WorkLog } from '@/types';

interface EditWorkLogModalProps {
  log: WorkLog;
  contractId: string;
  trigger: React.ReactNode;
}

export function EditWorkLogModal({ log, contractId, trigger }: EditWorkLogModalProps) {
  const [open, setOpen] = useState(false);
  const [existingData, setExistingData] = useState<any>(null);
  const updateWorkLog = useUpdateWorkLog();

  // Fetch existing log data when modal opens
  useEffect(() => {
    if (open) {
      setExistingData({
        description: log.description || '',
        problems_faced: log.problems_faced || '',
        checklist: log.checklist || [],
        evidence: log.evidence || { links: [] },
      });
    }
  }, [open, log]);

  const getFormComponent = () => {
    switch (log.type) {
      case 'daily_log':
        return DailyLogForm;
      case 'sprint_submission':
        return SprintSubmitForm;
      case 'milestone_request':
        return MilestoneRequestForm;
      default:
        return DailyLogForm;
    }
  };

  const FormComponent = getFormComponent();

  const handleSubmit = async (data: any) => {
    try {
      await updateWorkLog.mutateAsync({
        contractId,
        logId: log.id,
        data,
      });
      setOpen(false);
    } catch (error) {
      console.error('Failed to update work log:', error);
    }
  };

  const formProps = {
    onSubmit: handleSubmit,
    isLoading: updateWorkLog.isPending,
    contract: log.type === 'sprint_submission' ? { 
      payment_terms: { current_sprint_number: log.sprint_number } 
    } : undefined,
    // Pass existing data for pre-population
    initialData: existingData,
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle>Edit {log.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</DialogTitle>
        </DialogHeader>
        <div className="p-6">
          <FormComponent {...formProps} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
