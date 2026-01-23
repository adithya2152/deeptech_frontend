import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Rocket, Target, CheckCircle2, Timer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { currencySymbol } from '@/lib/currency';
import { useCurrency } from '@/hooks/useCurrency';

interface ServiceRatesProps {
    form_data: any;
    set_form_data: (data: any) => void;
    is_editing: boolean;
}

// Helper component for currency inputs
function RateInput({
    valueInInr,
    onChangeInInr,
    disabled,
    className
}: {
    valueInInr: number | string,
    onChangeInInr: (val: string) => void,
    disabled?: boolean,
    className?: string
}) {
    const { displayCurrency, rates, convert } = useCurrency();
    const [localValue, setLocalValue] = useState('');
    const isTyping = useRef(false);

    // Sync from prop only when not typing or value changed significantly (external update)
    useEffect(() => {
        if (isTyping.current) return;

        const val = Number(valueInInr) || 0;
        if (val === 0 && localValue === '') return;

        const converted = convert(val, 'INR');
        // Avoid overwriting if conversion is very close (rounding diffs)
        const currentLocal = parseFloat(localValue) || 0;
        if (Math.abs(converted - currentLocal) > 0.05) {
            // For display, clean up decimals if whole number, otherwise max 2
            setLocalValue(converted % 1 === 0 ? converted.toString() : converted.toFixed(2));
        }
    }, [valueInInr, displayCurrency, rates, convert]); // Removing localValue dep to avoid loop

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLocalValue(val);
        isTyping.current = true;

        // Clear typing flag after delay
        setTimeout(() => isTyping.current = false, 2000);

        if (val === '') {
            onChangeInInr('');
            return;
        }

        const numVal = parseFloat(val);
        if (!isNaN(numVal)) {
            const rate = rates[displayCurrency] || 1;
            // Convert Display -> INR (Amount / Rate)
            // Example: 100 USD / 0.011 = 9090 INR
            const inrVal = numVal / rate;
            onChangeInInr(inrVal.toString());
        }
    };

    return (
        <Input
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={localValue}
            onKeyDown={(e) => e.key === '-' && e.preventDefault()}
            onChange={handleChange}
            disabled={disabled}
            className={className}
            placeholder="0.00"
        />
    );
}

export function ServiceRates({ form_data, set_form_data, is_editing }: ServiceRatesProps) {
    const mode = form_data.preferred_engagement_mode;
    const { displayCurrency } = useCurrency();
    // Use user's preferred currency from settings

    const getModeLabel = (val: string) => {
        switch (val) {
            case 'hourly': return 'Hourly Rate';
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
                        <span className="text-zinc-400 text-sm">{currencySymbol(displayCurrency)}</span>
                        Engagement Rates (Average)
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
                                    <SelectItem value="hourly">Prefers Hourly Rate</SelectItem>
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

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Hourly Rate */}
                    <div className={cn(
                        "space-y-2 p-3 border rounded-lg transition-all relative",
                        mode === 'hourly' ? "bg-emerald-50/50 border-emerald-200 shadow-sm" : "bg-zinc-50 border-zinc-100"
                    )}>
                        {mode === 'hourly' && !is_editing && (
                            <div className="absolute -top-2.5 left-3 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-200">
                                PREFERRED
                            </div>
                        )}
                        <Label className={cn("text-[10px] uppercase font-bold flex items-center gap-1", mode === 'hourly' ? "text-emerald-700" : "text-zinc-500")}>
                            <Timer className="h-3 w-3" /> Hourly Rate ({currencySymbol(displayCurrency)})
                        </Label>
                        <RateInput
                            valueInInr={form_data.avg_hourly_rate || ''}
                            onChangeInInr={(val) =>
                                set_form_data({ ...form_data, avg_hourly_rate: val })
                            }
                            disabled={!is_editing}
                            className="border-zinc-200 bg-white"
                        />
                        <p className="text-[10px] text-zinc-400 text-right">Per hour</p>
                    </div>

                    {/* Daily Rate */}
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
                            <Clock className="h-3 w-3" /> Daily Rate ({currencySymbol(displayCurrency)})
                        </Label>
                        <RateInput
                            valueInInr={form_data.avg_daily_rate}
                            onChangeInInr={(val) =>
                                set_form_data({ ...form_data, avg_daily_rate: val })
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
                            <Rocket className="h-3 w-3" /> Sprint Rate ({currencySymbol(displayCurrency)})
                        </Label>
                        <RateInput
                            valueInInr={form_data.avg_sprint_rate}
                            onChangeInInr={(val) =>
                                set_form_data({ ...form_data, avg_sprint_rate: val })
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
                            <Target className="h-3 w-3" /> Fixed Project ({currencySymbol(displayCurrency)})
                        </Label>
                        <RateInput
                            valueInInr={form_data.avg_fixed_rate}
                            onChangeInInr={(val) =>
                                set_form_data({ ...form_data, avg_fixed_rate: val })
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