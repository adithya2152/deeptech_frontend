import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { scoringApi } from "@/lib/api";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "@/hooks/useCurrency";
import { Trophy, DollarSign } from "lucide-react";

export default function ExpertsLeaderboard() {
    const { token } = useAuth();
  const navigate = useNavigate();
  const { convertAndFormat } = useCurrency();
  const [sortBy, setSortBy] = useState<"score" | "earnings">("score");

  const { data } = useQuery({
    queryKey: ["scoring:leaderboard:experts", sortBy],
    queryFn: () =>
      scoringApi.getLeaderboard(token, { limit: 50, role: "expert", sortBy }),
    enabled: !!token,
  });

  const rows = data?.data || [];

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-slate-900">
            {'Expert Leaderboard'}
          </h1>
          <div className="flex items-center gap-3">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as "score" | "earnings")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={'Sort By'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="score">
                  <span className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-violet-500" />
                    {'Top Performers'}
                  </span>
                </SelectItem>
                <SelectItem value="earnings">
                  <span className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                    {'Highest Earners'}
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => navigate("/experts")}>
              {'Discover Experts'}
            </Button>
          </div>
        </div>
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-slate-700">
              {sortBy === "earnings" ? 'Highest Earners' : 'Top Performers'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rows.map((r: any, idx: number) => (
                <div
                  key={r.user_id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="font-mono text-slate-500 w-6 text-center">
                    #{idx + 1}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={r.avatar_url || undefined} />
                    <AvatarFallback>{(r.first_name || "U")[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-slate-900 font-semibold truncate">
                      {r.first_name} {r.last_name}
                    </div>
                    <div className="text-slate-500 text-xs">
                      {r.tier_name} · L{r.tier_level}
                      {r.contracts_completed > 0 && ` · ${r.contracts_completed} ${'contracts'}`}
                    </div>
                  </div>
                  <div className="text-right">
                    {sortBy === "earnings" ? (
                      <div className="text-emerald-600 font-bold">
                        {convertAndFormat(Number(r.total_earned || 0), 'INR')}
                      </div>
                    ) : (
                      <div className="text-violet-600 font-bold">
                        {Math.round(r.overall_score)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {rows.length === 0 && (
                <div className="col-span-full text-center py-8 text-slate-500">
                  {'No experts found yet.'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}