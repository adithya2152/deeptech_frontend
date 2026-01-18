import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { TimeEntryModal } from '@/components/contracts/TimeEntryModal';
import { timeEntriesApi } from '@/lib/api';
import { TimeEntry } from '@/types';
import { ChevronLeft, ChevronRight, Clock, Loader2, Plus } from 'lucide-react';
import { addWeeks, eachDayOfInterval, endOfWeek, format, isSameDay, startOfWeek, subWeeks } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface HourlyTimesheetProps {
    contract: any;
    isExpert: boolean;
    isBuyer: boolean;
}

export function HourlyTimesheet({ contract, isExpert, isBuyer }: HourlyTimesheetProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [entries, setEntries] = useState<TimeEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalDate, setModalDate] = useState<Date>(new Date());
    const [editingEntry, setEditingEntry] = useState<TimeEntry | undefined>(undefined);

    // Time Navigation
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

    const fetchEntries = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) return;

            const entriesRes = await timeEntriesApi.getByContract(contract.id, token);
            const entriesData = (entriesRes as any).data || entriesRes;
            setEntries(entriesData);
        } catch (error) {
            console.error("Failed to fetch time entries", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntries();
    }, [contract.id]);

    // Keep selectedDate within the currently shown week
    useEffect(() => {
        if (selectedDate >= weekStart && selectedDate <= weekEnd) return;
        setSelectedDate(weekStart);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentDate]);

    const handlePrevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
    const handleNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
    const handleToday = () => setCurrentDate(new Date());

    // Filter entries for current week
    const weeklyEntries = useMemo(() => {
        return entries.filter(e => {
            const d = new Date(e.start_time);
            return d >= weekStart && d <= weekEnd;
        });
    }, [entries, weekStart, weekEnd]);

    // Aggregate daily totals
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const dailyTotals = weekDays.map(day => {
        const dayEntries = weeklyEntries.filter(e => isSameDay(new Date(e.start_time), day));
        const totalMinutes = dayEntries.reduce((acc, curr) => acc + curr.duration_minutes, 0);
        return {
            date: day,
            minutes: totalMinutes,
            hours: (totalMinutes / 60).toFixed(1),
            entries: dayEntries
        };
    });

    const totalWeeklyMinutes = weeklyEntries.reduce((acc, curr) => acc + curr.duration_minutes, 0);
    const totalWeeklyHours = (totalWeeklyMinutes / 60).toFixed(1);

    const selectedEntries = useMemo(() => {
        return weeklyEntries.filter(e => isSameDay(new Date(e.start_time), selectedDate));
    }, [weeklyEntries, selectedDate]);

    const invalidateSummary = () =>
        queryClient.invalidateQueries({ queryKey: ['time-entries-summary', contract.id] });

    const invalidateInvoices = () =>
        queryClient.invalidateQueries({ queryKey: ['invoices', contract.id] });

    // Actions
    const handleAddEntry = (date?: Date) => {
        if (!isExpert) return;
        setModalDate(date || new Date());
        setEditingEntry(undefined);
        setIsModalOpen(true);
    };

    const handleEditEntry = (entry: TimeEntry) => {
        if (!isExpert || entry.status !== 'draft') return;
        setEditingEntry(entry);
        setModalDate(new Date(entry.start_time));
        setIsModalOpen(true);
    };

    const handleDeleteEntry = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            await timeEntriesApi.delete(id, token);
            toast({ title: "Deleted", description: "Time entry removed." });
            fetchEntries();
            invalidateSummary();
        } catch (e) {
            toast({ title: "Error", description: "Failed to delete entry", variant: "destructive" });
        }
    };

    const handleSubmitEntry = async (id: string) => {
        // Individual submit
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            await timeEntriesApi.submit(id, token);
            toast({ title: "Submitted", description: "Time entry submitted for approval." });
            fetchEntries();
            invalidateSummary();
        } catch (e) {
            toast({ title: "Error", description: "Submit failed", variant: "destructive" });
        }
    };

    const handleApproveEntry = async (id: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            await timeEntriesApi.approve(id, "Approved", token);
            toast({ title: "Approved", description: "Time entry approved." });
            fetchEntries();
            invalidateSummary();
            invalidateInvoices();
        } catch (e) {
            toast({ title: "Error", description: "Approval failed", variant: "destructive" });
        }
    };

    const handleRejectEntry = async (id: string) => {
        const reason = prompt("Enter rejection reason:");
        if (!reason) return;

        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            await timeEntriesApi.reject(id, reason, token);
            toast({ title: 'Rejected', description: 'Time entry rejected.' });
            fetchEntries();
            invalidateSummary();
        } catch (e) {
            toast({ title: 'Error', description: 'Rejection failed', variant: 'destructive' });
        }
    };

    if (loading) {
        return (
            <div className="py-10 flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={handlePrevWeek}><ChevronLeft className="h-4 w-4" /></Button>
                    <div className="text-center min-w-[200px]">
                        <h3 className="font-semibold text-lg">{format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}</h3>
                        <p className="text-xs text-zinc-500">Week total: {totalWeeklyHours} hrs</p>
                    </div>
                    <Button variant="outline" size="icon" onClick={handleNextWeek}><ChevronRight className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={handleToday} className="text-xs">Today</Button>
                </div>

                {isExpert && (
                    <Button onClick={() => handleAddEntry(selectedDate)} className="bg-zinc-900 text-white hover:bg-zinc-800">
                        <Plus className="h-4 w-4 mr-2" /> Log Time
                    </Button>
                )}
            </div>

            {/* Weekly Grid */}
            <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="grid grid-cols-7 border-b bg-zinc-50 divide-x">
                    {weekDays.map(day => {
                        const isToday = isSameDay(day, new Date());
                        const isSelected = isSameDay(day, selectedDate);
                        const dayTotal = dailyTotals.find(d => isSameDay(d.date, day));

                        return (
                            <div
                                key={day.toISOString()}
                                className={`p-3 text-center cursor-pointer hover:bg-zinc-100 transition-colors ${isToday ? 'bg-blue-50/50' : ''} ${isSelected ? 'ring-2 ring-blue-500 ring-inset bg-white' : ''}`}
                                onClick={() => setSelectedDate(day)}
                            >
                                <p className={`text-xs font-medium uppercase mb-1 ${isToday ? 'text-blue-600' : 'text-zinc-500'}`}>
                                    {format(day, 'EEE')}
                                </p>
                                <p className={`text-sm font-semibold ${isToday ? 'text-blue-700' : 'text-zinc-900'}`}>
                                    {format(day, 'd')}
                                </p>
                                <div className="mt-2">
                                    {dayTotal && dayTotal.minutes > 0 ? (
                                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                                            {dayTotal.hours}h
                                        </span>
                                    ) : (
                                        <span className="text-xs text-zinc-300">-</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Detailed List */}
                <div className="divide-y">
                    <div className="p-3 text-sm text-zinc-600 bg-white border-b">
                        Showing logs for <span className="font-semibold text-zinc-900">{format(selectedDate, 'EEE, MMM d')}</span>
                    </div>

                    {selectedEntries.length === 0 ? (
                        <div className="p-12 text-center text-zinc-500">
                            <Clock className="h-10 w-10 mx-auto mb-3 text-zinc-300" />
                            <p>No time logged for this day.</p>
                        </div>
                    ) : (
                        selectedEntries.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
                            .map(entry => {
                                const statusColor =
                                    entry.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                        entry.status === 'submitted' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                            entry.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                                'bg-zinc-100 text-zinc-700 border-zinc-200';

                                const canEdit = isExpert && entry.status === 'draft';
                                const canApprove = isBuyer && entry.status === 'submitted';

                                return (
                                    <div key={entry.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-50/50 transition-colors">
                                        <div className="flex items-start gap-4">
                                            <div className="min-w-[4rem] text-center">
                                                <p className="text-xs text-zinc-500 font-medium uppercase">{format(new Date(entry.start_time), 'EEE')}</p>
                                                <p className="text-lg font-bold text-zinc-900">{format(new Date(entry.start_time), 'd')}</p>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant="outline" className={`capitalize border ${statusColor}`}>
                                                        {entry.status}
                                                    </Badge>
                                                    <span className="font-mono font-bold text-zinc-900 text-sm">
                                                        {(entry.duration_minutes / 60).toFixed(2)} hrs
                                                    </span>
                                                    <span className="text-xs text-zinc-400">
                                                        {format(new Date(entry.start_time), 'h:mm a')}
                                                        {entry.end_time && ` - ${format(new Date(entry.end_time), 'h:mm a')}`}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-zinc-700 whitespace-pre-wrap">{entry.description}</p>
                                                {entry.reviewer_comment && (
                                                    <p className="text-xs text-red-600 mt-1 bg-red-50 p-1 rounded">Reviewer: {entry.reviewer_comment}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 self-end sm:self-center">
                                            {canEdit && (
                                                <>
                                                    <Button variant="ghost" size="sm" onClick={() => handleEditEntry(entry)}>Edit</Button>
                                                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => handleSubmitEntry(entry.id)}>
                                                        Submit
                                                    </Button>
                                                </>
                                            )}
                                            {canApprove && (
                                                <>
                                                    <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleRejectEntry(entry.id)}>
                                                        Reject
                                                    </Button>
                                                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleApproveEntry(entry.id)}>
                                                        Approve
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                    )}
                </div>
            </div>

            <TimeEntryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                contractId={contract.id}
                initialDate={modalDate}
                initialEntry={editingEntry}
                onSuccess={() => {
                    fetchEntries();
                    invalidateSummary();
                }}
                onDelete={handleDeleteEntry}
            />
        </div>
    );
}
