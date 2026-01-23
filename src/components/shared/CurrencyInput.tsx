
import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { useCurrency } from '@/hooks/useCurrency';

interface CurrencyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    value: number | string;
    onChangeValue: (val: string) => void;
    sourceCurrency: string;
}

export function CurrencyInput({
    value,
    onChangeValue,
    sourceCurrency,
    className,
    disabled,
    ...props
}: CurrencyInputProps) {
    const { displayCurrency, rates, convert } = useCurrency();
    const [localValue, setLocalValue] = useState('');
    const isTyping = useRef(false);

    // Sync from prop only when not typing or value changed significantly (external update)
    useEffect(() => {
        if (isTyping.current) return;

        const val = Number(value) || 0;
        if (val === 0 && localValue === '') return;

        // Convert Source -> Display
        // We use the convert function from hook which handles Source -> Display logic
        const converted = convert(val, sourceCurrency);

        // Avoid overwriting if conversion is very close (rounding diffs)
        const currentLocal = parseFloat(localValue) || 0;
        if (Math.abs(converted - currentLocal) > 0.05) {
            setLocalValue(converted % 1 === 0 ? converted.toString() : converted.toFixed(2));
        }
    }, [value, sourceCurrency, displayCurrency, rates, convert]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLocalValue(val);
        isTyping.current = true;

        // Clear typing flag after delay
        setTimeout(() => isTyping.current = false, 2000);

        if (val === '') {
            onChangeValue('');
            return;
        }

        const numVal = parseFloat(val);
        if (!isNaN(numVal)) {
            // Convert Display -> Source
            // Source = Display / (Rate_Display / Rate_Source)
            // But simpler: 
            // 1 Source = X Display. (Effective Rate)
            // Source = Display / EffectiveRate.

            // convert(1, sourceCurrency) gives Effective Rate (amount of Display units for 1 Source unit)
            const effectiveRate = convert(1, sourceCurrency);

            if (effectiveRate > 0) {
                const sourceVal = numVal / effectiveRate;
                onChangeValue(sourceVal.toString());
            }
        }
    };

    return (
        <Input
            {...props}
            type="number"
            min={0}
            step="0.01"
            inputMode="decimal"
            value={localValue}
            onKeyDown={(e) => e.key === '-' && e.preventDefault()}
            onChange={handleChange}
            disabled={disabled}
            className={className}
        />
    );
}
