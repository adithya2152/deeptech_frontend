import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '@/types';
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
  CheckCircle, Archive, Trash2, MapPin, Star, BadgeCheck, Heart, ThumbsDown, Users
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
import { formatDistanceToNow } from 'date-fns';
import { domainLabels } from '@/lib/constants';

const formatBudget = (amount: number) => {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}k`;
  }
  return amount.toString();
};

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    draft: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    open: 'bg-primary/10 text-primary border-primary/20',
    active: 'bg-blue-50 text-blue-700 border-blue-200',
    completed: 'bg-purple-50 text-purple-700 border-purple-200',
    archived: 'bg-orange-50 text-orange-700 border-orange-200',
  };
  const className = styles[status] || 'bg-zinc-100 text-zinc-800';

  return (
    <Badge variant="outline" className={`${className} border uppercase text-[10px] font-bold tracking-wider h-5 whitespace-nowrap`}>
      {status.replace('_', ' ')}
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
}

const getProposalRange = (count: number): string => {
  if (count === 0) return 'No proposals yet';
  if (count < 5) return 'Less than 5';
  if (count < 10) return '5 to 10';
  if (count < 20) return '10 to 20';
  return '20+ proposals';
};

interface ProjectCardProps {
  project: ExtendedProject;
  compact?: boolean;
}

export function ProjectCard({ project, compact = false }: ProjectCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isBuyer = user?.role === 'buyer';
  const isOwner = isBuyer && project.buyer_id === user?.id;

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

  if (compact) {
    return (
      <Card
        className="group relative overflow-hidden transition-all duration-200 hover:bg-zinc-50/50 cursor-pointer bg-card border-zinc-200"
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
                  {project.budget_min ? `$${formatBudget(project.budget_min)}` : 'Neg.'}
                </span>
                <span>•</span>
                <span className="capitalize">{domainLabels[project.domain] || project.domain}</span>
                <span>•</span>
                <span className="truncate">Posted {formatDistanceToNow(new Date(project.created_at))} ago</span>
              </div>
            </div>
            {getStatusBadge(project.status)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card
        className="group relative border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/30 transition-all duration-200 cursor-pointer bg-white"
        onClick={handleCardClick}
      >
        <CardContent className="p-6">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-2 flex-1">
              <div className="text-xs text-muted-foreground font-medium">
                Posted {formatDistanceToNow(new Date(project.created_at))} ago
              </div>

              <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-primary group-hover:underline decoration-2 underline-offset-2 transition-all">
                {project.title}
              </h3>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-1 text-xs text-zinc-500 font-medium">
                <span className="font-bold text-zinc-700 capitalize">
                  {project.engagement_model === 'hourly' ? 'Hourly' : 'Fixed-price'}
                </span>
                {project.experience_level && (
                  <>
                    <span className="text-zinc-300 mx-1">•</span>
                    <span className="text-zinc-600 capitalize">{project.experience_level}</span>
                  </>
                )}
                <span className="text-zinc-300 mx-1">•</span>
                <span className="text-zinc-600">
                  Est. Budget: {project.budget_min ? `$${project.budget_min.toLocaleString()}` : 'Negotiable'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
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
                          <Edit className="h-4 w-4 mr-2" /> Edit Posting
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setShowOpenDialog(true)}>
                          <Megaphone className="h-4 w-4 mr-2 text-primary" /> Open for Bids
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive focus:text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete Project
                        </DropdownMenuItem>
                      </>
                    )}
                    {(project.status === 'active' || project.status === 'open') && (
                      <>
                        {project.status === 'active' && (
                          <DropdownMenuItem onClick={() => setShowCompleteDialog(true)}>
                            <CheckCircle className="h-4 w-4 mr-2 text-primary" /> Mark Complete
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => setShowArchiveDialog(true)}>
                          <Archive className="h-4 w-4 mr-2" /> Archive Project
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>

          <p className="mt-4 text-[14px] text-zinc-600 line-clamp-2 leading-relaxed">
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2 mt-4 mb-5">
            <Badge variant="secondary" className="bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-normal rounded-full px-3">
              {domainLabels[project.domain] || project.domain}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground pt-4 border-t border-zinc-100">
            {isPaymentVerified ? (
              <div className="flex items-center gap-1.5" title="Payment Method Verified">
                <BadgeCheck className="h-4 w-4 text-white fill-blue-500" />
                <span className="font-semibold text-zinc-500">Payment verified</span>
              </div>
            ) : (
              <span className="text-zinc-400">Payment unverified</span>
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
                <span className="font-bold text-zinc-600">{clientRating.toFixed(1)}</span>
              </div>
            )}

            <div className="font-medium text-zinc-600">
              ${formatBudget(totalSpent)}+ spent
            </div>

            {(project.proposal_count !== undefined && project.proposal_count >= 0) && (
              <div className="flex items-center gap-1" title={`${project.proposal_count} proposal(s)`}>
                <Users className="h-3 w-3" />
                <span className="font-medium text-zinc-600">{getProposalRange(project.proposal_count)}</span>
                {project.proposal_stats && project.proposal_count > 0 && (
                  <span className="text-zinc-400 ml-1">
                    · Avg ${Math.round(project.proposal_stats.avg_rate || 0).toLocaleString()}
                  </span>
                )}
              </div>
            )}

            {clientLocation && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="font-medium text-zinc-600">{clientLocation}</span>
              </div>
            )}

            {isOwner && (
              <div className="ml-auto">
                {getStatusBadge(project.status)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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