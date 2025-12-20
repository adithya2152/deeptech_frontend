import { Project } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, AlertTriangle, Edit, Eye } from 'lucide-react';
import { domainLabels, trlDescriptions } from '@/data/mockData';
import { Link, useNavigate } from 'react-router-dom';
import { ProjectStatusBadge } from './ProjectStatusBadge';
import { useAuth } from '@/contexts/AuthContext';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth()
  const isBuyer = user?.role === 'buyer'

  const riskLabels = {
    technical: 'Technical',
    regulatory: 'Regulatory',
    scale: 'Scale',
    market: 'Market',
  }

  const handleActionClick = (e: React.MouseEvent) => {
    e.preventDefault()
    // Only buyers can edit, everyone can view
    if (project.status === 'draft' && isBuyer) {
      navigate(`/projects/${project.id}/edit`);
    } else {
      navigate(`/projects/${project.id}`);
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {project.title}
          </CardTitle>
          <ProjectStatusBadge status={project.status} />
        </div>
        <Badge variant="outline" className="w-fit">
          {domainLabels[project.domain]}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">TRL Level</span>
            <span className="font-medium">TRL {project.trl_level}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full gradient-primary rounded-full transition-all"
              style={{ width: `${(project.trl_level / 9) * 100}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{trlDescriptions[project.trl_level]}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(project.risk_categories ?? []).map(risk => (
            <Badge key={risk} variant="secondary" className="text-xs gap-1">
              <AlertTriangle className="h-3 w-3" />
              {riskLabels[risk]}
            </Badge>
          ))}
        </div>


        <div className="pt-3 border-t border-border flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" />
            Created {new Date(project.created_at).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
      <div className="p-4 pt-0 mt-auto">
        <Button
          onClick={handleActionClick}
          className="w-full"
          variant={project.status === 'draft' && isBuyer ? 'default' : 'outline'}
        >
          {project.status === 'draft' && isBuyer ? (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Edit Draft
            </>
          ) : (
            <>
              <Eye className="h-4 w-4 mr-2" />
              {isBuyer ? 'View Details' : 'View & Express Interest'}
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
