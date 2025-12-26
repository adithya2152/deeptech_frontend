import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, AlertCircle, Upload, CheckCircle2, XCircle, Link as LinkIcon } from 'lucide-react';

type Contract = any;

interface BaseFormProps {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  initialData?: any;
}

interface SprintFormProps extends BaseFormProps {
  contract?: Contract;
}

const EvidenceSection = ({ links, setLinks }: { links: string[], setLinks: (l: string[]) => void }) => {
  const [newLink, setNewLink] = useState('');

  const addLink = () => {
    if (newLink) {
      setLinks([...links, newLink]);
      setNewLink('');
    }
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3 pt-2 border-t">
      <Label className="text-base font-semibold">Evidence & Deliverables</Label>
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">External Links (PRs, Figma, Docs)</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="https://..."
              value={newLink}
              onChange={(e) => setNewLink(e.target.value)}
            />
          </div>
          <Button type="button" variant="outline" onClick={addLink} size="sm" className="mt-0.5">Add</Button>
        </div>
        {links.length > 0 && (
          <ul className="grid gap-2 mt-2">
            {links.map((l, i) => (
              <li key={i} className="flex items-center justify-between text-sm bg-muted/50 p-2 rounded border">
                <span className="truncate text-blue-600 max-w-[250px]">{l}</span>
                <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeLink(i)}>
                  <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="border-2 border-dashed rounded-lg p-4 text-center text-muted-foreground text-sm cursor-pointer hover:bg-muted/50 transition-colors mt-2">
        <Upload className="h-6 w-6 mx-auto mb-2 opacity-50" />
        <p>Click to upload files or drag and drop</p>
        <p className="text-xs opacity-70 mt-1">Supports PDF, PNG, JPG (Max 10MB)</p>
      </div>
    </div>
  );
};

export function DailyLogForm({ onSubmit, isLoading, initialData }: BaseFormProps) {
  const [description, setDescription] = useState('');
  const [links, setLinks] = useState<string[]>([]);

  // Pre-populate with existing data
  useEffect(() => {
    if (initialData) {
      setDescription(initialData.description || '');
      setLinks(initialData.evidence?.links?.map((l: any) => l.url) || []);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type: 'daily_log',
      description,
      evidence: {
        summary: description,
        links: links.map(l => ({ label: 'Link', url: l }))
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-2">
      <div className="space-y-2">
        <Label className="text-base font-semibold">Daily Update</Label>
        <Textarea
          placeholder="What did you complete today?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="min-h-[120px]"
        />
      </div>
      <EvidenceSection links={links} setLinks={setLinks} />
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Updating...' : 'Update Daily Log'}
      </Button>
    </form>
  );
}

export function SprintSubmitForm({ onSubmit, isLoading, contract, initialData }: SprintFormProps) {
  const [summary, setSummary] = useState('');
  const [blockers, setBlockers] = useState('');
  const [links, setLinks] = useState<string[]>([]);

  const [tasks, setTasks] = useState<{ id: number; text: string; status: 'done' | 'not_done' }[]>([
    { id: 1, text: '', status: 'not_done' }
  ]);

  // Pre-populate with existing data
  useEffect(() => {
    if (initialData) {
      setSummary(initialData.description || '');
      setBlockers(initialData.problems_faced || '');
      setLinks(initialData.evidence?.links?.map((l: any) => l.url) || []);
      
      if (initialData.checklist && initialData.checklist.length > 0) {
        setTasks(initialData.checklist.map((item: any, idx: number) => ({
          id: idx + 1,
          text: item.task || '',
          status: item.status === 'done' ? 'done' : 'not_done'
        })));
      }
    }
  }, [initialData]);

  const addTask = () => setTasks([...tasks, { id: Date.now(), text: '', status: 'not_done' }]);

  const updateTask = (index: number, text: string) => {
    const newTasks = [...tasks];
    newTasks[index].text = text;
    setTasks(newTasks);
  };

  const toggleTaskStatus = (index: number) => {
    const newTasks = [...tasks];
    newTasks[index].status = newTasks[index].status === 'done' ? 'not_done' : 'done';
    setTasks(newTasks);
  };

  const removeTask = (index: number) => setTasks(tasks.filter((_, i) => i !== index));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const sprintNumber = contract?.payment_terms?.current_sprint_number;

    if (!sprintNumber || sprintNumber < 1) {
      alert('Sprint number missing. Reload page.');
      return;
    }

    const checklistData = tasks
      .filter(t => t.text.trim() !== '')
      .map(t => ({ task: t.text, status: t.status }));

    if (checklistData.length === 0) {
      alert('Add at least one checklist item');
      return;
    }

    onSubmit({
      type: 'sprint_submission',
      sprint_number: sprintNumber,
      description: summary,
      checklist: checklistData,
      problems_faced: blockers,
      evidence: {
        summary,
        links: links.map(l => ({ label: 'Link', url: l }))
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-2">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Sprint Checklist</Label>
          <Button type="button" variant="ghost" size="sm" onClick={addTask} className="text-primary h-8">
            <Plus className="h-4 w-4 mr-1" /> Add Task
          </Button>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1 py-1">
          {tasks.map((task, idx) => (
            <div key={task.id} className="flex items-center gap-2 group">
              <Button
                type="button" variant="ghost" size="icon"
                className={`h-8 w-8 shrink-0 ${task.status === 'done' ? 'text-green-600' : 'text-gray-300 hover:text-gray-400'}`}
                onClick={() => toggleTaskStatus(idx)}
              >
                {task.status === 'done' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              </Button>
              <Input
                value={task.text}
                onChange={(e) => updateTask(idx, e.target.value)}
                placeholder="Task description..."
                className={`flex-1 ${task.status === 'done' ? 'text-muted-foreground line-through decoration-slate-300' : ''}`}
              />
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100" onClick={() => removeTask(idx)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-base font-semibold flex items-center gap-2">
          Blockers <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
        </Label>
        <Textarea
          placeholder="Any issues faced? (e.g. API down, waiting on access)"
          value={blockers}
          onChange={(e) => setBlockers(e.target.value)}
          className="bg-yellow-50/30 focus-visible:ring-yellow-400"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-base font-semibold">Sprint Summary</Label>
        <Textarea
          placeholder="Brief summary of overall progress for the record..."
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          required
        />
      </div>

      <EvidenceSection links={links} setLinks={setLinks} />

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Updating...' : 'Update Sprint Log'}
      </Button>
    </form>
  );
}

export function MilestoneRequestForm({ contract, onSubmit, isLoading, initialData }: any) {
  const [note, setNote] = useState('');
  const [links, setLinks] = useState<string[]>([]);

  // Pre-populate with existing data
  useEffect(() => {
    if (initialData) {
      setNote(initialData.description || '');
      setLinks(initialData.evidence?.links?.map((l: any) => l.url) || []);
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      type: 'milestone_request',
      description: note,
      evidence: { summary: note, links: links.map(l => ({ label: 'Link', url: l })) }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-2">
      <div className="space-y-2">
        <Label className="text-base font-semibold">Progress Update</Label>
        <Textarea
          placeholder="Describe the deliverables completed or progress made..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          required
          className="min-h-[100px]"
        />
      </div>
      <EvidenceSection links={links} setLinks={setLinks} />
      <Button type="submit" className="w-full" disabled={!note || isLoading}>
        {isLoading ? 'Updating...' : 'Update Milestone Request'}
      </Button>
    </form>
  );
}
