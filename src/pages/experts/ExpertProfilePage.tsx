import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star,
  Shield,
  FileText,
  Award,
  MessageSquare,
  ArrowLeft,
  Loader2,
  ExternalLink,
  Briefcase,
  Target,
  Clock,
  Flag,
  Rocket,
  Globe,
  Video,
  Package,
  Zap,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useExpert } from '@/hooks/useExperts';
import { useStartDirectChat } from '@/hooks/useMessages';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { domainLabels } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';
import { ReportDialog } from '@/components/shared/ReportDialog';

const getFileNameFromUrl = (url: string) => {
  if (!url) return 'View Document';
  try {
    const decodedUrl = decodeURIComponent(url);
    const parts = decodedUrl.split('/');
    const lastPart = parts[parts.length - 1];
    if (lastPart.trim() === '') return parts[parts.length - 2] || url;
    return lastPart.split('?')[0];
  } catch (e) {
    return url;
  }
};

export default function ExpertProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const { data: expert, isLoading } = useExpert(id!);
  const startConversationMutation = useStartDirectChat();
  const [showReportDialog, setShowReportDialog] = useState(false);

  const handleStartConversation = async () => {
    if (!expert) return;
    try {
      const chatId = await startConversationMutation.mutateAsync(expert.id);
      navigate(`/messages?id=${chatId}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start conversation.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex h-[80vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">Retrieving Technical Dossier...</p>
        </div>
      </Layout>
    );
  }

  if (!expert) {
    return (
      <Layout>
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">Expert Profile Not Found</h1>
          <Button onClick={() => navigate('/experts')} className="mt-8">
            Return to Discovery
          </Button>
        </div>
      </Layout>
    );
  }

  const fullName = `${expert.first_name || ''} ${expert.last_name || ''}`.trim() || 'Expert';
  const getInitials = (first: string, last: string) => `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();
  const isOwnProfile = user?.id === expert.id;

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate(-1)} className="pl-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Search Results
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-xl shadow-primary/5">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="relative">
                    <Avatar className="h-32 w-32 border-4 border-white shadow-lg ring-1 ring-primary/10">
                      <AvatarImage src={expert.avatar_url} />
                      <AvatarFallback className="bg-primary/5 text-primary text-3xl font-bold">
                        {getInitials(expert.first_name || '', expert.last_name || '')}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            {fullName}
                          </h1>
                          
                          {/* Status Badges */}
                          {expert.expert_status === 'verified' && (
                            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 flex gap-1 items-center px-3 hover:bg-emerald-100">
                              <Shield className="h-3 w-3 fill-emerald-100" /> Verified
                            </Badge>
                          )}
                          {expert.expert_status === 'rookie' && (
                            <Badge className="bg-blue-50 text-blue-700 border border-blue-100 flex gap-1 items-center px-3 hover:bg-blue-100">
                              <Rocket className="h-3 w-3" /> Rising Talent
                            </Badge>
                          )}
                          {expert.vetting_level === 'deep_tech_verified' && (
                            <Badge className="bg-purple-50 text-purple-700 border border-purple-100 flex gap-1 items-center px-3 hover:bg-purple-100">
                              <Zap className="h-3 w-3 fill-purple-100" /> Deep Tech
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {expert.years_experience > 0 && (
                            <span className="flex items-center gap-1.5 font-medium">
                                <Briefcase className="h-4 w-4" /> {expert.years_experience} Years Exp.
                            </span>
                          )}
                          <span className="flex items-center gap-1.5 font-medium">
                             <Activity className="h-4 w-4" /> Responds in ~{expert.response_time_hours || 24}h
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-md leading-relaxed max-w-2xl whitespace-pre-wrap">
                      {expert.experience_summary}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {expert.domains?.map((domain: string) => (
                        <Badge key={domain} variant="outline" className="bg-primary/5 border-primary/10 text-primary/80 capitalize">
                          {domainLabels[domain as keyof typeof domainLabels] || domain}
                        </Badge>
                      ))}
                    </div>
                    
                    {expert.languages && expert.languages.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                            <Globe className="h-3 w-3" />
                            <span>Speaks: {expert.languages.join(', ')}</span>
                        </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-8 mt-10 pt-8 border-t border-muted/30">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-xl text-foreground">{expert.rating ? Number(expert.rating).toFixed(1) : 'N/A'}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">{expert.review_count || 0} reviews</p>
                  </div>
                  <div className="space-y-1 border-x border-muted/30 px-8 text-center">
                    <p className="font-bold text-xl text-foreground">{expert.total_hours?.toLocaleString() || 0}</p>
                    <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Hours Billed</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                       <Activity className="h-5 w-5 text-emerald-500" />
                       <p className="font-bold text-xl text-foreground">~{expert.response_time_hours || 24}h</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Avg. Response</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="skills">
              <TabsList className="w-full justify-start h-12 bg-muted/30 p-1 rounded-xl">
                <TabsTrigger value="skills" className="px-8 rounded-lg">Skills & Expertise</TabsTrigger>
                <TabsTrigger value="publications" className="px-8 rounded-lg">Publications & IP</TabsTrigger>
                <TabsTrigger value="products" className="px-8 rounded-lg">Products</TabsTrigger>
              </TabsList>

              <TabsContent value="skills">
                <Card className="border-none shadow-lg shadow-primary/5">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/60 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" /> Specialized Skills
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {expert.skills?.map((skill: string, i: number) => (
                            <Badge key={i} variant="secondary" className="px-3 py-1 text-sm bg-zinc-100 text-zinc-700">
                                {skill}
                            </Badge>
                        ))}
                        {(!expert.skills || expert.skills.length === 0) && (
                            <p className="text-sm text-muted-foreground italic">No specific skills listed.</p>
                        )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="publications" className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <Card className="border-none shadow-lg shadow-primary/5">
                    <CardHeader>
                      <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/60 flex items-center gap-2">
                        <Award className="h-4 w-4" /> Patents ({expert.patents?.length || 0})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {expert.patents?.map((url: string, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl border bg-primary/[0.02]">
                            <a 
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-between hover:text-primary transition-colors"
                            >
                                <span className="text-xs font-semibold text-foreground/80 truncate mr-2">{getFileNameFromUrl(url)}</span>
                                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            </a>
                        </div>
                      ))}
                      {(!expert.patents || expert.patents.length === 0) && <p className="text-sm text-muted-foreground italic">No patents listed.</p>}
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-lg shadow-primary/5">
                    <CardHeader>
                      <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/60 flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Research Papers
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {expert.papers?.map((url: string, i: number) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl border bg-primary/[0.02]">
                           <a 
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 flex items-center justify-between hover:text-primary transition-colors"
                            >
                                <span className="text-xs font-semibold text-foreground/80 italic truncate mr-2">{getFileNameFromUrl(url)}</span>
                                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            </a>
                        </div>
                      ))}
                      {(!expert.papers || expert.papers.length === 0) && <p className="text-sm text-muted-foreground italic">No papers listed.</p>}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="products">
                <Card className="border-none shadow-lg shadow-primary/5">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/60 flex items-center gap-2">
                      <Package className="h-4 w-4" /> Products ({expert.products?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {expert.products?.map((url: string, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl border bg-primary/[0.02]">
                          <a 
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 flex items-center justify-between hover:text-primary transition-colors"
                          >
                              <span className="text-xs font-semibold text-foreground/80 truncate mr-2">{getFileNameFromUrl(url)}</span>
                              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          </a>
                      </div>
                    ))}
                    {(!expert.products || expert.products.length === 0) && <p className="text-sm text-muted-foreground italic">No products listed.</p>}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-xl shadow-primary/5">
              <CardHeader className="bg-primary/[0.02] border-b border-primary/5">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/60">Service Fee Structure</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className={`flex justify-between items-center p-4 border rounded-2xl relative transition-all ${expert.preferred_engagement_mode === 'daily' ? 'bg-emerald-50/50 border-emerald-200 shadow-sm' : 'bg-primary/[0.02] border-primary/5'}`}>
                  {expert.preferred_engagement_mode === 'daily' && (
                     <div className="absolute -top-3 left-4 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" /> PREFERRED
                     </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Clock className={`h-4 w-4 ${expert.preferred_engagement_mode === 'daily' ? 'text-emerald-500' : 'text-primary/40'}`} />
                    <span className="text-sm font-bold text-foreground/70">Daily Rate</span>
                  </div>
                  <span className="text-lg font-black text-foreground">${expert.avg_daily_rate?.toLocaleString() || 0}/day</span>
                </div>

                <div className={`flex justify-between items-center p-4 border rounded-2xl relative transition-all ${expert.preferred_engagement_mode === 'sprint' ? 'bg-emerald-50/50 border-emerald-200 shadow-sm' : 'bg-primary/[0.02] border-primary/5'}`}>
                  {expert.preferred_engagement_mode === 'sprint' && (
                     <div className="absolute -top-3 left-4 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" /> PREFERRED
                     </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Rocket className={`h-4 w-4 ${expert.preferred_engagement_mode === 'sprint' ? 'text-emerald-500' : 'text-primary/40'}`} />
                    <span className="text-sm font-bold text-foreground/70">Sprint Rate</span>
                  </div>
                  <span className="text-lg font-black text-foreground">${expert.avg_sprint_rate?.toLocaleString() || 0}/sprint</span>
                </div>

                <div className={`flex justify-between items-center p-4 border rounded-2xl relative transition-all ${expert.preferred_engagement_mode === 'fixed' ? 'bg-emerald-50/50 border-emerald-200 shadow-sm' : 'bg-primary/[0.02] border-primary/5'}`}>
                  {expert.preferred_engagement_mode === 'fixed' && (
                     <div className="absolute -top-3 left-4 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3" /> PREFERRED
                     </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Target className={`h-4 w-4 ${expert.preferred_engagement_mode === 'fixed' ? 'text-emerald-500' : 'text-primary/40'}`} />
                    <span className="text-sm font-bold text-foreground/70">Fixed Project</span>
                  </div>
                  <span className="text-lg font-black text-foreground">${expert.avg_fixed_rate?.toLocaleString() || 0}+</span>
                </div>
              </CardContent>
            </Card>

            {expert.profile_video_url && (
                <Card className="border-none shadow-md overflow-hidden">
                    <CardHeader className="py-3 bg-zinc-50 border-b">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                             <Video className="h-3 w-3" /> Intro Video
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 bg-black aspect-video flex items-center justify-center">
                        <a href={expert.profile_video_url} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 text-white/80 hover:text-white transition-colors">
                             <ExternalLink className="h-8 w-8" />
                             <span className="text-xs font-medium">Watch on External Site</span>
                        </a>
                    </CardContent>
                </Card>
            )}

            <div className="space-y-4 pt-2">
              {isAuthenticated ? (
                isOwnProfile ? (
                  <Button variant="outline" className="w-full h-14 rounded-2xl font-bold border-primary/20 hover:bg-primary/5" onClick={() => navigate('/profile')}>
                    Manage Portfolio
                  </Button>
                ) : user?.role === 'buyer' ? (
                  <div className="grid gap-4">
                    <Button
                      className="w-full h-14 rounded-2xl text-md font-bold shadow-lg shadow-primary/20"
                      onClick={() => navigate(`/projects/new?expert=${expert.id}`)}
                    >
                      Hire {expert.first_name}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full h-14 rounded-2xl font-bold border-primary/20 hover:bg-primary/5"
                      disabled={startConversationMutation.isPending}
                      onClick={handleStartConversation}
                    >
                      {startConversationMutation.isPending ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <>
                          <MessageSquare className="h-5 w-5 mr-3 text-primary/60" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </div>
                ) : null
              ) : (
                <Button className="w-full h-14 rounded-2xl text-md font-bold shadow-lg shadow-primary/20" onClick={() => navigate('/login')}>
                  Authenticate to Engage
                </Button>
              )}
            </div>

            <div className="p-5 bg-primary/5 border border-primary/10 rounded-3xl">
              <div className="flex gap-3 items-center mb-3">
                <Shield className="h-5 w-5 text-emerald-500" />
                <p className="text-sm font-bold text-primary">Secure Protocol</p>
              </div>
              <p className="text-[11px] leading-relaxed text-primary/70">
                Escrow and automated NDA protocols active. IP remains with the buyer through the technical duration.
              </p>
            </div>

            {!isOwnProfile && isAuthenticated && (
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-destructive text-xs h-8"
                  onClick={() => setShowReportDialog(true)}
                >
                  <Flag className="h-3 w-3 mr-2" />
                  Report {expert.first_name}
                </Button>
              </div>
            )}
          </div>
        </div>

        <ReportDialog
          open={showReportDialog}
          onOpenChange={setShowReportDialog}
          reportedId={expert.id}
          reportedName={fullName}
          type="user"
        />
      </div>
    </Layout>
  );
}