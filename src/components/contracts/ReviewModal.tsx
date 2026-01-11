import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2, ThumbsUp } from "lucide-react";
import { contractsApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface ReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractId: string;
  recipientName: string;
  onSuccess?: () => void;
}

const RATING_LABELS: Record<number, string> = {
  1: "Very Poor",
  2: "Poor",
  3: "Average",
  4: "Good",
  5: "Excellent"
};

export function ReviewModal({ open, onOpenChange, contractId, recipientName, onSuccess }: ReviewModalProps) {
  const { token } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    if (!token) return;

    setLoading(true);
    try {
      await contractsApi.submitFeedback(contractId, rating, comment, token);
      toast.success("Review submitted successfully");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const currentRating = hoverRating || rating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-display">Contract Feedback</DialogTitle>
          <DialogDescription className="text-base">
            Share your experience working with <span className="font-semibold text-foreground">{recipientName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-8 py-6">
          <div className="space-y-4">
            <div className="text-center">
              <Label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Overall Rating</Label>
              <div className="flex justify-center gap-3 mt-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="group focus:outline-none transition-transform hover:scale-110 p-1"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={`w-10 h-10 transition-colors duration-200 ${
                        star <= currentRating
                          ? "fill-amber-400 text-amber-400"
                          : "fill-muted/20 text-muted-foreground/20 group-hover:text-amber-400/50"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="h-6 mt-2">
                {currentRating > 0 && (
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                    currentRating >= 4 ? 'bg-emerald-100 text-emerald-700' :
                    currentRating === 3 ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {RATING_LABELS[currentRating]}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Public Review</Label>
            <div className="relative">
              <Textarea
                placeholder={`What was it like to work with ${recipientName}? Mention their skills, communication, and quality of work.`}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="resize-none min-h-[140px] text-base p-4"
              />
              <div className="absolute bottom-3 right-3">
                <ThumbsUp className="h-4 w-4 text-muted-foreground/30" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Your review will be posted publicly on {recipientName}'s profile.
            </p>
          </div>
        </div>

        <DialogFooter className="sm:justify-between flex-col sm:flex-row gap-3 border-t pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || rating === 0} 
            className="min-w-[140px] font-semibold"
            size="lg"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}