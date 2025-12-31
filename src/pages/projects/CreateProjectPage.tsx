import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateProject } from '@/hooks/useProjects';
import { useProjectExpertRecommendations } from '@/hooks/useExperts';
import { domainLabels, trlDescriptions } from '@/lib/constants';
import { Domain, TRLLevel, RiskCategory, Expert } from '@/types';
import { ArrowLeft, ArrowRight, Loader2, Rocket, ShieldAlert, Target, DollarSign, Calendar, CheckCircle, Users, Sparkles, X } from 'lucide-react';

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const createProject = useCreateProject();
  const [step, setStep] = useState(1);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [createdProject, setCreatedProject] = useState<any>(null);

  // Expert recommendations based on project data
  const { data: recommendedExperts, isLoading: isLoadingRecommendations } = useProjectExpertRecommendations(
    showRecommendations && createdProject ? {
      title: createdProject.title,
      description: createdProject.description,
      expected_outcome: createdProject.expected_outcome,
      domain: createdProject.domain?.[0] || '', // Use first domain for recommendations
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
    domain: [] as Domain[],
    description: '',
    trl_level: 4 as TRLLevel,
    risk_categories: [] as RiskCategory[],
    expected_outcome: '',
    budget_min: '',
    budget_max: '',
    deadline: '',
  });

  const handleSubmit = async () => {
    try {
      const payload: any = {
        title: formData.title.trim(),
        domain: formData.domain,
        description: formData.description.trim(),
        trl_level: formData.trl_level,
        risk_categories: formData.risk_categories,
        expected_outcome: formData.expected_outcome.trim(),
        status: 'draft',
        budget_min: Number(formData.budget_min) || 0,
        budget_max: Number(formData.budget_max) || 0,
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

  const toggleDomain = (domain: Domain) => {
    setFormData(prev => ({
      ...prev,
      domain: prev.domain.includes(domain)
        ? prev.domain.filter(d => d !== domain)
        : [...prev.domain, domain],
    }));
  };

  const removeDomain = (domain: Domain) => {
    setFormData(prev => ({
      ...prev,
      domain: prev.domain.filter(d => d !== domain),
    }));
  };

  // Check if step 1 is complete (at least one domain selected)
  const isStep1Complete = formData.title.trim() && formData.domain.length > 0 && formData.description.trim();

  return (
    <Layout showFooter={false}>
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-8 text-muted-foreground hover:text-foreground pl-0"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>

        <div className="flex items-center gap-3 mb-10">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex-1 space-y-2">
              <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${s <= step ? 'bg-primary' : 'bg-muted'}`} />
              <p className={`text-[10px] uppercase font-bold tracking-wider ${s === step ? 'text-primary' : 'text-muted-foreground'}`}>
                Step 0{s}
              </p>
            </div>
          ))}
        </div>

        {step === 1 && (
          <Card className="border-none shadow-2xl bg-card/50 backdrop-blur">
            <CardHeader className="space-y-1">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                <Rocket className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-display">Define the Mission</CardTitle>
              <CardDescription>Establish the core objectives and technical domain</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-bold">Project Title</Label>
                <Input
                  placeholder="e.g., Quantum-Safe Encryption"
                  value={formData.title}
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                  className="h-12 bg-background/50"
                />
              </div>
              
              {/* Multi-Domain Selection */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-bold">Scientific Domains (Select multiple)</Label>
                {formData.domain.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4 p-3 bg-muted/50 rounded-xl">
                    {formData.domain.map(domain => (
                      <Badge 
                        key={domain} 
                        variant="secondary"
                        className="flex items-center gap-1 px-3 py-1 text-xs"
                      >
                        {domainLabels[domain as Domain] || domain}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeDomain(domain as Domain);
                          }}
                          className="ml-1 hover:bg-muted rounded-full p-0.5 -mr-1"
                          type="button"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="max-h-48 overflow-y-auto border rounded-xl p-4 bg-background/50">
                  {Object.entries(domainLabels).map(([key, label]) => {
                    const domain = key as Domain;
                    return (
                      <div
                        key={domain}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:bg-muted ${
                          formData.domain.includes(domain)
                            ? 'border-primary bg-primary/5 border'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => toggleDomain(domain)}
                      >
                        <Checkbox 
                          checked={formData.domain.includes(domain)}
                          onCheckedChange={() => toggleDomain(domain)}
                        />
                        <span className="text-sm font-semibold capitalize">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-bold">Technical Challenge</Label>
                <Textarea
                  placeholder="Describe the problem..."
                  rows={6}
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  className="bg-background/50 resize-none"
                />
              </div>
              <Button
                className="w-full h-12 text-md font-bold"
                onClick={() => setStep(2)}
                disabled={!isStep1Complete}
              >
                Next Configuration <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-none shadow-2xl bg-card/50 backdrop-blur">
            <CardHeader className="space-y-1">
              <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-2">
                <ShieldAlert className="h-6 w-6 text-orange-500" />
              </div>
              <CardTitle className="text-2xl font-display">Technical Maturity & Risks</CardTitle>
              <CardDescription>Quantify the current stage and potential bottlenecks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-bold">Current TRL Level</Label>
                <Select
                  value={String(formData.trl_level)}
                  onValueChange={v => setFormData(p => ({ ...p, trl_level: Number(v) as TRLLevel }))}
                >
                  <SelectTrigger className="h-12 bg-background/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(l => (
                      <SelectItem key={l} value={String(l)}>
                        TRL {l}: {trlDescriptions[l]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                <Label className="text-xs uppercase tracking-widest font-bold">Anticipated Risk Profiles</Label>
                <div className="grid grid-cols-2 gap-3">
                  {(['technical', 'regulatory', 'scale', 'market'] as RiskCategory[]).map(risk => (
                    <div
                      key={risk}
                      className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.risk_categories.includes(risk)
                        ? 'border-primary bg-primary/5'
                        : 'border-transparent bg-muted/50 hover:bg-muted'
                      }`}
                      onClick={() => toggleRisk(risk)}
                    >
                      <Checkbox checked={formData.risk_categories.includes(risk)} />
                      <span className="text-sm font-semibold capitalize">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12 font-bold">Back</Button>
                <Button onClick={() => setStep(3)} className="flex-1 h-12 font-bold">Finalize <ArrowRight className="h-4 w-4 ml-2" /></Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="border-none shadow-2xl bg-card/50 backdrop-blur">
            <CardHeader className="space-y-1">
              <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-2">
                <Target className="h-6 w-6 text-green-500" />
              </div>
              <CardTitle className="text-2xl font-display">Target & Budget</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-bold">Expected Outcome</Label>
                <Textarea
                  placeholder="Define success..."
                  rows={4}
                  value={formData.expected_outcome}
                  onChange={e => setFormData(p => ({ ...p, expected_outcome: e.target.value }))}
                  className="bg-background/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Min Budget ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="number" value={formData.budget_min} onChange={e => setFormData(p => ({ ...p, budget_min: e.target.value }))} className="pl-9 h-12 bg-background/50" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Max Budget ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="number" value={formData.budget_max} onChange={e => setFormData(p => ({ ...p, budget_max: e.target.value }))} className="pl-9 h-12 bg-background/50" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Target Deadline</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={e => setFormData(p => ({ ...p, deadline: e.target.value }))}
                    className="pl-9 h-12 bg-background/50 block w-full text-left"
                    style={{ colorScheme: 'auto' }}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1 h-12 font-bold">Back</Button>
                <Button onClick={handleSubmit} className="flex-1 h-12 font-bold bg-zinc-900 text-white" disabled={createProject.isPending}>
                  {createProject.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Save Draft'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Expert Recommendations */}
        {showRecommendations && createdProject && (
          <div className="space-y-6">
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-2xl text-green-800">Project Created Successfully!</CardTitle>
                <CardDescription className="text-green-700">
                  Your project "{createdProject.title}" has been saved as a draft. 
                  Here are AI-powered expert recommendations based on your project requirements.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Recommended Experts
                </CardTitle>
                <CardDescription>
                  Based on your project: {createdProject.title}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingRecommendations ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    Finding the best experts for your project...
                  </div>
                ) : recommendedExperts && recommendedExperts.length > 0 ? (
                  <div className="space-y-4">
                    {recommendedExperts.slice(0, 5).map((expert: Expert) => (
                      <div key={expert.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                            {expert.name?.charAt(0) || 'E'}
                          </div>
                          <div>
                            <h4 className="font-semibold">{expert.name}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {expert.experience_summary || expert.bio}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {expert.rating && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                  ⭐ {expert.rating.toFixed(1)}
                                </span>
                              )}
                              {expert.hourly_rate_advisory && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  ${expert.hourly_rate_advisory}/hr
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          <Users className="w-4 h-4 mr-2" />
                          Invite
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No expert recommendations found at this time.</p>
                    <p className="text-sm">You can still publish your project to attract experts.</p>
                  </div>
                )}
                
                <div className="flex gap-3 mt-6 pt-6 border-t">
                  <Button variant="outline" onClick={() => navigate('/projects')} className="flex-1">
                    View All Projects
                  </Button>
                  <Button onClick={() => navigate(`/projects/${createdProject.id}`)} className="flex-1">
                    View Project Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
