import { Link } from 'react-router-dom';
import { Expert } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Clock, Shield, Briefcase, Zap, Rocket, CheckCircle2 } from 'lucide-react';
import { domainLabels } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface ExpertCardProps {
  expert: Expert;
}

export function ExpertCard({ expert }: ExpertCardProps) {
  const getInitials = (first: string, last: string) =>
    `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();

  const fullName = `${expert.first_name || ''} ${expert.last_name || ''}`.trim();

  // Use expert_profile_id as the primary identifier for routing
  const expertId = expert.expert_profile_id || expert.profile_id || expert.id;

  const isVerified = expert.expert_status === 'verified' || expert.vetting_level === 'deep_tech_verified';

  return (
    <Link to={`/experts/${expertId}`} className="block h-full group">
      <Card className="h-full overflow-hidden transition-all duration-300 border-border/50 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 bg-gradient-to-br from-card to-card/50 flex flex-col">
        <div className="h-1.5 bg-gradient-to-r from-primary/10 via-primary/30 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />

        <CardHeader className="p-4 pb-2 space-y-3 shrink-0">
          <div className="flex justify-between items-start">
            <div className="relative">
              <Avatar className="h-14 w-14 ring-4 ring-background shadow-sm group-hover:ring-primary/20 transition-all duration-300">
                <AvatarImage src={expert.avatar_url} className="object-cover" />
                <AvatarFallback className="bg-primary/5 text-primary text-lg font-bold">
                  {getInitials(expert.first_name || '', expert.last_name || '')}
                </AvatarFallback>
              </Avatar>
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5" title="Verified Expert">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-50" />
                </div>
              )}
            </div>

            <Badge variant="secondary" className="font-mono text-[10px] px-1.5 h-5">
              {expert.years_experience}+ YOE
            </Badge>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors line-clamp-1">
                {fullName}
              </h3>
              {expert.vetting_level === 'deep_tech_verified' && (
                <Badge variant="outline" className="h-4 px-1 gap-1 bg-purple-500/5 text-purple-600 border-purple-200 text-[9px]">
                  <Zap className="w-2.5 h-2.5 fill-purple-200" />
                  Deep Tech
                </Badge>
              )}
            </div>
            <p className="text-xs text-balance text-muted-foreground line-clamp-1">
              {domainLabels[expert.domains?.[0] as keyof typeof domainLabels] || expert.domains?.[0]} Specialist
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-1 pb-3 space-y-3 flex-grow">
          <p className="text-xs text-muted-foreground line-clamp-2 min-h-[32px] leading-relaxed">
            {expert.experience_summary}
          </p>

          <div className="flex flex-wrap gap-1.5 h-[20px] content-start overflow-hidden">
            {/* Show skills if available, otherwise fallback to domains */}
            {(expert.skills?.length ? expert.skills : expert.domains)?.slice(0, 4).map((skill, i) => (
              <Badge
                key={i}
                variant="outline"
                className="bg-background/50 hover:bg-background hover:border-primary/30 transition-colors cursor-default text-[10px] px-1.5 h-5 font-normal"
              >
                {skill.replace('_', ' ')}
              </Badge>
            ))}
            {((expert.skills?.length || expert.domains?.length || 0) > 4) && (
              <Badge variant="secondary" className="text-[10px] px-1.5 h-5 text-muted-foreground">
                +{(expert.skills?.length || expert.domains?.length || 0) - 4}
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-3 bg-muted/30 border-t flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold text-xs">
              {expert.rating ? Number(expert.rating).toFixed(1) : 'New'}
            </span>
            <span className="text-[10px] text-muted-foreground">
              ({expert.review_count || 0})
            </span>
          </div>

          <div className="flex items-center gap-2">
            {expert.total_hours > 0 && (
              <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground" title={`${expert.total_hours} Hours Billed`}>
                <Clock className="h-3 w-3" />
                {expert.total_hours}h
              </div>
            )}
            <div className="font-bold text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-md whitespace-nowrap">
              ${expert.avg_daily_rate?.toLocaleString()}/day
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}