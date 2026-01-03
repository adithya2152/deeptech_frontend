import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useProposals } from '@/hooks/useProposals'
import { contractsApi } from '@/lib/api'
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
}

export function ProposalsList({
  projectId,
  projectStatus,
  contractedExpertIds
}: ProposalsListProps) {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Hooks
  const { data: proposals = [], isLoading } = useProposals(projectId)
  const startConversation = useStartDirectChat() // Using the hook directly

  // State
  const [selectedProposal, setSelectedProposal] = useState<any>(null)
  const [formData, setFormData] = useState({
    model: 'fixed',
    rate: '',
    duration: '',
    sprintCount: ''
  })

  // Mutations
  const createContractMutation = useMutation({
    mutationFn: (data: any) => contractsApi.create(data, token!),
    onSuccess: (response: any) => {
      toast({
        title: 'Offer Sent',
        description: 'Contract offer sent successfully.'
      })
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      navigate(`/contracts/${response.data.id}`)
    },
    onError: (error: any) => {
      toast({
        title: 'Hiring Failed',
        description: error.message,
        variant: 'destructive'
      })
    }
  })

  const handleChatClick = (expertId: string) => {
    startConversation.mutate(expertId, {
      onSuccess: (data: any) => {
        // Handle both possible response structures (direct object or nested data)
        const chat = data.data || data; 
        const conversationId = chat.id || chat.conversation?.id;
        if (conversationId) {
            navigate(`/messages?id=${conversationId}`);
        } else {
            toast({
                title: "Error",
                description: "Could not retrieve conversation ID",
                variant: "destructive"
            });
        }
      }
    });
  };

  const handleAcceptClick = (proposal: any) => {
    if (contractedExpertIds?.has(proposal.expert_id)) {
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
      sprintCount: String(proposal.sprint_count || '')
    })
  }

  const handleConfirmAccept = () => {
    if (!token || !user || !selectedProposal) return

    let payment_terms: any = {}
    const rate = Number(formData.rate)

    if (formData.model === 'daily') {
      payment_terms = {
        currency: 'USD',
        daily_rate: rate,
        total_days: Number(formData.duration) || 1
      }
    } else if (formData.model === 'sprint') {
      payment_terms = {
        currency: 'USD',
        sprint_rate: rate,
        sprint_duration_days: selectedProposal.sprint_duration_days || 14,
        total_sprints: parseInt(formData.sprintCount || '0', 10)
      }
    } else {
      payment_terms = {
        currency: 'USD',
        total_amount: rate
      }
    }

    const contractData = {
      expert_id: selectedProposal.expert_id,
      project_id: projectId,
      engagement_model: formData.model,
      payment_terms,
      start_date: new Date().toISOString()
    }

    createContractMutation.mutate(contractData)
  }

  const getTotalEstimate = () => {
    const r = Number(formData.rate) || 0
    const d = Number(formData.duration) || 0
    const s = Number(formData.sprintCount) || 0

    if (formData.model === 'daily') return r * d
    if (formData.model === 'sprint') return r * s
    return r
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!proposals || proposals.length === 0) {
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

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        Proposals <Badge variant="secondary">{proposals.length}</Badge>
      </h2>

      <div className="grid gap-4">
        {proposals.map((proposal) => {
          const isExpertAlreadyContracted =
            contractedExpertIds?.has(proposal.expert_id) ?? false
          return (
            <Card
              key={proposal.id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex gap-4">
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage src={proposal.expert_avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {proposal.expert_name
                          ?.split(' ')
                          .map((n: string) => n[0])
                          .join('') || 'E'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{proposal.expert_name}</h3>
                        <UserCheck className="h-4 w-4 text-blue-500" />
                        {proposal.engagement_model && (
                          <Badge
                            variant="outline"
                            className="uppercase text-[10px] tracking-wider ml-2"
                          >
                            {proposal.engagement_model}
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1.5 text-foreground font-medium bg-muted/30 px-2 py-0.5 rounded">
                          <Tag className="h-3.5 w-3.5" />
                          {proposal.engagement_model === 'fixed'
                            ? `$${(proposal.rate || proposal.quote_amount)?.toLocaleString()} Total`
                            : proposal.engagement_model === 'sprint'
                            ? `$${proposal.rate?.toLocaleString()} / Sprint`
                            : `$${proposal.rate?.toLocaleString()} / Day`}
                        </span>

                        {proposal.engagement_model === 'sprint' &&
                          proposal.sprint_count && (
                            <span className="flex items-center gap-1.5">
                              <RefreshCcw className="h-3.5 w-3.5" />
                              {proposal.sprint_count} sprints est.
                            </span>
                          )}

                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {proposal.duration_days} days est.
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(proposal.created_at), 'MMM dd')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 items-start shrink-0">
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 w-24"
                      onClick={() => handleAcceptClick(proposal)}
                      disabled={
                        isExpertAlreadyContracted || createContractMutation.isPending
                      }
                    >
                      {isExpertAlreadyContracted ? 'In Contract' : 'Hire'}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      disabled={startConversation.isPending}
                      onClick={() => handleChatClick(proposal.expert_id)}
                    >
                      {startConversation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MessageSquare className="h-4 w-4 mr-2" />
                      )}
                      Chat
                    </Button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Expert&apos;s Pitch
                  </p>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    "{proposal.message}"
                  </p>
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
                  {selectedProposal.sprint_count || '?'} sprints · $
                  {selectedProposal.rate?.toLocaleString()} / sprint
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
                ${getTotalEstimate().toLocaleString()}
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