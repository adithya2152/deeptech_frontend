import { useState, useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { expertsApi, authApi } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Domain } from '@/types'
import {
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
    Loader2,
    Sparkles,
    Brain
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
import { useAuth } from '@/contexts/AuthContext'

export default function ExpertProfileEditor() {
    const { user, profile, updateProfile, token } = useAuth()
    const { toast } = useToast()
    const queryClient = useQueryClient()
    const navigate = useNavigate()

    const STORAGE_KEY = `profile_draft_${user?.id}`

    const [is_editing, set_is_editing] = useState(false)
    const [save_loading, set_save_loading] = useState(false)
    const [aiLoading, setAiLoading] = useState(false)
    const [showResumeModal, setShowResumeModal] = useState(false)
    const [viewResumeLoading, setViewResumeLoading] = useState(false)
    const [savingAvatar, setSavingAvatar] = useState(false)
    const [savingBanner, setSavingBanner] = useState(false)

    const { data: expert_data, refetch: refetchExpert } = useQuery({
        queryKey: ['expertProfile', user?.id],
        queryFn: async () => (await expertsApi.getById(user!.id, token!)).data,
        enabled: !!user?.id && !!token,
    })

    const [form_data, set_form_data] = useState({
        first_name: '',
        last_name: '',
        company: '',
        bio: '',
        domains: [] as Domain[],
        availability_status: 'open',
        timezone: '',
        country: '',
        headline: '',
        avg_hourly_rate: '',
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
    const [pendingDocumentIds, setPendingDocumentIds] = useState<string[]>([])
    const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([])
    const [originalData, setOriginalData] = useState<any>(null)

    // ... (Sync Logic) ...
    const syncDataFromServer = useCallback(() => {
        set_form_data(prev => {
            let data = { ...prev }
            if (profile) {
                data.first_name = profile.first_name || ''
                data.last_name = profile.last_name || ''
                data.company = (profile as any).company || ''
                data.country = (profile as any).country || ''
            }
            if (expert_data) {
                data = {
                    ...data,
                    avatar_url: expert_data.avatar_url || '',
                    banner_url: expert_data.banner_url || '',
                    bio: expert_data.experience_summary || '',
                    domains: expert_data.domains || [],
                    availability_status: expert_data.availability_status ?? 'open',
                    timezone: expert_data.timezone ?? '',
                    headline: expert_data.headline ?? '',
                    avg_hourly_rate: expert_data.avg_hourly_rate ?? '',
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
                    projects: expert_data.projects || [],
                    products: expert_data.products || [],
                    certificates: expert_data.certificates || [],
                    awards: expert_data.awards || [],
                    documents: expert_data.documents || [],
                }
            }
            setOriginalData({ ...data })
            return data
        })
    }, [profile, expert_data])

    useEffect(() => {
        const draft = localStorage.getItem(STORAGE_KEY)
        if (draft) {
            try {
                set_form_data(JSON.parse(draft))
                set_is_editing(true)
            } catch {
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

    const isSupportedVideoUrl = (url: string) =>
        !url || /youtube\.com|youtu\.be|vimeo\.com|loom\.com\/share|\.mp4($|\?)/.test(url)

    const handleCancel = async () => {
        const hasChanges = originalData ? JSON.stringify(form_data) !== JSON.stringify(originalData) : true
        if (hasChanges) {
            const confirmed = window.confirm('Discard unsaved changes? Any uploaded documents will be removed.')
            if (!confirmed) return
        }
        if (pendingDocumentIds.length && token) {
            for (const id of pendingDocumentIds) {
                try { await expertsApi.deleteDocument(token, id) } catch (e) { }
            }
        }
        setPendingDocumentIds([])
        setPendingDeleteIds([])
        localStorage.removeItem(STORAGE_KEY)
        set_is_editing(false)
        syncDataFromServer()
        toast({ description: 'Changes discarded' })
    }

    // ---------------------------------------------------------
    // ✅ MODIFIED: AI AUTOFILL HANDLER (Smart Resume Prompt)
    // ---------------------------------------------------------
    const handleAiAutofill = async () => {
        if (!token) return

        // 1. Check for documents
        const hasDocuments = form_data.documents && form_data.documents.some((d: any) =>
            ['resume', 'publication', 'credential', 'work'].includes(d.document_type)
        );

        // ✅ UX IMPROVEMENT: If no docs/portfolio, pop open the Resume Modal
        if (!hasDocuments && !form_data.portfolio_url) {
            set_is_editing(true)          // 🔥 IMPORTANT
            setShowResumeModal(true)
            toast({
                title: "Let's get started",
                description: "Please upload your resume.",
                className: "bg-indigo-50 border-indigo-200 text-indigo-800"
            })
            // Automatically open the upload modal
            setShowResumeModal(true)
            return
        }

        setAiLoading(true)
        try {
            // 2. Call AI Service
            const response = await fetch(`${import.meta.env.VITE_AI_URL}/analyze-existing`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    portfolio_url: form_data.portfolio_url,
                    github_username: null
                })
            })

            if (!response.ok) throw new Error("AI Service failed to respond")

            const data = await response.json()
            const extracted = data.autofill

            // 3. Update Form
            set_form_data(prev => ({
                ...prev,
                bio: extracted.summary || prev.bio,
                headline: extracted.role || prev.headline,
                years_experience: extracted.years_experience ? String(extracted.years_experience) : prev.years_experience,
                skills: Array.from(new Set([...prev.skills, ...(extracted.all_skills || [])])),
            }))

            set_is_editing(true)

            toast({
                title: "✨ Profile Autofilled!",
                description: `Analysis complete. Deep Tech Score: ${data.score}`,
                className: "bg-emerald-50 border-emerald-200 text-emerald-800"
            })

        } catch (e: any) {
            console.error(e)
            toast({
                title: "Analysis Failed",
                description: "Could not analyze your documents. Please try again.",
                variant: "destructive"
            })
        } finally {
            setAiLoading(false)
        }
    }

    const handle_save = async () => {
        if (form_data.profile_video_url && !isSupportedVideoUrl(form_data.profile_video_url)) {
            toast({ title: 'Invalid video URL', variant: 'destructive' })
            return
        }
        set_save_loading(true)
        try {
            await updateProfile({
                first_name: form_data.first_name,
                last_name: form_data.last_name,
                company: form_data.company,
                country: form_data.country,
            })
            const isComplete =
                form_data.bio.length > 50 &&
                form_data.domains.length > 0 &&
                form_data.skills.length > 0 &&
                (Number(form_data.avg_daily_rate) > 0 || Number(form_data.avg_sprint_rate) > 0 || Number(form_data.avg_hourly_rate) > 0)

            const newStatus = expert_data?.expert_status === 'incomplete' && isComplete ? 'pending_review' : expert_data?.expert_status

            await expertsApi.updateById(
                user!.id,
                {
                    experience_summary: form_data.bio,
                    domains: form_data.domains,
                    headline: form_data.headline,
                    availability_status: form_data.availability_status,
                    timezone: form_data.timezone,
                    avg_hourly_rate: Number(form_data.avg_hourly_rate || 0),
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
                    certificates: form_data.certificates,
                    awards: form_data.awards,
                    profile_video_url: form_data.profile_video_url,
                    is_profile_complete: isComplete,
                    expert_status: newStatus,
                },
                token!
            )

            if (pendingDeleteIds.length && token) {
                for (const id of pendingDeleteIds) {
                    try { await expertsApi.deleteDocument(token, id) } catch (e) { }
                }
            }

            await queryClient.invalidateQueries({ queryKey: ['expertProfile', user?.id] })
            if (newStatus === 'pending_review') refetchExpert()
            setPendingDocumentIds([])
            setPendingDeleteIds([])
            localStorage.removeItem(STORAGE_KEY)
            toast({ title: 'Profile Saved' })
            set_is_editing(false)
        } finally {
            set_save_loading(false)
        }
    }

    const handleSaveMedia = async (file: File, type: 'avatar' | 'banner') => {
        if (!token) return
        const setSaving = type === 'avatar' ? setSavingAvatar : setSavingBanner
        setSaving(true)
        try {
            const { url } = await authApi.profile.uploadMedia(token, file, type)
            await authApi.profile.update(token, { [`${type}_url`]: url })
            set_form_data(p => ({ ...p, [`${type}_url`]: `${url}?t=${Date.now()}` }))
            toast({ title: `${type} updated` })
        } finally { setSaving(false) }
    }

    const handleRemoveMedia = async (type: 'avatar' | 'banner') => {
        if (!token) return
        const setSaving = type === 'avatar' ? setSavingAvatar : setSavingBanner
        setSaving(true)
        try {
            await authApi.profile.update(token, { [`${type}_url`]: null })
            set_form_data(p => ({ ...p, [`${type}_url`]: '' }))
            toast({ title: 'Removed' })
        } finally { setSaving(false) }
    }

    const handleViewResume = async () => (await expertsApi.getResumeSignedUrl(token!)).url
    const resumeDoc = form_data.documents.find((d: any) => d.document_type === 'resume')

    const getResumeDisplayName = (doc: any) => {
        const title = String(doc?.title || '').trim()
        if (title) return title

        const url = String(doc?.url || '').trim()
        if (!url) return 'Resume'

        const base = (url.split('/').pop() || url).split('?')[0]
        const dashIndex = base.indexOf('-')
        const maybeOriginal = dashIndex > 0 ? base.slice(dashIndex + 1) : base
        return maybeOriginal || 'Resume'
    }

    const openResume = async () => {
        if (!token) return
        setViewResumeLoading(true)
        try {
            const url = await handleViewResume()
            window.open(url, '_blank', 'noopener,noreferrer')
        } finally {
            setViewResumeLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50/50 pb-20 pt-10">
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1 space-y-6" id="profile-form-start">

                        {/* AI ASSISTANT SECTION */}
                        <Card className="border-indigo-100 bg-gradient-to-r from-indigo-50/50 to-white shadow-sm">
                            <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600 border border-indigo-100">
                                        <Sparkles className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-indigo-950 flex items-center gap-2">
                                            {'Smart Resume Assistant'}
                                            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full uppercase tracking-wider">{'Beta'}</span>
                                        </h3>
                                        <p className="text-sm text-indigo-900/60 mt-0.5">

                                            Auto-fill skills & experience instantly by analyzing your resume.
                                            <br></br>1. Upload your documents below. 2. Click "Auto-Fill Profile".
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleAiAutofill}
                                    disabled={aiLoading}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 border-none min-w-[160px]"
                                >
                                    {aiLoading ? (
                                        <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {'Analyzing'}</>
                                    ) : (
                                        <><Brain className="h-4 w-4 mr-2" /> {'Auto-Fill Profile'}</>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>

                        <ProfileHeader
                            form_data={form_data} set_form_data={set_form_data} is_editing={is_editing} set_is_editing={set_is_editing}
                            is_buyer={false} is_expert={true} user_email={profile?.email || user?.email || ''}
                            onSaveAvatar={(f) => handleSaveMedia(f, 'avatar')} onSaveBanner={(f) => handleSaveMedia(f, 'banner')}
                            onRemoveAvatar={() => handleRemoveMedia('avatar')} onRemoveBanner={() => handleRemoveMedia('banner')}
                            savingAvatar={savingAvatar} savingBanner={savingBanner}
                        />

                        <ServiceRates form_data={form_data} set_form_data={set_form_data} is_editing={is_editing} />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card className="border-zinc-200 shadow-sm h-full flex flex-col">
                                <CardHeader className="border-b bg-zinc-50/50 py-4"><CardTitle className="text-base font-semibold flex items-center gap-2"><Video className="h-4 w-4" /> {'Introduction Video'}</CardTitle></CardHeader>
                                <CardContent className="p-6 flex-1">
                                    {is_editing ? (
                                        <div className="space-y-3">
                                            <Label>{'Video URL'}</Label>
                                            <Input placeholder="https://youtube.com/..." value={form_data.profile_video_url} onChange={(e) => set_form_data(prev => ({ ...prev, profile_video_url: e.target.value }))} />
                                            {form_data.profile_video_url && isSupportedVideoUrl(form_data.profile_video_url) && <VideoPlayer url={form_data.profile_video_url} />}
                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center">{form_data.profile_video_url ? <VideoPlayer url={form_data.profile_video_url} /> : <div className="text-center w-full text-zinc-500">Video unavailable</div>}</div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border-zinc-200 shadow-sm h-full flex flex-col">
                                <CardHeader className="border-b bg-zinc-50/50 py-4"><CardTitle className="text-base font-semibold flex items-center gap-2"><FileText className="h-4 w-4" /> {'Resume / CV'}</CardTitle></CardHeader>
                                <CardContent className="p-6 flex-1">
                                    {is_editing ? (
                                        <div className="w-full h-full">
                                            {resumeDoc ? (
                                                <div
                                                    onClick={openResume}
                                                    className="w-full h-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-200 rounded-lg bg-zinc-50/50 text-center min-h-[320px] cursor-pointer hover:border-zinc-300 relative"
                                                >
                                                    <div className="absolute top-3 right-3 flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => {
                                                                e.preventDefault()
                                                                e.stopPropagation()
                                                                setPendingDeleteIds(p => [...p, resumeDoc.id])
                                                                set_form_data(p => ({ ...p, documents: p.documents.filter(d => d.id !== resumeDoc.id) }))
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>

                                                    <FileText className="h-10 w-10 text-red-400 mb-3" />
                                                    <p className="text-sm font-medium text-zinc-700">{getResumeDisplayName(resumeDoc)}</p>
                                                    <p className="text-xs text-zinc-500 mt-1">{viewResumeLoading ? 'Opening' : 'View'}</p>

                                                    <div className="mt-4 w-full flex justify-center">
                                                        <Button
                                                            variant="outline"
                                                            className="border-dashed"
                                                            onClick={(e) => {
                                                                e.preventDefault()
                                                                e.stopPropagation()
                                                                setShowResumeModal(true)
                                                            }}
                                                        >
                                                            <Plus className="h-4 w-4 mr-2" /> {'Replace Resume'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-200 rounded-lg bg-zinc-50/50 text-center min-h-[320px]">
                                                    <FileText className="h-8 w-8 text-zinc-300 mb-3" />
                                                    <p className="text-sm text-zinc-500 font-medium">{'No resume uploaded'}</p>
                                                    <Button
                                                        variant="outline"
                                                        className="mt-4 border-dashed"
                                                        onClick={() => setShowResumeModal(true)}
                                                    >
                                                        <Plus className="h-4 w-4 mr-2" /> {'Upload Resume'}
                                                    </Button>
                                                </div>
                                            )}

                                        </div>
                                    ) : (
                                        <div className="w-full h-full flex items-center">
                                            {resumeDoc ? (
                                                <div
                                                    onClick={openResume}
                                                    className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-200 rounded-lg bg-zinc-50/50 text-center h-full min-h-[200px] cursor-pointer hover:border-zinc-300"
                                                >
                                                    <FileText className="h-10 w-10 text-red-400 mb-3" />
                                                    <p className="text-sm font-medium text-zinc-700">{getResumeDisplayName(resumeDoc)}</p>
                                                    <p className="text-xs text-zinc-500 mt-1">{viewResumeLoading ? 'Opening…' : 'Click to view'}</p>
                                                </div>
                                            ) : (
                                                <div className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-200 rounded-lg bg-zinc-50/50 text-center h-full min-h-[200px]">
                                                    <FileText className="h-8 w-8 text-zinc-300 mb-2" />
                                                    <p className="text-sm text-zinc-500 font-medium">No resume</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="border-zinc-200 shadow-sm"><CardHeader className="border-b bg-zinc-50/50 py-4"><CardTitle className="text-base font-semibold">{'Credentials & Skills'}</CardTitle><CardDescription>{'Manage professional certifications and skills.'}</CardDescription></CardHeader><CardContent className="p-6"><ExpertCredentials form_data={form_data} set_form_data={set_form_data} is_editing={is_editing} refreshProfile={refetchExpert} token={token!} onPendingAdd={(id: string) => setPendingDocumentIds(p => [...p, id])} onMarkDelete={(id: string) => setPendingDeleteIds(p => [...p, id])} /></CardContent></Card>

                        {is_editing && (
                            <div className="flex items-center justify-end gap-3 p-4 bg-white border border-zinc-200 rounded-xl shadow-lg sticky bottom-6 z-50 animate-in slide-in-from-bottom-2">
                                <Button variant="ghost" onClick={handleCancel} disabled={save_loading}>{'Cancel'}</Button>
                                <Button onClick={handle_save} disabled={save_loading} className="bg-zinc-900 text-white hover:bg-zinc-800 min-w-[120px]">{save_loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />} {'Save Changes'}</Button>
                            </div>
                        )}
                    </div>

                    <div className="w-full lg:w-80 space-y-6">
                        <ProfileCompletion formData={form_data} isExpert={true} onEditSection={() => { set_is_editing(true); document.getElementById('profile-form-start')?.scrollIntoView({ behavior: 'smooth' }); }} expertStatus={expert_data?.expert_status} />
                        <Card className="shadow-sm border-zinc-200"><CardHeader className="pb-3 border-b border-zinc-100 bg-zinc-50/50"><CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-500">{'Account Info'}</CardTitle></CardHeader><CardContent className="p-4 space-y-4"><div className="flex justify-between text-sm"><span className="text-zinc-500 flex gap-2"><User className="h-4 w-4" />Role</span><span className="capitalize">Expert</span></div><div className="flex justify-between text-sm"><span className="text-zinc-500 flex gap-2"><Calendar className="h-4 w-4" />{'Member Since'}</span><span>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '-'}</span></div><div className="flex justify-between text-sm"><span className="text-zinc-500 flex gap-2"><ShieldCheck className="h-4 w-4" />Status</span><span className="capitalize text-emerald-600">{expert_data?.expert_status?.replace('_', ' ') || 'Pending'}</span></div></CardContent></Card>
                        <div className="grid gap-2">
                            <Button variant="outline" className="w-full justify-start text-zinc-600" onClick={() => window.open(`/experts/${user?.id}`, '_blank')}><Eye className="h-4 w-4 mr-2" /> {'View Public Profile'}</Button>
                            <Button variant="outline" className="w-full justify-start text-zinc-600" onClick={() => navigate('/settings')}><Settings className="h-4 w-4 mr-2" /> {'Account Settings'}</Button>
                        </div>
                    </div>
                </div>
                <UploadDocumentModal
                    type="resume"
                    open={showResumeModal}
                    onOpenChange={setShowResumeModal}
                    onSuccess={(res) => {
                        if (res?.data) {
                            set_form_data(p => ({
                                ...p,
                                documents: [...p.documents, res.data]
                            }))
                            setPendingDocumentIds(prev => [...prev, res.data.id])
                        }
                        refetchExpert()
                    }}
                />
            </div>
        </div>
    )
}