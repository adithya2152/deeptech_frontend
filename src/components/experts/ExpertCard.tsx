import { Link } from 'react-router-dom';
import { Expert } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Clock, Shield, Briefcase, Zap, Rocket, CheckCircle2 } from 'lucide-react';
import { domainLabels } from '@/lib/constants';
import { useCurrency } from '@/hooks/useCurrency';
import { cn } from '@/lib/utils';

interface ExpertCardProps {
  expert: Expert;
}

export function ExpertCard({ expert }: ExpertCardProps) {
  const { convertAndFormat } = useCurrency();
  const getInitials = (first: string, last: string) =>
    `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();


  const fullName = `${expert.first_name || ''} ${expert.last_name || ''}`.trim();

  // Use expert_profile_id as the primary identifier for routing
  const expertId = expert.expert_profile_id || expert.profile_id || expert.id;

  const isVerified = expert.expert_status === 'verified' || expert.vetting_level === 'deep_tech_verified';

  return (
    <Link to={`/experts/${expertId}`} className="block h-full group">
      <Card className="h-full overflow-hidden transition-all duration-200 border-border/50 hover:border-border hover:shadow-sm bg-card flex flex-col">
        <CardHeader className="p-5 pb-3 space-y-3 shrink-0">
          <div className="flex justify-between items-start">
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-background shadow-sm">
                <AvatarImage src={expert.avatar_url} className="object-cover" />
                <AvatarFallback className="bg-muted text-muted-foreground text-base font-medium">
                  {getInitials(expert.first_name || '', expert.last_name || '')}
                </AvatarFallback>
              </Avatar>
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5" title="Verified Expert">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                </div>
              )}
            </div>

            <Badge variant="secondary" className="font-mono text-xs px-2 h-6 bg-muted text-muted-foreground">
              {expert.years_experience}+ {'Years Exp'}
            </Badge>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors line-clamp-1">
                {fullName}
              </h3>
              {expert.vetting_level === 'deep_tech_verified' && (
                <Badge variant="outline" className="h-5 px-2 gap-1 bg-primary/5 text-primary border-primary/20 text-[10px]">
                  <Zap className="w-2.5 h-2.5" />
                  {'Verified'}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {domainLabels[expert.domains?.[0] as keyof typeof domainLabels] || expert.domains?.[0]} {'Specialist'}
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-5 pt-0 pb-4 space-y-3 flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px] leading-relaxed">
            {expert.experience_summary}
          </p>

          <div className="flex flex-wrap gap-2 min-h-[24px] content-start overflow-hidden">
            {/* Show skills if available, otherwise fallback to domains */}
            {(expert.skills?.length ? expert.skills : expert.domains)?.slice(0, 4).map((skill, i) => (
              <Badge
                key={i}
                variant="outline"
                className="bg-background hover:bg-primary/5 border-border/50 transition-colors cursor-default text-xs px-2 h-6 font-normal"
              >
                {skill.replace('_', ' ')}
              </Badge>
            ))}
            {((expert.skills?.length || expert.domains?.length || 0) > 4) && (
              <Badge variant="secondary" className="text-xs px-2 h-6 text-muted-foreground bg-muted">
                +{(expert.skills?.length || expert.domains?.length || 0) - 4}
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 bg-muted/20 border-t border-border/50 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 fill-primary/80 text-primary/80" />
            <span className="font-medium text-sm">
              {expert.rating ? Number(expert.rating).toFixed(1) : 'New'}
            </span>
            <span className="text-xs text-muted-foreground">
              ({expert.review_count || 0})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {expert.total_hours > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground" title={`${expert.total_hours} Hours Billed`}>
                <Clock className="h-3 w-3" />
                {expert.total_hours}h
              </div>
            )}
            <div className="font-medium text-sm bg-muted text-foreground px-3 py-1 rounded-md whitespace-nowrap">
              {convertAndFormat(expert.avg_hourly_rate || 0, 'INR')}/hr
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}