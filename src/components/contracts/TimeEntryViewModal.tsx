import { useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ExternalLink, Link2, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import type { TimeEntry } from '@/types';

type Attachment = string | { name: string; url: string; path?: string };

function asAttachment(a: Attachment): { name: string; url: string } | null {
  if (!a) return null;
  if (typeof a === 'string') {
    const url = a;
    const name = url.split('/').pop() || 'Attachment';
    return { name, url };
  }
  if (typeof a === 'object' && typeof a.url === 'string') {
    return { name: a.name || a.url.split('/').pop() || 'Attachment', url: a.url };
  }
  return null;
}

function formatMinutesAsHoursMinutes(totalMinutes: number | null | undefined): string {
  const mins = Number(totalMinutes || 0);
  const safe = Number.isFinite(mins) && mins >= 0 ? Math.floor(mins) : 0;
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

export function TimeEntryViewModal({
  isOpen,
  onClose,
  entry,
  isBuyer,
  onApprove,
  onReject,
  isWorking,
}: {
  isOpen: boolean;
  onClose: () => void;
  entry: TimeEntry | null;
  isBuyer: boolean;
  onApprove?: (id: string) => Promise<void> | void;
  onReject?: (id: string, reason: string) => Promise<void> | void;
  isWorking?: boolean;
}) {
  const [rejectReason, setRejectReason] = useState('');

  const evidence = useMemo(() => {
    const raw: any = (entry as any)?.evidence;
    if (!raw) return {};
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        return typeof parsed === 'object' && parsed !== null ? parsed : {};
      } catch {
        return {};
      }
    }
    return typeof raw === 'object' ? raw : {};
  }, [entry]);

  const links = useMemo(() => {
    const raw = (evidence as any)?.links;
    if (!Array.isArray(raw)) return [];
    return raw
      .map((l) => ({
        label: typeof l?.label === 'string' ? l.label : 'Link',
        url: typeof l?.url === 'string' ? l.url : '',
      }))
      .filter((l) => !!l.url);
  }, [evidence]);

  const attachments = useMemo(() => {
    const raw = (evidence as any)?.attachments;
    if (!Array.isArray(raw)) return [];
    return raw.map(asAttachment).filter(Boolean) as Array<{ name: string; url: string }>;
  }, [evidence]);

  if (!entry) return null;

  const statusColor =
    entry.status === 'approved'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : entry.status === 'submitted'
        ? 'bg-blue-100 text-blue-700 border-blue-200'
        : entry.status === 'rejected'
          ? 'bg-red-100 text-red-700 border-red-200'
          : 'bg-zinc-100 text-zinc-700 border-zinc-200';

  const canBuyerAct = isBuyer && entry.status === 'submitted';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[720px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Time Entry</DialogTitle>
          <DialogDescription>
            {format(new Date(entry.start_time), 'EEE, MMM d, yyyy')} • {formatMinutesAsHoursMinutes(entry.duration_minutes)} hrs
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-4 py-1 px-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={`capitalize border ${statusColor}`}>{entry.status}</Badge>
            <span className="text-sm text-zinc-500">
              {format(new Date(entry.start_time), 'h:mm a')}
              {entry.end_time ? ` – ${format(new Date(entry.end_time), 'h:mm a')}` : ''}
            </span>
          </div>

          <div className="space-y-2">
            <Label>Memorandum / Description</Label>
            <div className="rounded-md border bg-zinc-50 p-3 text-sm whitespace-pre-wrap">
              {entry.description || '—'}
            </div>
          </div>

          {entry.reviewer_comment && (
            <div className="space-y-2">
              <Label>Reviewer Comment</Label>
              <div className="rounded-md border bg-red-50 p-3 text-sm text-red-700 whitespace-pre-wrap">
                {entry.reviewer_comment}
              </div>
            </div>
          )}

          {(links.length > 0 || attachments.length > 0) && (
            <div className="space-y-4">
              {links.length > 0 && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Link2 className="h-4 w-4" /> Evidence Links</Label>
                  <div className="space-y-2">
                    {links.map((l, idx) => (
                      <a
                        key={idx}
                        href={l.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded border px-3 py-2 text-sm hover:bg-zinc-50"
                      >
                        <span className="truncate">{l.label}: {l.url}</span>
                        <ExternalLink className="h-4 w-4 text-zinc-500" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {attachments.length > 0 && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2"><Paperclip className="h-4 w-4" /> Attachments</Label>
                  <div className="space-y-2">
                    {attachments.map((a, idx) => (
                      <a
                        key={idx}
                        href={a.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded border px-3 py-2 text-sm hover:bg-zinc-50"
                      >
                        <span className="truncate">{a.name}</span>
                        <ExternalLink className="h-4 w-4 text-zinc-500" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {canBuyerAct && (
            <div className="space-y-2">
              <Label>Rejection Reason (optional)</Label>
              <Textarea
                placeholder="If rejecting, add a short reason..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="resize-none"
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Close</Button>
          {canBuyerAct && (
            <>
              <Button
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50"
                disabled={isWorking}
                onClick={() => onReject?.(entry.id, rejectReason.trim())}
              >
                Reject
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isWorking}
                onClick={() => onApprove?.(entry.id)}
              >
                Approve
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
