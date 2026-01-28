import { useState } from "react";
// Custom event for admin ticket dialog open
const openAdminTicketDialog = (ticketId: string) => {
    window.dispatchEvent(new CustomEvent("open-admin-ticket-dialog", { detail: { ticketId } }));
};
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, CheckCheck, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface Notification {
    id: string;
    profile_id: string;
    type: string;
    title: string;
    message: string;
    link: string | null;
    is_read: boolean;
    created_at: string;
}

interface NotificationsResponse {
    success: boolean;
    data: Notification[];
    unreadCount: number;
}

export function NotificationBell() {
    const { token, user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);

    // Fetch notifications
    const { data: notificationsData } = useQuery<NotificationsResponse>({
        queryKey: ["notifications"],
        queryFn: () => api.get<NotificationsResponse>("/notifications?limit=10", token),
        enabled: !!token,
        refetchInterval: 30000,
    });

    // Filter notifications by active profile ID to ensure role separation
    const allNotifications = notificationsData?.data || [];
    const notifications = allNotifications.filter(n => n.profile_id === user?.profileId);

    // We strictly use the filtered list length for counts if we want accuracy on frontend, 
    // but total unread count from backend might still be mixed if backend isn't fixed.
    // However, showing only relevant notifications is the priority.
    const unreadCount = notificationsData?.unreadCount || 0;

    // Mark single as read
    const markAsReadMutation = useMutation({
        mutationFn: (notificationId: string) =>
            api.put(`/notifications/${notificationId}/read`, {}, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    // Mark all as read
    const markAllAsReadMutation = useMutation({
        mutationFn: () => api.patch("/notifications/read-all", {}, token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    // Delete all notifications
    const deleteAllMutation = useMutation({
        mutationFn: () => api.delete("/notifications/delete-all", token),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
    });

    const handleNotificationClick = (notification: Notification) => {
        // Mark as read if not already
        if (!notification.is_read) {
            markAsReadMutation.mutate(notification.id);
        }

        // If admin support ticket notification, open dialog (not route)
        if (
            notification.type === "helpdesk_reply" ||
            notification.type === "support_ticket" ||
            notification.title?.toLowerCase().includes("ticket")
        ) {
            // Try to extract ticket id from message or title
            let ticketId = null;
            const idFromMessage = notification.message?.match(/#([a-zA-Z0-9]+)/);
            if (idFromMessage) ticketId = idFromMessage[1];
            // fallback: try from title
            if (!ticketId) {
                const idFromTitle = notification.title?.match(/#([a-zA-Z0-9]+)/);
                if (idFromTitle) ticketId = idFromTitle[1];
            }
            // Always navigate to /support (user support history)
            navigate('/support');
            // Also try to open the dialog (admin page will listen if loaded)
            if (ticketId) {
                setTimeout(() => openAdminTicketDialog(ticketId), 100); // slight delay to allow navigation
            }
            setIsOpen(false);
            return;
        }

        // Navigate if there's a link
        if (notification.link) {
            navigate(notification.link);
            setIsOpen(false);
        }
    };



    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "proposal_received":
                return "📩";
            case "proposal_accepted":
                return "🎉";
            case "proposal_declined":
                return "😔";
            case "project_closed":
                return "🔒";
            case "project_reopened":
                return "🔓";
            case "project_completed":
            case "work_completed":
                return "✅";
            case "contract_received":
            case "contract_accepted":
                return "📝";
            case "payment_received":
                return "💰";
            case "invitation_received":
                return "✉️";
            case "message_received":
                return "💬";
            default:
                return "📬";
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] font-bold animate-pulse"
                        >
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
                <div className="flex items-center justify-between px-3 py-2 border-b">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                    <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                                onClick={() => markAllAsReadMutation.mutate()}
                                disabled={markAllAsReadMutation.isPending}
                                title="Mark all as read"
                            >
                                <CheckCheck className="h-4 w-4" />
                            </Button>
                        )}
                        {notifications.length > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-red-600"
                                onClick={() => deleteAllMutation.mutate()}
                                disabled={deleteAllMutation.isPending}
                                title="Clear all"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-8 text-center text-muted-foreground">
                            <Bell className="h-8 w-8 mb-2 opacity-50" />
                            <p className="text-sm">No notifications</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={cn(
                                    "flex flex-col items-start gap-1 p-3 cursor-pointer focus:bg-purple-50 dark:focus:bg-purple-900/20 focus:text-black",
                                    !notification.is_read && "bg-blue-50/50 dark:bg-blue-950/20"
                                )}
                                onClick={() => handleNotificationClick(notification)}
                            >
                                <div className="flex items-start gap-2 w-full">
                                    <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className={cn(
                                                "text-sm truncate",
                                                !notification.is_read && "font-semibold"
                                            )}>
                                                {notification.title}
                                            </p>
                                            {!notification.is_read && (
                                                <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground mt-1">
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                    {notification.link && (
                                        <ExternalLink className="h-3 w-3 text-muted-foreground shrink-0" />
                                    )}
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu >
    );
}
