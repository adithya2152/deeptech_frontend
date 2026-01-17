import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Shield, Mail, Phone, Link as LinkIcon, Share2, AlertTriangle, User, Clock } from 'lucide-react';
import { useAdminCircumventionAnalytics } from '@/hooks/useAdmin';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Link } from 'react-router-dom';
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

function formatDate(dateStr: string) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

const typeIcons: Record<string, React.ReactNode> = {
    email: <Mail className="h-4 w-4 text-blue-500" />,
    phone: <Phone className="h-4 w-4 text-green-500" />,
    social_media: <Share2 className="h-4 w-4 text-purple-500" />,
    external_link: <LinkIcon className="h-4 w-4 text-orange-500" />,
};

const typeLabels: Record<string, string> = {
    email: 'Email',
    phone: 'Phone Number',
    social_media: 'Social Media',
    external_link: 'External Link',
};

export default function CircumventionAnalytics() {
    const [days, setDays] = useState(30);
    const { data, isLoading, error } = useAdminCircumventionAnalytics({ days, limit: 100 });

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex h-[80vh] items-center justify-center">
                    <Loader2 className="h-10 w-10 animate-spin text-zinc-900" />
                </div>
            </AdminLayout>
        );
    }

    if (error) {
        return (
            <AdminLayout>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Circumvention Detection</h1>
                    <p className="text-zinc-500">Failed to load analytics.</p>
                    <pre className="text-xs text-red-600 bg-red-50 border border-red-100 rounded p-3 overflow-auto">
                        {String((error as any)?.message || error)}
                    </pre>
                </div>
            </AdminLayout>
        );
    }

    const stats = data?.stats || {
        total_attempts: 0,
        unique_users: 0,
        email_attempts: 0,
        phone_attempts: 0,
        social_media_attempts: 0,
        link_attempts: 0,
    };
    const trend = data?.trend || [];
    const topUsers = data?.topUsers || [];
    const recentAttempts = data?.recentAttempts || [];

    const hasData = parseInt(stats.total_attempts) > 0;

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div className="flex items-start justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
                            <Shield className="h-7 w-7 text-red-600" />
                            Circumvention Detection
                        </h1>
                        <p className="text-zinc-500 mt-2">
                            Monitor users attempting to share contact information to move conversations off-platform.
                        </p>
                    </div>

                    <Select value={String(days)} onValueChange={(v) => setDays(parseInt(v))}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Time range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7">Last 7 days</SelectItem>
                            <SelectItem value="30">Last 30 days</SelectItem>
                            <SelectItem value="90">Last 90 days</SelectItem>
                            <SelectItem value="365">Last year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-zinc-200 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-600">Total Attempts</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-zinc-900">{parseInt(stats.total_attempts).toLocaleString()}</div>
                            <p className="text-xs text-zinc-500 mt-1">Blocked messages</p>
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-200 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-600">Unique Users</CardTitle>
                            <User className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-zinc-900">{parseInt(stats.unique_users).toLocaleString()}</div>
                            <p className="text-xs text-zinc-500 mt-1">Users who attempted</p>
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-200 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-600">Email Attempts</CardTitle>
                            <Mail className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-zinc-900">{parseInt(stats.email_attempts).toLocaleString()}</div>
                            <p className="text-xs text-zinc-500 mt-1">Email addresses detected</p>
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-200 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-600">Phone Attempts</CardTitle>
                            <Phone className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-zinc-900">{parseInt(stats.phone_attempts).toLocaleString()}</div>
                            <p className="text-xs text-zinc-500 mt-1">Phone numbers detected</p>
                        </CardContent>
                    </Card>
                </div>

                {!hasData ? (
                    <Card className="border-zinc-200 shadow-sm p-8">
                        <div className="flex flex-col items-center justify-center text-center">
                            <Shield className="h-16 w-16 text-zinc-300 mb-4" />
                            <h3 className="text-lg font-semibold text-zinc-900">No Circumvention Attempts Detected</h3>
                            <p className="text-zinc-500 mt-2 max-w-md">
                                No users have attempted to share contact information off-platform in the selected time period.
                                This is good news!
                            </p>
                            <p className="text-sm text-zinc-400 mt-4">
                                The circumvention logging table may not be set up yet. Contact detection is handled client-side.
                            </p>
                        </div>
                    </Card>
                ) : (
                    <>
                        <div className="grid gap-4 lg:grid-cols-2">
                            {/* Top Offenders */}
                            <Card className="border-zinc-200 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                                        Top Offenders
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {topUsers.length ? (
                                        <div className="space-y-2">
                                            {topUsers.map((u: any) => (
                                                <div key={u.user_id} className="flex items-center justify-between gap-4 p-2 hover:bg-zinc-50 rounded">
                                                    <div className="min-w-0">
                                                        <Link
                                                            to={`/admin/users/${u.user_id}`}
                                                            className="font-medium text-zinc-900 hover:underline truncate block"
                                                        >
                                                            {u.first_name} {u.last_name}
                                                        </Link>
                                                        <div className="text-xs text-zinc-500 truncate">{u.email}</div>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <div className="font-semibold text-zinc-900">{parseInt(u.attempt_count)} attempts</div>
                                                        <div className="text-xs text-zinc-500">Last: {formatDate(u.last_attempt)}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-zinc-500">No data.</div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Breakdown by Type */}
                            <Card className="border-zinc-200 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-base font-semibold">Detection Breakdown</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Mail className="h-4 w-4 text-blue-500" />
                                                <span className="text-sm text-zinc-700">Email Addresses</span>
                                            </div>
                                            <Badge variant="secondary">{parseInt(stats.email_attempts).toLocaleString()}</Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-green-500" />
                                                <span className="text-sm text-zinc-700">Phone Numbers</span>
                                            </div>
                                            <Badge variant="secondary">{parseInt(stats.phone_attempts).toLocaleString()}</Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Share2 className="h-4 w-4 text-purple-500" />
                                                <span className="text-sm text-zinc-700">Social Media Handles</span>
                                            </div>
                                            <Badge variant="secondary">{parseInt(stats.social_media_attempts).toLocaleString()}</Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <LinkIcon className="h-4 w-4 text-orange-500" />
                                                <span className="text-sm text-zinc-700">External Links</span>
                                            </div>
                                            <Badge variant="secondary">{parseInt(stats.link_attempts).toLocaleString()}</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Attempts Table */}
                        <Card className="border-zinc-200 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-zinc-600" />
                                    Recent Attempts
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>User</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Detected Value</TableHead>
                                                <TableHead>Action</TableHead>
                                                <TableHead>Time</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {recentAttempts.length ? (
                                                recentAttempts.slice(0, 20).map((a: any) => (
                                                    <TableRow key={a.id}>
                                                        <TableCell>
                                                            <Link
                                                                to={`/admin/users/${a.user_id}`}
                                                                className="hover:underline font-medium"
                                                            >
                                                                {a.first_name} {a.last_name}
                                                            </Link>
                                                            <div className="text-xs text-zinc-500">{a.user_email}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                {typeIcons[a.detected_type] || <AlertTriangle className="h-4 w-4" />}
                                                                <span>{typeLabels[a.detected_type] || a.detected_type}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <code className="text-xs bg-zinc-100 px-1.5 py-0.5 rounded">
                                                                {a.detected_value?.substring(0, 30)}{a.detected_value?.length > 30 ? '...' : ''}
                                                            </code>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={a.action_taken === 'blocked' ? 'destructive' : 'secondary'}>
                                                                {a.action_taken || 'logged'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-zinc-500 text-sm">
                                                            {formatDate(a.created_at)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center text-zinc-500 py-8">
                                                        No recent attempts recorded.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </AdminLayout>
    );
}
