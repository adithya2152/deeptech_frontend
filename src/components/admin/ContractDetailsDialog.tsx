import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, DollarSign, User, Shield, FileText, ExternalLink } from "lucide-react";
import { useAdminUser } from "@/hooks/useAdmin";
import { Link } from "react-router-dom";

interface ContractDetailsDialogProps {
  contract: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserInfoDisplay = ({ userId, label }: { userId: string; label: string }) => {
  const { data: user, isLoading } = useAdminUser(userId);

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
        <User className="h-4 w-4" /> {label}
      </h4>
      <div className="bg-zinc-50 p-3 rounded-md border border-zinc-100 relative group hover:border-zinc-300 transition-colors">
        {isLoading ? (
            <div className="h-10 flex items-center text-xs text-zinc-400">Loading details...</div>
        ) : user ? (
            <Link to={`/admin/users/${userId}`} className="block">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-medium text-sm text-zinc-900 group-hover:text-blue-600 transition-colors">
                            {user.first_name} {user.last_name}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                    </div>
                    <ExternalLink className="h-3 w-3 text-zinc-300 group-hover:text-blue-500" />
                </div>
            </Link>
        ) : (
            <p className="text-sm text-zinc-500 italic">Unknown User ({userId?.slice(0, 8)})</p>
        )}
      </div>
    </div>
  );
};

export function ContractDetailsDialog({
  contract,
  open,
  onOpenChange,
}: ContractDetailsDialogProps) {
  if (!contract) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-bold leading-tight flex items-center gap-2">
                Contract #{contract.id.slice(0, 8)}
              </DialogTitle>
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {contract.title || 'Untitled Contract'}
                </span>
              </div>
            </div>
            <Badge variant={
              contract.status === 'active' ? 'default' : 
              contract.status === 'completed' ? 'secondary' : 
              contract.status === 'disputed' ? 'destructive' : 'outline'
            }>
              {contract.status.toUpperCase()}
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 flex flex-col gap-2">
                  <span className="text-xs font-medium text-zinc-500 uppercase">Total Value</span>
                  <div className="flex items-center gap-2 text-xl font-bold text-emerald-600">
                    <DollarSign className="h-5 w-5" />
                    {contract.total_amount?.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex flex-col gap-2">
                  <span className="text-xs font-medium text-zinc-500 uppercase">Engagement Model</span>
                  <div className="flex items-center gap-2 text-lg font-medium text-zinc-900 capitalize">
                    <Shield className="h-5 w-5 text-blue-600" />
                    {contract.engagement_model?.replace('_', ' ')}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-8">
               <UserInfoDisplay userId={contract.buyer_id} label="Buyer" />
               <UserInfoDisplay userId={contract.expert_id} label="Expert" />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-zinc-900">Timeline</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-zinc-600">
                  <Calendar className="h-4 w-4" />
                  Created: {new Date(contract.created_at).toLocaleDateString()}
                </div>
                {contract.end_date && (
                  <div className="flex items-center gap-2 text-zinc-600">
                    <Calendar className="h-4 w-4" />
                    End Date: {new Date(contract.end_date).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>

            {contract.milestones && contract.milestones.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-zinc-900">Milestones</h4>
                <div className="border rounded-md divide-y">
                  {contract.milestones.map((milestone: any, i: number) => (
                    <div key={i} className="p-3 flex justify-between items-center text-sm">
                      <div>
                        <p className="font-medium">{milestone.description || `Milestone ${i + 1}`}</p>
                        <p className="text-xs text-zinc-500">{milestone.status}</p>
                      </div>
                      <span className="font-medium">${milestone.amount?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator />
        
        <DialogFooter className="p-6 bg-zinc-50/50 flex justify-between sm:justify-between w-full">
          <Button variant="ghost" asChild className="text-zinc-500 hover:text-zinc-900">
            <Link to={`/contracts/${contract.id}`} target="_blank">
               <ExternalLink className="h-4 w-4 mr-2" />
               View Public Page
            </Link>
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close Details
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}