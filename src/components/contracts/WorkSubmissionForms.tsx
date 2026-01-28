import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  Circle,
  Link as LinkIcon,
  Calendar,
  Clock,
  AlertCircle,
} from 'lucide-react';

type Contract = any;

function normalizeAndValidateUrl(raw: string): { ok: true; url: string } | { ok: false; error: string } {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, error: 'Please enter a link.' };

  // Allow users to paste `www.example.com` by auto-prefixing.
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const u = new URL(candidate);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') {
      return { ok: false, error: 'Links must start with http(s).' };
    }
    const host = u.hostname;
    const looksLikeHostname = host === 'localhost' || host.includes('.');
    if (!looksLikeHostname) {
      return { ok: false, error: 'Invalid link. Please paste a real URL (e.g., https://example.com).' };
    }
    return { ok: true, url: u.toString() };
  } catch {
    return { ok: false, error: 'Invalid link. Please paste a valid URL.' };
  }
}

interface WorkLogFormProps {
  mode: 'daily' | 'sprint' | 'fixed';
  contract?: Contract;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  initialData?: any;
}

const EvidenceSection = ({
  links,
  setLinks,
  files,
  setFiles,
  existingAttachments,
  setExistingAttachments,
}: {
  links: string[];
  setLinks: (l: string[]) => void;
  files: File[];
  setFiles: (f: File[]) => void;
  existingAttachments: Array<{ name: string; url: string }>;
  setExistingAttachments: (a: Array<{ name: string; url: string }>) => void;
}) => {
  const MAX_FILES = 10;
  const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
  const [newLink, setNewLink] = useState('');
  const [linkError, setLinkError] = useState<string | null>(null);

  const addLink = () => {
    const result = normalizeAndValidateUrl(newLink);
    if (result.ok === false) {
      setLinkError(result.error);
      return;
    }
    setLinkError(null);
    setLinks([...links, result.url]);
    setNewLink('');
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const addFiles = (incoming: FileList | null) => {
    if (!incoming || incoming.length === 0) return;
    const picked = Array.from(incoming);
    const accepted: File[] = [];
    for (const f of picked) {
      if (f.size > MAX_FILE_SIZE_BYTES) {
        setLinkError(`File too large: ${f.name} exceeds 10MB.`);
        continue;
      }
      accepted.push(f);
    }
    const next = [...files, ...accepted];
    setFiles(next.slice(0, MAX_FILES));
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = (index: number) => {
    setExistingAttachments(existingAttachments.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 pt-4 border-t">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">
          Evidence & Deliverables
        </Label>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
          Optional
        </span>
      </div>

      <div className="space-y-3">
        {/* Link Input */}
        <div className="flex gap-2">
          <div className="relative flex-1 group">
            <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              className="pl-9"
              placeholder="Paste external link (Figma, GitHub PR, Docs)..."
              value={newLink}
              onChange={e => {
                setNewLink(e.target.value);
                if (linkError) setLinkError(null);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addLink();
                }
              }}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="shrink-0"
            onClick={addLink}
          >
            Add Link
          </Button>
        </div>

        {linkError && (
          <p className="text-xs text-red-600">{linkError}</p>
        )}

        {/* Link Pills */}
        {links.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {links.map((l, i) => (
              <div
                key={i}
                className="flex items-center gap-2 pl-3 pr-1 py-1 text-sm bg-blue-50 text-blue-700 border border-blue-100 rounded-full max-w-full"
              >
                <LinkIcon className="h-3 w-3 shrink-0 opacity-60" />
                <span className="truncate max-w-[200px] text-xs font-medium">
                  {l}
                </span>
                <button
                  type="button"
                  onClick={() => removeLink(i)}
                  className="p-1 hover:bg-blue-100 rounded-full text-blue-400 hover:text-blue-600 transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Area */}
      <label className="group border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50 rounded-xl p-6 transition-all cursor-pointer text-center block">
        <div className="bg-muted group-hover:bg-background p-3 rounded-full w-fit mx-auto mb-3 transition-colors">
          <Upload className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <p className="text-sm font-medium">
          Click to upload files or drag and drop
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Supports images, PDFs, docs, zips (Max 10MB each, up to 10 files)
        </p>

        <input
          type="file"
          multiple
          className="hidden"
          onChange={e => addFiles(e.target.files)}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
        />
      </label>

      {/* Existing Attachments */}
      {existingAttachments && existingAttachments.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Previously Uploaded Files ({existingAttachments.length})</Label>
          <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent">
            {existingAttachments.map((f, i) => {
              const fileName = f.name || f.url.split('/').pop() || 'File';
              const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName);
              const isPdf = /\.pdf$/i.test(fileName);
              const isDoc = /\.(doc|docx|txt|rtf)$/i.test(fileName);
              const isZip = /\.(zip|rar|7z|tar|gz)$/i.test(fileName);

              return (
                <div
                  key={`existing-${i}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg border bg-zinc-50/50 border-zinc-200"
                >
                  {/* File Icon */}
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${isImage ? 'bg-purple-50 text-purple-500 border border-purple-100' :
                    isPdf ? 'bg-red-50 text-red-500 border border-red-100' :
                      isDoc ? 'bg-blue-50 text-blue-500 border border-blue-100' :
                        isZip ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          'bg-zinc-50 text-zinc-500 border border-zinc-200'
                    }`}>
                    {isImage ? (
                      <img src={f.url} alt={fileName} className="h-full w-full object-cover rounded-lg opacity-80" />
                    ) : isPdf ? (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 18H17V16H7V18ZM7 14H17V12H7V14ZM7 10H11V8H7V10ZM15 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V7L15 2ZM18 20H6V4H14V8H18V20Z" />
                      </svg>
                    ) : (
                      <Upload className="h-5 w-5" />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{fileName}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="bg-zinc-100 px-1.5 rounded text-[10px] font-medium text-zinc-600">EXISTING</span>
                      <a href={f.url} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors hover:underline">View</a>
                    </p>
                  </div>

                  {/* Remove Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:bg-red-50 hover:text-red-500 shrink-0"
                    onClick={() => removeExistingAttachment(i)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* New Files */}
      {files.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Selected Files ({files.length})</Label>
          <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent">
            {files.map((f, i) => {
              const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(f.name);
              const isPdf = /\.pdf$/i.test(f.name);
              const isDoc = /\.(doc|docx|txt|rtf)$/i.test(f.name);
              const isZip = /\.(zip|rar|7z|tar|gz)$/i.test(f.name);

              return (
                <div
                  key={`${f.name}-${i}`}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg border bg-background hover:border-zinc-300 transition-colors"
                >
                  {/* File Icon */}
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${isImage ? 'bg-purple-50 text-purple-500 border border-purple-100' :
                    isPdf ? 'bg-red-50 text-red-500 border border-red-100' :
                      isDoc ? 'bg-blue-50 text-blue-500 border border-blue-100' :
                        isZip ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          'bg-zinc-50 text-zinc-500 border border-zinc-200'
                    }`}>
                    {isImage ? (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    ) : isPdf ? (
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7 18H17V16H7V18ZM7 14H17V12H7V14ZM7 10H11V8H7V10ZM15 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V7L15 2ZM18 20H6V4H14V8H18V20Z" />
                      </svg>
                    ) : (
                      <Upload className="h-5 w-5" />
                    )}
                  </div>

                  {/* File Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{f.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.ceil(f.size / 1024)} KB • {isImage ? 'Image' : isPdf ? 'PDF' : isDoc ? 'Document' : isZip ? 'Archive' : 'File'}
                    </p>
                  </div>

                  {/* Remove Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:bg-red-50 hover:text-red-500 shrink-0"
                    onClick={() => removeFile(i)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export function WorkLogForm({
  mode,
  contract,
  onSubmit,
  isLoading,
  initialData,
}: WorkLogFormProps) {
  const [summary, setSummary] = useState('');
  const [blockers, setBlockers] = useState('');
  const [links, setLinks] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<Array<{ name: string; url: string }>>([]);

  const [tasks, setTasks] = useState<
    { id: number; text: string; status: 'done' | 'not_done' }[]
  >([{ id: 1, text: '', status: 'not_done' }]);

  // daily-only
  const [workDate, setWorkDate] = useState('');
  const [totalHours, setTotalHours] = useState<number>(0);

  const todayDateStr = new Date().toISOString().slice(0, 10);

  // load initial data
  useEffect(() => {
    if (initialData) {
      setSummary(
        initialData.description ||
        initialData.note ||
        initialData.summary ||
        '',
      );
      setBlockers(initialData.problems_faced || '');
      setLinks(initialData.evidence?.links?.map((l: any) => l.url) || []);
      if (initialData.evidence?.attachments) {
        setExistingAttachments(initialData.evidence.attachments);
      }
      // Existing submissions store uploaded file URLs; do not prefill file inputs.
      setFiles([]);

      if (initialData.checklist && initialData.checklist.length > 0) {
        setTasks(
          initialData.checklist.map((item: any, idx: number) => ({
            id: idx + 1,
            text: item.task || '',
            status: item.status === 'done' ? 'done' : 'not_done',
          })),
        );
      }

      if (mode === 'daily') {
        if (initialData.work_date) setWorkDate(initialData.work_date);
        if (initialData.total_hours)
          setTotalHours(initialData.total_hours as number);
      }
    } else if (mode === 'daily') {
      setWorkDate(new Date().toISOString().slice(0, 10));
    }
  }, [initialData, mode]);

  const addTask = () =>
    setTasks([...tasks, { id: Date.now(), text: '', status: 'not_done' }]);

  const updateTask = (index: number, text: string) => {
    const next = [...tasks];
    next[index].text = text;
    setTasks(next);
  };

  const toggleTaskStatus = (index: number) => {
    const next = [...tasks];
    next[index].status = next[index].status === 'done' ? 'not_done' : 'done';
    setTasks(next);
  };

  const removeTask = (index: number) =>
    setTasks(tasks.filter((_, i) => i !== index));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'daily') {
      if (workDate !== todayDateStr) {
        alert("You can only submit a work summary for today.");
        return;
      }
    }

    const normalizedLinks: string[] = [];
    for (const raw of links) {
      const result = normalizeAndValidateUrl(raw);
      if (result.ok === false) {
        alert(result.error);
        return;
      }
      normalizedLinks.push(result.url);
    }

    const checklistData = tasks
      .filter(t => t.text.trim() !== '')
      .map(t => ({ task: t.text.trim(), status: t.status }));

    if (mode === 'sprint' && checklistData.length === 0) {
      alert('Add at least one checklist item');
      return;
    }

    const sprintNumber =
      mode === 'sprint'
        ? contract?.payment_terms?.current_sprint_number ?? 1
        : undefined;

    const payload: any = {
      type:
        mode === 'fixed'
          ? 'milestone_request'
          : mode === 'sprint'
            ? 'sprint_submission'
            : 'daily_work_log',
      description: summary || (mode === 'daily' ? `Work log for ${workDate}` : ''),
      checklist: checklistData,
      problems_faced: blockers || undefined,
      evidence: {
        summary: summary || (mode === 'daily' ? `Work log for ${workDate}` : ''),
        links: normalizedLinks.map(l => ({ label: 'Link', url: l })),
        attachments: existingAttachments,
      },
      attachments: files,
    };

    if (mode === 'daily') {
      payload.work_date = workDate;
      payload.total_hours = totalHours;
    }
    if (mode === 'sprint') {
      payload.sprint_number = sprintNumber;
    }

    onSubmit(payload);
  };

  const primaryButtonLabel =
    mode === 'daily'
      ? 'Submit Day Summary'
      : mode === 'sprint'
        ? 'Update Sprint Log'
        : 'Update Work Log';

  return (
    <div className="flex flex-col h-full max-h-[65vh] w-full">
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-2 py-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent hover:scrollbar-thumb-zinc-400">
          {/* Daily-specific fields */}
          {mode === 'daily' && (
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"> Work Date </Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={workDate}
                    onChange={e => setWorkDate(e.target.value)}
                    min={todayDateStr}
                    max={todayDateStr}
                    required
                    className="pl-9 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"> Total Hours </Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min={0}
                    max={24}
                    step={0.5}
                    value={totalHours}
                    onChange={e => setTotalHours(Number(e.target.value) || 0)}
                    required
                    className="pl-9 font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Shared fields (all modes) */}
          <>
            {/* Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <Label className="text-base font-semibold flex items-center gap-2">
                  Checklist / Tasks
                  {mode === 'sprint' && (
                    <span className="text-[10px] uppercase font-medium tracking-wide text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                      Required
                    </span>
                  )}
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addTask}
                  className="text-primary hover:text-primary hover:bg-muted h-8"
                >
                  <Plus className="h-4 w-4 mr-1.5" /> Add Item
                </Button>
              </div>

              <div className="space-y-1">
                {tasks.map((task, idx) => (
                  <div
                    key={task.id}
                    className={`group flex items-center gap-3 p-2 rounded-lg transition-all ${task.status === 'done'
                      ? 'bg-muted/60 opacity-80'
                      : 'bg-background hover:bg-muted/40'
                      }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleTaskStatus(idx)}
                      className={`shrink-0 transition-colors focus:outline-none ${task.status === 'done'
                        ? 'text-green-500'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      {task.status === 'done' ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Circle className="h-5 w-5" />
                      )}
                    </button>

                    <Input
                      value={task.text}
                      onChange={e => updateTask(idx, e.target.value)}
                      placeholder="Describe task..."
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all"
                      onClick={() => removeTask(idx)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-2">
              <Label className="text-base font-semibold">
                {mode === 'sprint'
                  ? 'Sprint Summary'
                  : mode === 'daily'
                    ? 'Daily Summary'
                    : 'Progress Update'}
              </Label>
              <Textarea
                placeholder={
                  mode === 'sprint'
                    ? 'Brief summary of overall sprint progress...'
                    : mode === 'daily'
                      ? 'What did you work on today?'
                      : 'Describe the deliverables completed or progress made...'
                }
                value={summary}
                onChange={e => setSummary(e.target.value)}
                required={mode !== 'daily'}
                className="resize-none min-h-[100px] text-base"
              />
            </div>

            {/* Blockers */}
            <div className="bg-amber-50/60 rounded-lg p-4 border border-amber-200/70 space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <Label className="text-sm font-semibold text-amber-900">
                  Blockers / Issues
                </Label>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700/70 bg-amber-100 px-1.5 py-0.5 rounded ml-auto">
                  Optional
                </span>
              </div>
              <Textarea
                placeholder="Any issues faced? (e.g. API down, waiting on access...)"
                value={blockers}
                onChange={e => setBlockers(e.target.value)}
                className="bg-transparent border-amber-200/70 focus-visible:ring-amber-400/50 placeholder:text-amber-900/40 text-amber-900 min-h-[80px]"
              />
            </div>

            <EvidenceSection
              links={links}
              setLinks={setLinks}
              files={files}
              setFiles={setFiles}
              existingAttachments={existingAttachments}
              setExistingAttachments={setExistingAttachments}
            />
          </>
        </div>

        {/* Submit button as part of content */}
        <Button
          type="submit"
          className="w-full h-11 text-base mt-4"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Submitting...
            </span>
          ) : (
            primaryButtonLabel
          )}
        </Button>
      </form>
    </div>
  );
}