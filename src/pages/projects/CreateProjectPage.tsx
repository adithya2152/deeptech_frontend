import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateProject } from '@/hooks/useProjects';
import { useProjectExpertRecommendations } from '@/hooks/useExperts';
import { domainLabels, trlDescriptions } from '@/lib/constants';
import { currencySymbol, formatCurrency } from '@/lib/currency';
import { useCurrency } from '@/hooks/useCurrency';
import { Domain, TRLLevel, RiskCategory, Expert } from '@/types';
import {
  ArrowLeft, ArrowRight, Loader2, Rocket, ShieldAlert, Target,
  DollarSign, Calendar, CheckCircle, Users, Sparkles,
  Lightbulb, Zap, AlertTriangle, TrendingUp, FileText,
  Clock, Info, Check
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Mission', icon: Rocket, description: 'Define your project' },
  { id: 2, title: 'Risks', icon: ShieldAlert, description: 'Technical details' },
  { id: 3, title: 'Budget', icon: Target, description: 'Resources & timeline' },
];

const riskInfo: Record<RiskCategory, { icon: React.ElementType; color: string; description: string }> = {
  technical: { icon: Zap, color: 'text-blue-600 bg-blue-50 border-blue-200', description: 'Technical complexity or unproven approaches' },
  regulatory: { icon: FileText, color: 'text-purple-600 bg-purple-50 border-purple-200', description: 'Compliance, certifications, or legal hurdles' },
  scale: { icon: TrendingUp, color: 'text-green-600 bg-green-50 border-green-200', description: 'Challenges in scaling production or deployment' },
  market: { icon: AlertTriangle, color: 'text-orange-600 bg-orange-50 border-orange-200', description: 'Market adoption or competitive pressures' },
};

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { displayCurrency } = useCurrency();
  const createProject = useCreateProject();
  const [step, setStep] = useState(1);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [createdProject, setCreatedProject] = useState<any>(null);

  const { data: recommendedExperts, isLoading: isLoadingRecommendations } = useProjectExpertRecommendations(
    showRecommendations && createdProject ? {
      title: createdProject.title,
      description: createdProject.description,
      expected_outcome: createdProject.expected_outcome,
      domain: createdProject.domain || '',
    } : {
      title: '',
      description: '',
      expected_outcome: '',
      domain: '',
    }
  );

  useEffect(() => {
    if (!user) return;
    if (user.role === 'expert') {
      toast({
        title: 'Access Restricted',
        description: 'Only Buyers can initiate new projects.',
        variant: 'destructive',
      });
      navigate('/projects');
    }
  }, [user, navigate, toast]);

  const [formData, setFormData] = useState({
    title: '',
    domain: '' as Domain | '',
    description: '',
    trl_level: 4 as TRLLevel,
    risk_categories: [] as RiskCategory[],
    expected_outcome: '',
    currency: displayCurrency || 'USD',
    budget_min: '',
    budget_max: '',
    deadline: '',
  });

  useEffect(() => {
    if (displayCurrency) {
      setFormData(prev => ({ ...prev, currency: displayCurrency }));
    }
  }, [displayCurrency]);

  const handleSubmit = async () => {
    try {
      const budgetMin = formData.budget_min ? Number(formData.budget_min) : 0
      const budgetMax = formData.budget_max ? Number(formData.budget_max) : 0
      if (budgetMin && budgetMax && budgetMax < budgetMin) {
        toast({
          title: 'Invalid budget range',
          description: 'Max budget cannot be less than min budget.',
          variant: 'destructive'
        })
        return
      }

      const payload: any = {
        title: formData.title.trim(),
        domain: formData.domain,
        description: formData.description.trim(),
        trl_level: formData.trl_level,
        risk_categories: formData.risk_categories,
        expected_outcome: formData.expected_outcome.trim(),
        status: 'draft',
        currency: formData.currency,
        budget_min: budgetMin,
        budget_max: budgetMax,
      };

      if (formData.deadline) {
        payload.deadline = formData.deadline;
      }

      const project = await createProject.mutateAsync(payload);
      setCreatedProject(project);
      setShowRecommendations(true);

      toast({
        title: 'Draft Saved Successfully!',
        description: 'Finding expert recommendations for your project...'
      });
    } catch (error: any) {
      const errorMessage = error.message || '';
      const isDuplicate = errorMessage.includes('already exists') || errorMessage.includes('duplicate key') || errorMessage.includes('23505');

      toast({
        title: isDuplicate ? 'Project Title Exists' : 'Submission Failed',
        description: isDuplicate
          ? 'You already have a project with this title. Please use a unique title.'
          : (errorMessage || 'Check your connection and try again.'),
        variant: 'destructive'
      });
    }
  };

  const toggleRisk = (risk: RiskCategory) => {
    setFormData(prev => ({
      ...prev,
      risk_categories: prev.risk_categories.includes(risk)
        ? prev.risk_categories.filter(r => r !== risk)
        : [...prev.risk_categories, risk],
    }));
  };

  const isStep1Complete = formData.title.trim() && formData.domain && formData.description.trim();
  const isStep2Complete = true; // TRL has default, risks are optional
  const isStep3Complete = formData.expected_outcome.trim();

  const canProceed = (currentStep: number) => {
    if (currentStep === 1) return isStep1Complete;
    if (currentStep === 2) return isStep2Complete;
    if (currentStep === 3) return isStep3Complete;
    return false;
  };

  const goToStep = (targetStep: number) => {
    if (targetStep < step) {
      setStep(targetStep);
    } else if (targetStep === step + 1 && canProceed(step)) {
      setStep(targetStep);
    }
  };

  // Success state
  if (showRecommendations && createdProject) {
    return (
      <Layout showFooter={false}>
        <div className="min-h-screen bg-gradient-to-b from-green-50/50 to-background">
          <div className="mx-auto max-w-4xl px-4 py-12">
            {/* Success Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-zinc-900 mb-3">Project Created Successfully!</h1>
              <p className="text-lg text-muted-foreground max-w-md mx-auto">
                Your project "<span className="font-semibold text-zinc-700">{createdProject.title}</span>" has been saved as a draft.
              </p>
            </div>

            {/* Expert Recommendations */}
            <Card className="border-none shadow-xl mb-6">
              <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-pink-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">AI-Recommended Experts</CardTitle>
                    <CardDescription>Based on your project requirements</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {isLoadingRecommendations ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Analyzing your project and finding the best experts...</p>
                  </div>
                ) : recommendedExperts && recommendedExperts.length > 0 ? (
                  <div className="space-y-3">
                    {recommendedExperts.map((expert: Expert) => (
                      <div
                        key={expert.id}
                        className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 bg-white hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
                        onClick={() => navigate(`/experts/${expert.id}`)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20">
                            {expert.name?.charAt(0) || expert.first_name?.charAt(0) || 'E'}
                          </div>
                          <div>
                            <h4 className="font-semibold text-zinc-900 group-hover:text-primary transition-colors">
                              {expert.username ? `@${expert.username}` : (expert.name || `${expert.first_name} ${expert.last_name}`)}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-1 max-w-md">
                              {expert.headline || expert.experience_summary || expert.bio}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              {expert.rating > 0 && (
                                <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                                  ⭐ {expert.rating.toFixed(1)}
                                </Badge>
                              )}
                              {expert.avg_daily_rate > 0 && (
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                                  {formatCurrency(expert.avg_daily_rate, 'INR')}/day
                                </Badge>
                              )}
                              {expert.total_hours > 0 && (
                                <Badge variant="secondary" className="bg-zinc-100 text-zinc-600">
                                  {expert.total_hours}h billed
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button size="sm" className="shadow-sm">
                          <Users className="w-4 h-4 mr-2" />
                          Invite
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-zinc-400" />
                    </div>
                    <p className="text-muted-foreground mb-2">No expert recommendations found at this time.</p>
                    <p className="text-sm text-zinc-500">You can still publish your project to attract experts.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => navigate('/projects')} className="flex-1 h-12">
                View All Projects
              </Button>
              <Button onClick={() => navigate(`/projects/${createdProject.id}`)} className="flex-1 h-12 bg-zinc-900 hover:bg-zinc-800">
                View Project Details
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-primary/5">
        <div className="mx-auto max-w-5xl px-4 py-8 lg:py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <div className="text-sm text-muted-foreground">
              <Clock className="h-4 w-4 inline mr-1" />
              Auto-saves as draft
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="text-3xl lg:text-4xl font-bold text-zinc-900 mb-2">Create New Project</h1>
            <p className="text-muted-foreground">Define your technical challenge and find the right expert</p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-4 mb-12">
            {STEPS.map((s, idx) => {
              const StepIcon = s.icon;
              const isActive = s.id === step;
              const isCompleted = s.id < step;
              const isClickable = s.id < step || (s.id === step + 1 && canProceed(step));

              return (
                <div key={s.id} className="flex items-center">
                  <button
                    onClick={() => isClickable && goToStep(s.id)}
                    disabled={!isClickable && s.id !== step}
                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${isActive
                      ? 'bg-primary text-white shadow-lg shadow-primary/30'
                      : isCompleted
                        ? 'bg-primary/10 text-primary cursor-pointer hover:bg-primary/20'
                        : 'bg-zinc-100 text-zinc-400'
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-white/20' : isCompleted ? 'bg-primary/20' : 'bg-zinc-200'
                      }`}>
                      {isCompleted ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <StepIcon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="text-left hidden sm:block">
                      <div className="text-xs font-medium opacity-80">Step {s.id}</div>
                      <div className="font-semibold">{s.title}</div>
                    </div>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <div className={`w-8 lg:w-16 h-0.5 mx-2 rounded-full ${s.id < step ? 'bg-primary' : 'bg-zinc-200'
                      }`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Form Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              {/* Step 1: Mission */}
              {step === 1 && (
                <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="p-3 bg-gradient-to-br from-primary to-blue-600 rounded-2xl shadow-lg shadow-primary/20">
                        <Rocket className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">Define the Mission</CardTitle>
                        <CardDescription>Establish the core objectives and technical domain</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-zinc-700">
                        Project Title <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        placeholder="e.g., Quantum-Safe Encryption Protocol Development"
                        value={formData.title}
                        onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                        className="h-12 text-base border-zinc-200 focus:border-primary"
                      />
                      <p className="text-xs text-muted-foreground">Choose a clear, descriptive title for your project</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-zinc-700">
                        Scientific Domain <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.domain}
                        onValueChange={(v) => setFormData(p => ({ ...p, domain: v as Domain }))}
                      >
                        <SelectTrigger className="h-12 text-base border-zinc-200">
                          <SelectValue placeholder="Select the primary domain" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(domainLabels).map(([key, label]) => (
                            <SelectItem key={key} value={key} className="py-3">
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold text-zinc-700">
                          Technical Challenge <span className="text-red-500">*</span>
                        </Label>
                        <span className="text-xs text-muted-foreground">
                          {formData.description.length} / 2000
                        </span>
                      </div>
                      <Textarea
                        placeholder="Describe the problem you're trying to solve, the current state of your technology, and what expertise you need..."
                        rows={6}
                        maxLength={2000}
                        value={formData.description}
                        onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                        className="text-base border-zinc-200 focus:border-primary resize-none"
                      />
                      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                        <p className="text-xs text-blue-700">
                          <strong>Tip:</strong> Include specific technical requirements, constraints, and any previous approaches you've tried.
                        </p>
                      </div>
                    </div>

                    <Button
                      className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20"
                      onClick={() => setStep(2)}
                      disabled={!isStep1Complete}
                    >
                      Continue to Requirements
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Technical Maturity & Risks */}
              {step === 2 && (
                <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="p-3 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl shadow-lg shadow-orange-500/20">
                        <ShieldAlert className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">Technical Maturity & Risks</CardTitle>
                        <CardDescription>Help experts understand the project's current stage</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-zinc-700">Technology Readiness Level (TRL)</Label>
                      <Select
                        value={String(formData.trl_level)}
                        onValueChange={v => setFormData(p => ({ ...p, trl_level: Number(v) as TRLLevel }))}
                      >
                        <SelectTrigger className="h-12 text-base border-zinc-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(l => (
                            <SelectItem key={l} value={String(l)} className="py-3">
                              <div className="flex items-center gap-3">
                                <Badge variant="outline" className="font-mono">TRL {l}</Badge>
                                <span>{trlDescriptions[l]}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Current maturity level of your technology or concept</p>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-semibold text-zinc-700">Anticipated Risk Categories</Label>
                        <p className="text-xs text-muted-foreground mt-1">Select all that apply to help experts prepare</p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(Object.keys(riskInfo) as RiskCategory[]).map(risk => {
                          const info = riskInfo[risk];
                          const Icon = info.icon;
                          const isSelected = formData.risk_categories.includes(risk);

                          return (
                            <button
                              key={risk}
                              type="button"
                              onClick={() => toggleRisk(risk)}
                              className={`flex items-start gap-3 p-4 rounded-xl border-2 transition-all text-left ${isSelected
                                ? 'border-primary bg-primary/5 shadow-sm'
                                : 'border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50'
                                }`}
                            >
                              <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/10 text-primary' : info.color.split(' ')[0] + ' ' + info.color.split(' ')[1]}`}>
                                <Icon className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold capitalize">{risk}</span>
                                  {isSelected && <Check className="h-4 w-4 text-primary" />}
                                </div>
                                <p className="text-xs text-muted-foreground mt-0.5">{info.description}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12 font-semibold">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                      </Button>
                      <Button onClick={() => setStep(3)} className="flex-1 h-12 font-semibold shadow-lg shadow-primary/20">
                        Continue to Budget
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Target & Budget */}
              {step === 3 && (
                <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg shadow-green-500/20">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl">Target & Budget</CardTitle>
                        <CardDescription>Define success criteria and project resources</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-semibold text-zinc-700">
                          Expected Outcome <span className="text-red-500">*</span>
                        </Label>
                        <span className="text-xs text-muted-foreground">
                          {formData.expected_outcome.length} / 1000
                        </span>
                      </div>
                      <Textarea
                        placeholder="What does success look like? Describe deliverables, milestones, or measurable results..."
                        rows={4}
                        maxLength={1000}
                        value={formData.expected_outcome}
                        onChange={e => setFormData(p => ({ ...p, expected_outcome: e.target.value }))}
                        className="text-base border-zinc-200 focus:border-primary resize-none"
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-3">
                        <Label className="text-sm font-semibold text-zinc-700">Budget Range</Label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Minimum</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500 notranslate">
                              {currencySymbol(formData.currency)}
                            </span>
                            <Input
                              type="number"
                              placeholder="5,000"
                              value={formData.budget_min}
                              onChange={e => setFormData(p => ({ ...p, budget_min: e.target.value }))}
                              className="pl-9 h-12 text-base border-zinc-200"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">Maximum</Label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500 notranslate">
                              {currencySymbol(formData.currency)}
                            </span>
                            <Input
                              type="number"
                              placeholder="50,000"
                              value={formData.budget_max}
                              onChange={e => setFormData(p => ({ ...p, budget_max: e.target.value }))}
                              className="pl-9 h-12 text-base border-zinc-200"
                            />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Leave empty for "Negotiable"</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-zinc-700">Target Deadline</Label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 z-10" />
                        <Input
                          type="date"
                          value={formData.deadline}
                          onChange={e => setFormData(p => ({ ...p, deadline: e.target.value }))}
                          className="pl-9 h-12 text-base border-zinc-200"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Optional - leave empty for flexible timeline</p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-12 font-semibold">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                      </Button>
                      <Button
                        onClick={handleSubmit}
                        className="flex-1 h-12 font-semibold bg-zinc-900 hover:bg-zinc-800 shadow-lg"
                        disabled={createProject.isPending || !isStep3Complete}
                      >
                        {createProject.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Save Draft & Get Recommendations
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar Preview */}
            <div className="hidden lg:block">
              <div className="sticky top-8 space-y-6">
                <Card className="border-none shadow-lg bg-white/80 backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Title</p>
                      <p className="font-semibold text-zinc-900">
                        {formData.title || <span className="text-zinc-300 italic">Not set</span>}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Domain</p>
                      {formData.domain ? (
                        <Badge variant="secondary">{domainLabels[formData.domain as Domain]}</Badge>
                      ) : (
                        <span className="text-zinc-300 italic text-sm">Not selected</span>
                      )}
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">TRL Level</p>
                      <Badge variant="outline" className="font-mono">TRL {formData.trl_level}</Badge>
                    </div>

                    {formData.risk_categories.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Risks</p>
                        <div className="flex flex-wrap gap-1">
                          {formData.risk_categories.map(risk => (
                            <Badge key={risk} variant="secondary" className="capitalize text-xs">
                              {risk}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {(formData.budget_min || formData.budget_max) && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Budget</p>
                        <p className="font-semibold text-green-600 notranslate">
                          {formatCurrency(Number(formData.budget_min || 0), formData.currency)}
                          {formData.budget_max && ` - ${formatCurrency(Number(formData.budget_max), formData.currency)}`}
                        </p>
                      </div>
                    )}

                    {formData.deadline && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Deadline</p>
                        <p className="text-sm">{new Date(formData.deadline).toLocaleDateString()}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-none shadow-lg bg-gradient-to-br from-primary/5 to-purple-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Info className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-700">Need help?</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          After saving, you'll get AI-powered expert recommendations based on your project requirements.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
