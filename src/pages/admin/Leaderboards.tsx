import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { scoringApi } from "@/lib/api";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminLeaderboards() {
    const { token } = useAuth();
    const [sortBy, setSortBy] = useState<"score" | "earnings">("earnings");

    const { data } = useQuery({
        queryKey: ["scoring:leaderboard:admin", sortBy],
        queryFn: () =>
            scoringApi.getLeaderboard(token, { limit: 50, role: "expert", sortBy }),
        enabled: !!token,
    });

    const rows = data?.data || [];

    const title = useMemo(() => {
        return sortBy === "earnings" ? "Highest Earners (Paid Invoices)" : "Top Experts (Score)";
    }, [sortBy]);

    return (
        <AdminLayout>
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
                <Card className="shadow-sm border-slate-200">
                    <CardHeader>
                        <div className="flex items-center justify-between gap-4">
                            <CardTitle className="text-xl font-semibold text-slate-900">
                                {title}
                            </CardTitle>

                            <div className="w-[260px]">
                                <Select value={sortBy} onValueChange={(v: "score" | "earnings") => setSortBy(v)}>
                                    <SelectTrigger className="h-9">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="earnings">Highest Earners</SelectItem>
                                        <SelectItem value="score">Highest Score</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="text-left text-slate-500 border-b">
                                        <th className="py-2 pr-4">#</th>
                                        <th className="py-2 pr-4">Expert</th>
                                        {sortBy === "earnings" ? (
                                            <>
                                                <th className="py-2 pr-4">Total Earned</th>
                                                <th className="py-2 pr-4">Invoices Paid</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="py-2 pr-4">Score</th>
                                                <th className="py-2 pr-4">Tier</th>
                                            </>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((r, idx) => (
                                        <tr
                                            key={r.user_id}
                                            className="border-b hover:bg-slate-50/50"
                                        >
                                            <td className="py-2 pr-4 font-mono text-slate-500">
                                                {idx + 1}
                                            </td>
                                            <td className="py-2 pr-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={r.avatar_url || undefined} />
                                                        <AvatarFallback>
                                                            {(r.first_name || "U")[0]}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="text-slate-900 font-medium">
                                                            {r.first_name} {r.last_name}
                                                        </div>
                                                        <div className="text-slate-500 text-xs">
                                                            {r.user_id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            {sortBy === "earnings" ? (
                                                <>
                                                    <td className="py-2 pr-4 font-semibold text-slate-900">
                                                        ${Number(r.total_earned || 0).toLocaleString()}
                                                    </td>
                                                    <td className="py-2 pr-4 text-slate-700">
                                                        {Number(r.invoices_paid || 0)}
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="py-2 pr-4 font-semibold text-slate-900">
                                                        {Math.round(r.overall_score)}
                                                    </td>
                                                    <td className="py-2 pr-4 text-slate-700">
                                                        {r.tier_name} (L{r.tier_level})
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}