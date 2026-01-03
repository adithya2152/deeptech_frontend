import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, ArrowRight, AlertCircle, Clock, ShieldCheck } from 'lucide-react';
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
}

export function ProfileCompletion({ formData, isExpert, onEditSection }: ProfileCompletionProps) {
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  if (!isExpert) return null;

  // Check if at least one type of credential exists
  const hasCredentials = 
    (formData.patents && formData.patents.length > 0) || 
    (formData.papers && formData.papers.length > 0) || 
    (formData.products && formData.products.length > 0);

  const criteria = [
    { 
        label: 'Basic Info', 
        filled: !!formData.first_name && !!formData.last_name, 
        weight: 10 
    },
    { 
        label: 'Professional Summary', 
        filled: !!formData.bio && formData.bio.length > 50, 
        weight: 15,
        warning: (formData.bio && formData.bio.length <= 50) 
            ? `Too short (${formData.bio?.length || 0}/50 chars)` 
            : null
    },
    { label: 'Expertise Domains', filled: formData.domains && formData.domains.length > 0, weight: 10 },
    { label: 'Specific Skills', filled: formData.skills && formData.skills.length > 0, weight: 10 },
    { label: 'Credentials (Patents/Papers)', filled: hasCredentials, weight: 20 },
    { label: 'Hourly Rates', filled: formData.avg_daily_rate > 0 || formData.avg_sprint_rate > 0, weight: 10 },
    { label: 'Years of Experience', filled: formData.years_experience > 0, weight: 10 },
    { label: 'Languages', filled: formData.languages && formData.languages.length > 0, weight: 5 },
    { label: 'Profile Video', filled: !!formData.profile_video_url, weight: 10 },
  ];

  const score = criteria.reduce((acc, curr) => acc + (curr.filled ? curr.weight : 0), 0);
  const nextStep = criteria.find(c => !c.filled);

  useEffect(() => {
    if (score === 100) {
      const hasShown = sessionStorage.getItem('profile_complete_shown');
      if (!hasShown) {
        setShowSuccessDialog(true);
        sessionStorage.setItem('profile_complete_shown', 'true');
      }
    }
  }, [score]);

  return (
    <>
      <Card className="border-blue-100 bg-blue-50 overflow-hidden">
        <CardHeader className="pb-3 border-b border-blue-100/50">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base text-blue-900">Profile Strength</CardTitle>
            <span className="font-bold text-blue-700">{score}%</span>
          </div>
          <Progress 
              value={score} 
              className="h-2 bg-blue-200 [&>div]:bg-blue-600" 
          />
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {score < 100 && nextStep ? (
            <div className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
              <p className="text-xs font-semibold text-zinc-500 uppercase mb-1">Next Step</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-900">{nextStep.label}</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2"
                  onClick={() => onEditSection(nextStep.label)}
                >
                  Add <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-sm text-emerald-800 font-medium">
                      <CheckCircle2 className="h-4 w-4" /> Profile Complete!
                  </div>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                      Your profile has been submitted to the Admin team for verification.
                  </p>
              </div>
          )}

          <div className="space-y-2">
              <p className="text-xs font-medium text-zinc-500">Requirements</p>
              {criteria.map((item) => (
                  <div key={item.label} className="flex items-start gap-2 text-sm">
                      {item.filled ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : item.warning ? (
                          <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      ) : (
                          <Circle className="h-4 w-4 text-zinc-300 shrink-0 mt-0.5" />
                      )}
                      
                      <div className="flex flex-col">
                          <span className={item.filled ? 'text-zinc-700' : 'text-zinc-400'}>
                              {item.label}
                          </span>
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

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
               <ShieldCheck className="h-6 w-6 text-emerald-600" />
            </div>
            <DialogTitle className="text-center text-xl">Profile Submitted for Review</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Congratulations! You have completed your expert profile. 
            </DialogDescription>
          </DialogHeader>
          
          <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100 space-y-3">
             <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                   <h4 className="text-sm font-semibold text-zinc-900">What happens next?</h4>
                   <p className="text-sm text-zinc-600 mt-1">
                     Our admin team will review your credentials, patents, and background within <strong>24-48 hours</strong>.
                   </p>
                </div>
             </div>
             <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-zinc-400 mt-0.5" />
                <div>
                   <h4 className="text-sm font-semibold text-zinc-900">Verification Status</h4>
                   <p className="text-sm text-zinc-600 mt-1">
                     Your status will remain <strong>Pending Review</strong> until approved. You will receive an email notification once verified.
                   </p>
                </div>
             </div>
          </div>

          <div className="flex justify-center pt-4">
             <Button className="w-full" onClick={() => setShowSuccessDialog(false)}>
                Got it
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}