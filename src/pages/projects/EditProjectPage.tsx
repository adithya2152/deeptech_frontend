import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { useProject, useUpdateProject } from '@/hooks/useProjects'
import { Domain } from '@/types'
import { domainLabels, trlDescriptions } from '@/data/mockData'
import { ArrowLeft, Loader2 } from 'lucide-react'

type FormData = {
  title: string
  domain: string
  problemDescription: string
  trlLevel: number
  riskCategories: string[]
  expectedOutcome: string
}

export default function EditProjectPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const { data: project, isLoading: loadingProject } = useProject(id!)
  const updateProject = useUpdateProject()

  const [formData, setFormData] = useState<FormData>({
    title: '',
    domain: '',
    problemDescription: '',
    trlLevel: 1,
    riskCategories: [],
    expectedOutcome: '',
  })

  // Pre-fill form when project loads
  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        domain: project.domain,
        problemDescription: project.problemDescription,
        trlLevel: project.trlLevel,
        riskCategories: project.riskCategories,
        expectedOutcome: project.expectedOutcome,
      })
    }
  }, [project])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await updateProject.mutateAsync({
        id: id!,
        updates: {
          title: formData.title,
          domain: formData.domain as Domain,
          description: formData.problemDescription,
          trl_level: formData.trlLevel.toString(),
          risk_categories: formData.riskCategories,
          expected_outcome: formData.expectedOutcome,
        },
      })

      toast({
        title: 'Project Updated!',
        description: 'Your changes have been saved.',
      })

      navigate(`/projects/${id}`)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update project',
        variant: 'destructive',
      })
    }
  }

  const toggleRisk = (risk: string) => {
    setFormData(prev => ({
      ...prev,
      riskCategories: prev.riskCategories.includes(risk)
        ? prev.riskCategories.filter(r => r !== risk)
        : [...prev.riskCategories, risk],
    }))
  }

  if (loadingProject) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    )
  }

  if (!project) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <h2 className="text-2xl font-bold">Project Not Found</h2>
          <Button onClick={() => navigate('/projects')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
      </Layout>
    )
  }

  if (project.status !== 'draft') {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <h2 className="text-2xl font-bold">Cannot Edit Project</h2>
          <p className="text-muted-foreground">Only draft projects can be edited.</p>
          <Button onClick={() => navigate(`/projects/${id}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            View Project
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Button
          variant="ghost"
          onClick={() => navigate(`/projects/${id}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Project
        </Button>

        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Edit Project</h1>
          <p className="text-muted-foreground mt-1">Update your project details</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter project title"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain">Domain *</Label>
                <Select
                  value={formData.domain}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, domain: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select domain" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(domainLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="problem">Problem Description *</Label>
                <Textarea
                  id="problem"
                  value={formData.problemDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, problemDescription: e.target.value }))}
                  placeholder="Describe the technical challenge you're facing..."
                  rows={6}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="trl">Technology Readiness Level (TRL) *</Label>
                <Select
                  value={formData.trlLevel.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, trlLevel: parseInt(value) }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(trlDescriptions).map(([level, description]) => (
                      <SelectItem key={level} value={level}>
                        TRL {level} - {description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Risk Categories</Label>
                <div className="space-y-2">
                  {[
                    { value: 'technical', label: 'Technical Risk' },
                    { value: 'regulatory', label: 'Regulatory Risk' },
                    { value: 'scale', label: 'Scale Risk' },
                    { value: 'market', label: 'Market Risk' },
                  ].map((risk) => (
                    <div key={risk.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={risk.value}
                        checked={formData.riskCategories.includes(risk.value)}
                        onCheckedChange={() => toggleRisk(risk.value)}
                      />
                      <Label htmlFor={risk.value} className="cursor-pointer">
                        {risk.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expected Outcome */}
          <Card>
            <CardHeader>
              <CardTitle>Expected Outcome</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="outcome">Expected Outcome *</Label>
                <Textarea
                  id="outcome"
                  value={formData.expectedOutcome}
                  onChange={(e) => setFormData(prev => ({ ...prev, expectedOutcome: e.target.value }))}
                  placeholder="Describe what success looks like for this project..."
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/projects/${id}`)}
              disabled={updateProject.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateProject.isPending}>
              {updateProject.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  )
}
