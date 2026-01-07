import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star, Shield, FileText, Award, MessageSquare, ArrowLeft, Loader2, ExternalLink, Briefcase, Target, Clock, Flag,
  Rocket, Globe, Video, Package, Activity, CalendarCheck, CheckCircle2, GraduationCap, Medal, Laptop, Layers
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
import { VideoPlayer } from '@/components/shared/VideoPlayer';

interface ExtendedExpert {
  id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  expert_status?: string;
  availability_status?: string;
  headline?: string;
  timezone?: string;
  years_experience: number;
  response_time_hours?: number;
  experience_summary?: string;
  domains?: string[];
  languages?: string[];
  rating?: number;
  review_count?: number;
  total_hours?: number;
  preferred_engagement_mode?: string;
  avg_daily_rate?: number;
  avg_sprint_rate?: number;
  avg_fixed_rate?: number;
  profile_video_url?: string;
  skills?: string[];
  patents?: string[];
  papers?: string[];
  products?: string[];
  documents?: Array<{
    id: string;
    title: string;
    url: string;
    document_type: string;
  }>;
}

export default function ExpertProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();
  const { data: rawExpert, isLoading } = useExpert(id!);
  const startConversationMutation = useStartDirectChat();
  const [showReportDialog, setShowReportDialog] = useState(false);

  const expert_data = rawExpert as unknown as ExtendedExpert | undefined;

  const handleStartConversation = async () => {
    if (!expert_data) return;
    try {
      const chatId = await startConversationMutation.mutateAsync(expert_data.id);
      navigate(`/messages?id=${chatId}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start conversation.',
        variant: 'destructive',
      });
    }
  };

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

  if (!expert_data) {
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

  const fullName = `${expert_data.first_name || ''} ${expert_data.last_name || ''}`.trim() || 'Expert';
  const getInitials = (first: string, last: string) => `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();
  const isOwnProfile = user?.id === expert_data.id;

  const certifications = expert_data.documents?.filter((d: any) => d.document_type === 'credential') || [];
  const otherItems = expert_data.documents?.filter((d: any) => d.document_type === 'other' || d.document_type === 'award') || [];
  const portfolioItems = expert_data.documents?.filter((d: any) => d.document_type === 'work') || [];
  const researchPapers = expert_data.documents?.filter((d: any) => d.document_type === 'publication') || [];

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
                      <AvatarImage src={expert_data.avatar_url} />
                      <AvatarFallback className="bg-primary/5 text-primary text-3xl font-bold">
                        {getInitials(expert_data.first_name || '', expert_data.last_name || '')}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                          <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            {fullName}
                          </h1>

                          {expert_data.expert_status === 'verified' && (
                            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 flex gap-1 items-center px-3 hover:bg-emerald-100">
                              <Shield className="h-3 w-3 fill-emerald-100" /> Verified
                            </Badge>
                          )}
                          {expert_data.availability_status && (
                            <Badge className={`border flex gap-1 items-center px-3 ${expert_data.availability_status === 'open' ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-100' :
                              expert_data.availability_status === 'limited' ? 'bg-amber-100 text-amber-700 border-amber-100' :
                                'bg-red-100 text-red-700 border-red-100'
                              }`}>
                              <CalendarCheck className="h-3 w-3" /> {expert_data.availability_status.replace('_', ' ')}
                            </Badge>
                          )}
                        </div>

                        {expert_data.headline && (
                          <p className="text-lg font-medium text-muted-foreground">{expert_data.headline}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pt-1">
                          {expert_data.timezone && (
                            <span className="flex items-center gap-1.5 font-medium">
                              <Clock className="h-4 w-4" /> {expert_data.timezone}
                            </span>
                          )}
                          {expert_data.years_experience > 0 && (
                            <span className="flex items-center gap-1.5 font-medium">
                              <Briefcase className="h-4 w-4" /> {expert_data.years_experience} Years Exp.
                            </span>
                          )}
                          <span className="flex items-center gap-1.5 font-medium">
                            <Activity className="h-4 w-4" /> Responds in ~{expert_data.response_time_hours || 24}h
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-muted-foreground text-md leading-relaxed max-w-2xl whitespace-pre-wrap">
                      {expert_data.experience_summary}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {expert_data.domains?.map((domain: string) => (
                        <Badge key={domain} variant="outline" className="bg-primary/5 border-primary/10 text-primary/80 capitalize">
                          {domainLabels[domain as keyof typeof domainLabels] || domain}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-8 mt-10 pt-8 border-t border-muted/30">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-xl text-foreground">{expert_data.rating ? Number(expert_data.rating).toFixed(1) : 'N/A'}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">{expert_data.review_count || 0} reviews</p>
                  </div>
                  <div className="space-y-1 border-x border-muted/30 px-8 text-center">
                    <p className="font-bold text-xl text-foreground">{expert_data.total_hours?.toLocaleString() || 0}</p>
                    <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Hours Billed</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <p className="font-bold text-xl text-foreground">0</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">Job Satisfaction Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="portfolio">
              <TabsList className="w-full justify-start h-auto flex-wrap gap-2 bg-muted/30 p-1 rounded-xl">
                <TabsTrigger value="portfolio" className="px-4 py-2 rounded-lg">Portfolio ({portfolioItems.length})</TabsTrigger>
                <TabsTrigger value="skills" className="px-4 py-2 rounded-lg">Skills & Tech</TabsTrigger>
                <TabsTrigger value="publications" className="px-4 py-2 rounded-lg">Research ({researchPapers.length})</TabsTrigger>
                <TabsTrigger value="credentials" className="px-4 py-2 rounded-lg">Credentials ({certifications.length})</TabsTrigger>
                <TabsTrigger value="others" className="px-4 py-2 rounded-lg">Others ({otherItems.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="portfolio" className="space-y-6 mt-6">
                <Card className="border-none shadow-lg shadow-primary/5">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/60 flex items-center gap-2">
                      <Laptop className="h-4 w-4" /> Featured Projects & Products
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {portfolioItems.length > 0 ? (
                      portfolioItems.map((item: any, i: number) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-zinc-100 bg-white hover:border-zinc-200 transition-all group">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                              <Package className="h-5 w-5" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                {item.title || "Untitled Project"}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {item.url ? new URL(item.url).hostname : 'Project Link'}
                              </p>
                            </div>
                          </div>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-full transition-all"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground italic">No portfolio items listed yet.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="skills" className="mt-6">
                <Card className="border-none shadow-lg shadow-primary/5">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/60 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" /> Technical Expertise
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-sm font-semibold mb-3">Core Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {expert_data.skills?.map((skill: string, i: number) => (
                            <Badge key={i} className="px-3 py-1.5 text-sm bg-zinc-900 text-zinc-50 hover:bg-zinc-800">
                              {skill}
                            </Badge>
                          ))}
                          {(!expert_data.skills || expert_data.skills.length === 0) && (
                            <p className="text-sm text-muted-foreground italic">No skills listed.</p>
                          )}
                        </div>
                      </div>
                      {expert_data.languages && expert_data.languages.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-3">Languages</h4>
                          <div className="flex flex-wrap gap-2">
                            {expert_data.languages.map((lang: string, i: number) => (
                              <Badge key={i} variant="outline" className="px-3 py-1.5 text-sm">
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="publications" className="mt-6">
                <div className="grid gap-6">
                  <Card className="border-none shadow-lg shadow-primary/5">
                    <CardHeader>
                      <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/60 flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Research Papers & Articles
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {researchPapers.length > 0 ? (
                        researchPapers.map((item: any, i: number) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-xl border bg-zinc-50/50">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="p-2 bg-white rounded-md border border-zinc-100 text-emerald-600">
                                <FileText className="h-4 w-4" />
                              </div>
                              <span className="text-sm font-medium text-foreground truncate">
                                {item.title || "Untitled Publication"}
                              </span>
                            </div>
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-muted-foreground hover:text-primary transition-colors"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No publications listed.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="credentials" className="mt-6">
                <Card className="border-none shadow-lg shadow-primary/5">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/60 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" /> Professional Credentials
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {certifications.length > 0 ? (
                      certifications.map((cert: any, i: number) => (
                        <div key={i} className="flex items-start justify-between p-4 rounded-xl border border-zinc-100 bg-white hover:border-zinc-200 transition-all">
                          <div className="flex items-start gap-4">
                            <div className="mt-1 p-2 bg-amber-50 rounded-lg text-amber-600">
                              <GraduationCap className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">
                                {cert.title || "Certification"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Verified Credential
                              </p>
                            </div>
                          </div>
                          <a
                            href={cert.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-medium text-primary hover:underline flex items-center gap-1 mt-1"
                          >
                            View Certificate <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No credentials listed.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="others" className="mt-6">
                <Card className="border-none shadow-lg shadow-primary/5">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/60 flex items-center gap-2">
                      <Layers className="h-4 w-4" /> Others
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {otherItems.length > 0 ? (
                      otherItems.map((item: any, i: number) => (
                        <div key={i} className="flex items-start justify-between p-4 rounded-xl border border-zinc-100 bg-white hover:border-zinc-200 transition-all">
                          <div className="flex items-start gap-4">
                            <div className="mt-1 p-2 bg-zinc-50 rounded-lg text-zinc-600">
                              <Layers className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">
                                {item.title || "Item"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Additional Information
                              </p>
                            </div>
                          </div>
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-primary hover:underline flex items-center gap-1 mt-1"
                            >
                              View Details <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No other items listed.</p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-xl shadow-primary/5">
              <CardHeader className="bg-primary/[0.02] border-b border-primary/5">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/60">Rates</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className={`flex justify-between items-center p-4 border rounded-2xl relative transition-all ${expert_data.preferred_engagement_mode === 'daily' ? 'bg-emerald-50/50 border-emerald-200 shadow-sm' : 'bg-primary/[0.02] border-primary/5'}`}>
                  {expert_data.preferred_engagement_mode === 'daily' && (
                    <div className="absolute -top-3 left-4 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3" /> PREFERRED
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Clock className={`h-4 w-4 ${expert_data.preferred_engagement_mode === 'daily' ? 'text-emerald-500' : 'text-primary/40'}`} />
                    <span className="text-sm font-bold text-foreground/70">Daily</span>
                  </div>
                  <span className="text-lg font-black text-foreground">${expert_data.avg_daily_rate?.toLocaleString() || 0}</span>
                </div>

                <div className={`flex justify-between items-center p-4 border rounded-2xl relative transition-all ${expert_data.preferred_engagement_mode === 'sprint' ? 'bg-emerald-50/50 border-emerald-200 shadow-sm' : 'bg-primary/[0.02] border-primary/5'}`}>
                  {expert_data.preferred_engagement_mode === 'sprint' && (
                    <div className="absolute -top-3 left-4 bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                      <CheckCircle2 className="h-3 w-3" /> PREFERRED
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <Rocket className={`h-4 w-4 ${expert_data.preferred_engagement_mode === 'sprint' ? 'text-emerald-500' : 'text-primary/40'}`} />
                    <span className="text-sm font-bold text-foreground/70">Sprint</span>
                  </div>
                  <span className="text-lg font-black text-foreground">${expert_data.avg_sprint_rate?.toLocaleString() || 0}</span>
                </div>

                <div className={`flex justify-between items-center p-4 border rounded-2xl relative transition-all ${expert_data.preferred_engagement_mode === 'fixed' ? 'bg-emerald-50/50 border-emerald-200 shadow-sm' : 'bg-primary/[0.02] border-primary/5'}`}>
                  <div className="flex items-center gap-3">
                    <Target className={`h-4 w-4 ${expert_data.preferred_engagement_mode === 'fixed' ? 'text-emerald-500' : 'text-primary/40'}`} />
                    <span className="text-sm font-bold text-foreground/70">Fixed Min.</span>
                  </div>
                  <span className="text-lg font-black text-foreground">${expert_data.avg_fixed_rate?.toLocaleString() || 0}</span>
                </div>
              </CardContent>
            </Card>
            
            {expert_data.profile_video_url && (
              <Card className="border-none shadow-md overflow-hidden">
                <CardHeader className="py-3 bg-zinc-50 border-b">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                    <Video className="h-3 w-3" /> Introduction
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <VideoPlayer url={expert_data.profile_video_url} />
                </CardContent>
              </Card>
            )}

            <div className="space-y-4 pt-2">
              {isAuthenticated ? (
                isOwnProfile ? (
                  <Button variant="outline" className="w-full h-14 rounded-2xl font-bold border-primary/20 hover:bg-primary/80" onClick={() => navigate('/profile')}>
                    Edit Profile
                  </Button>
                ) : user?.role === 'buyer' ? (
                  <div className="grid gap-4">
                    <Button
                      className="w-full h-14 rounded-2xl text-md font-bold shadow-lg shadow-primary/20"
                      onClick={() => navigate(`/projects/new?expert=${expert_data.id}`)}
                    >
                      Hire {expert_data.first_name}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full h-14 rounded-2xl font-bold border-primary/20"
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

                    {!isOwnProfile && isAuthenticated && (
                      <Button
                        variant="ghost"
                        className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/5 text-xs"
                        onClick={() => setShowReportDialog(true)}
                      >
                        <Flag className="h-3 w-3 mr-2" />
                        Report this Profile
                      </Button>
                    )}
                  </div>
                ) : null
              ) : (
                <Button className="w-full h-14 rounded-2xl text-md font-bold shadow-lg shadow-primary/20" onClick={() => navigate('/login')}>
                  Login to Hire
                </Button>
              )}
            </div>
          </div>
        </div>

        <ReportDialog
          open={showReportDialog}
          onOpenChange={setShowReportDialog}
          reportedId={expert_data.id}
          reportedName={fullName}
          type="user"
        />
      </div>
    </Layout>
  );
}