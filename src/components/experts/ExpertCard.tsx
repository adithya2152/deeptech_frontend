import { Link } from 'react-router-dom';
import { Expert } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Clock, Shield, Briefcase, Zap, Rocket } from 'lucide-react';
import { domainLabels } from '@/lib/constants';

interface ExpertCardProps {
  expert: Expert;
}

export function ExpertCard({ expert }: ExpertCardProps) {
  const getInitials = (first: string, last: string) => 
    `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();

  const fullName = `${expert.first_name || ''} ${expert.last_name || ''}`.trim();

  const getVettingBadge = () => {
    if (expert.expert_status === 'verified') {
      return (
        <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 gap-1 hover:bg-emerald-100">
          <Shield className="h-3 w-3 fill-emerald-100" />
          Verified
        </Badge>
      );
    }
    if (expert.vetting_level === 'deep_tech_verified') {
      return (
        <Badge className="bg-purple-50 text-purple-700 border border-purple-100 gap-1 hover:bg-purple-100">
          <Zap className="h-3 w-3 fill-purple-100" />
          Deep Tech
        </Badge>
      );
    }
    if (expert.expert_status === 'rookie') {
        return (
          <Badge className="bg-blue-50 text-blue-700 border border-blue-100 gap-1 hover:bg-blue-100">
            <Rocket className="h-3 w-3" />
            Rising Talent
          </Badge>
        );
      }
    return null;
  };

  return (
    <Link to={`/experts/${expert.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer h-full">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 ring-2 ring-border group-hover:ring-primary/50 transition-all">
              <AvatarImage src={expert.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {getInitials(expert.first_name || '', expert.last_name || '')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground truncate">{fullName}</h3>
                {getVettingBadge()}
              </div>
              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                {expert.years_experience > 0 && (
                   <span className="flex items-center gap-1">
                     <Briefcase className="h-3.5 w-3.5" />
                     {expert.years_experience} Years Exp.
                   </span>
                )}
              </div>
            </div>
          </div>

          <p className="mt-4 text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
            {expert.experience_summary}
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5 h-[20px] content-start">
            {expert.domains?.slice(0, 3).map(domain => (
              <Badge key={domain} variant="outline" className="text-xs">
                {domainLabels[domain as keyof typeof domainLabels] || domain}
              </Badge>
            ))}
            {(expert.domains?.length || 0) > 3 && (
                <Badge variant="outline" className="text-xs">+{expert.domains.length - 3}</Badge>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium">{expert.rating ? Number(expert.rating).toFixed(1) : 'N/A'}</span>
              <span className="text-sm text-muted-foreground">({expert.review_count || 0})</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1" title="Hours Billed">
                <Clock className="h-4 w-4" />
                {expert.total_hours?.toLocaleString() || 0}h
              </div>
              <div className="font-semibold text-foreground">
                ${expert.avg_daily_rate?.toLocaleString() || 0}/day
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}