import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Clock, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { timeEntriesApi } from '@/lib/api';

interface TimeEntryModalProps {
    isOpen: boolean;
    onClose: () => void;
    contractId: string;
    initialDate?: Date;
    initialEntry?: any; // If editing
    onSuccess: () => void;
    onDelete?: (id: string) => void;
}

export function TimeEntryModal({
    isOpen,
    onClose,
    contractId,
    initialDate,
    initialEntry,
    onSuccess,
    onDelete
}: TimeEntryModalProps) {
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [hours, setHours] = useState('');
    const [minutes, setMinutes] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialEntry) {
                // Editing mode
                setDate(initialEntry.start_time.split('T')[0]);
                const start = new Date(initialEntry.start_time);
                setStartTime(format(start, 'HH:mm'));

                const totalMinutes = initialEntry.duration_minutes || 0;
                setHours(Math.floor(totalMinutes / 60).toString());
                setMinutes((totalMinutes % 60).toString());
                setDescription(initialEntry.description || '');
            } else {
                // Create mode
                if (initialDate) {
                    setDate(format(initialDate, 'yyyy-MM-dd'));
                } else {
                    setDate(format(new Date(), 'yyyy-MM-dd'));
                }
                setStartTime('09:00');
                setHours('');
                setMinutes('');
                setDescription('');
            }
        }
    }, [isOpen, initialEntry, initialDate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hours && !minutes) {
            toast({ title: "Duration required", description: "Please enter hours or minutes worked.", variant: "destructive" });
            return;
        }
        if (!description.trim()) {
            toast({ title: "Description required", description: "Please describe what you worked on.", variant: "destructive" });
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) return;

            const durationMinutes = (parseInt(hours || '0') * 60) + parseInt(minutes || '0');

            // Construct ISO start time
            const datetimeString = `${date}T${startTime}:00`;
            const startDateTime = new Date(datetimeString);
            const isoStartTime = startDateTime.toISOString();

            const payload = {
                contract_id: contractId,
                description,
                start_time: isoStartTime,
                duration_minutes: durationMinutes
            };

            if (initialEntry) {
                await timeEntriesApi.update(initialEntry.id, payload, token);
                toast({ title: "Time Entry Updated", description: "Your timesheet has been updated." });
            } else {
                await timeEntriesApi.create(payload, token);
                toast({ title: "Time Logged", description: "Hours have been added to your timesheet." });
            }

            onSuccess();
            onClose();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to save time entry",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!initialEntry || !onDelete) return;
        if (confirm("Are you sure you want to delete this time entry?")) {
            onDelete(initialEntry.id);
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{initialEntry ? 'Edit Time Entry' : 'Log Time'}</DialogTitle>
                    <DialogDescription>
                        Record your hours for this contract.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Date</Label>
                        <Input type="date" required value={date} onChange={e => setDate(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Time</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                                <Input type="time" className="pl-9" required value={startTime} onChange={e => setStartTime(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Duration</Label>
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <Input
                                        type="number" min="0" placeholder="0"
                                        value={hours} onChange={e => setHours(e.target.value)}
                                    />
                                    <span className="absolute right-2 top-2.5 text-xs text-zinc-500">h</span>
                                </div>
                                <div className="flex-1 relative">
                                    <Input
                                        type="number" min="0" max="59" placeholder="0"
                                        value={minutes} onChange={e => setMinutes(e.target.value)}
                                    />
                                    <span className="absolute right-2 top-2.5 text-xs text-zinc-500">m</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Memorandum / Description</Label>
                        <Textarea
                            placeholder="What did you work on?"
                            className="resize-none h-24"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    <DialogFooter className="flex items-center justify-between sm:justify-between w-full gap-2">
                        {initialEntry && onDelete ? (
                            <Button type="button" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleDelete}>
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </Button>
                        ) : <div />}

                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                            <Button type="submit" disabled={loading} className="bg-zinc-900 text-white hover:bg-zinc-800">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {initialEntry ? 'Update' : 'Log Time'}
                            </Button>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
