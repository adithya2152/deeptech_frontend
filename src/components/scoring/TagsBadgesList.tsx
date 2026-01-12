import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <Card className="shadow-sm border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-slate-700">
          Achievements & Badges
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <div className="text-slate-500 text-sm">
            No badges yet. Keep up the great work!
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {sorted.map((t) => (
              <Badge key={t.tag_name} variant="outline" className="bg-slate-50">
                {t.tag_icon ? <span className="mr-1">{t.tag_icon}</span> : null}
                {t.tag_name}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};