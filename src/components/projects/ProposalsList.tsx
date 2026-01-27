import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useProposals } from '@/hooks/useProposals'
import { useProject } from '@/hooks/useProjects'
import { contractsApi } from '@/lib/api'
import { DEFAULT_CURRENCY } from '@/lib/currency'
import { useCurrency } from '@/hooks/useCurrency'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useStartDirectChat } from '@/hooks/useMessages' // Correct import
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import {
  Loader2,
  Calendar,
  DollarSign,
  Clock,
  UserCheck,
  MessageSquare,
  RefreshCcw,
  Tag,
  AlertCircle
} from 'lucide-react'
import { format } from 'date-fns'

interface ProposalsListProps {
  projectId: string
  projectStatus?: string
  contractedExpertIds?: Set<string>
  limit?: number
  showAllLink?: boolean
  proposalsOverride?: any[]
  isLoadingOverride?: boolean
  hideHeader?: boolean
}

export function ProposalsList({
  projectId,
  projectStatus,
  contractedExpertIds,
  limit,
  showAllLink,
  proposalsOverride,
  isLoadingOverride,
  hideHeader
}: ProposalsListProps) {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { convertAndFormat } = useCurrency()

  const { data: project } = useProject(projectId)
  const projectCurrency = project?.currency || DEFAULT_CURRENCY

  // Hooks
  const { data: proposals = [], isLoading } = useProposals(projectId, {
    enabled: !proposalsOverride
  })
  const startConversation = useStartDirectChat() // Using the hook directly

  const proposalsData = proposalsOverride ?? proposals
  const isLoadingData = isLoadingOverride ?? isLoading

  // State
  const [selectedProposal, setSelectedProposal] = useState<any>(null)
  const [formData, setFormData] = useState({
    model: 'fixed',
    rate: '',
    duration: '',
    sprintCount: '',
    estimatedHours: ''
  })

  // Mutations
  const createContractMutation = useMutation({
    mutationFn: ({ contractData }: { contractData: any; proposalId: string }) =>
      contractsApi.create(contractData, token!),
    onSuccess: (response: any) => {
      toast({
        title: 'Offer Sent',
        description: 'Contract offer sent successfully.'
      })
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      queryClient.invalidateQueries({ queryKey: ['proposals', projectId] })
      queryClient.invalidateQueries({ queryKey: ['notificationCounts'] })
      navigate(`/contracts/${response.data.id}`)
    },
    onError: (error: any) => {
      toast({
        title: 'Hiring Failed',
        description: error.message || 'Failed to create contract. Please try again.',
        variant: 'destructive'
      })
    }
  })

  // Reject proposal mutation
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const rejectProposalMutation = useMutation({
    mutationFn: async (proposalId: string) => {
      const response = await fetch(`${API_BASE_URL}/proposals/${proposalId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to reject proposal');
      }
      return response.json();
    },
    onMutate: async (proposalId: string) => {
      await queryClient.cancelQueries({ queryKey: ['proposals', projectId] })

      const previousProposals = queryClient.getQueryData<any[]>(['proposals', projectId])

      queryClient.setQueryData<any[]>(['proposals', projectId], (current = []) =>
        current.map((p) => (p?.id === proposalId ? { ...p, status: 'rejected' } : p))
      )

      return { previousProposals }
    },
    onSuccess: () => {
      toast({
        title: 'Proposal Declined',
        description: 'The proposal has been declined.'
      })
      queryClient.invalidateQueries({ queryKey: ['proposals', projectId] })
      queryClient.invalidateQueries({ queryKey: ['project-proposals', projectId] })
      queryClient.invalidateQueries({ queryKey: ['notificationCounts'] })
    },
    onError: (error: any, _proposalId, context) => {
      if (context?.previousProposals) {
        queryClient.setQueryData(['proposals', projectId], context.previousProposals)
      }
      toast({
        title: 'Decline Failed',
        description: error.message || 'Failed to decline proposal.',
        variant: 'destructive'
      })
    }
  })

  const handleChatClick = (expertUserId: string) => {
    if (!expertUserId) {
      toast({
        title: "Error",
        description: "Expert user ID not available",
        variant: "destructive"
      });
      return;
    }

    // useStartDirectChat returns the conversation ID directly
    startConversation.mutate(expertUserId, {
      onSuccess: (conversationId: string) => {
        if (conversationId) {
          navigate(`/messages?id=${conversationId}`);
        } else {
          toast({
            title: "Error",
            description: "Could not retrieve conversation ID",
            variant: "destructive"
          });
        }
      },
      onError: (error: any) => {
        toast({
          title: "Chat Failed",
          description: error.message || "Failed to start conversation",
          variant: "destructive"
        });
      }
    });
  };

  const handleAcceptClick = (proposal: any) => {
    if (proposal?.status && proposal.status !== 'pending') {
      toast({
        title: 'Action Unavailable',
        description: 'You can only hire from pending proposals.'
      })
      return
    }
    if (contractedExpertIds?.has(proposal.expert_profile_id)) {
      toast({
        title: 'Already in contract',
        description: 'You already have a contract with this expert for this project.',
        variant: 'destructive'
      })
      return
    }
    setSelectedProposal(proposal)
    setFormData({
      model: proposal.engagement_model || 'fixed',
      rate: String(proposal.rate || proposal.quote_amount || ''),
      duration: String(proposal.duration_days || ''),
      sprintCount: String(proposal.sprint_count || ''),
      estimatedHours: String(proposal.estimated_hours || '')
    })
  }

  const handleConfirmAccept = () => {
    if (!token || !user || !selectedProposal) return

    let payment_terms: any = {}
    const rate = Number(formData.rate)

    if (formData.model === 'daily') {
      payment_terms = {
        currency: projectCurrency,
        daily_rate: rate,
        total_days: Number(formData.duration) || 1
      }
    } else if (formData.model === 'sprint') {
      payment_terms = {
        currency: projectCurrency,
        sprint_rate: rate,
        sprint_duration_days: selectedProposal.sprint_duration_days || 14,
        total_sprints: parseInt(formData.sprintCount || '0', 10)
      }
    } else if (formData.model === 'hourly') {
      payment_terms = {
        currency: projectCurrency,
        hourly_rate: rate,
        estimated_hours: Number(formData.estimatedHours) || 0
      }
    } else {
      payment_terms = {
        currency: projectCurrency,
        total_amount: rate
      }
    }

    const contractData = {
      expert_profile_id: selectedProposal.expert_profile_id,
      project_id: projectId,
      engagement_model: formData.model,
      payment_terms,
      start_date: new Date().toISOString()
    }

    createContractMutation.mutate({ contractData, proposalId: selectedProposal.id })
  }

  const getTotalEstimate = () => {
    const r = Number(formData.rate) || 0
    const d = Number(formData.duration) || 0
    const s = Number(formData.sprintCount) || 0
    const h = Number(formData.estimatedHours) || 0

    if (formData.model === 'daily') return r * d
    if (formData.model === 'sprint') return r * s
    if (formData.model === 'hourly') return r * h
    return r
  }

  if (isLoadingData) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!proposalsData || proposalsData.length === 0) {
    return (
      <div className="text-center p-12 border-2 border-dashed rounded-xl bg-muted/20 flex flex-col items-center gap-3">
        {projectStatus === 'draft' ? (
          <>
            <div className="bg-amber-100 p-3 rounded-full">
              <AlertCircle className="h-6 w-6 text-amber-600" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-foreground">Project is in Draft Mode</p>
              <p className="text-sm text-muted-foreground">
                Publish your project to start receiving proposals from experts.
              </p>
            </div>
          </>
        ) : (
          <p className="text-muted-foreground">No proposals received yet.</p>
        )}
      </div>
    )
  }

  const visibleProposals =
    typeof limit === 'number' ? proposalsData.slice(0, limit) : proposalsData

  return (
    <div className="space-y-4">
      {!hideHeader && (
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold flex items-center gap-2">
            Proposals <Badge variant="secondary">{proposalsData.length}</Badge>
          </h2>
          {showAllLink && typeof limit === 'number' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/projects/${projectId}/proposals`)}
            >
              View all proposals
            </Button>
          )}
        </div>
      )}

      <div className="grid gap-4">
        {visibleProposals.map((proposal) => {
          const isExpertAlreadyContracted =
            contractedExpertIds?.has(proposal.expert_id) ?? false
          const rawStatus = proposal.status || 'pending'
          const status = rawStatus === 'declined' ? 'rejected' : rawStatus
          const isPending = status === 'pending'
          const isAccepted = status === 'accepted'
          const isDeclined = status === 'rejected'
          const statusLabel = isAccepted ? 'Accepted' : isDeclined ? 'Declined' : 'Pending'

          return (
            <Card
              key={proposal.id}
              className="overflow-hidden hover:shadow-md transition-shadow group border-muted/60"
            >
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-muted/60">

                  {/* Left Section: Expert Info & Pitch (Grow) */}
                  <div className="flex-1 p-5 space-y-4">
                    {/* Header: User Info & Status */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <Avatar className="h-12 w-12 border shadow-sm cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all" onClick={() => navigate(`/experts/${proposal.expert_user_id}`)}>
                          <AvatarImage src={proposal.expert_avatar} />
                          <AvatarFallback className="bg-primary/5 text-primary font-bold">
                            {proposal.expert_name?.slice(0, 2).toUpperCase() || 'EX'}
                          </AvatarFallback>
                        </Avatar>

                        <div className="space-y-1">
                          <div className="flex items-center flex-wrap gap-2">
                            <h3
                              className="font-bold text-lg hover:text-primary cursor-pointer transition-colors leading-none"
                              onClick={() => navigate(`/experts/${proposal.expert_user_id}`)}
                            >
                              {proposal.expert_name}
                            </h3>
                            {proposal.expert_tier && (
                              <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700 text-[10px] h-5 px-1.5 uppercase tracking-wider font-semibold">
                                {proposal.expert_tier}
                              </Badge>
                            )}
                            <Badge
                              variant={isAccepted ? "default" : isDeclined ? "destructive" : "secondary"}
                              className={isAccepted ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                            >
                              {statusLabel}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(proposal.created_at), 'MMM dd, yyyy')}
                            </div>
                            {isExpertAlreadyContracted && (
                              <span className="text-emerald-600 font-medium flex items-center gap-1">
                                <UserCheck className="h-3 w-3" /> Hired
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Proposal Pitch */}
                    <div className="bg-muted/30 rounded-lg p-3 text-sm text-foreground/80 relative group-hover:bg-muted/50 transition-colors">
                      <p className="line-clamp-3 italic">"{proposal.message}"</p>
                    </div>
                  </div>

                  {/* Right Section: Metadata & Actions (Fixed Width on Desktop) */}
                  <div className="md:w-72 lg:w-80 bg-muted/5 flex flex-col justify-between p-5 gap-6">

                    {/* Key Stats Grid */}
                    {/* Key Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-0.5">
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">Rate</p>
                        <div className="font-semibold text-sm flex items-center gap-1">
                          {proposal.engagement_model === 'fixed'
                            ? convertAndFormat(proposal.rate || proposal.quote_amount, projectCurrency)
                            : convertAndFormat(proposal.rate, projectCurrency)}
                          <span className="text-xs text-muted-foreground font-normal">
                            {proposal.engagement_model === 'fixed'
                              ? 'total'
                              : proposal.engagement_model === 'sprint'
                                ? '/sprint'
                                : `/${proposal.engagement_model === 'hourly' ? 'hr' : 'day'}`
                            }
                          </span>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <p className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">
                          {proposal.engagement_model === 'sprint' ? 'Sprints' : 'Duration'}
                        </p>
                        <div className="font-semibold text-sm flex items-center gap-1">
                          {proposal.engagement_model === 'sprint' ? (
                            <>
                              <RefreshCcw className="h-3.5 w-3.5 text-muted-foreground" />
                              {proposal.sprint_count || 1} sprints
                            </>
                          ) : (
                            <>
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              {proposal.duration_days} days
                            </>
                          )}
                        </div>
                      </div>

                      <div className="col-span-2 pt-2 border-t border-dashed">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground capitalize">{proposal.engagement_model} Model</span>
                          {/* Potential Total */}
                          {(proposal.engagement_model === 'daily' || proposal.engagement_model === 'sprint') && (
                            <div className="flex gap-2">
                              <span className="text-muted-foreground">Est. Total:</span>
                              <span className="font-medium">
                                {proposal.engagement_model === 'daily'
                                  ? convertAndFormat((proposal.rate || 0) * (proposal.duration_days || 1), projectCurrency)
                                  : convertAndFormat((proposal.rate || 0) * (proposal.sprint_count || 1), projectCurrency)
                                }
                              </span>
                            </div>
                          )}
                          {proposal.engagement_model === 'fixed' && (
                            <div className="flex gap-2">
                              <span className="text-muted-foreground">Total Price:</span>
                              <span className="font-medium">
                                {convertAndFormat(proposal.quote_amount || proposal.rate, projectCurrency)}
                              </span>
                            </div>
                          )}
                          {proposal.engagement_model === 'hourly' && (
                            <div className="flex gap-2">
                              <span className="text-muted-foreground">Rate:</span>
                              <span className="font-medium">
                                {convertAndFormat(proposal.rate, projectCurrency)}/hr
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        disabled={startConversation.isPending}
                        onClick={() => handleChatClick(proposal.expert_user_id)}
                      >
                        {startConversation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageSquare className="h-3.5 w-3.5 mr-2" />}
                        Chat
                      </Button>

                      {isPending && !isExpertAlreadyContracted ? (
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            size="sm"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                            onClick={() => handleAcceptClick(proposal)}
                            disabled={createContractMutation.isPending}
                          >
                            Hire
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20"
                            onClick={() => rejectProposalMutation.mutate(proposal.id)}
                            title="Decline"
                          >
                            <AlertCircle className="h-4 w-4 mr-2" /> Decline
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="secondary" disabled className="w-full opacity-70">
                          {isAccepted ? 'Hired' : isDeclined ? 'Declined' : 'Done'}
                        </Button>
                      )}
                    </div>

                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog
        open={!!selectedProposal}
        onOpenChange={(open) => !open && setSelectedProposal(null)}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Make an Offer to {selectedProposal?.expert_name}
            </DialogTitle>
            <DialogDescription>
              Review or negotiate the terms before sending the contract.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-5 py-4">
            {selectedProposal?.engagement_model === 'sprint' && (
              <div className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground text-sm">
                  Expert&apos;s original proposal
                </p>
                <p>
                  {selectedProposal.sprint_count || '?'} sprints · {convertAndFormat(selectedProposal.rate, projectCurrency)} / sprint
                </p>
                {selectedProposal.duration_days && (
                  <p>{selectedProposal.duration_days} days estimated</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Engagement Model</Label>
              <Select
                value={formData.model}
                onValueChange={(val) => setFormData({ ...formData, model: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly Rate</SelectItem>
                  <SelectItem value="daily">Daily Rate (Time &amp; Materials)</SelectItem>
                  <SelectItem value="sprint">Sprint-Based (Retainer)</SelectItem>
                  <SelectItem value="fixed">Fixed Price (Milestones)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  {formData.model === 'daily'
                    ? 'Daily Rate'
                    : formData.model === 'sprint'
                      ? 'Per Sprint'
                      : formData.model === 'hourly'
                        ? 'Hourly Rate'
                        : 'Total Price'}
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    type="number"
                    value={formData.rate}
                    onChange={(e) =>
                      setFormData({ ...formData, rate: e.target.value })
                    }
                  />
                </div>
              </div>

              {formData.model === 'sprint' ? (
                <div className="space-y-2">
                  <Label>Est. Sprints</Label>
                  <div className="relative">
                    <RefreshCcw className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      type="number"
                      value={formData.sprintCount}
                      onChange={(e) =>
                        setFormData({ ...formData, sprintCount: e.target.value })
                      }
                    />
                  </div>
                </div>
              ) : formData.model === 'hourly' ? (
                <div className="space-y-2">
                  <Label>Est. Total Hours</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      type="number"
                      placeholder="40"
                      value={formData.estimatedHours}
                      onChange={(e) =>
                        setFormData({ ...formData, estimatedHours: e.target.value })
                      }
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Total hours for the contract</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Duration (Days)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9"
                      type="number"
                      value={formData.duration}
                      onChange={(e) =>
                        setFormData({ ...formData, duration: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-muted/50 p-3 rounded-lg flex justify-between items-center border">
              <span className="text-sm text-muted-foreground">
                Total Contract Value
              </span>
              <span className="text-lg font-bold">
                {convertAndFormat(getTotalEstimate(), projectCurrency)}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedProposal(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAccept}
              disabled={createContractMutation.isPending}
            >
              {createContractMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Send Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}