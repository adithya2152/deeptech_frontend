import { DEFAULT_CURRENCY } from '@/lib/currency'
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { useProject } from '@/hooks/useProjects'
import { contractsApi } from '@/lib/api'
import { currencySymbol, formatCurrency } from '@/lib/currency'
import { Expert } from '@/types'
import {
  Loader2,
  Clock,
  Calendar,
  Shield,
  FileText,
  Info,
} from 'lucide-react'
import { Card } from '../ui/card'

interface ContractCreationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  project_id: string
  expert: Expert
  onSuccess?: () => void
}

interface FormData {
  engagement_type: 'advisory' | 'architecture_review' | 'hands_on_execution'
  hourly_rate: number
  weekly_hour_cap: number
  start_date: string
  end_date?: string
  ip_ownership: 'buyer_owns' | 'shared' | 'expert_owns'
  nda_signed: boolean
}

export function ContractCreationDialog({
  open,
  onOpenChange,
  project_id,
  expert,
  onSuccess,
}: ContractCreationDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { token } = useAuth()
  const { data: project } = useProject(project_id)
  const projectCurrency = project?.currency || DEFAULT_CURRENCY

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      engagement_type: 'advisory',
      weekly_hour_cap: 10,
      ip_ownership: 'buyer_owns',
      nda_signed: true,
      hourly_rate: expert.avg_hourly_rate || 0,
      start_date: new Date().toISOString().spli'T'[0],
    },
  })

  const watched_rate = watch('hourly_rate')
  const watched_cap = watch('weekly_hour_cap')

  const createContractMutation = useMutation({
    mutationFn: (data: any) => contractsApi.create(data, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      toast({
        title: 'Contract Invitation Sent',
        description: `Terms sent to ${expert.first_name}. Work can begin once they accept.`,
      })
      reset()
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to create contract',
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: FormData) => {
    // Treat this dialog as DAILY engagement model
    const payment_terms = {
      currency: projectCurrency,
      daily_rate: Number(data.hourly_rate),
      total_days: Number(data.weekly_hour_cap) || 1,
    }

    const payload = {
      project_id,
      expert_id: expert.id,
      engagement_model: 'daily' as const,
      payment_terms,
      start_date: data.start_date,
      ip_ownership: data.ip_ownership,
    }

    createContractMutation.mutate(payload)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Engagement Terms</DialogTitle>
          <DialogDescription>
            Defining collaboration with{' '}
            <strong>
              {expert.first_name} {expert.last_name}
            </strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <Card className="p-4 bg-primary/5 border-primary/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">Weekly Budget Cap</p>
                <p className="text-xs text-muted-foreground">
                  Based on current terms
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-primary">
                {formatCurrency(watched_rate * watched_cap, projectCurrency)}
              </p>
              <p className="text-[10px] uppercase font-bold text-muted-foreground">
                Max Per Week
              </p>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Engagement Type</Label>
              <Controller
                name="engagement_type"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="advisory">Strategic Advisory</SelectItem>
                      <SelectItem value="architecture_review">
                        Architecture Review
                      </SelectItem>
                      <SelectItem value="hands_on_execution">
                        Hands-on Execution
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Hourly Rate ({projectCurrency})</Label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-sm text-muted-foreground">
                  {currencySymbol(projectCurrency)}
                </span>
                <Input
                  type="number"
                  className="pl-9"
                  {...register('hourly_rate', { required: true, min: 1 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Weekly Hour Limit</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  className="pl-9"
                  {...register('weekly_hour_cap', {
                    required: true,
                    min: 1,
                    max: 168,
                  })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  className="pl-9"
                  {...register('start_date', { required: true })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <Label className="text-base">Legal & IP Terms</Label>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">
                IP Ownership
              </Label>
              <Controller
                name="ip_ownership"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buyer_owns">
                        Buyer Owns All IP (Standard)
                      </SelectItem>
                      <SelectItem value="shared">
                        Shared Intellectual Property
                      </SelectItem>
                      <SelectItem value="expert_owns">
                        Expert Retains Rights
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
              <Checkbox
                id="nda_signed"
                defaultChecked={true}
                onCheckedChange={(checked) =>
                  setValue('nda_signed', checked as boolean)
                }
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="nda_signed"
                  className="text-sm font-medium flex items-center gap-2 cursor-pointer"
                >
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  Enforce Platform NDA
                </label>
                <p className="text-xs text-muted-foreground">
                  Expert must agree to non-disclosure before logging hours.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-8"
              disabled={createContractMutation.isPending}
            >
              {createContractMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              Send Contract for Review
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
