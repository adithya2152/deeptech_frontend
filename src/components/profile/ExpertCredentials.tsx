import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Award, BookOpen, Package, Plus, X, Globe, Trash2, Tag, Briefcase, GraduationCap, Medal, Star, Laptop, FileText } from 'lucide-react';
import { UploadDocumentModal } from './UploadDocumentModal';
import { domainLabels } from '@/lib/constants';
import { expertsApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface ExpertCredentialsProps {
    form_data: any;
    set_form_data: (data: any) => void;
    is_editing: boolean;
    refreshProfile: () => void;
    token: string;
}

export function ExpertCredentials({ form_data, set_form_data, is_editing, refreshProfile, token }: ExpertCredentialsProps) {
    const { toast } = useToast();

    const [newSkill, setNewSkill] = useState('');
    const [newLanguage, setNewLanguage] = useState('');
    const [modalType, setModalType] = useState<'work' | 'publication' | 'credential' | 'other' | null>(null);

    const addItem = (field: 'skills' | 'languages', value: string, setter: (v: string) => void) => {
        if (!value.trim()) return;
        set_form_data((prev: any) => ({ ...prev, [field]: [...(prev[field] || []), value.trim()] }));
        setter('');
    };

    const removeItem = (field: string, index: number) => {
        set_form_data((prev: any) => ({ ...prev, [field]: prev[field].filter((_: any, i: number) => i !== index) }));
    };

    const removeDocument = async (documentId: string) => {
        try {
            await expertsApi.deleteDocument(token, documentId);
            set_form_data((prev: any) => ({
                ...prev,
                documents: prev.documents.filter((d: any) => d.id !== documentId)
            }));
            toast({ title: "Document removed" });
        } catch (error) {
            toast({ title: "Failed to remove document", variant: "destructive" });
        }
    };

    const renderDocumentList = (docType: string, placeholder: string, icon: any) => {
        const items = (form_data.documents || []).filter(
            (d: any) => d.document_type === docType
        );

        if (items.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-zinc-100 rounded-lg bg-zinc-50/50">
                    <div className="p-2 bg-zinc-100 rounded-full text-zinc-400 mb-2">
                        {icon}
                    </div>
                    <p className="text-xs text-zinc-500 font-medium">{placeholder}</p>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 gap-2">
                {items.map((item: { id: string; url: string; title?: string }, idx: number) => (
                    <div key={item.id || idx} className="group relative flex items-center justify-between p-3 rounded-lg border border-zinc-200 bg-white hover:border-zinc-300 transition-all">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`p-2 rounded-md shrink-0 ${
                                docType === 'work' ? "bg-blue-50 text-blue-600" :
                                docType === 'publication' ? "bg-emerald-50 text-emerald-600" :
                                docType === 'credential' ? "bg-amber-50 text-amber-600" :
                                "bg-purple-50 text-purple-600"
                            }`}>
                                <FileText className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <a href={item.url} target="_blank" rel="noreferrer" className="truncate text-sm font-medium text-zinc-900 hover:text-primary hover:underline">
                                    {item.title || item.url.split('/').pop() || 'Untitled Document'}
                                </a>
                                <span className="text-[10px] text-zinc-500 uppercase tracking-wide truncate">
                                    {docType === 'work' ? 'Project / Product' : docType}
                                </span>
                            </div>
                        </div>
                        {is_editing && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeDocument(item.id)}
                                className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const otherItems = (form_data.documents || []).filter(
        (d: any) => d.document_type === 'other' || d.document_type === 'award'
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-500">

            {/* SECTION 1: CORE EXPERTISE */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
                    <Tag className="h-4 w-4 text-zinc-900" />
                    <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Core Expertise</h3>
                </div>

                <div className="space-y-6">
                    {/* Domains */}
                    <div className="space-y-3">
                        <Label className="text-zinc-500 text-xs font-semibold uppercase">Domains</Label>
                        {is_editing ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {Object.entries(domainLabels).map(([key, label]) => (
                                    <div 
                                        key={key} 
                                        className={`flex items-center space-x-3 p-3 rounded-md border transition-all cursor-pointer ${
                                            form_data.domains?.includes(key) ? 'border-zinc-900 bg-zinc-50' : 'border-zinc-200 bg-white hover:bg-zinc-50'
                                        }`}
                                    >
                                        <Checkbox
                                            id={key}
                                            checked={form_data.domains?.includes(key as any)}
                                            onCheckedChange={(checked) => {
                                                if (checked) set_form_data((prev: any) => ({ ...prev, domains: [...(prev.domains || []), key] }))
                                                else set_form_data((prev: any) => ({ ...prev, domains: prev.domains.filter((d: any) => d !== key) }))
                                            }}
                                            className="data-[state=checked]:bg-zinc-900 data-[state=checked]:border-zinc-900"
                                        />
                                        <Label htmlFor={key} className="text-sm font-medium cursor-pointer text-zinc-700 w-full">
                                            {label as string}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {form_data.domains?.map((d: string) => (
                                    <Badge key={d} variant="secondary" className="px-3 py-1.5 bg-zinc-100 text-zinc-800 hover:bg-zinc-200 border-0 font-medium">
                                        {domainLabels[d as keyof typeof domainLabels] || d}
                                    </Badge>
                                ))}
                                {(!form_data.domains || form_data.domains.length === 0) && <p className="text-sm text-zinc-400 italic">No domains selected.</p>}
                            </div>
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Skills */}
                        <div className="space-y-3">
                            <Label className="text-zinc-500 text-xs font-semibold uppercase">Technical Skills</Label>
                            <div className="flex flex-wrap gap-2">
                                {form_data.skills?.map((skill: string, idx: number) => (
                                    <Badge key={idx} className="pl-2 pr-2 py-1.5 flex items-center gap-1 bg-zinc-900 text-white hover:bg-zinc-800 border-0">
                                        {skill}
                                        {is_editing && <X className="h-3 w-3 ml-1 cursor-pointer hover:text-red-300" onClick={() => removeItem('skills', idx)} />}
                                    </Badge>
                                ))}
                                {form_data.skills?.length === 0 && <span className="text-sm text-zinc-400 italic">No skills added.</span>}
                            </div>
                            {is_editing && (
                                <div className="flex gap-2 max-w-sm">
                                    <Input
                                        placeholder="Add skill..."
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addItem('skills', newSkill, setNewSkill)}
                                        className="h-9"
                                    />
                                    <Button size="sm" variant="secondary" onClick={() => addItem('skills', newSkill, setNewSkill)} className="h-9 w-9 p-0">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Languages */}
                        <div className="space-y-3">
                            <Label className="text-zinc-500 text-xs font-semibold uppercase">Languages</Label>
                            <div className="flex flex-wrap gap-2">
                                {form_data.languages?.map((lang: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="pl-2 pr-2 py-1.5 flex items-center gap-1 bg-white border-zinc-200 text-zinc-700">
                                        {lang}
                                        {is_editing && <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => removeItem('languages', idx)} />}
                                    </Badge>
                                ))}
                                {form_data.languages?.length === 0 && <span className="text-sm text-zinc-400 italic">No languages added.</span>}
                            </div>
                            {is_editing && (
                                <div className="flex gap-2 max-w-sm">
                                    <Input
                                        placeholder="Add language..."
                                        value={newLanguage}
                                        onChange={(e) => setNewLanguage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && addItem('languages', newLanguage, setNewLanguage)}
                                        className="h-9"
                                    />
                                    <Button size="sm" variant="secondary" onClick={() => addItem('languages', newLanguage, setNewLanguage)} className="h-9 w-9 p-0">
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 2: PROFESSIONAL EVIDENCE */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
                    <Briefcase className="h-4 w-4 text-zinc-900" />
                    <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Professional Evidence</h3>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-zinc-700 font-medium">Projects & Products</Label>
                            {is_editing && (
                                <Button size="sm" variant="ghost" onClick={() => setModalType('work')} className="h-6 w-6 p-0 hover:bg-zinc-100 rounded-full">
                                    <Plus className="h-3 w-3 text-zinc-600" />
                                </Button>
                            )}
                        </div>
                        {renderDocumentList('work', 'Add key projects.', <Laptop className="h-4 w-4" />)}
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-zinc-700 font-medium">Research & Papers</Label>
                            {is_editing && (
                                <Button size="sm" variant="ghost" onClick={() => setModalType('publication')} className="h-6 w-6 p-0 hover:bg-zinc-100 rounded-full">
                                    <Plus className="h-3 w-3 text-zinc-600" />
                                </Button>
                            )}
                        </div>
                        {renderDocumentList('publication', 'Add publications.', <BookOpen className="h-4 w-4" />)}
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-zinc-700 font-medium">Certifications</Label>
                            {is_editing && (
                                <Button size="sm" variant="ghost" onClick={() => setModalType('credential')} className="h-6 w-6 p-0 hover:bg-zinc-100 rounded-full">
                                    <Plus className="h-3 w-3 text-zinc-600" />
                                </Button>
                            )}
                        </div>
                        {renderDocumentList('credential', 'Add certifications.', <GraduationCap className="h-4 w-4" />)}
                    </div>
                </div>
            </section>

            {/* SECTION 3: ADDITIONAL */}
            <section className="space-y-6">
                <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
                    <Star className="h-4 w-4 text-zinc-900" />
                    <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-wider">Additional Portfolio & Achievements</h3>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-zinc-700 font-medium">Other Items</Label>
                        {is_editing && (
                            <Button size="sm" variant="outline" onClick={() => setModalType('other')} className="h-7 text-xs gap-2">
                                <Plus className="h-3 w-3" /> Add Item
                            </Button>
                        )}
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-3">
                        {otherItems.length === 0 && (
                            <div className="col-span-full py-6 text-center border border-dashed border-zinc-100 rounded-lg">
                                <p className="text-xs text-zinc-400">No additional items listed.</p>
                            </div>
                        )}
                        {otherItems.map((item: { id: string; url: string; document_type: string; title?: string }, idx: number) => (
                            <div key={item.id || idx} className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 bg-white shadow-sm hover:border-zinc-300 transition-all">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="p-2 rounded-md bg-zinc-50 text-zinc-600 shrink-0">
                                        <Star className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                                            {item.document_type === 'credential' ? 'Certification' : 'Item'}
                                        </span>
                                        <a href={item.url} target="_blank" rel="noreferrer" className="truncate text-sm font-medium text-zinc-900 hover:text-primary hover:underline">
                                            {item.title || item.url.split('/').pop() || 'View Item'}
                                        </a>
                                    </div>
                                </div>
                                {is_editing && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeDocument(item.id)}
                                        className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <UploadDocumentModal
                open={!!modalType}
                onOpenChange={(isOpen) => !isOpen && setModalType(null)}
                type={modalType!}
                onSuccess={(doc) => {
                    set_form_data((prev: any) => ({
                        ...prev,
                        documents: [...(prev.documents || []), doc.data]
                    }))
                    refreshProfile();
                }}
            />
        </div>
    );
}