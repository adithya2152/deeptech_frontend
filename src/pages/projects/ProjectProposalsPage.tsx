import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ProposalsList } from '@/components/projects/ProposalsList'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { useProject } from '@/hooks/useProjects'
import { useProjectContracts } from '@/hooks/useContracts'
import { useProposals } from '@/hooks/useProposals'
import { domainLabels } from '@/lib/constants'
import { ArrowLeft, CalendarDays, Globe, Target, Search, ArrowUpDown } from 'lucide-react'

export default function ProjectProposalsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()

  const { data: project, isLoading: projectLoading } = useProject(id || '')
  const { data: projectContracts = [] } = useProjectContracts(id || '')
  const { data: proposals = [], isLoading: proposalsLoading } = useProposals(id || '')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>(
    'all'
  )
  const [modelFilter, setModelFilter] = useState<'all' | 'daily' | 'sprint' | 'fixed'>('all')
  const [sort, setSort] = useState<'newest' | 'oldest' | 'rate_high' | 'rate_low'>(
    'newest'
  )

  useEffect(() => {
    if (!project || !user) return

    // Buyer can only see proposals on their own project.
    if (user.role === 'buyer' && project.buyer_user_id && project.buyer_user_id !== user.id) {
      toast({
        title: 'Access Restricted',
        description: 'You can only view proposals for your own projects.',
        variant: 'destructive'
      })
      navigate('/projects')
    }
  }, [project, user, toast, navigate])

  const contractedExpertIds = useMemo(() => {
    return new Set(
      projectContracts
        .filter((c: any) => ['pending', 'active'].includes(c.status))
        .map((c: any) => c.expert_profile_id || c.expert_id)
    )
  }, [projectContracts])

  const filteredProposals = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = (proposals || []).slice()

    if (q) {
      list = list.filter((p: any) => {
        const expertName = String(p?.expert_name || '').toLowerCase()
        const message = String(p?.message || '').toLowerCase()
        return expertName.includes(q) || message.includes(q)
      })
    }

    if (statusFilter !== 'all') {
      list = list.filter((p: any) => {
        if (statusFilter === 'rejected') return p?.status === 'rejected' || p?.status === 'declined'
        return p?.status === statusFilter
      })
    }

    if (modelFilter !== 'all') {
      list = list.filter((p: any) => p?.engagement_model === modelFilter)
    }

    const getRate = (p: any) => Number(p?.rate ?? p?.quote_amount ?? 0)
    const getCreated = (p: any) => new Date(p?.created_at || 0).getTime()

    list.sort((a: any, b: any) => {
      if (sort === 'oldest') return getCreated(a) - getCreated(b)
      if (sort === 'rate_high') return getRate(b) - getRate(a)
      if (sort === 'rate_low') return getRate(a) - getRate(b)
      return getCreated(b) - getCreated(a)
    })

    return list
  }, [proposals, search, statusFilter, modelFilter, sort])

  if (!id) return null

  return (
    <Layout>
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/projects/${id}`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to project
            </Button>
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">All Proposals</h1>
              {project?.title ? (
                <p className="text-sm text-muted-foreground">
                  For: <span className="font-medium text-foreground">{project.title}</span>
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Project: {id}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3 space-y-4">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Project details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {projectLoading ? (
                  <p className="text-sm text-muted-foreground">Loading project…</p>
                ) : project ? (
                  <>
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {project.status}
                        </Badge>
                        {project.domain && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Globe className="h-3.5 w-3.5" />
                            {(domainLabels as any)[project.domain] ?? project.domain}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2">
                        <h2 className="text-lg font-semibold leading-tight">{project.title}</h2>
                        {project.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {project.description}
                          </p>
                        )}
                      </div>

                      {project.expected_outcome && (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Expected outcome
                          </p>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {project.expected_outcome}
                          </p>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase text-muted-foreground">Budget</p>
                      <p className="text-sm text-foreground font-medium">
                        {project.budget_min
                          ? `$${project.budget_min.toLocaleString()}`
                          : '—'}
                        {project.budget_max ? ` – $${project.budget_max.toLocaleString()}` : ''}
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase text-muted-foreground">Deadline</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        <span className="text-foreground font-medium">
                          {project.deadline
                            ? new Date(project.deadline).toLocaleDateString()
                            : 'Flexible'}
                        </span>
                      </p>
                    </div>

                    <Separator />

                    <div className="pt-1">
                      <Button className="w-full" onClick={() => navigate(`/projects/${id}`)}>
                        Go to project
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Project not found.</p>
                )}
              </CardContent>
            </Card>
          </aside>

          <section className="lg:col-span-9">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">Proposals</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Showing {filteredProposals.length} of {proposals.length}
                    </p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="relative md:col-span-3">
                    <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by expert name or message…"
                      className="pl-9"
                    />
                  </div>

                  <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Declined</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={modelFilter} onValueChange={(v: any) => setModelFilter(v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All models</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="sprint">Sprint</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sort} onValueChange={(v: any) => setSort(v)}>
                    <SelectTrigger>
                      <ArrowUpDown className="h-4 w-4 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="rate_high">Rate: high → low</SelectItem>
                      <SelectItem value="rate_low">Rate: low → high</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>

              <CardContent className="p-4 md:p-6 pt-0">
                <ProposalsList
                  projectId={id}
                  projectStatus={project?.status}
                  contractedExpertIds={contractedExpertIds}
                  proposalsOverride={filteredProposals}
                  isLoadingOverride={proposalsLoading}
                  hideHeader
                />
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </Layout>
  )
}
