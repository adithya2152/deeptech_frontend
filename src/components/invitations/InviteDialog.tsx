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
import { useProject } from '@/hooks/useProjects';
import { DEFAULT_CURRENCY, currencySymbol } from '@/lib/currency';
import { useCurrency } from '@/hooks/useCurrency';
import { CurrencyInput } from '@/components/shared/CurrencyInput';
import { Loader2, Send, Calendar, RefreshCcw, Clock } from 'lucide-react';

interface InviteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectId: string;
    projectTitle: string;
    expertId: string;
    expertName: string;
}

interface InviteFormData {
    engagement_model: 'daily' | 'sprint' | 'fixed' | 'hourly';
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
    // Hourly fields
    hourly_rate: string;
    estimated_hours: string;
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

    const { data: project } = useProject(projectId);
    const projectCurrency = project?.currency || DEFAULT_CURRENCY;
    const { displayCurrency, convertAndFormat } = useCurrency();
    const currencySym = currencySymbol(displayCurrency);

    const [formData, setFormData] = useState<InviteFormData>({
        engagement_model: 'daily',
        message: '',
        daily_rate: '',
        total_days: '',
        sprint_rate: '',
        total_sprints: '',
        sprint_duration_days: '14',
        total_amount: '',
        hourly_rate: '',
        estimated_hours: '',
    });

    const calculateTotalValue = () => {
        if (formData.engagement_model === 'daily') {
            return (Number(formData.daily_rate) || 0) * (Number(formData.total_days) || 0);
        }
        if (formData.engagement_model === 'sprint') {
            return (Number(formData.sprint_rate) || 0) * (Number(formData.total_sprints) || 0);
        }
        if (formData.engagement_model === 'hourly') {
            return (Number(formData.hourly_rate) || 0) * (Number(formData.estimated_hours) || 0);
        }
        return Number(formData.total_amount) || 0;
    };

    const validateTerms = (): { ok: boolean; message?: string } => {
        const num = (v: string) => Number(v);
        const isNonNegative = (n: number) => Number.isFinite(n) && n >= 0;
        const isPositive = (n: number) => Number.isFinite(n) && n > 0;

        if (formData.engagement_model === 'hourly') {
            const rate = num(formData.hourly_rate);
            const hours = num(formData.estimated_hours);
            if (!isNonNegative(rate) || !isNonNegative(hours)) return { ok: false, message: 'Hourly terms cannot be negative.' };
            if (!isPositive(rate) || !isPositive(hours)) return { ok: false, message: 'Hourly rate and estimated hours must be greater than 0.' };
            return { ok: true };
        }

        if (formData.engagement_model === 'daily') {
            const rate = num(formData.daily_rate);
            const days = num(formData.total_days);
            if (!isNonNegative(rate) || !isNonNegative(days)) return { ok: false, message: 'Daily terms cannot be negative.' };
            if (!isPositive(rate) || !isPositive(days)) return { ok: false, message: 'Daily rate and total days must be greater than 0.' };
            return { ok: true };
        }

        if (formData.engagement_model === 'sprint') {
            const rate = num(formData.sprint_rate);
            const sprints = num(formData.total_sprints);
            const duration = num(formData.sprint_duration_days);
            if (!isNonNegative(rate) || !isNonNegative(sprints) || !isNonNegative(duration)) return { ok: false, message: 'Sprint terms cannot be negative.' };
            if (!isPositive(rate) || !isPositive(sprints) || !isPositive(duration)) return { ok: false, message: 'Sprint rate, total sprints, and duration must be greater than 0.' };
            return { ok: true };
        }

        // fixed
        const total = num(formData.total_amount);
        if (!isNonNegative(total)) return { ok: false, message: 'Fixed amount cannot be negative.' };
        if (!isPositive(total)) return { ok: false, message: 'Fixed amount must be greater than 0.' };
        return { ok: true };
    };

    const buildPaymentTerms = () => {
        const base = { currency: projectCurrency };

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

        if (formData.engagement_model === 'hourly') {
            return {
                ...base,
                hourly_rate: Number(formData.hourly_rate) || 0,
                estimated_hours: Number(formData.estimated_hours) || 0,
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

        const v = validateTerms();
        if (!v.ok) {
            toast({ title: 'Invalid terms', description: v.message || 'Please check the entered values.', variant: 'destructive' });
            return;
        }

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
                hourly_rate: '',
                estimated_hours: '',
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
                                onValueChange={(val: 'daily' | 'sprint' | 'fixed' | 'hourly') =>
                                    setFormData({ ...formData, engagement_model: val })
                                }
                            >
                                <SelectTrigger className="h-11 bg-muted/30">
                                    <SelectValue placeholder="Select a model" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="hourly">Hourly Rate</SelectItem>
                                    <SelectItem value="daily">Daily Rate</SelectItem>
                                    <SelectItem value="sprint">Sprint-Based</SelectItem>
                                    <SelectItem value="fixed">Fixed Price</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Hourly Model Fields */}
                        {formData.engagement_model === 'hourly' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-widest font-bold">Hourly Rate ({currencySym}/hr)</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                            {currencySym}
                                        </span>
                                        <CurrencyInput
                                            sourceCurrency={projectCurrency}
                                            placeholder="50"
                                            className="pl-9 h-11 bg-muted/30"
                                            value={formData.hourly_rate}
                                            onChangeValue={(val) => setFormData({ ...formData, hourly_rate: val })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-widest font-bold">Estimated Hours</Label>
                                    <div className="relative">
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="number"
                                            min={0}
                                            placeholder="40"
                                            className="pl-9 h-11 bg-muted/30"
                                            value={formData.estimated_hours}
                                            onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Daily Model Fields */}
                        {formData.engagement_model === 'daily' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-widest font-bold">Daily Rate ({currencySym})</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                            {currencySym}
                                        </span>
                                        <CurrencyInput
                                            sourceCurrency={projectCurrency}
                                            placeholder="150"
                                            className="pl-9 h-11 bg-muted/30"
                                            value={formData.daily_rate}
                                            onChangeValue={(val) => setFormData({ ...formData, daily_rate: val })}
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
                                            min={0}
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
                                    <Label className="text-xs uppercase tracking-widest font-bold">Sprint Rate ({currencySym})</Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                            {currencySym}
                                        </span>
                                        <CurrencyInput
                                            sourceCurrency={projectCurrency}
                                            placeholder="1000"
                                            className="pl-9 h-11 bg-muted/30"
                                            value={formData.sprint_rate}
                                            onChangeValue={(val) => setFormData({ ...formData, sprint_rate: val })}
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
                                            min={0}
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
                                            min={1}
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
                                <Label className="text-xs uppercase tracking-widest font-bold">Total Amount ({currencySym})</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                                        {currencySym}
                                    </span>
                                    <CurrencyInput
                                        sourceCurrency={projectCurrency}
                                        placeholder="5000"
                                        className="pl-9 h-11 bg-muted/30"
                                        value={formData.total_amount}
                                        onChangeValue={(val) => setFormData({ ...formData, total_amount: val })}
                                        required
                                    />
                                </div>
                            </div>
                        )}

                        <div className="bg-primary/5 p-3 rounded-lg flex justify-between items-center border border-primary/10">
                            <span className="text-sm text-muted-foreground">Estimated Contract Value</span>
                            <span className="text-lg font-bold text-primary">{convertAndFormat(calculateTotalValue(), projectCurrency)}</span>
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
