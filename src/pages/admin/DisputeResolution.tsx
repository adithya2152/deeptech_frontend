import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAdminDisputes, useAdminActions } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, AlertTriangle, FileText, Gavel, User, ExternalLink, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Helper to show user names - uses pre-fetched data from dispute
const DisputeUser = ({ name, role }: { name?: string, role: string }) => {
  return (
    <div className="flex items-center gap-2">
      <User className="h-3 w-3 text-zinc-500" />
      <span className="text-sm font-medium text-zinc-900">
        {name || 'Unknown User'}
      </span>
      <Badge variant="outline" className="text-[10px] h-5 px-1.5 capitalize bg-zinc-50">
        {role}
      </Badge>
    </div>
  );
};

export default function DisputeResolution() {
  const { data: disputes, isLoading } = useAdminDisputes();
  const { resolveDispute, isActing } = useAdminActions();

  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [filter, setFilter] = useState('open'); // 'open' | 'resolved' | 'all'

  // Filter disputes
  const filteredDisputes = useMemo(() => {
    if (!disputes) return [];
    if (filter === 'all') return disputes;

    // Assuming 'open' status includes 'open' and 'in_review'
    if (filter === 'open') {
      return disputes.filter((d: any) => ['open', 'in_review'].includes(d.status));
    }
    return disputes.filter((d: any) => ['resolved', 'closed'].includes(d.status));
  }, [disputes, filter]);

  // Reset selection when filter changes if selected item is no longer visible
  useMemo(() => {
    if (selectedDispute && !filteredDisputes.find((d: any) => d.id === selectedDispute.id)) {
      setSelectedDispute(null);
    }
  }, [filteredDisputes, selectedDispute]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Dispute Resolution Center</h1>
            <p className="text-zinc-500 mt-1">Adjudicate contract disputes and manage refunds.</p>
          </div>
          <Tabs value={filter} onValueChange={setFilter} className="w-[400px]">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="open">Open Cases</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
              <TabsTrigger value="all">All History</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
          {/* Left Column: List of Disputes */}
          <div className="lg:col-span-4 space-y-4 overflow-y-auto pr-2 pb-4">
            {isLoading ? (
              <div className="text-center py-10 text-zinc-500 text-sm">Loading disputes...</div>
            ) : filteredDisputes.length === 0 ? (
              <div className="text-center py-10 text-zinc-500 text-sm border-2 border-dashed rounded-lg">
                No {filter} disputes found.
              </div>
            ) : (
              filteredDisputes.map((dispute: any) => (
                <Card
                  key={dispute.id}
                  className={`cursor-pointer transition-all hover:border-zinc-400 group ${selectedDispute?.id === dispute.id
                    ? 'border-zinc-900 shadow-md ring-1 ring-zinc-900 bg-zinc-50'
                    : 'border-zinc-200'
                    }`}
                  onClick={() => {
                    setSelectedDispute(dispute);
                    setResolutionNote(dispute.resolution_notes || '');
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant={
                        ['resolved', 'closed'].includes(dispute.status) ? 'secondary' : 'destructive'
                      } className={
                        ['resolved', 'closed'].includes(dispute.status)
                          ? 'bg-zinc-100 text-zinc-600'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }>
                        {dispute.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {formatDistanceToNow(new Date(dispute.created_at))} ago
                      </span>
                    </div>
                    <h3 className="font-semibold text-zinc-900 mb-1 line-clamp-1">{dispute.reason}</h3>
                    <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{dispute.description}</p>
                    <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-medium">
                      <span className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-zinc-100">
                        <FileText className="h-3 w-3" /> #{dispute.contract_id?.slice(0, 6)}
                      </span>
                      <span className="flex items-center gap-1">
                        Raised by: <span className="capitalize text-zinc-600">{dispute.raised_by_type}</span>
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Right Column: Resolution Panel */}
          <div className="lg:col-span-8 h-full">
            {selectedDispute ? (
              <Card className="h-full flex flex-col border-zinc-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-zinc-50/50 border-b py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Gavel className="h-5 w-5 text-zinc-500" />
                        Dispute Review
                      </CardTitle>
                      <CardDescription className="font-mono text-xs mt-1">
                        ID: {selectedDispute.id}
                      </CardDescription>
                    </div>
                    {['resolved', 'closed'].includes(selectedDispute.status) && (
                      <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm font-medium">
                        <CheckCircle className="h-4 w-4" />
                        Resolved
                      </div>
                    )}
                  </div>
                </CardHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  {/* Parties Involved */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg border border-zinc-100 bg-white space-y-2">
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Raised By</span>
                      <DisputeUser name={selectedDispute.raised_by_name} role={selectedDispute.raised_by_type} />
                    </div>
                    <div className="p-4 rounded-lg border border-zinc-100 bg-white space-y-2">
                      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Reason</span>
                      <p className="text-sm font-medium text-zinc-900">{selectedDispute.reason}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-zinc-900">Claim Details</h4>
                    <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200 text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
                      {selectedDispute.description}
                    </div>
                  </div>

                  {/* Evidence */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm flex items-center gap-2 text-zinc-900">
                      <MessageSquare className="h-4 w-4" /> Evidence Provided
                    </h4>
                    {selectedDispute.evidence && Array.isArray(selectedDispute.evidence) && selectedDispute.evidence.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {selectedDispute.evidence.map((item: any, i: number) => (
                          <a
                            key={i}
                            href={item.url || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors group"
                          >
                            <div className="h-8 w-8 rounded bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100">
                              <ExternalLink className="h-4 w-4" />
                            </div>
                            <div className="overflow-hidden">
                              <p className="text-sm font-medium text-zinc-900 truncate">{item.name || `Evidence ${i + 1}`}</p>
                              <p className="text-xs text-zinc-500">Click to view</p>
                            </div>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-500 italic">No evidence attachments provided.</p>
                    )}
                  </div>
                </div>

                {/* Footer / Actions */}
                <div className="p-6 bg-zinc-50 border-t mt-auto space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2 text-zinc-900">
                      Resolution Notes
                    </h4>
                    <Textarea
                      placeholder="Explain the decision (Required for resolution)..."
                      value={resolutionNote}
                      onChange={(e) => setResolutionNote(e.target.value)}
                      className="min-h-[100px] bg-white resize-none"
                      disabled={['resolved', 'closed'].includes(selectedDispute.status)}
                    />
                  </div>

                  {['open', 'in_review'].includes(selectedDispute.status) && (
                    <div className="flex gap-3 justify-end pt-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Rule for Buyer (Refund)
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirm Refund to Buyer</DialogTitle>
                            <DialogDescription>
                              This will cancel the contract and refund escrow funds to the buyer.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="destructive"
                              onClick={() => resolveDispute(selectedDispute.id, 'buyer_wins', resolutionNote)}
                              disabled={isActing || !resolutionNote.trim()}
                            >
                              Confirm Refund
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            <Gavel className="h-4 w-4 mr-2" />
                            Rule for Expert (Release)
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Confirm Release to Expert</DialogTitle>
                            <DialogDescription>
                              This will override the dispute and release funds to the expert.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              className="bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => resolveDispute(selectedDispute.id, 'expert_wins', resolutionNote)}
                              disabled={isActing || !resolutionNote.trim()}
                            >
                              Confirm Release
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-xl bg-zinc-50 text-zinc-400">
                <Gavel className="h-16 w-16 mb-4 opacity-20" />
                <p className="text-lg font-medium">No Dispute Selected</p>
                <p className="text-sm">Select a case from the sidebar to review details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}