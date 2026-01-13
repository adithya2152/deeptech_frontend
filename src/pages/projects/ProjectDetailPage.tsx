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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Briefcase, Shield, Clock, Globe, Edit2, Save, X,
  Flag, AlertCircle, DollarSign, FileText, CheckCircle2,
  MapPin, Target, Share2, Star, BadgeCheck, Users
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

  // Determine if current user is the creator of this project
  // Use buyer_user_id which is the user_accounts.id of the project creator
  // This works reliably across role switches because user.id stays the same
  const isCreator = (() => {
    if (!project || !user) return false;

    // Primary check: buyer_user_id matches user.id
    const buyerUserId = project.buyer_user_id || project.buyer?.user_id;
    if (buyerUserId && String(buyerUserId) === String(user.id)) {
      return true;
    }

    // Fallback: check if user's profileId matches buyer_profile_id (only valid if same role)
    if (user.role === 'buyer' && user.profileId) {
      const projectBuyerProfileId = project.buyer_profile_id || project.buyer_id;
      if (String(user.profileId) === String(projectBuyerProfileId)) {
        return true;
      }
    }

    return false;
  })();

  useEffect(() => {
    if (!project || !user) return;

    // Block access if:
    // 1. User is an expert AND they are the creator of this project (switched roles)
    // 2. User is not the buyer owner AND not an expert viewer
    if (user.role === 'expert' && isCreator) {
      // Expert viewing their own project (created as buyer) - not allowed
      toast({
        title: "Access Restricted",
        description: "You cannot view your own project as an expert. Switch to buyer mode to manage it.",
        variant: "destructive",
      });
      navigate('/dashboard');
      return;
    }

    if (user.role === 'buyer' && !isCreator) {
      // Buyer trying to view someone else's project - not allowed
      toast({
        title: "Access Restricted",
        description: "You can only view your own projects as a buyer.",
        variant: "destructive",
      });
      navigate('/marketplace');
      return;
    }

  }, [project, user, navigate, isCreator, toast]);

  const contractedExpertIds = new Set(
    projectContracts
      .filter(c => ['pending', 'active'].includes(c.status))
      .map(c => c.expert_profile_id || c.expert_id)
  );

  const updateProjectMutation = useUpdateProject();
  const jobLink = window.location.href;

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
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
  // Use the isCreator computed above, and update isOwner to use profile IDs
  const isOwner = user?.role === 'buyer' && isCreator;

  type Buyer = {
    company_name?: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
    location?: string;
    rating?: number;
    review_count?: number;
    created_at?: string;
    total_spent?: number;
    projects_posted?: number;
    hires_made?: number;
    verified_payment?: boolean;
    verified_email?: boolean;
  };

  const buyer: Buyer = project.buyer || {};
  const buyerName = buyer.company_name || `${buyer.first_name || ''} ${buyer.last_name || ''}`.trim() || project.buyer_name || '';
  const buyerAvatar = buyer.avatar_url || project.buyer_avatar || null;
  const buyerLocation = buyer.location || project.buyer_location || '';
  const buyerRatingRaw = buyer.rating ?? project.buyer_rating ?? 0;
  const buyerRating = (() => {
    const coerced = typeof buyerRatingRaw === 'number' ? buyerRatingRaw : Number(buyerRatingRaw);
    return Number.isFinite(coerced) ? coerced : 0;
  })();
  const buyerReviewCount = buyer.review_count ?? 0;
  const buyerJoinedAt = buyer.created_at || project.buyer_joined_at || null;
  const buyerTotalSpentRaw = buyer.total_spent ?? 0;
  const buyerTotalSpent = (() => {
    const coerced = typeof buyerTotalSpentRaw === 'number' ? buyerTotalSpentRaw : Number(buyerTotalSpentRaw);
    return Number.isFinite(coerced) ? coerced : 0;
  })();
  const buyerProjectsPosted = buyer.projects_posted ?? 0;
  const buyerHiresMade = buyer.hires_made ?? 0;
  const buyerVerifiedPayment = buyer.verified_payment ?? false;
  const buyerVerifiedEmail = buyer.verified_email ?? false;

  const hireRate = buyerProjectsPosted > 0
    ? Math.round((buyerHiresMade / buyerProjectsPosted) * 100)
    : 0;

  const getProposalRange = (count: number): string => {
    if (count === 0) return 'No proposals yet';
    if (count < 5) return 'Less than 5';
    if (count < 10) return '5 to 10';
    if (count < 20) return '10 to 20';
    return '20+ proposals';
  };

  const proposalCount = project.proposal_count ?? 0;

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
      <div className="min-h-screen bg-zinc-50/30">
        <div className="bg-white border-b border-zinc-100">
          <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
              <button
                onClick={() => navigate(-1)}
                aria-label="Back to projects"
                className="flex items-center gap-2 hover:text-primary transition-colors text-sm text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Projects</span>
              </button>
              <span>/</span>
              <span className="text-zinc-900 font-medium truncate max-w-[300px]">{project.title}</span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
              <div className="space-y-4 flex-1">
                {isEditing ? (
                  <Input
                    value={editForm.title}
                    onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                    className="text-3xl font-bold h-14 px-4"
                    placeholder="Project Title"
                  />
                ) : (
                  <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 leading-tight">
                    {project.title}
                  </h1>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-zinc-400" />
                    <span className="capitalize text-zinc-700">{domainLabels[project.domain as keyof typeof domainLabels] || project.domain}</span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-zinc-400" />
                    <span>Posted {formatDistanceToNow(new Date(project.created_at))} ago</span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  {(buyerLocation) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-zinc-400" />
                      <span>{buyerLocation}</span>
                    </div>
                  )}
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-zinc-400" />
                    <span className="font-medium text-zinc-700">{getProposalRange(proposalCount)}</span>
                  </div>
                  <div className="ml-auto">
                    <ProjectStatusBadge status={project.status} />
                  </div>
                </div>
              </div>

              {isOwner && !isLockedByContract && (
                <div className="flex gap-2 shrink-0">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        <X className="h-4 w-4 mr-2" /> Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={updateProjectMutation.isPending}>
                        {updateProjectMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                        Save
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                      <Edit2 className="h-4 w-4 mr-2" /> Edit Posting
                    </Button>
                  )}
                  {!isEditing && (
                    <ProjectStatusControls
                      projectId={project.id}
                      currentStatus={project.status}
                      isOwner={isOwner}
                      isLockedByContract={isLockedByContract}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle>Project Description</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isEditing ? (
                    <Textarea
                      value={editForm.description}
                      onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                      rows={12}
                      className="text-base"
                      placeholder="Detailed project description..."
                    />
                  ) : (
                    <div className="prose prose-zinc max-w-none text-zinc-700 leading-relaxed whitespace-pre-wrap text-[15px]">
                      {project.description}
                    </div>
                  )}

                  {project.attachments?.length > 0 && (
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
                            className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-white hover:border-primary/30 transition-all group"
                          >
                            <div className="h-10 w-10 rounded bg-white border border-zinc-100 flex items-center justify-center text-zinc-400 group-hover:text-primary transition-colors">
                              <FileText className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-medium text-zinc-700 group-hover:text-primary truncate flex-1">
                              {file.name}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Expected Outcome
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Textarea
                      value={editForm.expected_outcome}
                      onChange={e => setEditForm({ ...editForm, expected_outcome: e.target.value })}
                      rows={4}
                      placeholder="What does success look like?"
                    />
                  ) : (
                    <p className="text-zinc-700 leading-relaxed">
                      {project.expected_outcome || 'No specific outcome described.'}
                    </p>
                  )}
                </CardContent>
              </Card>

              {isOwner && (
                <div className="space-y-4 pt-4">
                  <h3 className="text-lg font-bold text-zinc-900">Proposals</h3>
                  <ProposalsList
                    projectId={project.id}
                    projectStatus={project.status}
                    contractedExpertIds={contractedExpertIds}
                  />
                </div>
              )}

              {isOwner && <RecommendedExpertsList project={project} isOwner={isOwner} />}
            </div>

            <div className="space-y-6">

              {isExpert && isBiddingOpen && !isCreator && (
                <Card className="border-primary/20 bg-primary/5 shadow-none">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-semibold text-lg">Submit a Proposal</h3>
                    <p className="text-sm text-muted-foreground">
                      Interested in this project? Submit your proposal to get started.
                    </p>
                    <div className="pt-2">
                      <BidDialog project={project} />
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="border-none shadow-sm">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3 tracking-wider">Budget</h4>
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="number"
                          value={editForm.budget_min}
                          onChange={e => setEditForm({ ...editForm, budget_min: Number(e.target.value) })}
                          placeholder="Min"
                        />
                        <Input
                          type="number"
                          value={editForm.budget_max}
                          onChange={e => setEditForm({ ...editForm, budget_max: Number(e.target.value) })}
                          placeholder="Max"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-zinc-900">
                        <DollarSign className="h-5 w-5 text-zinc-500" />
                        <span className="text-xl font-bold">
                          {project.budget_min
                            ? `$${project.budget_min.toLocaleString()} ${project.budget_max ? `- $${project.budget_max.toLocaleString()}` : '+'}`
                            : 'Negotiable'
                          }
                        </span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    {(project as any).experience_level && (
                      <div className="flex items-start gap-3">
                        <Briefcase className="h-5 w-5 text-zinc-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm text-zinc-900">Experience Level</p>
                          <p className="text-sm text-muted-foreground">{(project as any).experience_level}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-zinc-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm text-zinc-900">Deadline</p>
                        <p className="text-sm text-muted-foreground">{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Flexible'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-zinc-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm text-zinc-900">Risk Level</p>
                        <p className="text-sm text-muted-foreground">{project.trl_level ? `TRL ${project.trl_level}` : 'Standard'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {!isOwner && (
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">About the Client</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-zinc-600">
                        {buyerVerifiedPayment ? (
                          <CheckCircle2 className="h-4 w-4 text-blue-500 fill-blue-50" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-zinc-300" />
                        )}
                        <span className={buyerVerifiedPayment ? 'font-medium text-zinc-900' : 'text-zinc-500'}>
                          Payment method {buyerVerifiedPayment ? 'verified' : 'unverified'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-zinc-600">
                        {buyerVerifiedEmail ? (
                          <CheckCircle2 className="h-4 w-4 text-blue-500 fill-blue-50" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border-2 border-zinc-300" />
                        )}
                        <span className={buyerVerifiedEmail ? 'font-medium text-zinc-900' : 'text-zinc-500'}>
                          Email verified
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${star <= Math.round(buyerRating) ? 'fill-amber-400 text-amber-400' : 'fill-zinc-200 text-zinc-200'}`}
                          />
                        ))}
                        <span className="text-sm font-bold text-zinc-900 ml-1">{buyerRating.toFixed(1)}</span>
                      </div>
                      <p className="text-xs text-zinc-500">{buyerReviewCount} reviews</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {buyerJoinedAt && (
                        <div className="space-y-0.5">
                          <h5 className="text-sm font-medium text-zinc-900">Joined</h5>
                          <p className="text-xs text-zinc-500">{new Date(buyerJoinedAt).toLocaleDateString()}</p>
                        </div>
                      )}

                      <div className="space-y-0.5">
                        <h5 className="text-sm font-medium text-zinc-900">Jobs posted</h5>
                        <p className="text-xs text-zinc-500">{buyerProjectsPosted}</p>
                      </div>

                      <div className="space-y-0.5">
                        <h5 className="text-sm font-medium text-zinc-900">Hire rate</h5>
                        <p className="text-xs text-zinc-500">{hireRate}%</p>
                      </div>

                      {buyerTotalSpent > 0 && (
                        <div className="space-y-0.5">
                          <h5 className="text-sm font-medium text-zinc-900">Total spent</h5>
                          <p className="text-xs text-zinc-500">${buyerTotalSpent.toLocaleString()}</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-zinc-100 flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-zinc-200">
                        <AvatarImage src={buyerAvatar} />
                        <AvatarFallback className="bg-zinc-100 text-zinc-600 font-medium">
                          {buyerName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <p
                          className="text-sm font-semibold text-zinc-900 truncate hover:text-primary cursor-pointer hover:underline"
                          onClick={() => navigate(`/clients/${project.buyer_profile_id || project.buyer?.id || project.buyer_id}`)}
                        >
                          {buyerName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{buyer.company_name || 'Individual Client'}</p>
                      </div>
                    </div>

                    {!isOwner && user && (
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-zinc-500 hover:text-destructive h-auto px-0 py-0"
                        onClick={() => setShowReportDialog(true)}
                      >
                        <Flag className="h-3.5 w-3.5 mr-2" />
                        Report Project
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
              <Card className="border-none shadow-sm bg-zinc-50/50">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-zinc-900 text-sm mb-2">Job Link</h4>
                  <div className="flex items-center gap-2 bg-white border border-zinc-200 p-2 rounded text-xs text-zinc-500">
                    <span className="truncate flex-1">{jobLink}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 hover:bg-zinc-100"
                      onClick={() => {
                        navigator.clipboard.writeText(jobLink);
                        toast({ title: "Link copied" });
                      }}
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </Button>
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