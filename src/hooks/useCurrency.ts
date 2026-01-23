import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { currencyApi } from '@/lib/api';
import { formatCurrency as baseFormatCurrency, DEFAULT_CURRENCY, CurrencyCode, normalizeCurrency } from '@/lib/currency';

interface ExchangeRates {
    [currency: string]: number;
}

interface CurrencyState {
    /** User's preferred display currency */
    displayCurrency: CurrencyCode;
    /** Exchange rates from INR to other currencies */
    rates: ExchangeRates;
    /** Whether currency data is loading */
    isLoading: boolean;
    /** Convert amount from source currency to user's display currency and format */
    convertAndFormat: (amount: number | string | null | undefined, sourceCurrency?: string | null) => string;
    /** Convert amount without formatting (just the number) */
    convert: (amount: number, sourceCurrency?: string | null) => number;
    /** Format without conversion (use when amount is already in display currency) */
    format: (amount: number | string | null | undefined) => string;
}

/**
 * Hook to get user's preferred currency and provide conversion utilities.
 * 
 * All monetary values in the database are stored in their source currency (usually INR).
 * This hook converts amounts to the user's preferred display currency.
 */
export function useCurrency(): CurrencyState {
    const { token, isAuthenticated } = useAuth();

    const queryClient = useQueryClient();

    // Fetch user's preferred currency
    const { data: preferredData, isLoading: isLoadingPreferred } = useQuery({
        queryKey: ['currency:preferred'],
        queryFn: () => currencyApi.getPreferred(token!),
        enabled: !!token && isAuthenticated,
        staleTime: 5 * 60 * 1000,
        gcTime: 30 * 60 * 1000,
    });

    const setCurrencyMutation = useMutation({
        mutationFn: (curr: string) => currencyApi.setPreferred(curr, token!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['currency:preferred'] });
        }
    });

    const autoDetectRef = useRef(false);

    useEffect(() => {
        if (!isLoadingPreferred && preferredData && preferredData.data && preferredData.data.currency === null && !autoDetectRef.current) {
            autoDetectRef.current = true;
            try {
                const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                let detected = 'USD'; // Default global

                if (tz.includes('Calcutta') || tz.includes('Kolkata') || tz.includes('India')) detected = 'INR';
                else if (tz.includes('Europe') && !tz.includes('London')) detected = 'EUR';
                else if (tz.includes('London')) detected = 'GBP';
                else if (tz.includes('Australia')) detected = 'AUD';
                else if (tz.includes('Canada')) detected = 'CAD';
                // Add more logic as needed

                // Set it directly
                setCurrencyMutation.mutate(detected);
            } catch (e) {
                console.warn('Auto-detect currency failed', e);
            }
        }
    }, [preferredData, isLoadingPreferred, setCurrencyMutation]);

    // Fetch exchange rates
    const { data: ratesData, isLoading: isLoadingRates } = useQuery({
        queryKey: ['currency:rates'],
        queryFn: () => currencyApi.getRates(),
        staleTime: 15 * 60 * 1000, // Cache for 15 minutes (rates don't change often)
        gcTime: 60 * 60 * 1000,
    });

    const displayCurrency = normalizeCurrency(preferredData?.data?.currency);
    const rates: ExchangeRates = ratesData?.data?.rates || {};
    const isLoading = isLoadingPreferred || isLoadingRates;

    /**
     * Convert amount from source currency to user's display currency.
     * If source is INR and display is USD, multiplies by INR->USD rate.
     * Rate format: 1 INR = X target (e.g., USD rate is ~0.011)
     */
    const convert = (amount: number, sourceCurrency?: string | null): number => {
        const source = normalizeCurrency(sourceCurrency);

        // No conversion needed if same currency
        if (source === displayCurrency) {
            return amount;
        }

        // First convert to INR if source is not INR
        let amountInINR = amount;
        if (source !== 'INR') {
            const sourceRate = rates[source];
            if (sourceRate && sourceRate > 0) {
                // Rate is "1 INR = X source currency", so to get INR, divide
                amountInINR = amount / sourceRate;
            }
        }

        // Then convert from INR to display currency
        if (displayCurrency === 'INR') {
            return amountInINR;
        }

        const displayRate = rates[displayCurrency];
        if (displayRate && displayRate > 0) {
            // Rate is "1 INR = X displayCurrency", so multiply
            return amountInINR * displayRate;
        }

        // Fallback: no conversion if rates unavailable
        return amount;
    };


    /**
     * Convert and format amount for display.
     */
    const convertAndFormat = (
        amount: number | string | null | undefined,
        sourceCurrency?: string | null
    ): string => {
        const numeric = typeof amount === 'number' ? amount : Number(amount);
        const safeAmount = Number.isFinite(numeric) ? numeric : 0;

        const converted = convert(safeAmount, sourceCurrency);
        return baseFormatCurrency(converted, displayCurrency);
    };

    /**
     * Format amount in user's display currency (no conversion).
     */
    const format = (amount: number | string | null | undefined): string => {
        return baseFormatCurrency(amount, displayCurrency);
    };

    return {
        displayCurrency,
        rates,
        isLoading,
        convertAndFormat,
        convert,
        format,
    };
}

/**
 * For components that can't use hooks (like table columns),
 * provide a simple conversion context/provider pattern.
 */
export type { CurrencyState };
