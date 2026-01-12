import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface ScoreBreakdownProps {
  expertise: number;
  performance: number;
  reliability: number;
  quality: number;
  engagement: number;
  overall: number;
}

function Bar({ value, color }: { value: number; color: string }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="h-2 w-full bg-slate-200 rounded">
      <div className={`h-2 rounded ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export const ScoreBreakdownCard = ({
  expertise,
  performance,
  reliability,
  quality,
  engagement,
  overall,
}: ScoreBreakdownProps) => {
  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-slate-700">
          Score Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500">Overall</div>
          <div className="font-semibold text-slate-900">
            {overall.toFixed(0)} / 100
          </div>
        </div>
        <Bar value={overall} color="bg-violet-500" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Expertise</span>
              <span className="text-slate-900 font-medium">
                {Math.round(expertise)}
              </span>
            </div>
            <Bar value={expertise} color="bg-blue-500" />
          </div>
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Performance</span>
              <span className="text-slate-900 font-medium">
                {Math.round(performance)}
              </span>
            </div>
            <Bar value={performance} color="bg-emerald-500" />
          </div>
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Reliability</span>
              <span className="text-slate-900 font-medium">
                {Math.round(reliability)}
              </span>
            </div>
            <Bar value={reliability} color="bg-amber-500" />
          </div>
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Quality</span>
              <span className="text-slate-900 font-medium">
                {Math.round(quality)}
              </span>
            </div>
            <Bar value={quality} color="bg-pink-500" />
          </div>
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Engagement</span>
              <span className="text-slate-900 font-medium">
                {Math.round(engagement)}
              </span>
            </div>
            <Bar value={engagement} color="bg-slate-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};