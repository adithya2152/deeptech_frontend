import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { scoringApi } from "@/lib/api";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function ExpertsLeaderboard() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["scoring:leaderboard:experts"],
    queryFn: () =>
      scoringApi.getLeaderboard(token, { limit: 50, role: "expert" }),
    enabled: !!token,
  });

  const rows = data?.data || [];

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">
            Experts Leaderboard
          </h1>
          <Button variant="outline" onClick={() => navigate("/experts")}>
            Discover Experts
          </Button>
        </div>
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-slate-700">
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rows.map((r, idx) => (
                <div
                  key={r.user_id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-sm"
                >
                  <div className="font-mono text-slate-500">#{idx + 1}</div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={r.avatar_url || undefined} />
                    <AvatarFallback>{(r.first_name || "U")[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-slate-900 font-semibold">
                      {r.first_name} {r.last_name}
                    </div>
                    <div className="text-slate-500 text-xs">
                      {r.tier_name} · L{r.tier_level}
                    </div>
                  </div>
                  <div className="text-violet-600 font-bold">
                    {Math.round(r.overall_score)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}