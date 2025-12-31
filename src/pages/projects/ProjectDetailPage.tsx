import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject, useUpdateProject } from '@/hooks/useProjects';
import { useProjectContracts } from '@/hooks/useContracts';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProjectStatusBadge } from '@/components/projects/ProjectStatusBadge';
import { ProjectStatusControls } from '@/components/projects/ProjectStatusControls';
import { RecommendedExpertsList } from '@/components/projects/RecommendedExpertsList';
import { BidDialog } from '@/components/marketplace/BidDialog';
import { ProposalsList } from '@/components/projects/ProposalsList';
import { ReportDialog } from '@/components/shared/ReportDialog';
import { domainLabels } from '@/lib/constants';
import {
  ArrowLeft, Calendar, Loader2,
  Briefcase, Shield, Clock, Globe, Edit2, CheckCircle2, Save, X,
  Flag, AlertCircle, DollarSign, FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: project, isLoading, error } = useProject(id!);
  const { data: projectContracts = [] } = useProjectContracts(project?.id || '');

  const hasActiveOrPendingContract = projectContracts.some((c) =>
    ['pending', 'active', 'paused'].includes(c.status)
  );
  const isLockedByContract = hasActiveOrPendingContract;
  const isBiddingOpen = !!project && project.status === 'open';

  const contractedExpertIds = new Set(
    projectContracts
      .filter(c => ['pending', 'active'].includes(c.status))
      .map(c => c.expert_id)
  );

  const updateProjectMutation = useUpdateProject();

  const [isEditing, setIsEditing] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    expected_outcome: '',
    budget_min: 0,
    budget_max: 0
  });

  useEffect(() => {
    if (project) {
      setEditForm({
        title: project.title || '',
        description: project.description || '',
        expected_outcome: project.expected_outcome || '',
        budget_min: project.budget_min || 0,
        budget_max: project.budget_max || 0
      });
    }
  }, [project]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (error || !project) {
    return (
      <Layout>
        <div className="container py-20 text-center space-y-4">
          <h2 className="text-2xl font-bold">Project not found</h2>
          <Button variant="outline" onClick={() => navigate('/marketplace')}>Back to Marketplace</Button>
        </div>
      </Layout>
    );
  }

  const isExpert = user?.role === 'expert';
  const isOwner = user?.id === project.buyer_id;

  const handleSave = async () => {
    try {
      await updateProjectMutation.mutateAsync({ id: project.id, data: editForm });
      setIsEditing(false);
      toast({ title: 'Success', description: 'Project updated successfully.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          className="mb-6 pl-0 hover:bg-transparent hover:text-primary group"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Search
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <div className="space-y-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    {isEditing ? (
                      <Input
                        value={editForm.title}
                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                        className="text-3xl font-bold h-14 px-4 py-2"
                        placeholder="Project Title"
                      />
                    ) : (
                      <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 leading-tight">
                        {project.title}
                      </h1>
                    )}
                  </div>
                  {isOwner && !isLockedByContract && (
                    <div className="shrink-0">
                      {isEditing ? (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                            <X className="h-4 w-4 mr-2" /> Cancel
                          </Button>
                          <Button size="sm" onClick={handleSave} disabled={updateProjectMutation.isPending}>
                            {updateProjectMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Save
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (isLockedByContract) return;
                            setIsEditing(true);
                          }}
                        >
                          <Edit2 className="h-4 w-4 mr-2" /> Edit
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <ProjectStatusBadge status={project.status} />
                  <div className="w-1 h-1 rounded-full bg-zinc-300" />
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    <span>Posted {formatDistanceToNow(new Date(project.created_at))} ago</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-zinc-300" />
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-4 w-4" />
                    <span className="capitalize">{domainLabels[project.domain as keyof typeof domainLabels] || project.domain}</span>
                  </div>
                </div>
              </div>

              {isOwner && !isEditing && (
                <ProjectStatusControls
                  projectId={project.id}
                  currentStatus={project.status}
                  isOwner={isOwner}
                  isLockedByContract={isLockedByContract}
                />
              )}
            </div>

            <Separator className="bg-zinc-100" />

            <div className="space-y-8">
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900">Project Overview</h3>
                </div>
                
                <Card className="border-zinc-200 shadow-sm">
                  <CardContent className="p-6">
                    {isEditing ? (
                      <Textarea
                        value={editForm.description}
                        onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                        rows={12}
                        className="font-normal text-base leading-relaxed"
                        placeholder="Detailed project description..."
                      />
                    ) : (
                      <div className="prose prose-zinc max-w-none text-zinc-600 leading-relaxed whitespace-pre-wrap">
                        {project.description}
                      </div>
                    )}
                    
                    {!isEditing && project.attachments?.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-zinc-100">
                        <h4 className="text-sm font-medium text-zinc-900 mb-3 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-zinc-500" /> Attachments
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {project.attachments.map((file: any, i: number) => (
                            <a 
                              key={i}
                              href={file.url}
                              target="_blank"
                              rel="noreferrer"
                              className="group flex items-center gap-3 p-3 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-white hover:border-zinc-300 transition-all"
                            >
                              <div className="h-10 w-10 rounded-md bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                                <FileText className="h-5 w-5" />
                              </div>
                              <span className="text-sm font-medium text-zinc-700 group-hover:text-zinc-900 truncate flex-1">
                                {file.name}
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900">Expected Outcome</h3>
                </div>
                
                <Card className="border-zinc-200 shadow-sm bg-gradient-to-br from-white to-zinc-50/50">
                  <CardContent className="p-6">
                    {isEditing ? (
                      <Textarea
                        value={editForm.expected_outcome}
                        onChange={e => setEditForm({ ...editForm, expected_outcome: e.target.value })}
                        rows={4}
                        placeholder="What does success look like for this project?"
                      />
                    ) : (
                      <p className="text-zinc-600 leading-relaxed italic">
                        {project.expected_outcome || 'No specific outcome described.'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </section>

              {isOwner && (
                <section className="pt-4">
                  <ProposalsList
                    projectId={project.id}
                    projectStatus={project.status}
                    contractedExpertIds={contractedExpertIds}
                  />
                </section>
              )}

              {isOwner && <RecommendedExpertsList project={project} isOwner={isOwner} />}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-24 space-y-6">
              
              <Card className="border-2 border-zinc-100 shadow-lg overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 w-full" />
                <CardHeader className="pb-4 bg-zinc-50/50 border-b border-zinc-100">
                  <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">Estimated Budget</p>
                  {isEditing ? (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Min</span>
                        <div className="relative">
                          <span className="absolute left-2 top-2.5 text-zinc-400">$</span>
                          <Input type="number" className="pl-6" value={editForm.budget_min} onChange={e => setEditForm({ ...editForm, budget_min: Number(e.target.value) })} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">Max</span>
                        <div className="relative">
                          <span className="absolute left-2 top-2.5 text-zinc-400">$</span>
                          <Input type="number" className="pl-6" value={editForm.budget_max} onChange={e => setEditForm({ ...editForm, budget_max: Number(e.target.value) })} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-zinc-900">
                        {project.budget_min && project.budget_max
                          ? `$${project.budget_min.toLocaleString()} - $${project.budget_max.toLocaleString()}`
                          : 'Negotiable'}
                      </span>
                      {project.budget_min && <span className="text-sm text-zinc-500 font-medium">USD</span>}
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-zinc-100 text-sm">
                      <span className="flex items-center gap-2 text-zinc-500"><Clock className="h-4 w-4" /> Deadline</span>
                      <span className="font-medium text-zinc-900">{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Flexible'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-zinc-100 text-sm">
                      <span className="flex items-center gap-2 text-zinc-500"><Shield className="h-4 w-4" /> Type</span>
                      <span className="font-medium text-zinc-900">Fixed Price</span>
                    </div>
                  </div>

                  {isExpert && isBiddingOpen && (
                    <div className="pt-2">
                        <BidDialog project={project} />
                    </div>
                  )}

                  {isOwner && isBiddingOpen && (
                    <div className="p-3 rounded-lg text-xs text-center border bg-emerald-50 text-emerald-700 border-emerald-100 font-medium flex items-center justify-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Receiving Proposals
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-3 border-b border-zinc-100 bg-zinc-50/30">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500">Client Info</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-5">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border border-zinc-200">
                      <AvatarImage src={project.buyer_avatar} />
                      <AvatarFallback className="bg-zinc-100 text-zinc-500 font-medium">{project.buyer_name?.[0] || '?'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-zinc-900">{project.buyer_name || 'Unknown Buyer'}</div>
                      <div className="text-xs text-zinc-500">
                        {project.buyer_joined_at 
                          ? `Member since ${new Date(project.buyer_joined_at).getFullYear()}`
                          : 'Member details unavailable'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Payment Method Verified</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-600">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>Email Verified</span>
                    </div>
                  </div>
                  
                  {!isOwner && user && (
                    <>
                      <Separator className="bg-zinc-100" />
                      <Button 
                        variant="ghost" 
                        className="w-full text-zinc-500 hover:text-destructive hover:bg-destructive/5 h-9 text-xs justify-start px-2"
                        onClick={() => setShowReportDialog(true)}
                      >
                        <Flag className="h-3.5 w-3.5 mr-2" />
                        Report Project
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-orange-50/50 border-orange-100 shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3 text-orange-800 font-semibold text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>Risk Factors</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {project.risk_categories?.length > 0 ? (
                      project.risk_categories.map((r: string) => (
                        <Badge key={r} variant="outline" className="bg-white text-orange-700 border-orange-200 hover:bg-orange-50">
                          {r.replace('_', ' ')}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-orange-600/80 italic">Standard project risks apply.</span>
                    )}
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </div>

      <ReportDialog 
        open={showReportDialog} 
        onOpenChange={setShowReportDialog}
        reportedId={project.id}
        reportedName={project.title}
        type="project"
      />
    </Layout>
  );
}