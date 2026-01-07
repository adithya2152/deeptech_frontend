import { useState, useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { expertsApi } from '@/lib/api'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Domain } from '@/types'
import {
  Loader2,
  Save,
  FileText,
  Eye,
  Trash2,
  User,
  Calendar,
  ShieldCheck,
  Settings,
  Plus,
  Video,
} from 'lucide-react'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { ServiceRates } from '@/components/profile/ServiceRates'
import { ExpertCredentials } from '@/components/profile/ExpertCredentials'
import { ProfileCompletion } from '@/components/profile/ProfileCompletion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useNavigate } from 'react-router-dom'
import { VideoPlayer } from '@/components/shared/VideoPlayer'
import { UploadDocumentModal } from '@/components/profile/UploadDocumentModal'

export default function ProfilePage() {
  const { user, profile, updateProfile, isLoading: authLoading, token } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const user_role = profile?.role || user?.role
  const is_buyer = user_role === 'buyer'
  const is_expert = user_role === 'expert'
  const STORAGE_KEY = `profile_draft_${user?.id}`

  const [is_editing, set_is_editing] = useState(false)
  const [save_loading, set_save_loading] = useState(false)
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [uploading_resume, set_uploading_resume] = useState(false)

  // Separate media saving states
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [savingBanner, setSavingBanner] = useState(false)

  const { data: expert_data, refetch: refetchExpert } = useQuery({
    queryKey: ['expertProfile', user?.id],
    queryFn: async () => {
      const response = await expertsApi.getById(user!.id, token!)
      return response.data
    },
    enabled: !!user?.id && !!token && is_expert,
  })

  const [form_data, set_form_data] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    company: '',
    domains: [] as Domain[],
    availability_status: 'open',
    timezone: '',
    headline: '',
    avg_daily_rate: '',
    avg_sprint_rate: '',
    avg_fixed_rate: '',
    years_experience: '',
    preferred_engagement_mode: 'daily',
    languages: [] as string[],
    portfolio_url: '',
    profile_video_url: '',
    skills: [] as string[],
    patents: [] as string[],
    papers: [] as string[],
    projects: [] as string[],
    products: [] as string[],
    certificates: [] as string[],
    awards: [] as string[],
    avatar_url: '',
    banner_url: '',
    documents: [] as any[],
  })

  const syncDataFromServer = useCallback(() => {
    set_form_data(prev => {
      let newData = { ...prev }

      if (profile) {
        newData = {
          ...newData,
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          company: (profile as any).company || '',
        }
      }

      if (is_expert && expert_data) {
        newData = {
          ...newData,
          avatar_url: expert_data.avatar_url || '',
          banner_url: expert_data.banner_url || '',
          bio: expert_data.experience_summary || '',
          domains: expert_data.domains || [],
          availability_status: expert_data.availability_status ?? 'open',
          timezone: expert_data.timezone ?? '',
          headline: expert_data.headline ?? '',
          avg_daily_rate: expert_data.avg_daily_rate ?? '',
          avg_sprint_rate: expert_data.avg_sprint_rate ?? '',
          avg_fixed_rate: expert_data.avg_fixed_rate ?? '',
          years_experience: expert_data.years_experience ?? '',
          preferred_engagement_mode: expert_data.preferred_engagement_mode || 'daily',
          languages: expert_data.languages || [],
          portfolio_url: expert_data.portfolio_url || '',
          profile_video_url: expert_data.profile_video_url || '',
          skills: expert_data.skills || [],
          patents: expert_data.patents || [],
          papers: expert_data.papers || [],
          projects: expert_data.products || [],
          products: expert_data.products || [],
          certificates: expert_data.certificates || [],
          awards: expert_data.awards || [],
          documents: expert_data.documents || [],
        }
      }

      return newData
    })
  }, [profile, expert_data, is_expert])

  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY)
    if (savedDraft) {
      try {
        set_form_data(JSON.parse(savedDraft))
        set_is_editing(true)
      } catch (e) {
        syncDataFromServer()
      }
    } else {
      syncDataFromServer()
    }
  }, [syncDataFromServer, STORAGE_KEY])

  useEffect(() => {
    if (is_editing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form_data))
    }
  }, [form_data, is_editing, STORAGE_KEY])

  const handleCancel = () => {
    localStorage.removeItem(STORAGE_KEY)
    set_is_editing(false)
    syncDataFromServer()
    toast({ description: 'Changes discarded' })
  }

  const isSupportedVideoUrl = (url: string) => {
    if (!url) return true
    return (
      /youtube\.com|youtu\.be/.test(url) ||
      /vimeo\.com/.test(url) ||
      /loom\.com\/share/.test(url) ||
      /\.mp4($|\?)/.test(url)
    )
  }

  const handle_save = async () => {
    if (is_expert && form_data.profile_video_url && !isSupportedVideoUrl(form_data.profile_video_url)) {
      toast({
        title: 'Invalid video URL',
        description: 'Only YouTube, Vimeo, Loom, or MP4 links are supported.',
        variant: 'destructive',
      })
      return
    }

    set_save_loading(true)
    try {
      await updateProfile({
        first_name: form_data.first_name,
        last_name: form_data.last_name,
        ...(is_buyer && { company: form_data.company }),
      })

      if (is_expert) {
        const isComplete = Boolean(
          form_data.bio &&
          form_data.bio.length > 50 &&
          form_data.domains.length > 0 &&
          form_data.skills.length > 0 &&
          (Number(form_data.avg_daily_rate) > 0 || Number(form_data.avg_sprint_rate) > 0)
        )

        const newStatus =
          expert_data?.expert_status === 'incomplete' && isComplete ? 'pending_review' : expert_data?.expert_status

        await expertsApi.updateById(
          user!.id,
          {
            experience_summary: form_data.bio,
            domains: form_data.domains,
            headline: form_data.headline,
            availability_status: form_data.availability_status,
            timezone: form_data.timezone,
            avg_daily_rate: Number(form_data.avg_daily_rate || 0),
            avg_sprint_rate: Number(form_data.avg_sprint_rate || 0),
            avg_fixed_rate: Number(form_data.avg_fixed_rate || 0),
            years_experience: Number(form_data.years_experience || 0),
            preferred_engagement_mode: form_data.preferred_engagement_mode,
            languages: form_data.languages,
            portfolio_url: form_data.portfolio_url,
            skills: form_data.skills,
            patents: form_data.patents,
            papers: form_data.papers,
            projects: form_data.projects,
            products: form_data.products,
            profile_video_url: form_data.profile_video_url,
            certificates: form_data.certificates,
            awards: form_data.awards,
            is_profile_complete: isComplete,
            expert_status: newStatus,
          },
          token!
        )

        await queryClient.invalidateQueries({ queryKey: ['expertProfile', user?.id] })

        if (newStatus === 'pending_review') {
          refetchExpert()
        }
      }

      localStorage.removeItem(STORAGE_KEY)
      toast({
        title: 'Profile Saved',
        description: 'Your changes have been saved successfully.',
      })

      set_is_editing(false)
      set_save_loading(false)
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

  const handleSaveAvatar = async (file: File) => {
    if (!file || !token) return
    setSavingAvatar(true)

    try {
      const { url } = await expertsApi.uploadProfileMedia(token, file, 'avatar')
      await expertsApi.updateAvatar(token, url)

      set_form_data(prev => ({
        ...prev,
        avatar_url: `${url}?t=${Date.now()}`,
      }))

      await queryClient.invalidateQueries({ queryKey: ['expertProfile', user?.id] })
      toast({ title: 'Avatar updated' })
    } catch {
      toast({ title: 'Avatar upload failed', variant: 'destructive' })
    } finally {
      setSavingAvatar(false)
    }
  }

  const handleSaveBanner = async (file: File) => {
    if (!file || !token) return
    setSavingBanner(true)

    try {
      const { url } = await expertsApi.uploadProfileMedia(token, file, 'banner')
      await expertsApi.updateBanner(token, url)

      set_form_data(prev => ({
        ...prev,
        banner_url: `${url}?t=${Date.now()}`,
      }))

      await queryClient.invalidateQueries({ queryKey: ['expertProfile', user?.id] })
      toast({ title: 'Banner updated' })
    } catch {
      toast({ title: 'Banner upload failed', variant: 'destructive' })
    } finally {
      setSavingBanner(false)
    }
  }

  const handleRemoveAvatar = async () => {
    if (!token) return
    setSavingAvatar(true)

    try {
      await expertsApi.updateAvatar(token, null)
      set_form_data(prev => ({ ...prev, avatar_url: '' }))
      await queryClient.invalidateQueries({ queryKey: ['expertProfile', user?.id] })
      toast({ title: 'Avatar removed' })
    } finally {
      setSavingAvatar(false)
    }
  }

  const handleRemoveBanner = async () => {
    if (!token) return
    setSavingBanner(true)

    try {
      await expertsApi.updateBanner(token, null)
      set_form_data(prev => ({ ...prev, banner_url: '' }))
      await queryClient.invalidateQueries({ queryKey: ['expertProfile', user?.id] })
      toast({ title: 'Banner removed' })
    } finally {
      setSavingBanner(false)
    }
  }

  const handleViewResume = async () => {
    const res = await expertsApi.getResumeSignedUrl(token!)
    return res.url
  }

  const resumeDoc = form_data.documents?.find((d: any) => d.document_type === 'resume')

  const handleQuickEdit = (section: string) => {
    set_is_editing(true)
    const element = document.getElementById('profile-form-start')
    if (element) element.scrollIntoView({ behavior: 'smooth' })
  }

  if (authLoading) {
    return (
      <Layout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-zinc-50/50 pb-20">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pt-10 z-10">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-6" id="profile-form-start">
              <ProfileHeader
                form_data={form_data}
                set_form_data={set_form_data}
                is_editing={is_editing}
                set_is_editing={set_is_editing}
                is_buyer={is_buyer}
                is_expert={is_expert}
                user_email={profile?.email || user?.email || ''}
                onSaveAvatar={handleSaveAvatar}
                onSaveBanner={handleSaveBanner}
                onRemoveAvatar={handleRemoveAvatar}
                onRemoveBanner={handleRemoveBanner}
                savingAvatar={savingAvatar}
                savingBanner={savingBanner}
              />

              {is_expert && (
                <>
                  <ServiceRates form_data={form_data} set_form_data={set_form_data} is_editing={is_editing} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-zinc-200 shadow-sm h-full flex flex-col">
                      <CardHeader className="border-b bg-zinc-50/50 py-4">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <Video className="h-4 w-4" /> Introduction Video
                        </CardTitle>
                        <CardDescription>A short video introduction.</CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 flex-1">
                        {is_editing ? (
                          <div className="space-y-3">
                            <Label>Video URL</Label>
                            <Input
                              placeholder="https://youtube.com/..."
                              value={form_data.profile_video_url}
                              onChange={(e) =>
                                set_form_data(prev => ({ ...prev, profile_video_url: e.target.value }))
                              }
                            />
                            <p className="text-xs text-zinc-500">
                              Supports YouTube, Loom, Vimeo, or direct MP4 links.
                            </p>

                            {form_data.profile_video_url && !isSupportedVideoUrl(form_data.profile_video_url) && (
                              <p className="text-xs text-red-500">
                                Unsupported video link. Use YouTube, Vimeo, Loom, or MP4.
                              </p>
                            )}

                            {form_data.profile_video_url && isSupportedVideoUrl(form_data.profile_video_url) && (
                              <VideoPlayer url={form_data.profile_video_url} />
                            )}
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center">
                            {form_data.profile_video_url ? (
                              <VideoPlayer url={form_data.profile_video_url} />
                            ) : (
                              <div className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-200 rounded-lg bg-zinc-50/50 text-center h-full min-h-[200px]">
                                <Video className="h-8 w-8 text-zinc-300 mb-2" />
                                <p className="text-sm text-zinc-500 font-medium">Video unavailable</p>
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="border-zinc-200 shadow-sm h-full flex flex-col">
                      <CardHeader className="border-b bg-zinc-50/50 py-4">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <FileText className="h-4 w-4" /> Resume / CV
                        </CardTitle>
                        <CardDescription>Upload your full resume.</CardDescription>
                      </CardHeader>
                      <CardContent className="p-6 flex-1">
                        <div className="flex items-center gap-4 h-full">
                          {is_editing ? (
                            <div className="w-full">
                              {resumeDoc ? (
                                <div className="flex items-center justify-between p-3 border rounded-lg bg-zinc-50 w-full">
                                  <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="bg-red-100 p-2 rounded text-red-600 shrink-0">
                                      <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          const url = await handleViewResume()
                                          setTimeout(() => {
                                            window.open(url, '_blank', 'noopener,noreferrer')
                                          }, 0)
                                        }}
                                        className="text-left hover:underline font-medium text-sm truncate"
                                      >
                                        Resume.pdf
                                      </button>
                                      <span className="text-[10px] text-zinc-500">PDF Document</span>
                                    </div>
                                  </div>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-full h-8 w-8 shrink-0"
                                    onClick={async () => {
                                      try {
                                        await expertsApi.deleteDocument(token!, resumeDoc.id)
                                        set_form_data(prev => ({
                                          ...prev,
                                          documents: prev.documents.filter((d: any) => d.id !== resumeDoc.id),
                                        }))
                                        refetchExpert()
                                        toast({ title: 'Resume removed' })
                                      } catch (e) {
                                        toast({ title: 'Failed to remove resume', variant: 'destructive' })
                                      }
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="grid w-full items-center gap-1.5">
                                  <div className="flex gap-2 items-center w-full">
                                    <Button
                                      variant="outline"
                                      onClick={() => setShowResumeModal(true)}
                                      className="gap-2 w-full border-dashed h-16"
                                    >
                                      <Plus className="h-4 w-4" /> Upload Resume
                                    </Button>

                                    <UploadDocumentModal
                                      type="resume"
                                      open={showResumeModal}
                                      onOpenChange={setShowResumeModal}
                                      onSuccess={(res) => {
                                        if (res?.data) {
                                          set_form_data(prev => ({
                                            ...prev,
                                            documents: [...prev.documents, res.data],
                                          }))
                                        }
                                        refetchExpert()
                                      }}
                                    />

                                    {uploading_resume && (
                                      <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="w-full h-full flex items-center">
                              {resumeDoc ? (
                                <div
                                  onClick={async () => {
                                    const url = await handleViewResume()
                                    window.open(url, '_blank', 'noopener,noreferrer')
                                  }}
                                  className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-200 rounded-lg bg-zinc-50/50 text-center h-full min-h-[200px] cursor-pointer hover:border-zinc-300"
                                >
                                  <FileText className="h-10 w-10 text-red-400 mb-3" />
                                  <p className="text-sm font-medium text-zinc-700">Resume.pdf</p>
                                  <p className="text-xs text-zinc-500 mt-1">Click to view</p>
                                </div>
                              ) : (
                                <div className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-200 rounded-lg bg-zinc-50/50 text-center h-full min-h-[200px]">
                                  <FileText className="h-8 w-8 text-zinc-300 mb-2" />
                                  <p className="text-sm text-zinc-500 font-medium">No resume</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

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
                        token={token!}
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
                  <Button variant="ghost" onClick={handleCancel} disabled={save_loading}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handle_save}
                    disabled={save_loading}
                    className="bg-zinc-900 text-white hover:bg-zinc-800 min-w-[120px]"
                  >
                    {save_loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Profile
                  </Button>
                </div>
              )}
            </div>

            <div className="w-full lg:w-80 space-y-6">
              {is_expert && (
                <ProfileCompletion
                  formData={form_data}
                  isExpert={is_expert}
                  onEditSection={handleQuickEdit}
                  expertStatus={expert_data?.expert_status}
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
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '-'}
                    </span>
                  </div>
                  {is_expert && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" /> Status
                      </span>
                      <span
                        className={`font-medium capitalize ${expert_data?.expert_status === 'verified'
                            ? 'text-emerald-600'
                            : expert_data?.expert_status === 'pending_review'
                              ? 'text-blue-600'
                              : 'text-amber-600'
                          }`}
                      >
                        {expert_data?.expert_status?.replace('_', ' ') || 'Pending'}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid gap-2">
                {is_expert && (
                  <Button
                    variant="outline"
                    className="w-full justify-start text-zinc-600"
                    onClick={() => window.open(`/experts/${user?.id}`, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-2" /> View Public Profile
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full justify-start text-zinc-600"
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="h-4 w-4 mr-2" /> Account Settings
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
