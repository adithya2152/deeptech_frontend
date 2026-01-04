import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Award, BookOpen, Package, Plus, X, Globe, FileText, Link as LinkIcon, Trash2, Tag, Briefcase } from 'lucide-react';
import { UploadDocumentModal } from './UploadDocumentModal';
import { domainLabels } from '@/lib/constants';

interface ExpertCredentialsProps {
    form_data: any;
    set_form_data: (data: any) => void;
    is_editing: boolean;
    refreshProfile: () => void;
}

export function ExpertCredentials({ form_data, set_form_data, is_editing, refreshProfile }: ExpertCredentialsProps) {
    const [newSkill, setNewSkill] = useState('');
    const [newLanguage, setNewLanguage] = useState('');
    const [modalType, setModalType] = useState<'patent' | 'paper' | 'product' | null>(null);

    const addItem = (field: 'skills' | 'languages', value: string, setter: (v: string) => void) => {
        if (!value.trim()) return;
        set_form_data((prev: any) => ({ ...prev, [field]: [...(prev[field] || []), value.trim()] }));
        setter('');
    };

    const removeItem = (field: 'skills' | 'languages', index: number) => {
        set_form_data((prev: any) => ({ ...prev, [field]: prev[field].filter((_: any, i: number) => i !== index) }));
    };

    const removeDocument = (field: 'patents' | 'papers' | 'products', index: number) => {
        set_form_data((prev: any) => ({
            ...prev,
            [field]: prev[field].filter((_: any, i: number) => i !== index)
        }));
    };

    const renderDocuments = (type: 'patent' | 'paper' | 'product', icon: any) => {
        const fieldName = type === 'patent' ? 'patents' : type === 'paper' ? 'papers' : 'products';
        const docs = form_data[fieldName] || [];
        const labelMap = { patent: 'Patents', paper: 'Research Papers', product: 'Products' };

        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-zinc-800 text-sm font-semibold">
                        {icon} {labelMap[type]}
                    </Label>
                    {is_editing && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setModalType(type)}
                            className="h-7 text-xs text-primary hover:text-primary hover:bg-primary/5"
                        >
                            <Plus className="h-3 w-3 mr-1" /> Add
                        </Button>
                    )}
                </div>

                <div className="grid gap-2">
                    {docs.length === 0 && (
                        <div className="p-4 border border-dashed border-zinc-200 rounded-lg bg-zinc-50/50 flex flex-col items-center justify-center text-center">
                            <p className="text-xs text-zinc-400">No {labelMap[type].toLowerCase()} added.</p>
                        </div>
                    )}

                    {docs.map((url: string, idx: number) => (
                        <div key={idx} className="group flex items-center justify-between p-3 rounded-lg border border-zinc-100 bg-white shadow-sm hover:shadow-md hover:border-zinc-200 transition-all">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`p-2 rounded-md ${type === 'product' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {type === 'product' ? <LinkIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                </div>
                                <a
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="truncate text-sm font-medium text-zinc-700 hover:text-primary hover:underline"
                                >
                                    {url.split('/').pop() || 'View Document'}
                                </a>
                            </div>
                            {is_editing && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeDocument(fieldName, idx)}
                                    className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-zinc-900 font-semibold border-b border-zinc-100 pb-2">
                    <Tag className="h-4 w-4 text-primary" /> Core Expertise
                </div>

                {is_editing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1">
                        {Object.entries(domainLabels).map(([key, label]) => (
                            <div key={key} className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${form_data.domains?.includes(key) ? 'border-primary/20 bg-primary/5' : 'border-zinc-100 bg-white'}`}>
                                <Checkbox
                                    id={key}
                                    checked={form_data.domains?.includes(key as any)}
                                    onCheckedChange={(checked) => {
                                        if (checked) set_form_data((prev: any) => ({ ...prev, domains: [...(prev.domains || []), key] }))
                                        else set_form_data((prev: any) => ({ ...prev, domains: prev.domains.filter((d: any) => d !== key) }))
                                    }}
                                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                />
                                <Label htmlFor={key} className="text-sm font-medium cursor-pointer text-zinc-700 w-full">{label as string}</Label>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {form_data.domains?.map((d: string) => (
                            <Badge key={d} variant="outline" className="px-3 py-1 bg-zinc-50 border-zinc-200 text-zinc-700 font-medium">
                                {domainLabels[d as keyof typeof domainLabels] || d}
                            </Badge>
                        ))}
                        {(!form_data.domains || form_data.domains.length === 0) && <p className="text-sm text-zinc-400 italic">No domains selected.</p>}
                    </div>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                    <Label className="text-xs uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-2">
                        <Briefcase className="h-3 w-3" /> Technical Skills
                    </Label>
                    <div className="flex flex-wrap gap-2 min-h-[40px] content-start">
                        {form_data.skills?.map((skill: string, idx: number) => (
                            <Badge key={idx} className="pl-3 pr-2 py-1 flex items-center gap-1 bg-zinc-900 text-zinc-50 hover:bg-zinc-800 transition-colors">
                                {skill}
                                {is_editing && <X className="h-3 w-3 ml-1 cursor-pointer hover:text-red-400" onClick={() => removeItem('skills', idx)} />}
                            </Badge>
                        ))}
                        {form_data.skills?.length === 0 && <p className="text-sm text-zinc-400 italic py-1">Add specific skills like 'React', 'Python', etc.</p>}
                    </div>
                    {is_editing && (
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add skill..."
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addItem('skills', newSkill, setNewSkill)}
                                className="h-9"
                            />
                            <Button size="sm" variant="secondary" onClick={() => addItem('skills', newSkill, setNewSkill)} className="h-9">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>

                <div className="space-y-3">
                    <Label className="text-xs uppercase font-bold text-zinc-500 tracking-wider flex items-center gap-2">
                        <Globe className="h-3 w-3" /> Languages
                    </Label>
                    <div className="flex flex-wrap gap-2 min-h-[40px] content-start">
                        {form_data.languages?.map((lang: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="pl-3 pr-2 py-1 flex items-center gap-1 bg-white border-zinc-200 text-zinc-600">
                                {lang}
                                {is_editing && <X className="h-3 w-3 ml-1 cursor-pointer hover:text-red-500" onClick={() => removeItem('languages', idx)} />}
                            </Badge>
                        ))}
                        {form_data.languages?.length === 0 && <p className="text-sm text-zinc-400 italic py-1">List languages you speak.</p>}
                    </div>
                    {is_editing && (
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add language..."
                                value={newLanguage}
                                onChange={(e) => setNewLanguage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addItem('languages', newLanguage, setNewLanguage)}
                                className="h-9"
                            />
                            <Button size="sm" variant="secondary" onClick={() => addItem('languages', newLanguage, setNewLanguage)} className="h-9">
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-zinc-100">
                <h3 className="font-semibold text-lg text-zinc-900 flex items-center gap-2">
                    Portfolio & IP 
                    <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal">Optional</Badge>
                </h3>
                <div className="grid md:grid-cols-1 gap-6">
                    {renderDocuments('product', <Package className="h-4 w-4 text-purple-500" />)}
                    {renderDocuments('patent', <Award className="h-4 w-4 text-amber-500" />)}
                    {renderDocuments('paper', <BookOpen className="h-4 w-4 text-blue-500" />)}
                </div>
            </div>

            <UploadDocumentModal
                open={!!modalType}
                onOpenChange={(isOpen) => !isOpen && setModalType(null)}
                type={modalType || 'patent'}
                onSuccess={(url) => {
                    if (url) {
                        const field = modalType === 'patent' ? 'patents' : modalType === 'paper' ? 'papers' : 'products';
                        set_form_data((prev: any) => ({ ...prev, [field]: [...(prev[field] || []), url] }));
                    } else {
                        refreshProfile();
                    }
                }}
            />
        </div>
    );
}