import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Star, ThumbsUp, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  giver_name: string;
  giver_avatar?: string;
  project_title?: string;
  helpful_count?: number;
}

export interface ReviewsListProps {
  reviews: Review[];
  isLoading: boolean;
  userType?: string; // Changed to string to avoid strict union type issues during development
  currentUserId?: string | null;
  targetUserId?: string | null; // the profile being viewed (expert id)
}

export function ReviewsList({ reviews, isLoading, userType = "User", currentUserId, targetUserId }: ReviewsListProps) {
  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading reviews...</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="py-12 text-center border-2 border-dashed rounded-xl bg-muted/20">
        <Star className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
        <h3 className="font-semibold text-muted-foreground">No reviews yet</h3>
        <p className="text-sm text-muted-foreground/70">This {userType.toLowerCase()} hasn't received any feedback yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="border-none shadow-sm bg-zinc-50/50">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Avatar className="h-10 w-10 border border-border">
                <AvatarImage src={review.giver_avatar} />
                <AvatarFallback>{review.giver_name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">{review.giver_name}</h4>
                    {review.project_title && (
                      <p className="text-xs text-muted-foreground">Project: {review.project_title}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 bg-white border rounded-full px-2 py-0.5">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-bold">{Number(review.rating).toFixed(1)}</span>
                  </div>
                </div>

                {review.comment?.trim() ? (
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {review.comment.trim()}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No written review provided.
                  </p>
                )}

                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}