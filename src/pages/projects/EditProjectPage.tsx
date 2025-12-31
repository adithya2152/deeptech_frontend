import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { useProject, useUpdateProject } from '@/hooks/useProjects'
import { Domain, TRLLevel, RiskCategory } from '@/types'
import { domainLabels, trlDescriptions } from '@/lib/constants'
import { ArrowLeft, Loader2, Save } from 'lucide-react'

type FormData = {
  title: string
  domain: string
  description: string
  trl_level: number
  risk_categories: string[]
  expected_outcome: string
  budget_min: string
  budget_max: string
  deadline: string
}

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()

  const { data: project, isLoading } = useProject(id!)
  const updateProject = useUpdateProject()

  const redirected = useRef(false)
  const dataLoaded = useRef(false)

  const [formData, setFormData] = useState<FormData>({
    title: '',
    domain: '',
    description: '',
    trl_level: 1,
    risk_categories: [],
    expected_outcome: '',
    budget_min: '',
    budget_max: '',
    deadline: '',
  })

  /* ---------- ROLE GUARD ---------- */
  useEffect(() => {
    if (user?.role === 'expert' && !redirected.current) {
      redirected.current = true
      toast({
        title: 'Access Denied',
        description: 'Only buyers can edit projects.',
        variant: 'destructive',
      })
      navigate('/projects')
    }
  }, [user, navigate])

  /* ---------- OWNER GUARD ---------- */
  useEffect(() => {
    if (!isLoading && project && project.buyer_id !== user?.id) {
      navigate(`/projects/${id}`)
    }
  }, [isLoading, project, user, navigate, id])

  /* ---------- LOAD PROJECT ---------- */
  useEffect(() => {
    if (project && !dataLoaded.current) {
      setFormData({
        title: project.title || '',
        domain: project.domain || '',
        description: project.description || '',
        trl_level: project.trl_level || 1,
        risk_categories: project.risk_categories || [],
        expected_outcome: project.expected_outcome || '',
        budget_min: project.budget_min?.toString() || '',
        budget_max: project.budget_max?.toString() || '',
        deadline: project.deadline
          ? new Date(project.deadline).toISOString().split('T')[0]
          : '',
      })
      dataLoaded.current = true
    }
  }, [project])

  const toggleRisk = (risk: string) => {
    setFormData(prev => ({
      ...prev,
      risk_categories: prev.risk_categories.includes(risk)
        ? prev.risk_categories.filter(r => r !== risk)
        : [...prev.risk_categories, risk],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload = {
      title: formData.title.trim(),
      domain: formData.domain as Domain,
      description: formData.description.trim(),
      trl_level: formData.trl_level as TRLLevel,
      risk_categories: formData.risk_categories as RiskCategory[],
      expected_outcome: formData.expected_outcome.trim(),
      status: project?.status || 'draft',
      budget_min: Number(formData.budget_min) || 0,
      budget_max: Number(formData.budget_max) || 0,
      ...(formData.deadline && { deadline: formData.deadline }),
    }

    await updateProject.mutateAsync({ id: id!, data: payload })
    toast({ title: 'Project Updated', description: 'All changes saved.' })
    navigate(`/projects/${id}`)
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(`/projects/${id}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">

          <Card>
            <CardHeader>
              <CardTitle>Core Details</CardTitle>
              <CardDescription>Edit everything</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                value={formData.title}
                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                required
              />

              <Select
                value={formData.domain}
                onValueChange={v => setFormData(p => ({ ...p, domain: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Domain" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(domainLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Textarea
                value={formData.description}
                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                required
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>TRL & Risks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={formData.trl_level.toString()}
                onValueChange={v => setFormData(p => ({ ...p, trl_level: Number(v) }))}
              >
                <SelectTrigger />
                <SelectContent>
                  {Object.entries(trlDescriptions).map(([lvl, desc]) => (
                    <SelectItem key={lvl} value={lvl}>
                      Level {lvl}: {desc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {['technical', 'regulatory', 'scale', 'market'].map(risk => (
                <div key={risk} className="flex items-center gap-2">
                  <Checkbox
                    checked={formData.risk_categories.includes(risk)}
                    onCheckedChange={() => toggleRisk(risk)}
                  />
                  <span className="capitalize">{risk}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Budget & Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="number"
                placeholder="Min Budget"
                value={formData.budget_min}
                onChange={e => setFormData(p => ({ ...p, budget_min: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Max Budget"
                value={formData.budget_max}
                onChange={e => setFormData(p => ({ ...p, budget_max: e.target.value }))}
              />
              <Input
                type="date"
                value={formData.deadline}
                onChange={e => setFormData(p => ({ ...p, deadline: e.target.value }))}
              />
              <Textarea
                placeholder="Expected outcome"
                value={formData.expected_outcome}
                onChange={e => setFormData(p => ({ ...p, expected_outcome: e.target.value }))}
                required
              />
            </CardContent>
          </Card>

          <Button type="submit" disabled={updateProject.isPending}>
            {updateProject.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Save All Changes
          </Button>

        </form>
      </div>
    </Layout>
  )
}
