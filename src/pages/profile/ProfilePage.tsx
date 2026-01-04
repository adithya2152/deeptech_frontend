import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../../contexts/AuthContext'
import { expertsApi } from '../../lib/api'
import { Layout } from '../../components/layout/Layout'
import { Button } from '../../components/ui/button'
import { useToast } from '../../hooks/use-toast'
import { Domain } from '../../types'
import { Loader2, Save, User, Calendar, ShieldCheck, Settings, Eye } from 'lucide-react'
import { ProfileHeader } from '../../components/profile/ProfileHeader'
import { ServiceRates } from '../../components/profile/ServiceRates'
import { ExpertCredentials } from '../../components/profile/ExpertCredentials'
import { ProfileCompletion } from '../../components/profile/ProfileCompletion'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { useNavigate } from 'react-router-dom'

export default function ProfilePage() {
  const { user, profile, updateProfile, isLoading: authLoading, token } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const user_role = profile?.role || user?.role
  const is_buyer = user_role === 'buyer'
  const is_expert = user_role === 'expert'

  const [is_editing, set_is_editing] = useState(false)
  const [save_loading, set_save_loading] = useState(false)

  const { data: expert_data, refetch: refetchExpert } = useQuery({
    queryKey: ['expertProfile', user?.id],
    queryFn: async () => {
      const response = await expertsApi.getById(user!.id, token!)
      return response.data
    },
    enabled: !!user?.id && !!token && is_expert,
  })

  // State
  const [form_data, set_form_data] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    company: '',
    domains: [] as Domain[],
    avg_daily_rate: 0,
    avg_sprint_rate: 0,
    avg_fixed_rate: 0,
    preferred_engagement_mode: 'daily',
    years_experience: 0,
    languages: [] as string[],
    profile_video_url: '',
    skills: [] as string[],
    patents: [] as string[],
    papers: [] as string[],
    products: [] as string[],
  })

  useEffect(() => {
    if (profile) {
      set_form_data(prev => ({
        ...prev,
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        company: (profile as any).company || '',
      }));
    }

    if (is_expert && expert_data) {
      set_form_data(prev => ({
        ...prev,
        bio: expert_data.experience_summary || '',
        domains: expert_data.domains || [],
        avg_daily_rate: expert_data.avg_daily_rate || 0,
        avg_sprint_rate: expert_data.avg_sprint_rate || 0,
        avg_fixed_rate: expert_data.avg_fixed_rate || 0,
        preferred_engagement_mode: expert_data.preferred_engagement_mode || 'daily',
        years_experience: expert_data.years_experience || 0,
        languages: expert_data.languages || [],
        profile_video_url: expert_data.profile_video_url || '',
        skills: expert_data.skills || [],
        patents: expert_data.patents || [],
        papers: expert_data.papers || [],
        products: expert_data.products || [],
      }));
    }
  }, [profile, expert_data, is_expert]);

  const handle_save = async () => {
    set_save_loading(true)
    try {
      await updateProfile({
        first_name: form_data.first_name,
        last_name: form_data.last_name,
        ...(is_buyer && { company: form_data.company }),
      })

      if (is_expert) {
        const isComplete = Boolean(
          form_data.bio && form_data.bio.length > 50 &&
          form_data.domains.length > 0 &&
          form_data.skills.length > 0 &&
          (form_data.avg_daily_rate > 0 || form_data.avg_sprint_rate > 0) &&
          (form_data.patents.length > 0 || form_data.papers.length > 0 || form_data.products.length > 0)
        );

        const newStatus = (expert_data?.expert_status === 'incomplete' && isComplete)
          ? 'pending_review'
          : expert_data?.expert_status;

        await expertsApi.updateById(
          user!.id,
          {
            experience_summary: form_data.bio,
            domains: form_data.domains,
            avg_daily_rate: Number(form_data.avg_daily_rate),
            avg_sprint_rate: Number(form_data.avg_sprint_rate),
            avg_fixed_rate: Number(form_data.avg_fixed_rate),
            preferred_engagement_mode: form_data.preferred_engagement_mode,
            years_experience: Number(form_data.years_experience),
            languages: form_data.languages,
            profile_video_url: form_data.profile_video_url,
            skills: form_data.skills,
            is_profile_complete: isComplete,
            expert_status: newStatus,
          },
          token!
        )

        await queryClient.invalidateQueries({ queryKey: ['expertProfile', user?.id] });

        if (newStatus === 'pending_review') {
          refetchExpert();
        }
      }

      toast({
        title: 'Profile Saved',
        description: 'Your changes have been saved successfully.',
      })

      set_is_editing(false)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Error',
        description: 'Failed to update profile.',
        variant: 'destructive',
      })
    } finally {
      set_save_loading(false)
    }
  }

  const handleQuickEdit = (section: string) => {
    set_is_editing(true);
    const element = document.getElementById('profile-form-start');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-zinc-50/50 pb-20">

        {/* Banner / Cover Area */}
        <div className="h-48 bg-gradient-to-r from-zinc-900 to-zinc-800 w-full relative">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        </div>

        <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* LEFT COLUMN (Main Content) */}
            <div className="flex-1 space-y-6" id="profile-form-start">

              <ProfileHeader
                form_data={form_data}
                set_form_data={set_form_data}
                is_editing={is_editing}
                set_is_editing={set_is_editing}
                is_buyer={is_buyer}
                is_expert={is_expert}
                user_email={profile?.email || user?.email || ''}
              />

              {is_expert && (
                <>
                  <ServiceRates
                    form_data={form_data}
                    set_form_data={set_form_data}
                    is_editing={is_editing}
                  />

                  <Card className="border-zinc-200 shadow-sm">
                    <CardHeader className="border-b bg-zinc-50/50 py-4">
                      <CardTitle className="text-base font-semibold">Professional Credentials</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <ExpertCredentials
                        form_data={form_data}
                        set_form_data={set_form_data}
                        is_editing={is_editing}
                        refreshProfile={refetchExpert}
                      />
                    </CardContent>
                  </Card>
                </>
              )}

              {is_editing && (
                <div className="flex items-center justify-end gap-3 p-4 bg-white border border-zinc-200 rounded-xl shadow-lg sticky bottom-6 z-50 animate-in slide-in-from-bottom-2">
                  <span className="text-sm text-zinc-500 mr-auto pl-2 hidden sm:inline-block">
                    You have unsaved changes
                  </span>
                  <Button variant="ghost" onClick={() => set_is_editing(false)} disabled={save_loading}>
                    Cancel
                  </Button>
                  <Button onClick={handle_save} disabled={save_loading} className="bg-zinc-900 text-white hover:bg-zinc-800 min-w-[120px]">
                    {save_loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Profile
                  </Button>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN (Sidebar Stats & Actions) */}
            <div className="w-full lg:w-80 space-y-6">

              {is_expert && (
                <ProfileCompletion
                  formData={form_data}
                  isExpert={is_expert}
                  onEditSection={handleQuickEdit}
                />
              )}

              <Card className="shadow-sm border-zinc-200">
                <CardHeader className="pb-3 border-b border-zinc-100 bg-zinc-50/50">
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Account Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 flex items-center gap-2">
                      <User className="h-4 w-4" /> Role
                    </span>
                    <span className="font-medium capitalize">{user_role}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500 flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Joined
                    </span>
                    <span className="font-medium">
                      {(profile?.created_at) ? new Date(profile.created_at).toLocaleDateString() : '-'}
                    </span>
                  </div>
                  {is_expert && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" /> Status
                      </span>
                      <span className={`font-medium capitalize ${expert_data?.expert_status === 'verified' ? 'text-emerald-600' :
                        expert_data?.expert_status === 'pending_review' ? 'text-blue-600' :
                          'text-amber-600'
                        }`}>
                        {expert_data?.expert_status?.replace('_', ' ') || 'Pending'}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid gap-2">
                {is_expert && (
                  <Button variant="outline" className="w-full justify-start text-zinc-600" onClick={() => window.open(`/experts/${user?.id}`, '_blank')}>
                    <Eye className="h-4 w-4 mr-2" /> View Public Profile
                  </Button>
                )}
                <Button variant="outline" className="w-full justify-start text-zinc-600" onClick={() => navigate('/settings')}>
                  <Settings className="h-4 w-4 mr-2" /> Account Settings
                </Button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}