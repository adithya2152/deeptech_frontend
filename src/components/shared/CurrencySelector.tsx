import { useState } from 'react';
import { DollarSign, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SUPPORTED_CURRENCIES, currencySymbol, CurrencyCode, normalizeCurrency } from '@/lib/currency';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { currencyApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

// Display names for currencies
const CURRENCY_NAMES: Record<CurrencyCode, string> = {
    USD: 'US Dollar',
    EUR: 'Euro',
    GBP: 'British Pound',
    INR: 'Indian Rupee',
    AED: 'UAE Dirham',
    SGD: 'Singapore Dollar',
    CAD: 'Canadian Dollar',
    AUD: 'Australian Dollar',
    NZD: 'New Zealand Dollar',
    JPY: 'Japanese Yen',
};

export function CurrencySelector() {
    const { token, isAuthenticated } = useAuth();
    const queryClient = useQueryClient();
    const [isUpdating, setIsUpdating] = useState(false);

    // Fetch current preferred currency
    const { data: preferredData } = useQuery({
        queryKey: ['currency:preferred'],
        queryFn: () => currencyApi.getPreferred(token!),
        enabled: !!token && isAuthenticated,
        staleTime: 5 * 60 * 1000,
    });

    const currentCurrency: CurrencyCode = normalizeCurrency(preferredData?.data?.currency);

    // Mutation to update currency
    const setCurrencyMutation = useMutation({
        mutationFn: (curr: string) => currencyApi.setPreferred(curr, token!),
        onMutate: async (newCurrency) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['currency:preferred'] });

            // Snapshot the previous value
            const previousCurrency = queryClient.getQueryData(['currency:preferred']);

            // Optimistically update to the new value
            queryClient.setQueryData(['currency:preferred'], (old: any) => ({
                ...old,
                data: { ...old?.data, currency: newCurrency }
            }));

            // Return a context object with the snapshotted value
            return { previousCurrency };
        },
        onError: (err, newCurrency, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            queryClient.setQueryData(['currency:preferred'], context?.previousCurrency);
            console.error('Failed to update currency preference:', err);
        },
        onSuccess: () => {
            // Always refetch after error or success to ensure we haven't drifted
            queryClient.invalidateQueries({ queryKey: ['currency:preferred'] });
            queryClient.invalidateQueries({ queryKey: ['currency:rates'] });
        },
    });

    const handleCurrencyChange = async (code: CurrencyCode) => {
        if (code === currentCurrency) return;

        setIsUpdating(true);
        try {
            await setCurrencyMutation.mutateAsync(code);
        } catch (err) {
            // Error handling is done in onError
        } finally {
            setIsUpdating(false);
        }
    };

    // Don't show selector if not authenticated
    if (!isAuthenticated) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2" disabled={isUpdating}>
                    {isUpdating ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>...</span>
                        </>
                    ) : (
                        <>
                            <span className="text-lg font-semibold notranslate" translate="no">{currencySymbol(currentCurrency)}</span>
                        </>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto w-54">
                {SUPPORTED_CURRENCIES.map((code) => (
                    <DropdownMenuItem
                        key={code}
                        onClick={() => handleCurrencyChange(code)}
                        className="flex items-center justify-between"
                    >
                        <div className="flex items-center gap-2">
                            <span className="font-medium w-8 notranslate" translate="no">{currencySymbol(code)}</span>
                            <span>{CURRENCY_NAMES[code]}</span>
                        </div>
                        {currentCurrency === code && <span className="text-xs text-primary font-bold">✓</span>}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
