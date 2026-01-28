import { Link } from 'react-router-dom';
import { Expert } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Clock, CheckCircle2, TrendingUp } from 'lucide-react';
import { domainLabels } from '@/lib/constants';
import { useCurrency } from '@/hooks/useCurrency';
import { cn, getTierStyle } from '@/lib/utils';

interface ExpertCardProps {
  expert: Expert;
}

export function ExpertCard({ expert }: ExpertCardProps) {
  const { convertAndFormat } = useCurrency();
  const getInitials = (first: string, last: string) =>
    `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();

  const fullName = `${expert.first_name || ''} ${expert.last_name || ''}`.trim();
  const expertId = expert.expert_profile_id || expert.profile_id || expert.id;
  const isVerified = expert.expert_status === 'verified' || expert.vetting_level === 'deep_tech_verified';
  const tierStyle = expert.tier ? getTierStyle(expert.tier.tier_level) : null;
  const hasStrongProfile = expert.rating >= 4.5 && expert.review_count >= 10;
  const isTopPerformer = expert.total_hours > 100;

  return (
    <Link to={`/experts/${expertId}`} className="block h-full group">
      <Card className="h-full overflow-hidden transition-all duration-500 ease-out border border-border/30 hover:border-primary/40 hover:shadow-2xl hover:shadow-primary/5 bg-card/50 backdrop-blur-sm flex flex-col group-hover:-translate-y-1 relative">

        {/* Sleek gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-accent/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Minimal top indicator */}
        {isTopPerformer && (
          <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-60" />
        )}

        <CardHeader className="p-5 pb-3 space-y-3 shrink-0 relative z-10">
          <div className="flex items-start gap-3">
            {/* Sleek avatar */}
            <div className="relative shrink-0">
              <div className={cn(
                "rounded-full p-[1.5px] transition-all duration-500",
                tierStyle
                  ? `bg-gradient-to-br ${tierStyle.gradient}`
                  : "bg-border/50"
              )}>
                <Avatar className="h-12 w-12 border border-background/50">
                  <AvatarImage src={expert.avatar_url} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-muted to-muted/50 text-foreground/80 text-sm font-medium">
                    {getInitials(expert.first_name || '', expert.last_name || '')}
                  </AvatarFallback>
                </Avatar>
              </div>

              {isVerified && (
                <div className="absolute -bottom-0.5 -right-0.5 bg-background rounded-full p-[1px]">
                  <div className="bg-emerald-500 rounded-full p-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                  </div>
                </div>
              )}
            </div>

            {/* Compact info */}
            <div className="flex-1 min-w-0 space-y-1">
              <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors line-clamp-1 tracking-tight">
                {fullName}
              </h3>
              <p className="text-xs text-muted-foreground/80 line-clamp-1 font-medium">
                {domainLabels[expert.domains?.[0] as keyof typeof domainLabels] || expert.domains?.[0]}
              </p>

              {/* Minimalist tier indicator */}
              {expert.tier && (
                <div className={cn(
                  "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-white/20 shadow-sm backdrop-blur-[1px]",
                  tierStyle ? `${tierStyle.gradient} text-black/90` : "bg-gray-100 text-gray-800"
                )} title={`Tier Level ${expert.tier.tier_level}`}>
                  <div className="flex items-center justify-center bg-white w-4 h-4 rounded-full text-[9px] font-extrabold shadow-inner ring-1 ring-black/5 text-black">
                    {expert.tier.tier_level}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold tracking-tight">
                    <span className="drop-shadow-sm filter scale-110">{expert.tier.badge_icon || '👑'}</span>
                    <span>{expert.tier.tier_name}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Subtle years badge */}
            <Badge variant="outline" className="text-[9px] h-5 px-1.5 font-mono border-border/30 text-muted-foreground/60 shrink-0">
              {expert.years_experience}y
            </Badge>
          </div>

          {/* Compact badges row - only show if exists */}
          {expert.badges && expert.badges.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {expert.badges.slice(0, 2).map((badge) => (
                <Badge
                  key={badge.id}
                  variant="secondary"
                  className="text-[9px] h-5 px-1.5 bg-amber-50/80 text-amber-700 border-0 font-medium"
                  title={badge.description || badge.tag_name}
                >
                  <span className="text-[10px] mr-0.5">{badge.tag_icon || '🏅'}</span>
                  <span className="truncate max-w-[70px]">{badge.tag_name}</span>
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>

        <CardContent className="px-5 pb-3 space-y-3 flex-grow relative z-10">
          {/* Concise summary */}
          <p className="text-xs text-muted-foreground/75 line-clamp-2 leading-relaxed">
            {expert.experience_summary}
          </p>

          {/* Minimal skills display */}
          <div className="flex flex-wrap gap-1">
            {(expert.skills?.length ? expert.skills : expert.domains)?.slice(0, 4).map((skill, i) => (
              <Badge
                key={i}
                variant="secondary"
                className="text-[10px] h-5 px-2 bg-secondary/40 hover:bg-secondary/60 border-0 transition-all font-medium"
              >
                {skill.replace('_', ' ')}
              </Badge>
            ))}
            {((expert.skills?.length || expert.domains?.length || 0) > 4) && (
              <Badge variant="outline" className="text-[9px] h-5 px-1.5 border-dashed border-border/30 text-muted-foreground/50">
                +{(expert.skills?.length || expert.domains?.length || 0) - 4}
              </Badge>
            )}
          </div>
        </CardContent>

        <CardFooter className="px-5 py-3 bg-gradient-to-b from-transparent to-muted/20 border-t border-border/20 flex items-center justify-between gap-3 shrink-0 relative z-10">
          {/* Sleek rating */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1">
              <Star className={cn(
                "h-3.5 w-3.5 transition-colors",
                hasStrongProfile
                  ? "fill-amber-400 text-amber-400"
                  : "fill-muted-foreground/30 text-muted-foreground/30"
              )} />
              <span className="font-semibold text-sm">
                {expert.rating ? Number(expert.rating).toFixed(1) : '—'}
              </span>
              <span className="text-[10px] text-muted-foreground/50">
                ({expert.review_count || 0})
              </span>
            </div>

            {expert.total_hours > 0 && (
              <>
                <div className="w-px h-3 bg-border/30" />
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
                  <Clock className="h-3 w-3" strokeWidth={2} />
                  <span className="font-medium">{expert.total_hours}h</span>
                </div>
              </>
            )}
          </div>

          {/* Clean rate display */}
          <div className="flex items-baseline gap-0.5">
            <span className="font-bold text-base text-foreground">
              {convertAndFormat(expert.avg_hourly_rate || 0, 'INR')}
            </span>
            <span className="text-[9px] text-muted-foreground/50 font-medium">
              /hr
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}