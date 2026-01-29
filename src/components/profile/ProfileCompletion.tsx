import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Sparkles, Building2, User } from 'lucide-react';
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
  isExpert?: boolean;
  isBuyer?: boolean;
  onEditSection: (section: string) => void;
  expertStatus?: string;
}

export function ProfileCompletion({ formData, isExpert, isBuyer, onEditSection, expertStatus }: ProfileCompletionProps) {
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  if (!isExpert && !isBuyer) return null;

  let criteria = [];

  if (isExpert) {
    const summaryText = (formData.experience_summary ?? formData.bio ?? '') as string;

    const hasCredentials =
      (formData.projects && formData.projects.length > 0) ||
      (formData.products && formData.products.length > 0) ||
      (formData.patents && formData.patents.length > 0) ||
      (formData.papers && formData.papers.length > 0) ||
      (formData.certificates && formData.certificates.length > 0) ||
      (formData.awards && formData.awards.length > 0);

    criteria = [
      { label: 'Basic Info', filled: !!formData.first_name && !!formData.last_name && !!formData.username, weight: 10, required: true },
      { label: 'Profile Photo', filled: !!formData.avatar_url, weight: 10, required: true },
      { label: 'Profile Video', filled: !!formData.profile_video_url, weight: 10, required: false },
      {
        label: 'Professional Summary',
        filled: !!summaryText && summaryText.length > 50,
        weight: 15,
        required: true,
        warning: (summaryText && summaryText.length <= 50) ? `Too short (${summaryText.length}/50 chars)` : null
      },
      {
        label: 'Resume',
        filled: !!formData.expert_has_resume || (formData.documents || []).some((d: any) => d.document_type === 'resume'),
        weight: 15,
        required: true
      },
      { label: 'Expertise Domains', filled: (formData.domains || []).length > 0, weight: 10, required: true },
      { label: 'Specific Skills', filled: (formData.skills || []).length > 0, weight: 10, required: true },
      { label: 'Engagement Rates', filled: Number(formData.avg_daily_rate) > 0 || Number(formData.avg_fixed_rate) > 0 || Number(formData.avg_sprint_rate) > 0, weight: 10, required: true },
      { label: 'Years of Experience', filled: Number(formData.years_experience) > 0, weight: 5, required: true },
      { label: 'Languages', filled: (formData.languages || []).length > 0, weight: 5, required: true },
      { label: 'Portfolio / Website', filled: !!formData.portfolio_url, weight: 0, required: false },
      { label: 'Patents and Papers', filled: hasCredentials, weight: 0, required: false },
    ];
  } else if (isBuyer) {
    const clientType = formData.client_type ?? 'individual';
    const isOrg = clientType === 'organisation';

    criteria = [
      { label: 'Basic Info', filled: !!formData.first_name && !!formData.last_name && !!formData.username, weight: 20, required: true },
      { label: 'Profile Photo', filled: !!formData.avatar_url, weight: 20, required: true },
      { label: 'Location', filled: !!formData.billing_country, weight: 10, required: true },
    ];

    if (isOrg) {
      criteria.push({
        label: 'Company Identity',
        filled: !!formData.company_name && !!formData.company_website,
        weight: 25,
        required: true
      });
      criteria.push({
        label: 'Company Details',
        filled: !!formData.industry && !!formData.company_size && !!formData.company_description,
        weight: 25,
        required: true
      });
    } else {
      criteria.push({
        label: 'Social Proof',
        filled: !!formData.social_proof,
        weight: 50,
        required: true,
        warning: !formData.social_proof ? 'Add LinkedIn or Portfolio' : null
      });
    }
  }

  const requiredCriteria = criteria.filter(c => c.required);
  const totalWeight = requiredCriteria.reduce((acc, curr) => acc + curr.weight, 0);
  const currentWeight = requiredCriteria.reduce((acc, curr) => acc + (curr.filled ? curr.weight : 0), 0);

  const rawScore = totalWeight > 0 ? Math.round((currentWeight / totalWeight) * 100) : 0;
  const serverScore = typeof formData?.profile_completion === 'number' ? formData.profile_completion : null;
  const score = Math.min(100, serverScore ?? rawScore);

  const nextStep = requiredCriteria.find(c => !c.filled);

  useEffect(() => {
    if (score === 100 && (isBuyer || (isExpert && expertStatus !== 'verified'))) {
      const key = isBuyer ? 'buyer_profile_complete_shown' : 'expert_profile_complete_shown';
      const hasShown = sessionStorage.getItem(key);
      if (!hasShown) {
        setShowSuccessDialog(true);
        sessionStorage.setItem(key, 'true');
      }
    }
  }, [score, expertStatus, isBuyer, isExpert]);

  return (
    <>
      <Card className="border-emerald-100 shadow-sm overflow-hidden">
        <div className="w-full" />
        <CardHeader className="pb-4 border-b border-zinc-100 bg-zinc-50/50">
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
          {expertStatus === 'verified' && isExpert ? (
            <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm text-emerald-700 font-bold">
                <ShieldCheck className="h-4 w-4" /> Verified Expert
              </div>
              <p className="text-xs text-emerald-600 leading-relaxed">
                Your profile is live and verified! Keep your availability updated.
              </p>
            </div>
          ) : score < 100 && nextStep ? (
            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 animate-in fade-in slide-in-from-bottom-1">
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
          ) : score === 100 ? (
            <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-sm text-emerald-700 font-bold">
                <Sparkles className="h-4 w-4" /> All Set!
              </div>
              <p className="text-xs text-emerald-600 leading-relaxed">
                {isExpert
                  ? "Your profile is 100% complete and under review."
                  : "Your profile is complete. You are ready to post projects!"}
              </p>
            </div>
          ) : null}

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
              {isExpert ? <ShieldCheck className="h-6 w-6 text-emerald-600" /> : <Building2 className="h-6 w-6 text-emerald-600" />}
            </div>
            <DialogTitle className="text-center text-xl">Profile Completed</DialogTitle>
            <DialogDescription className="text-center pt-2">
              {isExpert
                ? "Congratulations! You have completed the core requirements."
                : "Your client profile is now complete. You look trustworthy to experts!"}
            </DialogDescription>
          </DialogHeader>
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