import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { helpDeskApi, api } from "@/lib/api";
import { Layout } from "@/components/layout/Layout";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Paperclip, MessageSquare, ChevronRight, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface Ticket {
    id: string;
    ticket_type: string;
    subject: string;
    description: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: string;
    created_at: string;
    admin_reply?: string;
    attachments: Array<{
        file_name: string;
        file_path: string;
    }> | null;
}

export default function SupportHistoryPage() {
    const { token } = useAuth();
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [searchParams] = useSearchParams(); // Add this
    const ticketIdParam = searchParams.get('ticketId');

    const queryClient = useQueryClient();
    const { data: tickets, isLoading } = useQuery({
        queryKey: ["my-tickets"],
        queryFn: async () => {
            const res = await helpDeskApi.getMyTickets(token!);
            return res.tickets as Ticket[];
        },
        enabled: !!token,
    });

    // Auto-open ticket from URL if available
    useEffect(() => {
        if (ticketIdParam && tickets) {
            const found = tickets.find(t => t.id === ticketIdParam);
            if (found) {
                setSelectedTicket(found);
            }
        }
    }, [ticketIdParam, tickets]);

    const closeTicketMutation = useMutation({
        mutationFn: async (ticketId: string) => {
            return api.patch(`/help-desk/${ticketId}/status`, {
                status: 'closed',
                admin_reply: 'Closed by user'
            }, token!);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["my-tickets"] });
            setSelectedTicket(null);
        }
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "open": return <Badge variant="destructive" className="bg-red-500/15 text-red-600 hover:bg-red-500/25 border-none">Open</Badge>;
            case "in_progress": return <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 hover:bg-amber-500/25 border-none">In Progress</Badge>;
            case "resolved": return <Badge variant="default" className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-none">Resolved</Badge>;
            case "closed": return <Badge variant="outline" className="text-muted-foreground">Closed</Badge>;
            default: return <Badge>{status}</Badge>;
        }
    };

    if (isLoading) return (
        <Layout>
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin h-8 w-8 text-primary mb-4" />
                <p className="text-muted-foreground">Loading your tickets...</p>
            </div>
        </Layout>
    );

    return (
        <Layout>
            <div className="container max-w-5xl mx-auto py-10 px-4 space-y-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Support History</h1>
                    <p className="text-muted-foreground">
                        View the status of your support requests and communicate with our team.
                    </p>
                </div>

                <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle>My Tickets</CardTitle>
                        <CardDescription>
                            You have {tickets?.filter(t => t.status !== 'closed' && t.status !== 'resolved').length || 0} active tickets.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {tickets && tickets.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Ticket ID</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tickets.map((ticket) => (
                                        <TableRow key={ticket.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setSelectedTicket(ticket)}>
                                            <TableCell className="font-mono text-xs text-muted-foreground">#{ticket.id.slice(0, 8)}</TableCell>
                                            <TableCell className="font-medium">
                                                {ticket.subject}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize font-normal text-xs">{ticket.ticket_type}</Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {format(new Date(ticket.created_at), "MMM d, yyyy p")}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
                                    <MessageSquare className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h3 className="font-semibold text-lg mb-1">No tickets yet</h3>
                                <p className="text-muted-foreground max-w-sm mb-4">
                                    You haven't submitted any support tickets yet. Use the help widget in the bottom right to start a conversation.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {selectedTicket && (
                    <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
                        <DialogContent className="max-w-2xl sm:max-w-3xl">
                            <DialogHeader>
                                <div className="flex items-center gap-3 mb-2">
                                    {getStatusBadge(selectedTicket.status)}
                                    <span className="text-xs text-muted-foreground font-mono">#{selectedTicket.id}</span>
                                </div>
                                <DialogTitle className="text-xl">{selectedTicket.subject}</DialogTitle>
                                <p className="text-sm text-muted-foreground flex items-center gap-2">
                                    Submitted on {format(new Date(selectedTicket.created_at), "PPP p")}
                                </p>
                            </DialogHeader>

                            <div className="grid gap-6 py-4">
                                {/* Description Section */}
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium leading-none text-muted-foreground">Original Request</h4>
                                    <div className="p-4 rounded-lg bg-muted/50 border text-sm whitespace-pre-wrap">
                                        {selectedTicket.description}
                                    </div>
                                </div>

                                {/* Attachments Section */}
                                {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium leading-none text-muted-foreground">Attachments</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedTicket.attachments.map((att, i) => (
                                                <a
                                                    key={i}
                                                    href={att.file_path}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-2 text-xs bg-primary/5 hover:bg-primary/10 border border-primary/20 text-primary px-3 py-2 rounded-md transition-colors"
                                                >
                                                    <Paperclip className="h-3 w-3" />
                                                    {att.file_name}
                                                    <ExternalLink className="h-3 w-3 opacity-50" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Admin Response Section */}
                                {selectedTicket.admin_reply && (
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-medium leading-none text-blue-600 flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4" /> Support Response
                                        </h4>
                                        <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-100 text-sm whitespace-pre-wrap text-foreground dark:bg-blue-900/10 dark:border-blue-800">
                                            {selectedTicket.admin_reply}
                                        </div>
                                    </div>
                                )}

                                {!selectedTicket.admin_reply && (
                                    <div className="text-center p-6 bg-muted/20 rounded-lg border border-dashed">
                                        <p className="text-sm text-muted-foreground">
                                            {selectedTicket.status === 'open' && "We have received your request and will review it shortly."}
                                            {selectedTicket.status === 'in_progress' && "Our team is actively working on your request."}
                                            {selectedTicket.status === 'resolved' && "This request has been resolved."}
                                            {selectedTicket.status === 'closed' && "This request is closed."}
                                        </p>
                                    </div>
                                )}

                                {selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' && (
                                    <div className="border-t pt-4 flex justify-end">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => closeTicketMutation.mutate(selectedTicket.id)}
                                            disabled={closeTicketMutation.isPending}
                                        >
                                            Close Ticket
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </Layout>
    );
}
