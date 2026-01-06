import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UploadCloud, Link as LinkIcon, FileText, X } from 'lucide-react';
import { expertsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type UIType = 'resume' | 'work' | 'publication' | 'credential' | 'other';

interface UploadDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: UIType;
  onSuccess: (data: {
    success: boolean;
    data: {
      id: string;
      url: string;
      document_type: string;
    };
  }) => void;
}

const placeholders: Record<UIType, string> = {
  resume: 'Upload your resume (PDF, DOC, or DOCX)',
  work: 'e.g. Client website, SaaS product, GitHub project',
  publication: 'e.g. Research paper, technical blog',
  credential: 'e.g. AWS Certification, Stanford ML',
  other: 'e.g. Hackathon win, recognition, achievement',
};

const isLinkType = (type: UIType) =>
  type === 'work' || type === 'other';

export function UploadDocumentModal({
  open,
  onOpenChange,
  type,
  onSuccess,
}: UploadDocumentModalProps) {
  const { token } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (type !== 'resume' && !title.trim()) {
      toast({ title: 'Title required', variant: 'destructive' });
      return;
    }

    if (isLinkType(type) && !url) {
      toast({ title: 'URL required', variant: 'destructive' });
      return;
    }

    if (!isLinkType(type) && !file) {
      toast({ title: 'File required', variant: 'destructive' });
      return;
    }

    if (file && file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum allowed size is 5MB',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('title', title);

      if (isLinkType(type)) {
        formData.append('url', url);
      } else if (file) {
        formData.append('file', file);
      }

      const response = await expertsApi.uploadDocument(token, formData);

      toast({
        title: 'Success',
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} added successfully`,
      });

      onSuccess(response);
      onOpenChange(false);
      resetForm();
    } catch {
      toast({ title: 'Error', description: 'Failed to upload', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setUrl('');
    setFile(null);
    setDragActive(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
        if (!val) resetForm();
        onOpenChange(val);
    }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="capitalize">Add {type}</DialogTitle>
          <DialogDescription>
            {isLinkType(type)
              ? 'Add a link to your work (GitHub, demo, live site).'
              : 'Upload a document as proof.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {type !== 'resume' && (
            <div className="space-y-2">
              <Label htmlFor="title">Title / Name</Label>
              <Input
                id="title"
                placeholder={placeholders[type]}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          )}

          {isLinkType(type) ? (
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                <Input
                  id="url"
                  placeholder="https://..."
                  className="pl-9"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Document (PDF)</Label>
              <div
                className={cn(
                    "relative border-2 border-dashed rounded-lg p-6 text-center transition-all",
                    dragActive ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50",
                    file ? "bg-white border-zinc-200 p-4" : ""
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {!file ? (
                    <>
                        {/* Standard input with strict absolute positioning to cover entire parent */}
                        <input
                            type="file"
                            accept={type === 'resume' ? '.pdf,.doc,.docx' : '.pdf'}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                        <div className="pointer-events-none">
                            <div className="p-3 bg-zinc-100 rounded-full w-fit mx-auto mb-3 text-zinc-500">
                                <UploadCloud className="h-6 w-6" />
                            </div>
                            <p className="text-sm font-medium text-zinc-900">
                                Click to upload or drag and drop
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">
                                {type === 'resume' ? 'PDF, DOC, DOCX up to 5MB' : 'PDF up to 5MB'}
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="p-2 bg-zinc-100 rounded text-zinc-600 shrink-0">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div className="text-left overflow-hidden">
                                <p className="text-sm font-medium text-zinc-900 truncate max-w-[200px]">{file.name}</p>
                                <p className="text-xs text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-zinc-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 rounded-full"
                            onClick={() => setFile(null)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => {
                onOpenChange(false);
                resetForm();
            }}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLinkType(type) ? 'Add Link' : 'Upload'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}