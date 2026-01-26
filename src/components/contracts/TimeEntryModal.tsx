import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Clock, Trash2, Plus, X, Paperclip, Link2 } from 'lucide-react';
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
    const [evidenceLinks, setEvidenceLinks] = useState<Array<{ label: string; url: string }>>([]);
    const [existingAttachments, setExistingAttachments] = useState<any[]>([]);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const MAX_FILES = 10;
    const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

    const todayStr = format(new Date(), 'yyyy-MM-dd');

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

                let evidence: any = initialEntry?.evidence;
                if (typeof evidence === 'string') {
                    try {
                        evidence = JSON.parse(evidence);
                    } catch {
                        evidence = {};
                    }
                }
                if (typeof evidence !== 'object' || evidence === null) evidence = {};

                const links = Array.isArray(evidence?.links) ? evidence.links : [];
                setEvidenceLinks(
                    links.map((l: any) => ({
                        label: typeof l?.label === 'string' ? l.label : 'Link',
                        url: typeof l?.url === 'string' ? l.url : String(l ?? ''),
                    }))
                );
                setExistingAttachments(
                    evidence?.attachments && Array.isArray(evidence.attachments)
                        ? evidence.attachments
                        : []
                );
                setAttachments([]);
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
                setEvidenceLinks([]);
                setExistingAttachments([]);
                setAttachments([]);
            }
        }
    }, [isOpen, initialEntry, initialDate]);

    const addEvidenceLink = () => {
        setEvidenceLinks((prev) => [...prev, { label: 'Link', url: '' }]);
    };

    const updateEvidenceLink = (index: number, patch: Partial<{ label: string; url: string }>) => {
        setEvidenceLinks((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)));
    };

    const removeEvidenceLink = (index: number) => {
        setEvidenceLinks((prev) => prev.filter((_, i) => i !== index));
    };

    const onPickAttachments = (files: FileList | null) => {
        if (!files) return;

        const remainingSlots = Math.max(MAX_FILES - existingAttachments.length - attachments.length, 0);
        if (remainingSlots <= 0) {
            toast({
                title: 'Attachment limit reached',
                description: `You can upload up to ${MAX_FILES} files total.`,
                variant: 'destructive',
            });
            return;
        }

        const picked = Array.from(files);
        const accepted: File[] = [];
        for (const f of picked) {
            if (f.size > MAX_FILE_SIZE_BYTES) {
                toast({
                    title: 'File too large',
                    description: `${f.name} exceeds 10MB.`,
                    variant: 'destructive',
                });
                continue;
            }
            accepted.push(f);
        }

        const next = [...attachments, ...accepted].slice(0, attachments.length + remainingSlots);
        setAttachments(next);

        // Allow re-selecting the same file
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removeAttachment = (index: number) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const removeExistingAttachment = (index: number) => {
        setExistingAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (date !== todayStr) {
            toast({ title: "Not allowed", description: "You can only log time for today.", variant: "destructive" });
            return;
        }
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
            if (!Number.isFinite(durationMinutes) || durationMinutes < 1 || durationMinutes > 1440) {
                toast({
                    title: "Invalid duration",
                    description: "Duration must be between 1 minute and 24 hours.",
                    variant: "destructive",
                });
                return;
            }

            // Construct ISO start time
            const datetimeString = `${date}T${startTime}:00`;
            const startDateTime = new Date(datetimeString);
            const derivedEnd = new Date(startDateTime.getTime() + durationMinutes * 60 * 1000);
            const startIsoDay = startDateTime.toISOString().slice(0, 10);
            const endIsoDay = derivedEnd.toISOString().slice(0, 10);

            if (endIsoDay !== startIsoDay) {
                toast({
                    title: "Invalid time range",
                    description: "This entry crosses into the next day. Reduce duration or move the start time earlier.",
                    variant: "destructive",
                });
                return;
            }
            const isoStartTime = startDateTime.toISOString();

            const payload = {
                contract_id: contractId,
                description,
                start_time: isoStartTime,
                duration_minutes: durationMinutes,
                evidence: {
                    summary: '',
                    links: evidenceLinks.filter((l) => l.url && l.url.trim().length > 0),
                    ...(initialEntry ? { attachments: existingAttachments } : {}),
                },
                attachments,
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
            if (error?.code === 'OVERLAPPING_TIME_ENTRY' || /overlap/i.test(String(error?.message || ''))) {
                toast({
                    title: "Overlapping time entry",
                    description: "This time range overlaps with an existing entry. Adjust the start time or duration.",
                    variant: "destructive",
                });
                return;
            }
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
            <DialogContent className="sm:max-w-130 max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>{initialEntry ? 'Edit Time Entry' : 'Log Time'}</DialogTitle>
                    <DialogDescription>
                        Record your hours for this contract.
                    </DialogDescription>
                </DialogHeader>

                <form id="time-entry-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto overflow-x-hidden space-y-4 py-4 pl-1 pr-4">
                    <div className="space-y-2">
                        <Label>Date</Label>
                        <Input
                            type="date"
                            required
                            value={date}
                            min={todayStr}
                            max={todayStr}
                            onChange={e => setDate(e.target.value)}
                        />
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
                                        max="24"
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

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2">
                                <Link2 className="h-4 w-4" /> Evidence Links
                            </Label>
                            <Button type="button" variant="outline" size="sm" onClick={addEvidenceLink}>
                                <Plus className="h-4 w-4 mr-2" /> Add Link
                            </Button>
                        </div>

                        {evidenceLinks.length === 0 ? (
                            <p className="text-sm text-zinc-500">Optional: add any reference links for this entry.</p>
                        ) : (
                            <div className="space-y-2">
                                {evidenceLinks.map((link, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                        <Input
                                            className="col-span-4"
                                            placeholder="Label"
                                            value={link.label}
                                            onChange={(e) => updateEvidenceLink(idx, { label: e.target.value })}
                                        />
                                        <Input
                                            className="col-span-7"
                                            placeholder="https://..."
                                            value={link.url}
                                            onChange={(e) => updateEvidenceLink(idx, { url: e.target.value })}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="col-span-1"
                                            onClick={() => removeEvidenceLink(idx)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4" /> Attachments
                        </Label>

                        {/* Existing attachments (edit mode) */}
                        {initialEntry && existingAttachments.length > 0 && (
                            <div className="space-y-2">
                                <p className="text-sm text-zinc-700">Existing attachments</p>
                                <div className="space-y-1">
                                    {existingAttachments.map((att: any, idx: number) => {
                                        const url = typeof att === 'string' ? att : att?.url;
                                        if (!url) return null;
                                        const rawName = (typeof att === 'object' && att?.name)
                                            ? String(att.name)
                                            : (String(url).split('/').pop() || 'File');

                                        // Stored uploads often look like: "<timestamp>-<rand>-<originalName>".
                                        const displayName = rawName.replace(/^\d+-[a-z0-9]+-/, '');
                                        return (
                                            <div
                                                key={`existing-att-${idx}`}
                                                className="flex items-center justify-between gap-2 rounded border px-2 py-1.5 text-sm bg-zinc-50"
                                            >
                                                <span className="min-w-0 flex-1 truncate" title={displayName}>
                                                    {displayName}
                                                </span>
                                                <div className="shrink-0 flex items-center gap-1">
                                                    <a
                                                        href={url}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="rounded px-2 py-1 text-xs font-medium text-zinc-900 hover:bg-zinc-100"
                                                    >
                                                        View
                                                    </a>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => removeExistingAttachment(idx)}
                                                        aria-label="Remove attachment"
                                                        title="Remove"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            className="hidden"
                            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                            onChange={(e) => onPickAttachments(e.target.files)}
                        />

                        <div className="flex items-center justify-between gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="h-9"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Choose files
                            </Button>
                            <span className="text-xs text-zinc-500">
                                {existingAttachments.length + attachments.length}
                                /{MAX_FILES} attached
                            </span>
                        </div>
                        {attachments.length > 0 && (
                            <div className="space-y-1">
                                {attachments.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between rounded border px-2 py-1 text-sm">
                                        <span className="truncate">{file.name}</span>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeAttachment(idx)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="text-xs text-zinc-500">Up to 10 files, max 10MB each.</p>
                    </div>

                </form>

                <DialogFooter className="shrink-0 flex items-center justify-between sm:justify-between w-full gap-2 pt-3 border-t">
                    {initialEntry && onDelete ? (
                        <Button type="button" variant="ghost" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </Button>
                    ) : <div />}

                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                        <Button form="time-entry-form" type="submit" disabled={loading} className="bg-zinc-900 text-white hover:bg-zinc-800">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {initialEntry ? 'Update' : 'Log Time'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
