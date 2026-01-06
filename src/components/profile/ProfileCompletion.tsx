import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, ArrowRight, AlertCircle, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProfileCompletionProps {
  formData: any;
  isExpert: boolean;
  onEditSection: (section: string) => void;
  expertStatus?: string;
}

export function ProfileCompletion({ formData, isExpert, onEditSection, expertStatus }: ProfileCompletionProps) {
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  if (!isExpert) return null;

  const hasCredentials =
    (formData.projects && formData.projects.length > 0) ||
    (formData.products && formData.products.length > 0) ||
    (formData.patents && formData.patents.length > 0) ||
    (formData.papers && formData.papers.length > 0) ||
    (formData.certificates && formData.certificates.length > 0) ||
    (formData.awards && formData.awards.length > 0);

  const criteria = [
    { label: 'Basic Info', filled: !!formData.first_name && !!formData.last_name, weight: 10, required: true },

    { label: 'Profile Photo', filled: !!formData.avatar_url, weight: 10, required: true },
    { label: 'Profile Video', filled: !!formData.profile_video_url, weight: 10, required: true },

    {
      label: 'Professional Summary', filled: !!formData.bio && formData.bio.length > 50, weight: 15, required: true,
      warning: (formData.bio && formData.bio.length <= 50) ? `Too short (${formData.bio?.length || 0}/50 chars)` : null
    },

    { label: 'Resume', filled: (formData.documents || []).some((d: any) => d.document_type === 'resume'), weight: 15, required: true },

    { label: 'Expertise Domains', filled: (formData.domains || []).length > 0, weight: 10, required: true },
    { label: 'Specific Skills', filled: (formData.skills || []).length > 0, weight: 10, required: true },

    { label: 'Engagement Rates', filled: Number(formData.avg_daily_rate) > 0 || Number(formData.avg_sprint_rate) > 0, weight: 10, required: true },
    { label: 'Years of Experience', filled: Number(formData.years_experience) > 0, weight: 5, required: true },
    { label: 'Languages', filled: (formData.languages || []).length > 0, weight: 5, required: true },

    { label: 'Portfolio / Website', filled: !!formData.portfolio_url, weight: 0, required: false },
    { label: 'Patents and Papers', filled: hasCredentials, weight: 0, required: false },
  ];

  const requiredCriteria = criteria.filter(c => c.required);
  const totalWeight = requiredCriteria.reduce((acc, curr) => acc + curr.weight, 0);
  const currentWeight = requiredCriteria.reduce((acc, curr) => acc + (curr.filled ? curr.weight : 0), 0);

  const rawScore = Math.round((currentWeight / totalWeight) * 100);
  const score = Math.min(100, rawScore);

  const nextStep = requiredCriteria.find(c => !c.filled);

  useEffect(() => {
    if (score === 100 && expertStatus !== 'verified') {
      const hasShown = sessionStorage.getItem('profile_complete_shown');
      if (!hasShown) {
        setShowSuccessDialog(true);
        sessionStorage.setItem('profile_complete_shown', 'true');
      }
    }
  }, [score, expertStatus]);

  return (
    <>
      <Card className="border-zinc-200 shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-zinc-100 bg-zinc-50/50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-600">Profile Strength</CardTitle>
            <span className={`font-bold ${score === 100 ? 'text-emerald-600' : 'text-blue-600'}`}>{score}%</span>
          </div>
          <Progress
            value={score}
            className={`h-2 bg-zinc-100 ${score === 100 ? '[&>div]:bg-emerald-500' : '[&>div]:bg-blue-600'}`}
          />
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {expertStatus === 'verified' ? (
            <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm text-emerald-700 font-bold">
                <ShieldCheck className="h-4 w-4" /> Verified Expert
              </div>
              <p className="text-xs text-emerald-600 leading-relaxed">
                Your profile is live and verified! Keep your availability and portfolio updated to attract the best opportunities.
              </p>
            </div>
          ) : score < 100 && nextStep ? (
            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100">
              <p className="text-[10px] font-bold text-blue-500 uppercase mb-1 tracking-wider">Suggested Action</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-900">{nextStep.label}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-100/50 px-2 text-xs"
                  onClick={() => onEditSection(nextStep.label)}
                >
                  Add <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm text-amber-700 font-bold">
                <Sparkles className="h-4 w-4" /> Profile Submitted
              </div>
              <p className="text-xs text-amber-600 leading-relaxed">
                Great job! Your profile is 100% complete and currently under review by our admin team.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Checklist</p>
            {criteria.map((item) => (
              <div key={item.label} className="flex items-start gap-2.5 text-sm group">
                {item.filled ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : item.warning ? (
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                ) : (
                  <div className={`h-4 w-4 rounded-full border-2 shrink-0 mt-0.5 ${item.required ? 'border-zinc-300' : 'border-zinc-200 border-dashed'}`} />
                )}

                <div className="flex flex-col w-full">
                  <div className="flex justify-between items-center">
                    <span className={`${item.filled ? 'text-zinc-700' : 'text-zinc-500'} ${!item.required && !item.filled ? 'italic' : ''}`}>
                      {item.label}
                    </span>
                    {!item.required && !item.filled && (
                      <span className="text-[10px] bg-zinc-100 text-zinc-400 px-1.5 py-0.5 rounded">Optional</span>
                    )}
                  </div>
                  {!item.filled && item.warning && (
                    <span className="text-[10px] text-amber-600 font-medium">
                      {item.warning}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <DialogTitle className="text-center text-xl">Profile Submitted</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Congratulations! You have completed the core requirements.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100 space-y-4">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-zinc-900">What happens next?</h4>
                <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                  Our admin team will review your background within <strong>24-48 hours</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button className="w-full bg-zinc-900 hover:bg-zinc-800" onClick={() => setShowSuccessDialog(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}