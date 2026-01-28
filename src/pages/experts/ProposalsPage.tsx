import { useState } from 'react';
import { useExpertInvitations, useRespondToInvitation } from '@/hooks/useInvitations';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Loader2, CheckCircle2, XCircle, Clock, Calendar,
  MessageSquare, Briefcase, FileText, ChevronRight, User, MousePointerClick
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { currencySymbol } from '@/lib/currency';
import { useCurrency } from '@/hooks/useCurrency';

export default function ProposalsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { convertAndFormat, displayCurrency } = useCurrency();
  const { data: invitations, isLoading } = useExpertInvitations();
  const respondMutation = useRespondToInvitation();

  const [activeTab, setActiveTab] = useState('pending');

  const handleResponse = async (invitationId: string, status: 'accepted' | 'declined') => {
    try {
      const response: any = await respondMutation.mutateAsync({ invitationId, status });

      toast({
        title: status === 'accepted' ? 'Invitation Accepted' : 'Invitation Declined',
        description: status === 'accepted'
          ? 'You have accepted the invitation. Redirecting to contract...'
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
        description: 'Failed to process invitation. Please try again.',
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
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <Briefcase className="h-6 w-6 text-zinc-400" />
          </div>
          <h3 className="font-semibold text-zinc-900">No invitations found</h3>
          <p className="text-sm text-zinc-500 max-w-sm mt-1">
            {activeTab === 'pending'
              ? "You don't have any pending invitations. Optimize your profile to get discovered."
              : "No invitations in this category."}
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-6">
        {list.map((invitation) => (
          <Card key={invitation.id} className="overflow-hidden transition-all hover:shadow-md border-zinc-200 bg-white group">
            <div className="flex flex-col md:flex-row">
              {/* Left Side: Project Info */}
              <div className="flex-1 p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                        {invitation.project?.type || 'Project Invitation'}
                      </Badge>
                      <span className="text-xs text-zinc-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {formatDistanceToNow(new Date(invitation.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 group-hover:text-primary transition-colors cursor-pointer"
                      onClick={() => navigate(`/projects/${invitation.project_id}`)}>
                      {invitation.project?.title || 'Untitled Project'}
                    </h3>
                  </div>

                  {/* Price / Budget Display */}
                  <div className="text-right shrink-0">
                    {(invitation.payment_terms || invitation.engagement_model) ? (() => {
                      const terms = typeof invitation.payment_terms === 'string'
                        ? JSON.parse(invitation.payment_terms)
                        : (invitation.payment_terms || {});
                      const currency = terms.currency || invitation.project?.currency || 'INR';

                      let amount = 0;
                      let unit = '';
                      let type = '';

                      switch (invitation.engagement_model) {
                        case 'hourly':
                          amount = terms.hourly_rate; unit = '/hr'; type = 'Hourly Rate'; break;
                        case 'daily':
                          amount = terms.daily_rate; unit = '/day'; type = 'Daily Rate'; break;
                        case 'sprint':
                          amount = terms.sprint_rate; unit = '/sprint'; type = 'Per Sprint'; break;
                        case 'fixed':
                          amount = terms.total_amount; unit = ''; type = 'Fixed Price'; break;
                      }

                      return (
                        <div className="bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                          <p className="text-lg font-bold text-emerald-700 flex items-center justify-end gap-1 notranslate">
                            {convertAndFormat(amount || 0, currency)}<span className="text-sm font-normal text-emerald-600/80">{unit}</span>
                          </p>
                          <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider text-right">{type}</p>
                        </div>
                      );
                    })() : (
                      <div className="bg-zinc-50 px-3 py-2 rounded-lg border border-zinc-100">
                        <p className="text-lg font-bold text-zinc-900 flex items-center justify-end gap-1 notranslate">
                          {invitation.project?.budget_min
                            ? `${convertAndFormat(invitation.project.budget_min, invitation.project.currency)}${invitation.project.budget_max ? ` - ${convertAndFormat(invitation.project.budget_max, invitation.project.currency)}` : '+'}`
                            : 'Negotiable'}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider text-right">Est. Budget</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-4">
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                    <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <MessageSquare className="h-3 w-3" /> Message
                    </h4>
                    <p className="text-sm text-zinc-600 italic leading-relaxed">
                      "{invitation.message || 'We would like to invite you to join this project.'}"
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Scope Preview</h4>
                      <p className="text-sm text-zinc-600 line-clamp-2 mb-2">
                        {invitation.project?.description}
                      </p>
                      <Button variant="link" className="h-auto p-0 text-primary text-xs font-medium" onClick={() => navigate(`/projects/${invitation.project_id}`)}>
                        View Project Details <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {invitation.project?.duration || 'Flexible Duration'}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5" />
                        Remote
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side / Bottom: Actions */}
              {showActions && (
                <div className="border-t md:border-t-0 md:border-l border-zinc-100 p-6 flex flex-row md:flex-col justify-end md:justify-center items-center gap-3 bg-zinc-50/30 md:w-48 shrink-0">
                  <Button
                    className="w-full bg-zinc-900 text-white hover:bg-zinc-800 shadow-lg shadow-zinc-900/10"
                    onClick={() => handleResponse(invitation.id, 'accepted')}
                    disabled={respondMutation.isPending}
                  >
                    {respondMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                    Accept
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-zinc-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                    onClick={() => handleResponse(invitation.id, 'declined')}
                    disabled={respondMutation.isPending}
                  >
                    Decline
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="min-h-screen bg-zinc-50/30">
        <div className="bg-white border-b border-zinc-100">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-zinc-900">Project Invitations</h1>
            <p className="text-sm text-zinc-500 mt-1">Manage your incoming project proposals and invitations.</p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground animate-pulse">Loading invitations...</p>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-white border border-zinc-200 p-1 h-auto rounded-xl">
                <TabsTrigger
                  value="pending"
                  className="px-4 py-2 rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary"
                >
                  Pending <Badge variant="secondary" className="ml-2 bg-zinc-100 text-zinc-600">{pendingList.length}</Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="accepted"
                  className="px-4 py-2 rounded-lg data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-600"
                >
                  Accepted <Badge variant="secondary" className="ml-2 bg-zinc-100 text-zinc-600">{acceptedList.length}</Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="declined"
                  className="px-4 py-2 rounded-lg data-[state=active]:bg-red-50 data-[state=active]:text-red-600"
                >
                  Declined
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="animate-in fade-in-50 duration-300 focus-visible:outline-none">
                {renderList(pendingList, true)}
              </TabsContent>
              <TabsContent value="accepted" className="animate-in fade-in-50 duration-300 focus-visible:outline-none">
                {renderList(acceptedList, false)}
              </TabsContent>
              <TabsContent value="declined" className="animate-in fade-in-50 duration-300 focus-visible:outline-none">
                {renderList(declinedList, false)}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </Layout>
  );
}