import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, UserSearch } from 'lucide-react';
import { HireExpertDialog } from '@/components/experts/HireExpertDialog';
import { useProjectExpertRecommendations } from '@/hooks/useExperts';

// 1. The Wrapper Component (Manages the trigger)
export function RecommendedExpertsList({ project, isOwner }: { project: any, isOwner: boolean }) {
  const [showRecommendations, setShowRecommendations] = useState(false);

  if (!isOwner) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          <CardTitle>AI Recommended Experts</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {!showRecommendations ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-3 text-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <UserSearch className="h-6 w-6 text-purple-600" />
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              Use AI to analyze your project requirements and find the perfect experts for the job.
            </p>
            <Button 
              onClick={() => setShowRecommendations(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Find Experts with AI
            </Button>
          </div>
        ) : (
          // The hook is only called when this component renders
          <ExpertResults project={project} />
        )}
      </CardContent>
    </Card>
  );
}

// 2. The Logic Component (Contains the API Call)
function ExpertResults({ project }: { project: any }) {
  const navigate = useNavigate();
  
  // This hook now only runs because <ExpertResults /> is mounted AFTER the click
  const { data: recommendedExperts, isLoading } = useProjectExpertRecommendations({
    title: project.title,
    description: project.description,
    expected_outcome: project.expected_outcome,
    domain: project.domain,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-2">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <p className="text-sm text-muted-foreground animate-pulse">Analyzing project requirements...</p>
      </div>
    );
  }

  if (!recommendedExperts || recommendedExperts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No AI recommendations available yet. Try adding more details to your project.
      </p>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex justify-end">
         <Badge variant="secondary" className="mb-2">{recommendedExperts.length} matches found</Badge>
      </div>
      
      {recommendedExperts.map((expert: any) => (
        <div key={expert.id} className="border rounded-lg p-3 flex justify-between items-start hover:bg-slate-50 transition-colors">
          <div className="flex-1">
            <p className="font-medium cursor-pointer hover:underline text-primary" onClick={() => navigate(`/experts/${expert.id}`)}>
              {expert.display_name || expert.name}
            </p>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{expert.experienceSummary || expert.bio}</p>
            <div className="flex items-center gap-2 mt-2">
              {expert.rating && (
                <Badge variant="outline" className="text-xs bg-white">
                  ⭐ {expert.rating.toFixed(1)}
                </Badge>
              )}
              {expert.hourlyRates?.advisory && (
                <Badge variant="outline" className="text-xs bg-white">
                  ${expert.hourlyRates.advisory}/hr
                </Badge>
              )}
            </div>
          </div>
          
          <HireExpertDialog 
            expert={expert}
            defaultProjectId={project.id}
            trigger={
              <Button size="sm" variant="outline" className="ml-2">
                Invite
              </Button>
            }
          />
        </div>
      ))}
    </div>
  );
}