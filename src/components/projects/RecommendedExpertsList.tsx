import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Lightbulb, Sparkles } from 'lucide-react';
import { HireExpertDialog } from '@/components/experts/HireExpertDialog';
import { useProjectExpertRecommendations } from '@/hooks/useExperts';
import { domainLabels } from '@/lib/constants';

export function RecommendedExpertsList({ project, isOwner }: { project: any, isOwner: boolean }) {
  const navigate = useNavigate();
  const { data: recommendedExperts, isLoading } = useProjectExpertRecommendations({
    title: project.title,
    description: project.description,
    expected_outcome: project.expected_outcome,
    domain: project.domain,
  });
  
  if (!isOwner) return null;

  if (isLoading) return <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <CardTitle>AI Recommended Experts</CardTitle>
          <Badge variant="secondary">{recommendedExperts?.length || 0} matches</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {!recommendedExperts || recommendedExperts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No AI recommendations available yet. Try publishing your project to attract experts.
          </p>
        ) : (
          <div className="space-y-4">
            {recommendedExperts.map((expert: any) => (
              <div key={expert.id} className="border rounded-lg p-3 flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium cursor-pointer hover:underline" onClick={() => navigate(`/experts/${expert.id}`)}>
                    {expert.display_name || expert.name}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{expert.experienceSummary || expert.bio}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {expert.rating && (
                      <Badge variant="outline" className="text-xs">
                        ⭐ {expert.rating.toFixed(1)}
                      </Badge>
                    )}
                    {expert.hourlyRates?.advisory && (
                      <Badge variant="outline" className="text-xs">
                        ${expert.hourlyRates.advisory}/hr
                      </Badge>
                    )}
                  </div>
                </div>
                
                <HireExpertDialog 
                  expert={expert}
                  defaultProjectId={project.id}
                  trigger={
                    <Button size="sm" variant="outline">
                      Invite
                    </Button>
                  }
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}