import { Project } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, AlertTriangle } from 'lucide-react';
import { domainLabels, trlDescriptions } from '@/data/mockData';
import { Link } from 'react-router-dom';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const statusColors = {
    draft: 'bg-muted text-muted-foreground',
    active: 'bg-success text-success-foreground',
    completed: 'bg-info text-info-foreground',
    archived: 'bg-secondary text-secondary-foreground',
  };

  const riskLabels = {
    technical: 'Technical',
    regulatory: 'Regulatory',
    scale: 'Scale',
    market: 'Market',
  };

  return (
    <Link to={`/projects/${project.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer h-full">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {project.title}
            </CardTitle>
            <Badge className={statusColors[project.status]}>
              {project.status}
            </Badge>
          </div>
          <Badge variant="outline" className="w-fit">
            {domainLabels[project.domain]}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.problemDescription}
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">TRL Level</span>
              <span className="font-medium">TRL {project.trlLevel}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full gradient-primary rounded-full transition-all"
                style={{ width: `${(project.trlLevel / 9) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{trlDescriptions[project.trlLevel]}</p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {project.riskCategories.map(risk => (
              <Badge key={risk} variant="secondary" className="text-xs gap-1">
                <AlertTriangle className="h-3 w-3" />
                {riskLabels[risk]}
              </Badge>
            ))}
          </div>

          <div className="pt-3 border-t border-border flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            Created {project.createdAt.toLocaleDateString()}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
