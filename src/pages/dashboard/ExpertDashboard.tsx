import { motion } from "framer-motion";
import {
  Search,
  Briefcase,
  DollarSign,
  TrendingUp,
  Award,
  Zap,
  Clock,
  CheckCircle2,
  ArrowRight,
  Target,
  Bell,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useContracts } from "@/hooks/useContracts";
import { useMarketplaceProjects } from "@/hooks/useProjects";
import { expertsApi, scoringApi } from "@/lib/api";
import { useCurrency } from "@/hooks/useCurrency";
import { ScoreBreakdownCard } from "@/components/scoring/ScoreBreakdownCard";
import { RankTierCard } from "@/components/scoring/RankTierCard";
import { TagsBadgesList } from "@/components/scoring/TagsBadgesList";
// 1. IMPORT THE NEW COMPONENT
import { VerificationAction } from "@/components/experts/VerificationAction";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";


export function ExpertDashboard() {
    const { user, token } = useAuth();
  const navigate = useNavigate();
  const { data: marketplace_projects } = useMarketplaceProjects();
  const { data: contracts } = useContracts();
  const { convertAndFormat } = useCurrency();

  const { data: expertData } = useQuery({
    queryKey: ["expertDashboard", user?.id],
    queryFn: () => expertsApi.getById(user!.id, token!),
    enabled: !!user?.id && !!token,
  });

  // Fetch real dashboard stats (earnings data)
  const { data: dashboardStats } = useQuery({
    queryKey: ["expertDashboardStats", user?.id],
    queryFn: () => expertsApi.getDashboardStats(user!.id, token!),
    enabled: !!user?.id && !!token,
  });

  const expert = expertData?.data;
  const isProfileComplete = expert?.is_profile_complete === true;
  const expertStatus = expert?.expert_status;

  // Real earnings data from API
  // Use totalEarningsINR to avoid double conversion (backend converts, and convertAndFormat converts again)
  const totalEarnings = (dashboardStats?.data as any)?.totalEarningsINR || 0;
  const displayCurrency = dashboardStats?.data?.displayCurrency || 'INR';
  const earningsData = dashboardStats?.data?.earningsChart || [];
  const activeContracts =
    contracts?.filter((c: any) => c.status === "active").length || 0;
  const completedContracts =
    contracts?.filter((c: any) => c.status === "completed").length || 0;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header Section */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {'Welcome Back'}, {user?.first_name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  >
                    <CheckCircle2 className="w-3 h-3 mr-1" /> {'Available for Work'}
                  </Badge>
                  {!isProfileComplete && (
                    <Badge
                      variant="destructive"
                      className="cursor-pointer"
                      onClick={() => navigate("/profile")}
                    >
                      {'Complete Profile'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/proposals")}
                disabled={!isProfileComplete}
              >
                {'My Proposals'}
              </Button>
              <Button
                onClick={() => navigate("/marketplace")}
                className="bg-slate-900 hover:bg-slate-800"
                disabled={!isProfileComplete}
              >
                <Search className="w-4 h-4 mr-2" />
                {'Find Work'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">

        {/* 2. ADD THE VERIFICATION ACTION CARD HERE */}
        <VerificationAction />

        {/* Status Actions */}
        {!isProfileComplete && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Zap className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold text-amber-900">
                  {'Your Profile is Incomplete'}
                </h3>
                <p className="text-sm text-amber-700">
                  {'Complete your expertise profile to get verified and start bidding on projects.'}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => navigate("/profile")}
              className="bg-amber-600 hover:bg-amber-700 text-white border-none"
            >
              {'Complete Now'}
            </Button>
          </motion.div>
        )}

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 md:col-span-2 shadow-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg font-medium text-slate-700">
                {'Earnings Overview'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={earningsData}>
                    <defs>
                      <linearGradient
                        id="colorValue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#8b5cf6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8b5cf6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#E2E8F0"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748B", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#64748B", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      cursor={{ stroke: "#8b5cf6", strokeWidth: 1 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            <StatsWidget
              title={'Total Earnings'}
              value={convertAndFormat(totalEarnings, 'INR')}
              icon={DollarSign}
              color="text-emerald-600"
              bg="bg-emerald-50"
              subtitle={
                <span>
                  {'Lifetime Earnings'} · <button onClick={() => navigate('/settings')} className="text-primary hover:underline">{'Change Currency'}</button>
                </span>
              }
            />
            <StatsWidget
              title={'Active Contracts'}
              value={activeContracts}
              icon={Briefcase}
              color="text-blue-600"
              bg="bg-blue-50"
              subtitle={'Currently in progress'}
            />
            <StatsWidget
              title={'Completed'}
              value={completedContracts}
              icon={Award}
              color="text-violet-600"
              bg="bg-violet-50"
              subtitle={'Successfully delivered'}
            />
          </div>
        </div>

        {/* Scoring & Reputation */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ScoringSection userId={user!.id} token={token!} />
        </div>

        {/* Marketplace Feed */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">
              {'Recommended for You'}
            </h2>
            <Button
              variant="ghost"
              onClick={() => navigate("/marketplace")}
              disabled={!isProfileComplete}
            >
              {'View All'}
            </Button>
          </div>

          {!isProfileComplete ? (
            <Card className="border-dashed bg-slate-50">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 bg-slate-100 rounded-full mb-4">
                  <Briefcase className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="font-semibold text-lg text-slate-900 mb-2">
                  {'Marketplace is Locked'}
                </h3>
                <p className="text-slate-500 max-w-sm mb-6">
                  {'Complete your profile to unlock the marketplace and start bidding on high-value projects.'}
                </p>
                <Button onClick={() => navigate("/profile")}>
                  {'Complete Profile'}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {marketplace_projects?.slice(0, 3).map((project: any) => (
                <Card
                  key={project.id}
                  className="hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <Badge variant="outline" className="mb-2 bg-slate-50">
                        {project.project_type || "Project"}
                      </Badge>
                      <span className="text-xs text-slate-500 font-mono">
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="line-clamp-2 text-lg group-hover:text-blue-600 transition-colors">
                      {project.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-500 text-sm line-clamp-3 mb-4">
                      {project.description}
                    </p>
                    <div className="flex items-center justify-between text-sm mt-auto pt-4 border-t">
                      <span className="font-semibold text-slate-700">
                        {project.budget_min
                          ? `${convertAndFormat(project.budget_min, (project as any).currency)}${project.budget_max ? ` - ${convertAndFormat(project.budget_max, (project as any).currency)}` : '+'}`
                          : 'Negotiable'}
                      </span>
                      <span className="text-slate-500 flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> 7d left
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatsWidget({ title, value, icon: Icon, color, bg, subtitle }: any) {
  return (
    <Card className="border-none shadow-sm flex-1">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
            {subtitle && (
              <p className="text-xs text-slate-400 mt-2">{subtitle}</p>
            )}
          </div>
          <div className={`p-4 rounded-xl ${bg}`}>
            <Icon className={`w-7 h-7 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ScoringSection({ userId, token }: { userId: string; token: string }) {
  const { data: scoreRes } = useQuery({
    queryKey: ["scoring:user", userId],
    queryFn: () => scoringApi.getUserScore(userId, token),
    enabled: !!userId && !!token,
  });

  const { data: rankRes } = useQuery({
    queryKey: ["ranking:user", userId],
    queryFn: () => scoringApi.getUserRank(userId, token),
    enabled: !!userId && !!token,
  });

  const { data: tagsRes } = useQuery({
    queryKey: ["tags:user", userId],
    queryFn: () => scoringApi.getUserTags(userId, token),
    enabled: !!userId && !!token,
  });

  const s = scoreRes?.data;
  const r = rankRes?.data;
  const tags = tagsRes?.data || [];

  return (
    <>
      <div className="lg:col-span-2">
        <ScoreBreakdownCard
          expertise={s?.expertise_score || 0}
          performance={s?.performance_score || 0}
          reliability={s?.reliability_score || 0}
          quality={s?.quality_score || 0}
          engagement={s?.engagement_score || 0}
          overall={s?.overall_score || 0}
        />
      </div>
      <div className="lg:col-span-1 flex flex-col gap-6">
        <div className="flex-1">
          <RankTierCard
            tier_name={r?.tier_name || "Newcomer"}
            tier_level={r?.tier_level || 1}
            overall={s?.overall_score || 0}
            badge_icon={r?.badge_icon}
            description={r?.tier_description}
            top_percentile={r?.top_percentile}
            rank_position={r?.rank_position}
            total_experts={r?.total_experts}
          />
        </div>
        <div className="flex-1">
          <TagsBadgesList
            tags={(tags || []).map((t) => ({
              tag_name: t.tag_name,
              tag_category: t.tag_category,
              tag_icon: t.tag_icon,
              description: t.description,
              display_priority: t.display_priority,
            }))}
          />
        </div>
      </div>
    </>
  );
}