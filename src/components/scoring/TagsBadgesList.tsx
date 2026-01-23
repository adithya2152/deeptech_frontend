import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Medal } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface TagItem {
  tag_name: string;
  tag_category: string;
  tag_icon?: string | null;
  description?: string | null;
  display_priority?: number;
}

export const TagsBadgesList = ({ tags }: { tags: TagItem[] }) => {
    const sorted = [...tags].sort(
    (a, b) => (a.display_priority ?? 100) - (b.display_priority ?? 100)
  );

  return (
    <Card className="h-full shadow-none border border-slate-200">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Medal className="w-5 h-5 text-amber-500" />
          {'Achievements & Badges'}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {sorted.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Medal className="w-6 h-6 text-slate-300" />
            </div>
            <p className="text-slate-500 text-sm">
              {'No badges yet. Keep up the great work!'}
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            <TooltipProvider>
              {sorted.map((t) => (
                <Tooltip key={t.tag_name}>
                  <TooltipTrigger asChild>
                    <div className="group relative cursor-help">
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                      <Badge
                        variant="outline"
                        className="relative pl-2 pr-3 py-1.5 bg-white border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all duration-300 flex items-center gap-2 text-sm font-medium text-slate-700"
                      >
                        <span className="text-lg">
                          {t.tag_icon || "🏅"}
                        </span>
                        {t.tag_name}
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px] text-xs">
                    <p className="font-semibold mb-1">{t.tag_category}</p>
                    <p className="text-slate-300">
                      {t.description || "Earned for outstanding performance."}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
        )}
      </CardContent>
    </Card>
  );
};