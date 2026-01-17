import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, Trophy } from "lucide-react";

export interface RankTierProps {
  tier_name: string;
  tier_level: number; // 1-10
  overall: number; // for progress
  badge_icon?: string | null;
  description?: string | null;
  top_percentile?: number; // Real percentile from backend
  rank_position?: number | null;
  total_experts?: number;
}

export const RankTierCard = ({
  tier_name,
  tier_level,
  overall,
  badge_icon,
  description,
  top_percentile,
  rank_position,
  total_experts,
}: RankTierProps) => {
  const navigate = useNavigate();
  const nextLevel = Math.min(10, tier_level + 1);
  const nextThreshold = [0, 20, 35, 50, 65, 75, 85, 92, 97, 99, 100][nextLevel];
  const progress = Math.max(
    0,
    Math.min(100, Math.round((overall / nextThreshold) * 100))
  );

  // Use real percentile if available, otherwise estimate from score
  const displayPercentile = top_percentile ?? Math.max(1, 100 - Math.round(overall));

  return (
    <Card className="h-full shadow-none border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Crown className="w-32 h-32 rotate-12 text-violet-600" />
      </div>

      <CardContent className="pt-6 relative z-10">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-violet-500 blur-xl opacity-20 rounded-full animate-pulse" />
            <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl rotate-3 flex items-center justify-center shadow-lg text-4xl border-4 border-white">
              {badge_icon || "👑"}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
              <div className="bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Lvl {tier_level}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 flex items-center justify-center gap-2">
              {tier_name}
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            </h3>
            {description && (
              <p className="text-sm text-slate-500 mt-1 max-w-[200px] mx-auto leading-tight">
                {description}
              </p>
            )}
          </div>

          <div className="w-full space-y-2 pt-2">
            <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span>Current Score</span>
              <span>Next Level</span>
            </div>
            <div className="h-3 w-full bg-slate-200/50 rounded-full overflow-hidden border border-slate-100 p-[2px]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 shadow-[0_0_10px_rgba(167,139,250,0.5)] relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]" />
              </motion.div>
            </div>
            <div className="flex justify-between text-xs text-slate-500 font-medium">
              <span>{Math.round(overall)} XP</span>
              <span>{nextThreshold} XP</span>
            </div>
          </div>

          <div className="pt-2 w-full">
            <Badge
              variant="outline"
              className="w-full justify-center py-2 bg-white/50 border-violet-200 text-violet-700 hover:bg-violet-50 hover:border-violet-300 transition-all cursor-pointer group"
              onClick={() => navigate("/experts/leaderboard")}
            >
              <Trophy className="w-3.5 h-3.5 mr-1.5 group-hover:text-amber-500 transition-colors" />
              <span className="font-semibold">Top {displayPercentile}%</span>
              <span className="ml-1 text-slate-500">of Experts</span>
              {rank_position && total_experts && (
                <span className="ml-2 text-xs text-slate-400">
                  (#{rank_position} of {total_experts})
                </span>
              )}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};