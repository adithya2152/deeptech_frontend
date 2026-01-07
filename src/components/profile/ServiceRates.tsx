import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Clock, Rocket, Target, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ServiceRatesProps {
    form_data: any;
    set_form_data: (data: any) => void;
    is_editing: boolean;
}

export function ServiceRates({ form_data, set_form_data, is_editing }: ServiceRatesProps) {
    const mode = form_data.preferred_engagement_mode;

    const getModeLabel = (val: string) => {
        switch (val) {
            case 'daily': return 'Daily Rate';
            case 'sprint': return 'Sprint Rate';
            case 'fixed': return 'Fixed Project';
            default: return 'Hourly';
        }
    };

    return (
        <Card className="border-zinc-200 shadow-sm mt-6">
            <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-900 font-semibold">
                        <DollarSign className="h-4 w-4 text-zinc-400" /> Engagement Rates (Average)
                    </div>
                    {is_editing ? (
                        <div className="w-48">
                            <Select
                                value={form_data.preferred_engagement_mode}
                                onValueChange={(val) => set_form_data({ ...form_data, preferred_engagement_mode: val })}
                            >
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="Preferred Mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="daily">Prefers Daily Rate</SelectItem>
                                    <SelectItem value="sprint">Prefers Sprint</SelectItem>
                                    <SelectItem value="fixed">Prefers Fixed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (
                        mode && (
                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 flex gap-1.5">
                                <CheckCircle2 className="h-3 w-3" />
                                Prefers: {getModeLabel(mode)}
                            </Badge>
                        )
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={cn(
                        "space-y-2 p-3 border rounded-lg transition-all relative",
                        mode === 'daily' ? "bg-emerald-50/50 border-emerald-200 shadow-sm" : "bg-zinc-50 border-zinc-100"
                    )}>
                        {mode === 'daily' && !is_editing && (
                            <div className="absolute -top-2.5 left-3 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
                                PREFERRED
                            </div>
                        )}
                        <Label className={cn("text-[10px] uppercase font-bold flex items-center gap-1", mode === 'daily' ? "text-emerald-700" : "text-zinc-500")}>
                            <Clock className="h-3 w-3" /> Daily Rate
                        </Label>
                        <Input
                            type="number"
                            min={0}
                            inputMode="numeric"
                            value={form_data.avg_daily_rate}
                            onKeyDown={(e) => e.key === '-' && e.preventDefault()}
                            onChange={(e) =>
                                set_form_data({ ...form_data, avg_daily_rate: e.target.value })
                            }
                            disabled={!is_editing}
                            className="border-zinc-200 bg-white"
                        />
                        <p className="text-[10px] text-zinc-400 text-right">Per day</p>
                    </div>

                    <div className={cn(
                        "space-y-2 p-3 border rounded-lg transition-all relative",
                        mode === 'sprint' ? "bg-emerald-50/50 border-emerald-200 shadow-sm" : "bg-zinc-50 border-zinc-100"
                    )}>
                        {mode === 'sprint' && !is_editing && (
                            <div className="absolute -top-2.5 left-3 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
                                PREFERRED
                            </div>
                        )}
                        <Label className={cn("text-[10px] uppercase font-bold flex items-center gap-1", mode === 'sprint' ? "text-emerald-700" : "text-zinc-500")}>
                            <Rocket className="h-3 w-3" /> Sprint Rate
                        </Label>
                        <Input
                            type="number"
                            min={0}
                            inputMode="numeric"
                            value={form_data.avg_sprint_rate}
                            onKeyDown={(e) => e.key === '-' && e.preventDefault()}
                            onChange={(e) =>
                                set_form_data({ ...form_data, avg_sprint_rate: e.target.value })
                            }
                            disabled={!is_editing}
                            className="border-zinc-200 bg-white"
                        />
                        <p className="text-[10px] text-zinc-400 text-right">Per sprint</p>
                    </div>

                    <div className={cn(
                        "space-y-2 p-3 border rounded-lg transition-all relative",
                        mode === 'fixed' ? "bg-emerald-50/50 border-emerald-200 shadow-sm" : "bg-zinc-50 border-zinc-100"
                    )}>
                        {mode === 'fixed' && !is_editing && (
                            <div className="absolute -top-2.5 left-3 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
                                PREFERRED
                            </div>
                        )}
                        <Label className={cn("text-[10px] uppercase font-bold flex items-center gap-1", mode === 'fixed' ? "text-emerald-700" : "text-zinc-500")}>
                            <Target className="h-3 w-3" /> Fixed Project
                        </Label>
                        <Input
                            type="number"
                            min={0}
                            inputMode="numeric"
                            value={form_data.avg_fixed_rate}
                            onKeyDown={(e) => e.key === '-' && e.preventDefault()}
                            onChange={(e) =>
                                set_form_data({ ...form_data, avg_fixed_rate: e.target.value })
                            }
                            disabled={!is_editing}
                            className="border-zinc-200 bg-white"
                        />
                        <p className="text-[10px] text-zinc-400 text-right">Full Project Rate</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}