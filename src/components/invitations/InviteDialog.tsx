import { useState } from 'react';
import { useSendInvitation } from '@/hooks/useInvitations';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, DollarSign, Calendar, RefreshCcw } from 'lucide-react';

interface InviteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string;
    projectTitle: string;
    expertId: string;
    expertName: string;
}

interface InviteFormData {
    engagement_model: 'daily' | 'sprint' | 'fixed';
    message: string;
    // Daily fields
    daily_rate: string;
    total_days: string;
    // Sprint fields
    sprint_rate: string;
    total_sprints: string;
    sprint_duration_days: string;
    // Fixed fields
    total_amount: string;
}

export function InviteDialog({
    open,
    onOpenChange,
    projectId,
    projectTitle,
    expertId,
    expertName
}: InviteDialogProps) {
    const { toast } = useToast();
    const sendInvitationMutation = useSendInvitation();

    const [formData, setFormData] = useState<InviteFormData>({
        engagement_model: 'daily',
        message: '',
        daily_rate: '',
        total_days: '',
        sprint_rate: '',
        total_sprints: '',
        sprint_duration_days: '14',
        total_amount: '',
    });

    const calculateTotalValue = () => {
        if (formData.engagement_model === 'daily') {
            return (Number(formData.daily_rate) || 0) * (Number(formData.total_days) || 0);
        }
        if (formData.engagement_model === 'sprint') {
            return (Number(formData.sprint_rate) || 0) * (Number(formData.total_sprints) || 0);
        }
        return Number(formData.total_amount) || 0;
    };

    const buildPaymentTerms = () => {
        const base = { currency: 'USD' };

        if (formData.engagement_model === 'daily') {
            return {
                ...base,
                daily_rate: Number(formData.daily_rate) || 0,
                total_days: Number(formData.total_days) || 0,
            };
        }

        if (formData.engagement_model === 'sprint') {
            return {
                ...base,
                sprint_rate: Number(formData.sprint_rate) || 0,
                total_sprints: Number(formData.total_sprints) || 0,
                sprint_duration_days: Number(formData.sprint_duration_days) || 14,
                current_sprint_number: 1,
            };
        }

        // Fixed
        return {
            ...base,
            total_amount: Number(formData.total_amount) || 0,
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await sendInvitationMutation.mutateAsync({
                projectId,
                expertId,
                message: formData.message || `Project invitation for ${expertName}`,
                engagement_model: formData.engagement_model,
                payment_terms: buildPaymentTerms(),
            });

            toast({
                title: 'Invitation Sent',
                description: 'Your project invitation has been sent to the expert.',
            });

            onOpenChange(false);
            // Reset form
            setFormData({
                engagement_model: 'daily',
                message: '',
                daily_rate: '',
                total_days: '',
                sprint_rate: '',
                total_sprints: '',
                sprint_duration_days: '14',
                total_amount: '',
            });
        } catch (error: any) {
            const isDuplicate = error.message?.includes('Invitation already pending');
            toast({
                title: isDuplicate ? 'Invitation Already Sent' : 'Error',
                description: isDuplicate
                    ? 'You have a pending invitation for this project.'
                    : (error.message || 'Failed to send invitation.'),
                variant: isDuplicate ? 'default' : 'destructive',
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] rounded-3xl">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle className="text-2xl">Invite to Project</DialogTitle>
                        <DialogDescription>
                            Set engagement terms for inviting <span className="font-semibold text-foreground">{expertName}</span> to: <br />
                            <span className="font-semibold text-foreground">{projectTitle}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-6">
                        <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest font-bold">Engagement Model</Label>
                            <Select
                                value={formData.engagement_model}
                                onValueChange={(val: 'daily' | 'sprint' | 'fixed') =>
                                    setFormData({ ...formData, engagement_model: val })
                                }
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

                        {/* Daily Model Fields */}
                        {formData.engagement_model === 'daily' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-widest font-bold">Daily Rate ($)</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="number"
                                            placeholder="150"
                                            className="pl-9 h-11 bg-muted/30"
                                            value={formData.daily_rate}
                                            onChange={(e) => setFormData({ ...formData, daily_rate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-widest font-bold">Total Days</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="number"
                                            placeholder="20"
                                            className="pl-9 h-11 bg-muted/30"
                                            value={formData.total_days}
                                            onChange={(e) => setFormData({ ...formData, total_days: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Sprint Model Fields */}
                        {formData.engagement_model === 'sprint' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-widest font-bold">Sprint Rate ($)</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="number"
                                            placeholder="1000"
                                            className="pl-9 h-11 bg-muted/30"
                                            value={formData.sprint_rate}
                                            onChange={(e) => setFormData({ ...formData, sprint_rate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-widest font-bold">Total Sprints</Label>
                                    <div className="relative">
                                        <RefreshCcw className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="number"
                                            placeholder="5"
                                            className="pl-9 h-11 bg-muted/30"
                                            value={formData.total_sprints}
                                            onChange={(e) => setFormData({ ...formData, total_sprints: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label className="text-xs uppercase tracking-widest font-bold">Sprint Duration (Days)</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="number"
                                            placeholder="14"
                                            className="pl-9 h-11 bg-muted/30"
                                            value={formData.sprint_duration_days}
                                            onChange={(e) => setFormData({ ...formData, sprint_duration_days: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Fixed Model Fields */}
                        {formData.engagement_model === 'fixed' && (
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-widest font-bold">Total Amount ($)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        placeholder="5000"
                                        className="pl-9 h-11 bg-muted/30"
                                        value={formData.total_amount}
                                        onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="bg-primary/5 p-3 rounded-lg flex justify-between items-center border border-primary/10">
                            <span className="text-sm text-muted-foreground">Estimated Contract Value</span>
                            <span className="text-lg font-bold text-primary">${calculateTotalValue().toLocaleString()}</span>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest font-bold">
                                Message to Expert (Optional)
                            </Label>
                            <Textarea
                                placeholder="Add a personal message to the expert..."
                                className="min-h-[100px] bg-muted/30 resize-none"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="font-bold"
                            disabled={sendInvitationMutation.isPending}
                        >
                            {sendInvitationMutation.isPending ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Send Invitation
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
