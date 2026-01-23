import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Zap,
  Award,
  ShieldCheck,
  Activity,
  ThumbsUp,
  BrainCircuit,
  Star,
} from "lucide-react";

export interface ScoreBreakdownProps {
  expertise: number;
  performance: number;
  reliability: number;
  quality: number;
  engagement: number;
  overall: number;
}

function Bar({
  value,
  color,
  delay = 0,
}: {
  value: number;
  color: string;
  delay?: number;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, delay, ease: "easeOut" }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  );
}

export const ScoreBreakdownCard = ({
  expertise = 0,
  performance = 0,
  reliability = 0,
  quality = 0,
  engagement = 0,
  overall = 0,
}: ScoreBreakdownProps) => {
    const safeOverall = Number(overall) || 0;

  const categories = [
    {
      label: 'Expertise',
      value: expertise,
      icon: BrainCircuit,
      color: "bg-blue-500",
      text: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: 'Performance',
      value: performance,
      icon: Zap,
      color: "bg-emerald-500",
      text: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: 'Reliability',
      value: reliability,
      icon: ShieldCheck,
      color: "bg-amber-500",
      text: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: 'Quality',
      value: quality,
      icon: Award,
      color: "bg-pink-500",
      text: "text-pink-600",
      bg: "bg-pink-50",
    },
    {
      label: 'Engagement',
      value: engagement,
      icon: ThumbsUp,
      color: "bg-violet-500",
      text: "text-violet-600",
      bg: "bg-violet-50",
    },
  ];

  return (
    <Card className="h-full shadow-none border border-slate-200 overflow-hidden">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            {'Score Breakdown'}
          </CardTitle>
          <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border shadow-sm">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="font-bold text-slate-800">
              {safeOverall.toFixed(0)}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 100</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 grid grid-cols-1 gap-y-4">
        <div className="mb-4">
          <div className="flex justify-between items-end mb-2">
            <div className="text-sm font-medium text-slate-600">
              {'Overall Reputation'}
            </div>
            <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              {safeOverall.toFixed(0)}%
            </div>
          </div>
          <Bar
            value={safeOverall}
            color="bg-gradient-to-r from-indigo-500 to-violet-500"
          />
        </div>

        {categories.map((cat, i) => (
          <div key={cat.label} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${cat.bg}`}>
                  <cat.icon className={`w-3.5 h-3.5 ${cat.text}`} />
                </div>
                <span className="text-sm font-medium text-slate-700">
                  {cat.label}
                </span>
              </div>
              <span className="text-sm font-bold text-slate-900">
                {Math.round(Number(cat.value) || 0)}
              </span>
            </div>
            <Bar
              value={Number(cat.value) || 0}
              color={cat.color}
              delay={i * 0.1}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};