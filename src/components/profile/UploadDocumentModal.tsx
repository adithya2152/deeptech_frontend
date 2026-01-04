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
import { Loader2, UploadCloud, Link as LinkIcon } from 'lucide-react';
import { expertsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface UploadDocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'patent' | 'paper' | 'product';
  onSuccess: (data?: any) => void;
}

export function UploadDocumentModal({
  open,
  onOpenChange,
  type,
  onSuccess
}: UploadDocumentModalProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const isLinkType = type === 'product';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    
    if (isLinkType && !url) {
        toast({ title: "URL required", variant: "destructive" });
        return;
    }

    if (!isLinkType && !file) {
        toast({ title: "File required", variant: "destructive" });
        return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('type', type);
      
      if (isLinkType) {
        formData.append('url', url);
      } else if (file) {
        formData.append('file', file);
      }

      // Uploading returns the URL/data needed for the list
      const response = await expertsApi.uploadDocument(token, formData);
      
      toast({ title: "Success", description: `${type} added successfully` });
      
      // Pass the new item back to parent to update state
      // Assuming response contains the url or object to store
      onSuccess(response.url || url); 
      
      onOpenChange(false);
      // Reset form
      setTitle('');
      setUrl('');
      setFile(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="capitalize">Add {type}</DialogTitle>
          <DialogDescription>
            {isLinkType 
              ? "Add a link to your commercial product or project." 
              : "Upload a PDF document as proof of your work."}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title / Name</Label>
            <Input 
              id="title" 
              placeholder={`e.g. ${type === 'patent' ? 'US Patent 123456' : 'Research on Quantum...'}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {isLinkType ? (
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
                <Label htmlFor="file">Document (PDF)</Label>
                <div className="border-2 border-dashed border-zinc-200 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-zinc-50 hover:border-zinc-300 transition-colors relative">
                    <input 
                        type="file" 
                        id="file" 
                        accept=".pdf"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    <UploadCloud className="h-8 w-8 text-zinc-400 mb-2" />
                    <p className="text-sm font-medium text-zinc-600">
                        {file ? file.name : "Click to upload PDF"}
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">Max 5MB</p>
                </div>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLinkType ? 'Add Link' : 'Upload'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}