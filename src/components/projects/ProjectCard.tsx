import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '@/types';
import { useCurrency } from '@/hooks/useCurrency';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Edit, MoreVertical, Megaphone,
  CheckCircle, Archive, Trash2, MapPin, Star, BadgeCheck, Heart, ThumbsDown
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateProjectStatus, useDeleteProject } from '@/hooks/useProjects';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatDistanceToNow } from '@/lib/dateUtils';
import { domainLabels } from '@/lib/constants';

const formatBudget = (amount: number) => {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}k`;
  }
  return amount.toString();
};

const getStatusBadge = (status: string, labelOverride?: string) => {
  const styles: Record<string, string> = {
    draft: 'bg-muted text-muted-foreground border-border',
    open: 'bg-primary/10 text-primary border-primary/20',
    active: 'bg-muted text-foreground border-border',
    completed: 'bg-muted text-foreground border-border',
    archived: 'bg-muted text-muted-foreground border-border',
  };
  const className = styles[status] || 'bg-muted text-muted-foreground';

  return (
    <Badge variant="outline" className={`${className} border uppercase text-[10px] font-medium tracking-wider h-5 whitespace-nowrap`}>
      {(labelOverride || status).replace('_', ' ')}
    </Badge>
  );
};

interface ExtendedProject extends Project {
  buyer_rating?: number;
  buyer_country?: string;
  buyer_verified?: boolean;
  buyer_total_spent?: number;
  engagement_model?: 'hourly' | 'fixed';
  experience_level?: 'entry' | 'intermediate' | 'expert';
  proposal_count?: number;
  proposal_stats?: {
    avg_rate?: number;
    min_rate?: number;
    max_rate?: number;
  };
  my_proposal_status?: Project['my_proposal_status'];
  active_contract_id?: string | null;
  active_contract_status?: string | null;
}

const getProposalRange = (count: number): string => {
  if (count === 0) return '0 to 5';
  if (count < 5) return '0 to 5';
  if (count < 10) return '5 to 10';
  if (count < 20) return '10 to 20';
  return '20+ proposals';
};

interface ProjectCardProps {
  project: ExtendedProject;
  compact?: boolean;
  context?: 'default' | 'marketplace';
}

export function ProjectCard({ project, compact = false, context = 'default' }: ProjectCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isBuyer = user?.role === 'buyer';
  const isOwner = isBuyer && project.buyer_id === user?.id;
  const showBuyerInsights = context === 'marketplace' && !isOwner;
  const isExpert = user?.role === 'expert';
  const { convertAndFormat } = useCurrency();

  const myProposalStatus = (project.my_proposal_status || undefined)?.toLowerCase() as
    | 'pending'
    | 'accepted'
    | 'rejected'
    | undefined;
  const hasBlockingProposal = myProposalStatus === 'pending' || myProposalStatus === 'accepted';

  const proposalBadge =
    isExpert && myProposalStatus ? (
      <Badge
        variant="outline"
        title={`${'Your Proposal'}: ${myProposalStatus}`}
        className={
          myProposalStatus === 'accepted'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : myProposalStatus === 'pending'
              ? 'border-blue-200 bg-blue-50 text-blue-700'
              : 'border-zinc-200 bg-zinc-50 text-zinc-700'
        }
      >
        {`Proposal: ${myProposalStatus.charAt(0).toUpperCase() + myProposalStatus.slice(1)}`}
      </Badge>
    ) : null;

  const updateStatus = useUpdateProjectStatus();
  const deleteProject = useDeleteProject();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  const handleStatusChange = async (newStatus: 'open' | 'active' | 'completed' | 'archived') => {
    try {
      await updateStatus.mutateAsync({ id: project.id, status: newStatus });
      toast({ title: 'Success', description: `Project marked as ${newStatus.replace('_', ' ')}` });
      setShowOpenDialog(false);
      setShowCompleteDialog(false);
      setShowArchiveDialog(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteProject.mutateAsync(project.id);
      toast({ title: 'Deleted', description: 'Project removed successfully' });
      setShowDeleteDialog(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete project', variant: 'destructive' });
    }
  };

  const handleNavigation = () => {
    navigate(`/projects/${project.id}`);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[role="menuitem"], button, [data-radix-dropdown-menu-trigger], [role="dialog"], a')) return;
    handleNavigation();
  };

  const clientLocation = project.buyer?.location || project.buyer_location || '';
  const clientRatingRaw = project.buyer?.rating ?? project.buyer_rating ?? 0;
  const clientRating = (() => {
    const coerced = typeof clientRatingRaw === 'number' ? clientRatingRaw : Number(clientRatingRaw);
    return Number.isFinite(coerced) ? coerced : 0;
  })();
  const isPaymentVerified = project.buyer?.verified_payment ?? project.buyer_verified ?? false;
  const totalSpentRaw = project.buyer?.total_spent ?? project.buyer_total_spent ?? 0;
  const totalSpent = (() => {
    const coerced = typeof totalSpentRaw === 'number' ? totalSpentRaw : Number(totalSpentRaw);
    return Number.isFinite(coerced) ? coerced : 0;
  })();

  const proposalCountLabel = (count: number) => {
    if (count === 0) return '0';
    if (count === 1) return '1';
    return String(count);
  };

  if (compact) {
    return (
      <Card
        className="group relative overflow-hidden transition-all duration-200 hover:bg-muted/30 cursor-pointer bg-card border-border/50 hover:border-border"
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start gap-3">
            <div className="space-y-1.5 flex-1 min-w-0">
              <h4 className="font-semibold text-sm leading-tight text-foreground truncate group-hover:text-primary transition-colors">
                {project.title}
              </h4>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  {project.budget_min ? convertAndFormat(project.budget_min, project.currency) : 'Negotiable'}
                </span>
                <span>•</span>
                <span className="capitalize">{domainLabels[project.domain] || project.domain}</span>
                <span>•</span>
                <span className="truncate">{'Posted'} {formatDistanceToNow(new Date(project.created_at))} {'ago'}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {proposalBadge}
              {getStatusBadge(project.status)}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card
        className="group relative border-border/50 hover:border-border hover:shadow-sm transition-all duration-200 cursor-pointer bg-card"
        onClick={handleCardClick}
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-2 flex-1">
              <div className="text-sm text-muted-foreground font-medium">
                {'Posted'} {formatDistanceToNow(new Date(project.created_at))} {'ago'}
              </div>

              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                {project.title}
              </h3>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-1 text-sm text-muted-foreground font-medium">
                <span className="font-medium text-foreground capitalize">
                  {project.engagement_model === 'hourly' ? 'Hourly Rate' : 'Fixed Price'}
                </span>
                {project.experience_level && (
                  <>
                    <span className="text-muted-foreground/50 mx-1">•</span>
                    <span className="text-muted-foreground capitalize">{project.experience_level}</span>
                  </>
                )}
                <span className="text-muted-foreground/50 mx-1">•</span>
                <span className="text-muted-foreground">
                  {'Est. Budget'}: {project.budget_min ? convertAndFormat(project.budget_min, project.currency) : 'Negotiable'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
              {proposalBadge}
              {!isOwner && (
                <>
                </>
              )}

              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-foreground">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    {project.status === 'draft' && (
                      <>
                        <DropdownMenuItem onClick={() => navigate(`/projects/${project.id}/edit`)}>
                          <Edit className="h-4 w-4 mr-2" /> {'Edit Project'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowOpenDialog(true)}>
                          <Megaphone className="h-4 w-4 mr-2 text-primary" /> Open for Bids
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive focus:text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" /> {'Delete Project'}
                        </DropdownMenuItem>
                      </>
                    )}
                    {(project.status === 'active' || project.status === 'open') && (
                      <>
                        {project.status === 'active' && (
                          <DropdownMenuItem onClick={() => setShowCompleteDialog(true)}>
                            <CheckCircle className="h-4 w-4 mr-2 text-primary" /> {'Mark as Complete'}
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => setShowArchiveDialog(true)}>
                          <Archive className="h-4 w-4 mr-2" /> {'Archive Project'}
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2 mt-3 mb-4">
            <Badge variant="secondary" className="bg-muted hover:bg-muted/80 text-muted-foreground font-normal rounded-full px-3">
              {domainLabels[project.domain] || project.domain}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground pt-3 border-t border-border/50">
            {showBuyerInsights && (
              <>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
                  {'Buyer Details'}:
                </span>
                {isPaymentVerified ? (
                  <div className="flex items-center gap-1.5" title="Payment Method Verified">
                    <BadgeCheck className="h-4 w-4 text-primary" />
                    <span className="font-medium text-muted-foreground">{'Payment Verified'}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground/50">{'Payment Unverified'}</span>
                )}

                {clientRating > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < Math.round(clientRating) ? 'fill-primary text-primary' : 'fill-zinc-200 text-zinc-200'}`}
                        />
                      ))}
                    </div>
                    <span className="font-medium text-foreground">{clientRating.toFixed(1)}</span>
                  </div>
                )}

                <div className="font-medium text-foreground">
                  {convertAndFormat(totalSpent, 'INR')}+ {'spent'}
                </div>
              </>
            )}
            {showBuyerInsights && clientLocation && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="font-medium text-foreground">{clientLocation}</span>
              </div>
            )}

            {(project.proposal_count !== undefined && project.proposal_count >= 0) && (
              <div className="w-full" title={`${project.proposal_count} proposal(s)`}>
                <span className="font-medium text-foreground">
                  {'Proposals'} - {isBuyer ? proposalCountLabel(project.proposal_count) : getProposalRange(project.proposal_count)}
                </span>
                {project.proposal_stats && project.proposal_count > 0 && (
                  <span className="text-muted-foreground/60 ml-1">
                    · {'Avg. Rate'} {convertAndFormat(project.proposal_stats.avg_rate || 0, 'INR')}
                  </span>
                )}
              </div>
            )}


            {isOwner && (
              <div className="ml-auto">
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {project.active_contract_id && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => navigate(`/contracts/${project.active_contract_id}`)}
                    >
                      View Contract
                    </Button>
                  )}
                  {getStatusBadge(
                    project.status,
                    project.status === 'active' && project.active_contract_id ? 'in contract' : undefined
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card >

      <AlertDialog open={showOpenDialog} onOpenChange={setShowOpenDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Open Project for Bids?</AlertDialogTitle>
            <AlertDialogDescription>
              This will make your project visible to experts on the marketplace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleStatusChange('open')} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Open for Bids
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Project?</AlertDialogTitle>
            <AlertDialogDescription>This will close the project to new bids.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleStatusChange('completed')}>Complete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Project?</AlertDialogTitle>
            <AlertDialogDescription>Moved to the archived tab.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleStatusChange('archived')}>Archive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Delete Project?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}