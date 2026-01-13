import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, Trophy } from "lucide-react";

export interface RankTierProps {
  tier_name: string;
  tier_level: number; // 1-10
  overall: number; // for progress
  badge_icon?: string | null;
  description?: string | null;
}

export const RankTierCard = ({
  tier_name,
  tier_level,
  overall,
  badge_icon,
  description,
}: RankTierProps) => {
  const nextLevel = Math.min(10, tier_level + 1);
  const nextThreshold = [0, 20, 35, 50, 65, 75, 85, 92, 97, 99, 100][nextLevel];
  const progress = Math.max(
    0,
    Math.min(100, Math.round((overall / nextThreshold) * 100))
  );

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
              className="w-full justify-center py-1.5 bg-white/50 border-violet-200 text-violet-700 hover:bg-white transition-colors cursor-default"
            >
              <Trophy className="w-3 h-3 mr-1.5" />
              Top {100 - Math.round(overall)}% of Experts
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};