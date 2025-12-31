import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Edit, MoreVertical, Megaphone, 
  CheckCircle, Archive, Trash2, DollarSign, Clock, ArrowRight
} from 'lucide-react';
import { domainLabels } from '@/lib/constants';
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

const formatBudget = (amount: number) => {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return amount.toString();
};

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    draft: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    open: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    active: 'bg-blue-100 text-blue-700 border-blue-200',
    completed: 'bg-purple-100 text-purple-700 border-purple-200',
    archived: 'bg-orange-100 text-orange-700 border-orange-200',
  };
  const className = styles[status] || 'bg-zinc-100 text-zinc-800';
  
  return (
    <Badge variant="outline" className={`${className} border uppercase text-[10px] font-bold tracking-wider h-5 whitespace-nowrap`}>
      {status.replace('_', ' ')}
    </Badge>
  );
};

interface ProjectCardProps {
  project: Project;
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
    if ((e.target as HTMLElement).closest('[role="menuitem"], button, [data-radix-dropdown-menu-trigger], [role="dialog"]')) return;
    handleNavigation();
  };

  if (compact) {
    return (
      <Card 
        className="group relative overflow-hidden transition-all duration-300 hover:shadow-md border-l-4 border-l-primary/20 hover:border-l-primary cursor-pointer bg-card"
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tight py-0 px-1.5 h-4 bg-muted/30 whitespace-nowrap">
                  {domainLabels[project.domain as keyof typeof domainLabels] || project.domain}
                </Badge>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                </span>
              </div>
              <h4 className="font-semibold text-sm leading-tight text-foreground truncate group-hover:text-primary transition-colors">
                {project.title}
              </h4>
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
               <div className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                  <DollarSign className="h-3 w-3 mr-0.5" />
                  {project.budget_min ? `${formatBudget(project.budget_min)}+` : 'Neg.'}
               </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card 
        className="group hover:shadow-lg transition-all duration-300 border-zinc-200 hover:border-primary/50 h-full flex flex-col cursor-pointer bg-white"
        onClick={handleCardClick}
      >
        <CardHeader className="pb-2 pt-5 px-5">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-2">
              <Badge variant="secondary" className="uppercase text-[10px] font-bold tracking-wider bg-zinc-50 text-zinc-500 border-zinc-100 hover:bg-zinc-100 whitespace-nowrap">
                {domainLabels[project.domain as keyof typeof domainLabels] || project.domain}
              </Badge>
              
              {isOwner && (
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {getStatusBadge(project.status)}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-zinc-100 -mr-2">
                        <MoreVertical className="h-4 w-4 text-zinc-400" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {project.status === 'draft' && (
                        <>
                          <DropdownMenuItem onClick={() => navigate(`/projects/${project.id}/edit`)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setShowOpenDialog(true)}>
                            <Megaphone className="h-4 w-4 mr-2 text-emerald-600" /> Open for Bids
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
                              <CheckCircle className="h-4 w-4 mr-2 text-emerald-600" /> Mark Complete
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => setShowArchiveDialog(true)}>
                            <Archive className="h-4 w-4 mr-2" /> Archive Project
                          </DropdownMenuItem>
                        </>
                      )}
                      {project.status === 'open' && (
                        <DropdownMenuItem onClick={() => navigate(`/projects/${project.id}/edit`)}>
                          <Edit className="h-4 w-4 mr-2" /> Edit Specs
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-400 font-medium">
                Posted {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
              </span>
              <CardTitle className="text-lg font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                {project.title}
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-grow px-5 pb-4 pt-1">
          <p className="text-sm text-zinc-500 line-clamp-2 mb-6 leading-relaxed">
            {project.description}
          </p>

          <div className="flex items-center gap-4 text-xs pt-4 border-t border-zinc-50">
            <div className="flex items-center gap-1.5 text-zinc-600 font-semibold">
              <DollarSign className="h-3.5 w-3.5 text-zinc-400" />
              <span>
                {project.budget_min 
                  ? `$${formatBudget(project.budget_min)} - ${formatBudget(project.budget_max || 0)}` 
                  : 'Negotiable'
                }
              </span>
            </div>
            <div className="w-px h-3 bg-zinc-100" />
            <div className="flex items-center gap-1.5 text-zinc-600 font-semibold">
              <Clock className="h-3.5 w-3.5 text-zinc-400" />
              <span>
                {project.deadline ? new Date(project.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Flexible'}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-5 py-3 mt-auto border-t border-zinc-50 bg-zinc-50/20">
          <Button 
            variant="ghost" 
            className="w-full justify-between text-zinc-500 hover:text-primary hover:bg-white hover:shadow-sm transition-all h-8 text-xs font-medium px-2"
            onClick={(e) => {
              e.stopPropagation();
              handleNavigation();
            }}
          >
            Details
            <ArrowRight className="h-3.5 w-3.5 ml-1 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardFooter>
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
            <AlertDialogAction onClick={() => handleStatusChange('open')} className="bg-emerald-600 hover:bg-emerald-700">
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