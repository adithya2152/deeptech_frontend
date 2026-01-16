import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Calendar, Star, ShieldCheck, Briefcase, DollarSign,
  Clock, CheckCircle2, UserCheck, CreditCard, Mail, Globe,
  Building2, ArrowLeft, Loader2, Target
} from 'lucide-react';
import { useClient } from '@/hooks/useClients';
import { useMarketplaceProjects } from '@/hooks/useProjects';
import { useUserReviews } from '@/hooks/useReviews';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ReviewsList } from '@/components/shared/ReviewsList';
import { format } from 'date-fns';

interface ClientStats {
  total_spent: number;
  hire_rate: number;
  jobs_posted_count: number;
  avg_hourly_rate: number;
  hours_billed: number;
  member_since?: string | null;
}

interface ClientProfile {
  id: string;
  first_name: string;
  last_name: string;
  company_name?: string;
  avatar_url?: string;
  location?: string;
  timezone?: string;
  rating?: number;
  review_count?: number;
  website?: string;
  verified_identity?: boolean;
  verified_payment?: boolean;
  verified_email?: boolean;
  stats?: ClientStats;
}

export default function ClientPublicProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: rawClient, isLoading: isLoadingClient } = useClient(id!);
  const { data: reviews = [], isLoading: isLoadingReviews } = useUserReviews(id!, 'buyer');
  const { data: marketplaceProjects = [], isLoading: isLoadingProjects } = useMarketplaceProjects(id!);

  const client = rawClient as unknown as ClientProfile | undefined;

  if (isLoadingClient) {
    return (
      <Layout>
        <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Loading Client Profile...</p>
        </div>
      </Layout>
    );
  }

  if (!client) {
    return (
      <Layout>
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Client Not Found</h1>
          <Button onClick={() => navigate('/marketplace')} className="mt-8">
            Back to Marketplace
          </Button>
        </div>
      </Layout>
    );
  }

  const fullName = `${client.first_name} ${client.last_name}`;
  const initials = `${client.first_name[0]}${client.last_name[0]}`;
  const stats = client.stats || {
    total_spent: 0,
    hire_rate: 0,
    jobs_posted_count: 0,
    avg_hourly_rate: 0,
    hours_billed: 0,
    member_since: new Date().toISOString()
  };

  const formatDate = (value?: string | null) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return format(d, 'MMM d, yyyy');
  };

  const clientProjects = marketplaceProjects
    .filter((p: any) => p.buyer_id === client.id && p.status === 'open')
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const latestClientProjects = clientProjects.slice(0, 3);

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="pl-0">
            <ArrowLeft className="h-4 w-4 ml-2" />
            Back
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: Identity & Verifications */}
          <div className="space-y-6">
            <Card className="border-none shadow-xl shadow-primary/5">
              <CardContent className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  <Avatar className="h-32 w-32 border-4 border-white shadow-lg mx-auto">
                    <AvatarImage src={client.avatar_url} />
                    <AvatarFallback className="bg-primary/5 text-primary text-3xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  {client.verified_identity && (
                    <div className="absolute bottom-1 right-1 bg-primary text-primary-foreground p-1.5 rounded-full border-2 border-white" title="Identity Verified">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                  )}
                </div>

                <h1 className="text-2xl font-bold text-foreground">{fullName}</h1>
                {client.company_name && (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground mt-1">
                    <Building2 className="h-4 w-4" />
                    <span className="font-medium">{client.company_name}</span>
                  </div>
                )}

                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <Badge variant="outline" className="bg-zinc-50">
                    <MapPin className="h-3 w-3 mr-1" /> {client.location || 'Remote'}
                  </Badge>
                  <Badge variant="outline" className="bg-zinc-50">
                    <Clock className="h-3 w-3 mr-1" /> {client.timezone || 'UTC'}
                  </Badge>
                </div>

                <div className="mt-6 pt-6 border-t border-dashed space-y-3 text-left">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Verifications</h3>

                  <div className={`flex items-center gap-3 ${client.verified_payment ? 'text-primary' : 'text-muted-foreground/50'}`}>
                    <CreditCard className="h-5 w-5" />
                    <span className="text-sm font-medium">Payment Method {client.verified_payment ? 'Verified' : 'Pending'}</span>
                    {client.verified_payment && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                  </div>

                  <div className={`flex items-center gap-3 ${client.verified_identity ? 'text-primary' : 'text-muted-foreground/50'}`}>
                    <UserCheck className="h-5 w-5" />
                    <span className="text-sm font-medium">Identity {client.verified_identity ? 'Verified' : 'Unverified'}</span>
                    {client.verified_identity && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                  </div>

                  <div className={`flex items-center gap-3 ${client.verified_email ? 'text-primary' : 'text-muted-foreground/50'}`}>
                    <Mail className="h-5 w-5" />
                    <span className="text-sm font-medium">Email {client.verified_email ? 'Verified' : 'Unverified'}</span>
                    {client.verified_email && <CheckCircle2 className="h-4 w-4 ml-auto" />}
                  </div>
                </div>

                {client.website && (
                  <div className="mt-6 pt-6 border-t border-dashed">
                    <a href={client.website} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-primary hover:underline text-sm">
                      <Globe className="h-4 w-4" /> Company Website
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Stats, Jobs, Reviews */}
          <div className="lg:col-span-2 space-y-8">

            {/* STATS GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="border-none shadow-sm bg-zinc-900 text-zinc-50">
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <div className="mb-2 p-2 bg-zinc-800 rounded-lg w-fit">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{Number(client.rating || 0).toFixed(1)}</div>
                    <div className="text-xs text-zinc-400">{client.review_count || 0} Reviews</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <div className="mb-2 p-2 bg-blue-50 text-blue-600 rounded-lg w-fit">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.jobs_posted_count}</div>
                    <div className="text-xs text-muted-foreground">Jobs Posted</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <div className="mb-2 p-2 bg-primary/10 text-primary rounded-lg w-fit">
                    <Target className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.hire_rate}%</div>
                    <div className="text-xs text-muted-foreground">Hire Rate</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm">
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <div className="mb-2 p-2 bg-purple-50 text-purple-600 rounded-lg w-fit">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {stats.total_spent > 10000
                        ? `$${(stats.total_spent / 1000).toFixed(0)}k+`
                        : `$${stats.total_spent.toLocaleString()}`}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Spent</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* DETAILS TABS */}
            <Card className="border-none shadow-xl shadow-primary/5">
              <CardContent className="p-6">
                <Tabs defaultValue="jobs">
                  <TabsList className="w-full justify-start h-auto flex-wrap gap-2 bg-muted/30 p-1 rounded-xl mb-6">
                    <TabsTrigger value="jobs" className="px-4 py-2 rounded-lg">Open Jobs ({clientProjects.length})</TabsTrigger>
                    <TabsTrigger value="reviews" className="px-4 py-2 rounded-lg">Reviews ({reviews.length})</TabsTrigger>
                    <TabsTrigger value="about" className="px-4 py-2 rounded-lg">About</TabsTrigger>
                  </TabsList>

                  <TabsContent value="jobs" className="space-y-4">
                    {latestClientProjects.length > 0 ? (
                      <>
                        {latestClientProjects.map((project: any) => (
                          <ProjectCard key={project.id} project={project} />
                        ))}

                        {clientProjects.length > 3 && (
                          <div className="pt-2">
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => navigate(`/marketplace?buyerId=${client.id}`)}
                            >
                              View all open jobs
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed rounded-xl">
                        <Briefcase className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground">No active jobs at the moment.</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="reviews">
                    <ReviewsList reviews={reviews} isLoading={isLoadingReviews} userType="Client" />
                  </TabsContent>

                  <TabsContent value="about" className="space-y-6">
                    {/* Organisation About Section */}
                    {(client as any).client_type === 'organisation' ? (
                      <>
                        <div>
                          <h3 className="font-semibold mb-2">About the Company</h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {(client as any).company_description || "This company hasn't added a description yet."}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                          <div>
                            <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Member Since</p>
                            <p className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(stats.member_since)}
                            </p>
                          </div>
                          {(client as any).industry && (
                            <div>
                              <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Industry</p>
                              <p className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                {(client as any).industry}
                              </p>
                            </div>
                          )}
                          {(client as any).company_size && (
                            <div>
                              <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Company Size</p>
                              <p className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                {(client as any).company_size}
                              </p>
                            </div>
                          )}
                          {(client as any).preferred_engagement_model && (
                            <div>
                              <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Preferred Engagement</p>
                              <p className="flex items-center gap-2 capitalize">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                {(client as any).preferred_engagement_model === 'daily' ? 'Daily Rate' :
                                  (client as any).preferred_engagement_model === 'fixed' ? 'Fixed Price' :
                                    (client as any).preferred_engagement_model === 'sprint' ? 'Sprint-Based' :
                                      (client as any).preferred_engagement_model}
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      /* Individual Client About Section */
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Member Since</p>
                            <p className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(stats.member_since)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Client Type</p>
                            <p className="flex items-center gap-2 capitalize">
                              <UserCheck className="h-4 w-4 text-muted-foreground" />
                              Individual
                            </p>
                          </div>
                          {(client as any).preferred_engagement_model && (
                            <div>
                              <p className="text-xs font-bold uppercase text-muted-foreground mb-1">Preferred Engagement</p>
                              <p className="flex items-center gap-2 capitalize">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                {(client as any).preferred_engagement_model === 'daily' ? 'Daily Rate' :
                                  (client as any).preferred_engagement_model === 'fixed' ? 'Fixed Price' :
                                    (client as any).preferred_engagement_model === 'sprint' ? 'Sprint-Based' :
                                      (client as any).preferred_engagement_model}
                              </p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}