import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Award, BookOpen, Package, Plus, X, Globe, FileText, Link as LinkIcon, Trash2, Tag } from 'lucide-react';
import { UploadDocumentModal } from './UploadDocumentModal';
import { expertsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { domainLabels } from '@/lib/constants';

interface ExpertCredentialsProps {
    form_data: any;
    set_form_data: (data: any) => void;
    is_editing: boolean;
    refreshProfile: () => void;
}

export function ExpertCredentials({ form_data, set_form_data, is_editing, refreshProfile }: ExpertCredentialsProps) {
    const { token } = useAuth();
    const { toast } = useToast();

    const [newSkill, setNewSkill] = useState('');
    const [newLanguage, setNewLanguage] = useState('');
    const [modalType, setModalType] = useState<'patent' | 'paper' | 'product' | null>(null);

    const addItem = (field: 'skills' | 'languages', value: string, setter: (v: string) => void) => {
        if (!value.trim()) return;
        set_form_data((prev: any) => ({ ...prev, [field]: [...prev[field], value.trim()] }));
        setter('');
    };

    const removeItem = (field: 'skills' | 'languages', index: number) => {
        set_form_data((prev: any) => ({ ...prev, [field]: prev[field].filter((_: any, i: number) => i !== index) }));
    };

    const handleDeleteDoc = async (docId: string) => {
        if (!token) return;
        try {
            await expertsApi.deleteDocument(docId, token);
            toast({ title: "Deleted", description: "Item removed." });
            refreshProfile();
        } catch (e) {
            toast({ title: "Error", description: "Failed to delete item", variant: "destructive" });
        }
    };

    const renderDocuments = (type: 'patent' | 'paper' | 'product', icon: any) => {
        const docs = form_data[
            type === 'patent' ? 'patents' :
                type === 'paper' ? 'papers' : 'products'
        ] || [];

        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-zinc-700 text-sm font-medium">
                        {icon} {type === 'product' ? 'Commercial Products' : type === 'paper' ? 'Research Papers' : 'Patents'}
                    </Label>
                    {is_editing && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setModalType(type)}
                            className="h-6 text-xs border-zinc-200"
                        >
                            <Plus className="h-3 w-3 mr-1" /> Add
                        </Button>
                    )}
                </div>

                {docs.length === 0 && <p className="text-xs text-zinc-400 italic">None listed.</p>}

                {docs.map((url: string, idx: number) => (
                    <div key={idx} className="flex items-center justify-between text-sm bg-zinc-50 p-2 rounded-lg border">
                        <div className="flex items-center gap-2 overflow-hidden">
                            {type === 'product' ? <LinkIcon className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                            <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="truncate text-zinc-600 hover:underline"
                            >
                                {url.split('/').pop()}
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
            {/* 0. Domains (Expertise Areas) */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-zinc-900 font-semibold">
                    <Tag className="h-4 w-4 text-zinc-400" /> Core Expertise
                </div>

                {is_editing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border border-zinc-200 p-4 rounded-xl bg-zinc-50/50">
                        {Object.entries(domainLabels).map(([key, label]) => (
                            <div key={key} className="flex items-center space-x-3">
                                <Checkbox
                                    id={key}
                                    checked={form_data.domains.includes(key as any)}
                                    onCheckedChange={(checked) => {
                                        if (checked) set_form_data((prev: any) => ({ ...prev, domains: [...prev.domains, key] }))
                                        else set_form_data((prev: any) => ({ ...prev, domains: prev.domains.filter((d: any) => d !== key) }))
                                    }}
                                />
                                <Label htmlFor={key} className="text-sm font-normal cursor-pointer text-zinc-700">{label}</Label>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {form_data.domains.map((d: string) => (
                            <Badge key={d} variant="outline" className="bg-zinc-50 border-zinc-200 text-zinc-700">
                                {domainLabels[d as keyof typeof domainLabels] || d}
                            </Badge>
                        ))}
                        {form_data.domains.length === 0 && <p className="text-sm text-zinc-400 italic">No domains selected.</p>}
                    </div>
                )}
            </div>

            <div className="space-y-2 pt-4 border-t border-zinc-100">
                <Label className="text-[10px] uppercase font-bold text-zinc-500">Specific Skills</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {form_data.skills.map((skill: string, idx: number) => (
                        <Badge key={idx} variant="secondary" className="flex items-center gap-1 bg-zinc-100 text-zinc-700 hover:bg-zinc-200">
                            {skill}
                            {is_editing && <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeItem('skills', idx)} />}
                        </Badge>
                    ))}
                </div>
                {is_editing && (
                    <div className="flex gap-2">
                        <Input
                            placeholder="Add a skill (e.g. PyTorch, Rust)"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addItem('skills', newSkill, setNewSkill)}
                            className="border-zinc-200"
                        />
                        <Button size="sm" variant="outline" onClick={() => addItem('skills', newSkill, setNewSkill)} className="border-zinc-200">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            <div className="space-y-2 pt-4">
                <Label className="text-[10px] uppercase font-bold text-zinc-500 flex items-center gap-1">
                    <Globe className="h-3 w-3" /> Languages
                </Label>
                <div className="flex flex-wrap gap-2 mb-2">
                    {form_data.languages.map((lang: string, idx: number) => (
                        <Badge key={idx} variant="outline" className="flex items-center gap-1 bg-white border-zinc-200 text-zinc-600">
                            {lang}
                            {is_editing && <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeItem('languages', idx)} />}
                        </Badge>
                    ))}
                </div>
                {is_editing && (
                    <div className="flex gap-2">
                        <Input
                            placeholder="Add language"
                            value={newLanguage}
                            onChange={(e) => setNewLanguage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addItem('languages', newLanguage, setNewLanguage)}
                            className="border-zinc-200"
                        />
                        <Button size="sm" variant="outline" onClick={() => addItem('languages', newLanguage, setNewLanguage)} className="border-zinc-200">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            <div className="space-y-6 pt-6 border-t border-zinc-100">
                <h3 className="font-semibold text-lg text-zinc-900">Credentials & Portfolio</h3>
                {renderDocuments('patent', <Award className="h-4 w-4 text-zinc-400" />)}
                {renderDocuments('paper', <BookOpen className="h-4 w-4 text-zinc-400" />)}
                {renderDocuments('product', <Package className="h-4 w-4 text-zinc-400" />)}
            </div>

            <UploadDocumentModal
                open={!!modalType}
                onOpenChange={(isOpen) => !isOpen && setModalType(null)}
                type={modalType || 'patent'}
                onSuccess={() => {
                    refreshProfile();
                    setModalType(null);
                }}
            />
        </>
    );
}