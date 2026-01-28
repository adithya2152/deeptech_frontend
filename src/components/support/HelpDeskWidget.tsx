import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    MessageSquarePlus,
    X,
    Loader2,
    Paperclip,
    ChevronLeft,
    History,
    Bug,
    CreditCard,
    User,
    Send,
    ChevronRight,
    ImageIcon,
    Trash2
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/AuthContext";
import { helpDeskApi } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const formSchema = z.object({
    type: z.enum(["technical", "billing", "account", "other"]),
    subject: z.string().min(3, "Subject must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
});

type View = "home" | "form";

export function HelpDeskWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [view, setView] = useState<View>("home");
    const { token, user } = useAuth();

    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const navigate = useNavigate();

    // Default form values state to prepopulate from quick actions
    const [defaultValues, setDefaultValues] = useState<Partial<z.infer<typeof formSchema>>>({
        type: "technical",
        priority: "medium",
        subject: "",
        description: "",
    });

    // Reset view when closed
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => setView("home"), 200);
        }
    }, [isOpen]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues,
        values: defaultValues as any // Force update when state changes
    });

    // Fetch active tickets count
    const { data: myTickets } = useQuery({
        queryKey: ["my-tickets-summary"],
        queryFn: async () => helpDeskApi.getMyTickets(token!),
        enabled: !!token && isOpen,
        staleTime: 60000 // 1 minute
    });

    const activeTicketsCount = myTickets?.tickets?.filter((t: any) =>
        t.status !== 'closed' && t.status !== 'resolved'
    ).length || 0;

    const createTicketMutation = useMutation({
        mutationFn: async (values: z.infer<typeof formSchema>) => {
            const ticketData = {
                ...values,
                attachments: files
            };
            return await helpDeskApi.create(ticketData, token!);
        },
        onSuccess: () => {
            toast.success("Message sent! We'll get back to you shortly.");
            setIsOpen(false);
            form.reset();
            setFiles([]);
            setView("home");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to submit ticket");
        },
    });

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        createTicketMutation.mutate(values);
    };

    const handleQuickAction = (type: "technical" | "billing" | "account" | "other", subjectPrefix: string) => {
        setDefaultValues({
            type,
            priority: "medium",
            subject: subjectPrefix,
            description: ""
        });
        setView("form");
    };

    // File handling
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Drag and Drop
    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            setFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
        }
    }, []);

    // Paste handling
    const onPaste = useCallback((e: React.ClipboardEvent) => {
        if (e.clipboardData.files && e.clipboardData.files.length > 0) {
            e.preventDefault();
            setFiles(prev => [...prev, ...Array.from(e.clipboardData.files)]);
            toast.info("Image pasted from clipboard");
        }
    }, []);


    // HIDE FOR ADMINS (Placed safely after all hooks)
    if (user?.role === 'admin') return null;
    if (!token) return null;

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    className={cn(
                        "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl z-50 transition-all duration-300 hover:scale-110 hover:shadow-primary/25",
                        isOpen ? "rotate-90 bg-destructive hover:bg-destructive/90" : "bg-primary"
                    )}
                    size="icon"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <MessageSquarePlus className="h-6 w-6" />}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-[380px] p-0 overflow-hidden shadow-2xl border-none rounded-2xl mr-6 mb-4 animate-in slide-in-from-bottom-5 fade-in-20 duration-300"
                align="end"
                side="top"
            >
                {/* Header - Changes based on view */}
                <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 rotate-12">
                        <MessageSquarePlus className="h-24 w-24" />
                    </div>

                    {view === "home" ? (
                        <>
                            <h3 className="font-bold text-xl tracking-tight">Hello, {user?.first_name || "there"}! 👋</h3>
                            <p className="text-primary-foreground/80 text-sm mt-1">
                                How can we help you today?
                            </p>
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary-foreground hover:bg-white/20 -ml-2"
                                onClick={() => setView("home")}
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                            <div>
                                <h3 className="font-bold text-lg">New Request</h3>
                                <p className="text-primary-foreground/80 text-xs">We usually reply within a few hours</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Body Content */}
                <div className="bg-background min-h-[300px] max-h-[600px] overflow-y-auto">
                    {view === "home" ? (
                        <div className="p-4 space-y-6">
                            {/* Active Tickets Banner */}
                            <div
                                className="bg-muted/50 rounded-xl p-3 flex items-center justify-between cursor-pointer hover:bg-muted transition-colors group border border-border/50"
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate("/support");
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                        <History className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Your Tickets</p>
                                        <p className="text-xs text-muted-foreground">{activeTicketsCount} active conversations</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                            </div>

                            {/* Quick Actions */}
                            <div className="space-y-2">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">Start a conversation</p>
                                <div className="grid grid-cols-1 gap-2">
                                    <Button variant="outline" className="justify-start h-auto py-3 px-4 border-muted hover:border-primary/50 hover:bg-primary/5 transition-all text-left" onClick={() => handleQuickAction("technical", "Bug Report: ")}>
                                        <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-900/20 text-red-500 flex items-center justify-center mr-3 shrink-0">
                                            <Bug className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <span className="font-medium text-sm block">Report a Bug</span>
                                            <span className="text-xs text-muted-foreground font-normal">Something's not working right</span>
                                        </div>
                                    </Button>

                                    <Button variant="outline" className="justify-start h-auto py-3 px-4 border-muted hover:border-primary/50 hover:bg-primary/5 transition-all text-left" onClick={() => handleQuickAction("billing", "Billing Question: ")}>
                                        <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/20 text-green-500 flex items-center justify-center mr-3 shrink-0">
                                            <CreditCard className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <span className="font-medium text-sm block">Billing & Payments</span>
                                            <span className="text-xs text-muted-foreground font-normal">Invoices, fees, or refunds</span>
                                        </div>
                                    </Button>

                                    <Button variant="outline" className="justify-start h-auto py-3 px-4 border-muted hover:border-primary/50 hover:bg-primary/5 transition-all text-left" onClick={() => handleQuickAction("account", "Account Help: ")}>
                                        <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/20 text-purple-500 flex items-center justify-center mr-3 shrink-0">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <span className="font-medium text-sm block">Account Support</span>
                                            <span className="text-xs text-muted-foreground font-normal">Profile, settings, or access</span>
                                        </div>
                                    </Button>
                                </div>
                            </div>

                            {/* Send Message Button */}
                            <Button className="w-full gap-2 py-6 bg-primary/10 text-primary hover:bg-primary/20 shadow-none border-0" onClick={() => {
                                setDefaultValues({ type: "other", subject: "", description: "" });
                                setView("form");
                            }}>
                                <Send className="h-4 w-4" />
                                Send us a message
                            </Button>
                        </div>
                    ) : (
                        <div className="p-4">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Topic</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-9">
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="technical">Technical Issue</SelectItem>
                                                        <SelectItem value="billing">Billing & Payments</SelectItem>
                                                        <SelectItem value="account">Account Support</SelectItem>
                                                        <SelectItem value="other">General Inquiry</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="subject"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Subject</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="What's this about?" {...field} className="h-9" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Message</FormLabel>
                                                <FormControl>
                                                    <div
                                                        className={cn(
                                                            "flex flex-col relative rounded-md border border-input focus-within:ring-1 focus-within:ring-ring transition-colors bg-background overflow-hidden",
                                                            isDragging && "border-primary bg-primary/5 ring-1 ring-primary"
                                                        )}
                                                        onDragOver={onDragOver}
                                                        onDragLeave={onDragLeave}
                                                        onDrop={onDrop}
                                                        onPaste={onPaste}
                                                    >
                                                        <Textarea
                                                            placeholder="Describe your issue... (Paste screenshots here)"
                                                            className="min-h-[120px] max-h-[300px] resize-none border-0 focus-visible:ring-0 bg-transparent rounded-none shadow-none p-3 focus:bg-transparent active:bg-transparent"
                                                            {...field}
                                                        />

                                                        {/* File Attachments Area */}
                                                        <div className="p-2 border-t border-border/50 bg-muted/30">
                                                            {files.length > 0 && (
                                                                <div className="flex flex-wrap gap-2 mb-2">
                                                                    {files.map((file, idx) => (
                                                                        <div
                                                                            key={idx}
                                                                            className="flex items-center gap-1 bg-background border px-2 py-1 rounded-md text-xs group relative shadow-sm cursor-pointer hover:bg-muted/50 transition-colors"
                                                                            onClick={() => {
                                                                                const url = URL.createObjectURL(file);
                                                                                window.open(url, '_blank');
                                                                                setTimeout(() => URL.revokeObjectURL(url), 5000);
                                                                            }}
                                                                            title="Click to preview"
                                                                        >
                                                                            <span className="truncate max-w-[100px]">{file.name}</span>
                                                                            <Button
                                                                                type="button"
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-4 w-4 ml-1 hover:bg-destructive/10 hover:text-destructive rounded-full"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    removeFile(idx);
                                                                                }}
                                                                            >
                                                                                <X className="h-3 w-3" />
                                                                            </Button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}

                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-1">
                                                                    <Input
                                                                        type="file"
                                                                        multiple
                                                                        className="hidden"
                                                                        id="file-upload"
                                                                        onChange={handleFileSelect}
                                                                        accept="image/*,application/pdf,.doc,.docx"
                                                                    />
                                                                    <Input
                                                                        type="file"
                                                                        multiple
                                                                        className="hidden"
                                                                        id="image-upload"
                                                                        onChange={handleFileSelect}
                                                                        accept="image/*"
                                                                    />
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-8 px-2 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                                                        onClick={() => document.getElementById("file-upload")?.click()}
                                                                    >
                                                                        <Paperclip className="h-3 w-3 mr-1" />
                                                                        Attach
                                                                    </Button>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-8 px-2 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                                                        onClick={() => document.getElementById("image-upload")?.click()}
                                                                    >
                                                                        <ImageIcon className="h-3 w-3 mr-1" />
                                                                        Image
                                                                    </Button>
                                                                </div>
                                                                <span className="text-[10px] text-muted-foreground hidden sm:inline-block opacity-70">
                                                                    Drag & drop or paste
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button type="submit" className="w-full" disabled={createTicketMutation.isPending}>
                                        {createTicketMutation.isPending ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            "Send Message"
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}

