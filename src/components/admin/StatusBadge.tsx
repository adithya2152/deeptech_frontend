import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const statusStyles: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
  verified: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
  approved: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
  resolved: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
  completed: "bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200",
  processed: "bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200",
  pending: "bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200",
  held: "bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200",
  banned: "bg-red-50 text-red-700 hover:bg-red-50 border-red-200",
  rejected: "bg-red-50 text-red-700 hover:bg-red-50 border-red-200",
  cancelled: "bg-zinc-100 text-zinc-600 hover:bg-zinc-100 border-zinc-200",
  draft: "bg-zinc-100 text-zinc-600 hover:bg-zinc-100 border-zinc-200",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalizedStatus = status?.toLowerCase() || "default";
  const style = statusStyles[normalizedStatus] || "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <Badge variant="outline" className={cn("capitalize font-normal", style, className)}>
      {status}
    </Badge>
  );
}