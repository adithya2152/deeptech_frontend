import { useState } from 'react';
import { useExpertInvitations, useRespondToInvitation } from '@/hooks/useInvitations';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Loader2, CheckCircle2, XCircle, Clock, DollarSign, Calendar, 
  MessageSquare, Briefcase, FileText, ChevronRight 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function ProposalsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: invitations, isLoading } = useExpertInvitations();
  const respondMutation = useRespondToInvitation();

  const [activeTab, setActiveTab] = useState('pending');

  const handleResponse = async (invitationId: string, status: 'accepted' | 'declined') => {
    try {
      const response: any = await respondMutation.mutateAsync({ invitationId, status });
      
      toast({
        title: status === 'accepted' ? 'Invitation Accepted' : 'Invitation Declined',
        description: status === 'accepted' 
          ? 'Project active. Contract created. Redirecting...' 
          : 'You have declined the invitation.',
        variant: status === 'accepted' ? 'default' : 'destructive',
      });

      if (status === 'accepted') {
        // If the backend returns a contractId, redirect specifically to that contract
        if (response?.contractId) {
          navigate(`/contracts/${response.contractId}`);
        } else {
          navigate('/contracts');
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update invitation status.',
        variant: 'destructive',
      });
    }
  };

  const pendingList = invitations?.filter((p: any) => p.status === 'pending') || [];
  const acceptedList = invitations?.filter((p: any) => p.status === 'accepted') || [];
  const declinedList = invitations?.filter((p: any) => p.status === 'declined') || [];

  const renderList = (list: any[], showActions: boolean) => {
    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-xl bg-muted/20">
          <FileText className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <h3 className="font-semibold text-lg text-muted-foreground">No invitations found</h3>
        </div>
      );
    }

    return (
      <div className="grid gap-4">
        {list.map((invitation) => (
          <Card key={invitation.id} className="overflow-hidden transition-all hover:shadow-md border-muted/60">
            <CardHeader className="bg-muted/10 pb-4">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                     <Badge variant="outline" className="bg-background">{invitation.project?.type || 'Project'}</Badge>
                     <span className="text-xs text-muted-foreground flex items-center gap-1">
                       <Clock className="h-3 w-3" /> {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                     </span>
                  </div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    {invitation.project?.title || 'Untitled Project'}
                  </CardTitle>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-emerald-600 flex items-center justify-end gap-1">
                    <DollarSign className="h-4 w-4" />
                    {invitation.project?.budget_min ? `${invitation.project.budget_min.toLocaleString()} - ${invitation.project.budget_max.toLocaleString()}` : 'Negotiable'}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Estimated Budget</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-4 gap-6">
                <div className="md:col-span-3 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-2 text-foreground/80">Message from Buyer</h4>
                    <div className="bg-muted/30 p-4 rounded-lg text-sm text-muted-foreground italic border border-muted/50 relative">
                      <MessageSquare className="h-4 w-4 absolute top-4 left-3 text-muted-foreground/50" />
                      <div className="pl-6">
                        "{invitation.message || "I'd like to invite you to work on this project."}"
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1 text-foreground/80">Project Scope</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {invitation.project?.description}
                    </p>
                    <Button variant="link" className="h-auto p-0 text-primary mt-1" onClick={() => navigate(`/projects/${invitation.project_id}`)}>
                      View Full Project Details <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </div>
                <div className="md:col-span-1 space-y-3 pt-1">
                  <div className="p-3 bg-muted/20 rounded-lg border border-muted/50">
                    <p className="text-xs text-muted-foreground uppercase font-bold mb-2">Details</p>
                    <div className="space-y-2">
                       <div className="flex items-center gap-2 text-sm">
                         <Calendar className="h-4 w-4 text-primary/70" />
                         <span>{invitation.project?.duration || 'TBD'} duration</span>
                       </div>
                       <div className="flex items-center gap-2 text-sm">
                         <Briefcase className="h-4 w-4 text-primary/70" />
                         <span>Remote</span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            {showActions && (
              <CardFooter className="bg-muted/5 border-t py-4 flex justify-end gap-3">
                 <Button 
                   variant="outline" 
                   className="border-destructive/30 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50"
                   onClick={() => handleResponse(invitation.id, 'declined')}
                   disabled={respondMutation.isPending}
                 >
                   <XCircle className="h-4 w-4 mr-2" />
                   Decline
                 </Button>
                 <Button 
                   className="bg-emerald-600 hover:bg-emerald-700 text-white"
                   onClick={() => handleResponse(invitation.id, 'accepted')}
                   disabled={respondMutation.isPending}
                 >
                   {respondMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                   Accept & Chat
                 </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Job Invitations</h1>
            <p className="text-muted-foreground mt-1">Manage project invites sent by buyers.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-muted/50 p-1">
              <TabsTrigger value="pending" className="px-6">Pending ({pendingList.length})</TabsTrigger>
              <TabsTrigger value="accepted" className="px-6">Accepted ({acceptedList.length})</TabsTrigger>
              <TabsTrigger value="declined" className="px-6">Declined</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="animate-in fade-in-50 duration-300">
               {renderList(pendingList, true)}
            </TabsContent>
            <TabsContent value="accepted" className="animate-in fade-in-50 duration-300">
               {renderList(acceptedList, false)}
            </TabsContent>
            <TabsContent value="declined" className="animate-in fade-in-50 duration-300">
               {renderList(declinedList, false)}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </Layout>
  );
}