import { useState } from "react";
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

interface Ticket {
    id: string;
    created_at: string;
    ticket_type: string;
    priority: string;
    subject: string;
    description: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    admin_notes?: string;
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

export default function AdminHelpDeskPage() {
    const { token } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [notes, setNotes] = useState("");

    const { data: tickets, isLoading } = useQuery({
        queryKey: ['admin-tickets'],
        queryFn: async () => {
            const res = await api.get<Ticket[]>('/help-desk/all', token!);
            // Client-side sorting: Open/In_Progress first, then by date desc
            const sorted = res.sort((a: Ticket, b: Ticket) => {
                const statusOrder = { 'open': 0, 'in_progress': 1, 'resolved': 2, 'closed': 3 };
                const statusDiff = (statusOrder[a.status] || 4) - (statusOrder[b.status] || 4);
                if (statusDiff !== 0) return statusDiff;
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
            return sorted;
        },
        enabled: !!token
    });

    const updateStatusMutation = useMutation({
        mutationFn: async (data: { id: string, status: string, notes?: string }) => {
            return api.patch(`/help-desk/${data.id}/status`, {
                status: data.status,
                admin_notes: data.notes
            }, token!);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
            toast({ title: "Ticket Updated" });
            setSelectedTicket(null);
        }
    });

    if (isLoading) return (
        <AdminLayout>
            <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8" /></div>
        </AdminLayout>
    );

    return (
        <AdminLayout>
            <div className="p-6 space-y-6">
                <Card>
                    {/* ... rest of the component ... */}
                    <CardHeader>
                        <CardTitle>Help Desk Tickets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            {/* ... table content ... */}
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tickets?.map((ticket) => (
                                    <TableRow key={ticket.id}>
                                        <TableCell>{format(new Date(ticket.created_at), "MMM d, yyyy")}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{ticket.first_name} {ticket.last_name}</span>
                                                <span className="text-xs text-muted-foreground">{ticket.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="capitalize">{ticket.ticket_type}</TableCell>
                                        <TableCell className="max-w-[200px] truncate">{ticket.subject}</TableCell>
                                        <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                                        <TableCell>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm" onClick={() => {
                                                        setSelectedTicket(ticket);
                                                        setNotes(ticket.admin_notes || "");
                                                    }}>View</Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-2xl">
                                                    <DialogHeader>
                                                        <DialogTitle>Ticket Details</DialogTitle>
                                                        <div className="space-y-4 pt-4">
                                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                                <div>
                                                                    <span className="font-semibold block text-muted-foreground">User</span>
                                                                    {selectedTicket?.first_name} {selectedTicket?.last_name}
                                                                </div>
                                                                <div>
                                                                    <span className="font-semibold block text-muted-foreground">Date</span>
                                                                    {selectedTicket && format(new Date(selectedTicket.created_at), "PPP p")}
                                                                </div>
                                                                <div>
                                                                    <span className="font-semibold block text-muted-foreground">Type</span>
                                                                    {selectedTicket?.ticket_type}
                                                                </div>
                                                                <div>
                                                                    <span className="font-semibold block text-muted-foreground">Priority</span>
                                                                    {selectedTicket?.priority}
                                                                </div>
                                                            </div>

                                                            <div className="bg-muted p-3 rounded-md">
                                                                <h4 className="font-semibold mb-1">Description</h4>
                                                                <p className="whitespace-pre-wrap text-sm">{selectedTicket?.description}</p>
                                                            </div>

                                                            {selectedTicket?.attachments && selectedTicket.attachments.length > 0 && ( // Check if non-empty array
                                                                <div>
                                                                    <h4 className="font-semibold mb-2 flex items-center gap-2"><Paperclip className="h-4 w-4" /> Attachments</h4>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {selectedTicket.attachments.map((att, i) => (
                                                                            att && ( // Check if attachment is not null
                                                                                <a
                                                                                    key={i}
                                                                                    href={att.file_path} // Adjust if you need a full URL or signed URL
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

                                                            <div className="border-t pt-4 space-y-3">
                                                                <h4 className="font-semibold">Admin Actions</h4>
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium">Status</label>
                                                                    <Select
                                                                        defaultValue={selectedTicket?.status}
                                                                        onValueChange={(val) => updateStatusMutation.mutate({
                                                                            id: selectedTicket!.id,
                                                                            status: val,
                                                                            notes: notes
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
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-medium">Admin Notes</label>
                                                                    <Textarea
                                                                        value={notes}
                                                                        onChange={(e) => setNotes(e.target.value)}
                                                                        placeholder="Internal notes..."
                                                                    />
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => updateStatusMutation.mutate({
                                                                            id: selectedTicket!.id,
                                                                            status: selectedTicket!.status,
                                                                            notes: notes
                                                                        })}
                                                                        disabled={updateStatusMutation.isPending}
                                                                    >
                                                                        Save Notes
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </DialogHeader>
                                                </DialogContent>
                                            </Dialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
