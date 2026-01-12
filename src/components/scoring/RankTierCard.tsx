import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <Card className="shadow-sm border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-slate-700">
          Rank Tier
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {badge_icon && <span className="text-xl">{badge_icon}</span>}
            <div>
              <div className="text-slate-900 font-semibold">{tier_name}</div>
              <div className="text-slate-500 text-sm">
                Level {tier_level} / 10
              </div>
            </div>
          </div>
          <Badge variant="outline" className="bg-slate-50">
            Score {Math.round(overall)}
          </Badge>
        </div>
        {description && <p className="text-slate-600 text-sm">{description}</p>}
        <div className="space-y-1">
          <div className="text-xs text-slate-500">
            Progress to Level {nextLevel}
          </div>
          <div className="h-2 w-full bg-slate-200 rounded">
            <div
              className="h-2 rounded bg-violet-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};