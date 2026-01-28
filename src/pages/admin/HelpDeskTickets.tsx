import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
    Loader2,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Clock,
    Paperclip
} from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Label } from '@/components/ui/label'
import { notificationApi } from "@/lib/api";
import { useEffect } from "react";

interface Ticket {
    id: string;
    created_at: string;
    ticket_type: string;
    priority: string;
    subject: string;
    description: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    admin_reply?: string;
    user_id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    attachments?: any[];
}

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'open':
            return <Badge variant="destructive" className="bg-red-500">Open</Badge>;
        case 'in_progress':
            return <Badge className="bg-blue-500">In Progress</Badge>;
        case 'resolved':
            return <Badge className="bg-green-500">Resolved</Badge>;
        case 'closed':
            return <Badge variant="outline">Closed</Badge>;
        default:
            return <Badge variant="secondary">{status}</Badge>;
    }
};

function TicketNotifications({ ticket, token }: { ticket: Ticket | null, token: string | null }) {
    const [notifications, setNotifications] = useState<any[]>([]);
    useEffect(() => {
        const fetchNotifications = async () => {
            if (ticket && ticket.user_id && token) {
                try {
                    const res = await notificationApi.getForProfile(ticket.user_id, token);
                    const filtered = Array.isArray(res?.data)
                        ? res.data.filter((n: any) => n.type === "helpdesk_reply")
                        : [];
                    setNotifications(filtered);
                } catch (e) {
                    setNotifications([]);
                }
            } else {
                setNotifications([]);
            }
        };
        fetchNotifications();
    }, [ticket, token]);
    if (!ticket || notifications.length === 0) return null;
    return (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
            <h4 className="font-semibold mb-2 text-blue-700">Replies Sent to User</h4>
            <ul className="space-y-2">
                {notifications.map((n, i) => (
                    <li key={n.id || i} className="text-sm text-blue-900">
                        <span className="block font-medium">{n.title}</span>
                        <span className="block whitespace-pre-line">{n.message}</span>
                        <span className="block text-xs text-blue-500">{n.created_at ? format(new Date(n.created_at), "PPP p") : ""}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function AdminHelpDeskPage() {
    const { token } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [replyMessage, setReplyMessage] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // ...existing code...

    // Place this after tickets is declared

    // ...existing code...

    // Place this after tickets is declared

    // ...existing code...

    // Filters & Sorting State
    const [filterStatus, setFilterStatus] = useState<string | 'all'>('all');
    const [filterPriority, setFilterPriority] = useState<string | 'all'>('all');
    const [filterType, setFilterType] = useState<string | 'all'>('all');
    const [sortConfig, setSortConfig] = useState<{ key: keyof Ticket; direction: 'asc' | 'desc' }>({ key: 'created_at', direction: 'desc' });
    const [dialogOpen, setDialogOpen] = useState(false);

    const { data: tickets, isLoading } = useQuery({
        queryKey: ['admin-tickets'],
        queryFn: async () => {
            const payload = await api.get<any>('/help-desk/all', token!);
            const res: Ticket[] = Array.isArray(payload) ? payload : (payload?.tickets ?? []);
            return res;
        },
        enabled: !!token
    });

    // Listen for open-admin-ticket-dialog event (must be after tickets is declared)
    useEffect(() => {
        const handler = (e: any) => {
            const ticketId = e.detail?.ticketId;
            if (!ticketId || !tickets) return;
            const found = tickets.find((t: any) => t.id === ticketId);
            if (found) {
                setSelectedTicket(found);
                setDialogOpen(true);
            }
        };
        window.addEventListener("open-admin-ticket-dialog", handler);
        return () => window.removeEventListener("open-admin-ticket-dialog", handler);
    }, [tickets]);

    const processedTickets = useMemo(() => {
        if (!tickets) return [] as Ticket[];
        let result = [...tickets];

        // 1. Filtering
        const q = searchQuery.trim().toLowerCase();
        if (q || filterStatus !== 'all' || filterPriority !== 'all' || filterType !== 'all') {
            result = result.filter(t => {
                if (filterStatus !== 'all' && t.status !== filterStatus) return false;
                if (filterPriority !== 'all' && t.priority !== filterPriority) return false;
                if (filterType !== 'all' && t.ticket_type !== filterType) return false;

                if (q) {
                    const hay = `${t.subject ?? ''} ${t.description ?? ''} ${t.first_name ?? ''} ${t.last_name ?? ''} ${t.email ?? ''}`.toLowerCase();
                    if (!hay.includes(q)) return false;
                }
                return true;
            });
        }

        // 2. Sorting
        result.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue === bValue) return 0;

            // Handle nulls
            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            const comparison = aValue < bValue ? -1 : 1;
            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [tickets, searchQuery, filterStatus, filterPriority, filterType, sortConfig]);

    const handleSort = (key: keyof Ticket) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const updateStatusMutation = useMutation({
        mutationFn: async (data: { id: string, status: string, notes?: string }) => {
            return api.patch(`/help-desk/${data.id}/status`, {
                status: data.status,
                admin_reply: data.notes
            }, token!);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
            toast({ title: "Ticket Updated" });
            setSelectedTicket(null);
        }
    });

    const replyMutation = useMutation({
        mutationFn: async (data: { id: string, message: string }) => {
            // POST to a new endpoint for replies (backend must implement)
            return api.post(`/help-desk/${data.id}/reply`, { message: data.message }, token!);
        },
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
            toast({ title: "Reply sent to user" });
            setReplyMessage("");

            // Update local state to show the reply immediately using returned data
            if (data?.admin_reply) {
                setSelectedTicket(prev => prev ? { ...prev, admin_reply: data.admin_reply } : null);
            }
        }
    });

    // Removed unused notifications fetching logic for selectedTicket



    if (isLoading) return (
        <AdminLayout>
            <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8" /></div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            <div className="p-6">
                <Card>
                    <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <CardTitle>Help Desk Tickets</CardTitle>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Input
                                placeholder="Search by subject, user, or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="max-w-sm"
                            />
                            <Select defaultValue={filterType} onValueChange={(val) => setFilterType(val)}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="technical">Technical</SelectItem>
                                    <SelectItem value="billing">Billing</SelectItem>
                                    <SelectItem value="account">Account</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select defaultValue={filterPriority} onValueChange={(val) => setFilterPriority(val)}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priorities</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="urgent">Urgent</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select defaultValue={filterStatus} onValueChange={(val) => setFilterStatus(val)}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="in_progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                    <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('created_at')}>
                                        Date & Time {sortConfig.key === 'created_at' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </TableHead>
                                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('first_name')}>
                                        User {sortConfig.key === 'first_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </TableHead>
                                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('ticket_type')}>
                                        Type {sortConfig.key === 'ticket_type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </TableHead>
                                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('subject')}>
                                        Subject {sortConfig.key === 'subject' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </TableHead>
                                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => handleSort('status')}>
                                        Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                    </TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {processedTickets.map((ticket) => (
                                    <TableRow key={ticket.id} className="hover:bg-muted/50">
                                        <TableCell className="text-sm">{format(new Date(ticket.created_at), "MMM d, yyyy, h:mm a")}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{ticket.first_name} {ticket.last_name}</span>
                                                <span className="text-xs text-muted-foreground">{ticket.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="capitalize text-sm">{ticket.ticket_type}</TableCell>
                                        <TableCell className="max-w-[300px] truncate text-sm">{ticket.subject}</TableCell>
                                        <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" onClick={() => {
                                                setSelectedTicket(ticket);
                                                setReplyMessage("");
                                                setDialogOpen(true);
                                            }}>View</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                            <DialogContent className="max-w-2xl p-0">
                                {selectedTicket && (
                                    <div className="space-y-4 pt-7 max-h-[70vh] overflow-y-auto px-6 pb-4">
                                        <DialogHeader>
                                            <DialogTitle className="mb-2">Ticket Details</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-semibold block text-muted-foreground">User</span>
                                                {selectedTicket.first_name} {selectedTicket.last_name}
                                                <div className="text-xs text-muted-foreground">{selectedTicket.email}</div>
                                            </div>
                                            <div>
                                                <span className="font-semibold block text-muted-foreground">Date</span>
                                                {format(new Date(selectedTicket.created_at), "PPP p")}
                                            </div>
                                            <div>
                                                <span className="font-semibold block text-muted-foreground">Type</span>
                                                {selectedTicket.ticket_type}
                                            </div>
                                            <div>
                                                <span className="font-semibold block text-muted-foreground">Priority</span>
                                                {selectedTicket.priority}
                                            </div>
                                        </div>

                                        <div className="bg-muted p-3 rounded-md">
                                            <h4 className="font-semibold mb-1">Description</h4>
                                            <p className="whitespace-pre-wrap text-sm">{selectedTicket.description}</p>
                                        </div>

                                        {selectedTicket.attachments && selectedTicket.attachments.length > 0 && selectedTicket.attachments.some(a => a) && (
                                            <div>
                                                <h4 className="font-semibold mb-2 flex items-center gap-2"><Paperclip className="h-4 w-4" /> Attachments</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedTicket.attachments.map((att, i) => (
                                                        att && (
                                                            <a
                                                                key={i}
                                                                href={att.file_path}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-xs bg-primary/10 text-primary px-2 py-1 rounded hover:underline"
                                                            >
                                                                {att.file_name}
                                                            </a>
                                                        )
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <TicketNotifications ticket={selectedTicket} token={token} />

                                        <div className="border-t pt-6 pb-2">
                                            <h4 className="font-semibold mb-4">Admin Actions</h4>
                                            <div className="flex flex-col gap-6">
                                                <div className="flex flex-col md:flex-row md:items-center gap-4">
                                                    <div className="flex-1 flex flex-col gap-2 min-w-[180px]">
                                                        <Label>Status</Label>
                                                        <Select
                                                            defaultValue={selectedTicket.status}
                                                            onValueChange={(val) => updateStatusMutation.mutate({
                                                                id: selectedTicket.id,
                                                                status: val,
                                                                notes: ""
                                                            })}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="open">Open</SelectItem>
                                                                <SelectItem value="in_progress">In Progress</SelectItem>
                                                                <SelectItem value="resolved">Resolved</SelectItem>
                                                                <SelectItem value="closed">Closed</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>

                                                {selectedTicket.admin_reply && (
                                                    <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-md mb-2">
                                                        <h5 className="text-xs font-semibold text-blue-600 mb-1">Previous Reply:</h5>
                                                        <p className="text-sm whitespace-pre-wrap">{selectedTicket.admin_reply}</p>
                                                    </div>
                                                )}

                                                <div className="bg-muted/60 rounded-lg p-4 flex flex-col gap-2 border">
                                                    <Label className="font-semibold">Reply to User</Label>
                                                    <Textarea
                                                        value={replyMessage}
                                                        onChange={(e) => setReplyMessage(e.target.value)}
                                                        placeholder="Type your reply to the user..."
                                                        className="resize-none min-h-[60px]"
                                                    />
                                                    <div className="flex justify-end">
                                                        <Button
                                                            size="sm"
                                                            className="font-semibold"
                                                            onClick={() => {
                                                                replyMutation.mutate({
                                                                    id: selectedTicket.id,
                                                                    message: replyMessage
                                                                });
                                                            }}
                                                            disabled={replyMutation.isPending || !replyMessage.trim()}
                                                        >
                                                            Send Reply
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="flex flex-row gap-3 mt-2 justify-end">
                                                    {selectedTicket.status !== 'closed' && (
                                                        <Button
                                                            size="sm"
                                                            className="bg-red-600 text-white font-semibold"
                                                            onClick={() => {
                                                                updateStatusMutation.mutate({
                                                                    id: selectedTicket.id,
                                                                    status: 'closed',
                                                                    notes: ""
                                                                });
                                                            }}
                                                            disabled={updateStatusMutation.isPending}
                                                        >
                                                            Close Ticket
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
