'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';

type CurrencyMode = 'currency' | 'units';

interface CurrencyContextType {
    mode: CurrencyMode;
    unitSize: number;
    toggleMode: () => void;
    formatValue: (value: number, decimals?: number, showSign?: boolean) => string;
    setUnitSize: (size: number) => void;
    isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const [mode, setMode] = useState<CurrencyMode>('currency');
    const [unitSize, setUnitSizeState] = useState<number>(10); // Default to $10
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [mounted, setMounted] = useState(false);

    // Load preference from profile on mount
    useEffect(() => {
        setMounted(true);
        const fetchSettings = async () => {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    const { data } = await supabase
                        .from('profiles')
                        .select('unit_size, display_units')
                        .eq('id', user.id)
                        .single();

                    if (data) {
                        if (data.unit_size) setUnitSizeState(data.unit_size);
                        if (data.display_units !== undefined) {
                            setMode(data.display_units ? 'units' : 'currency');
                        }
                    }
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const toggleMode = async () => {
        const newMode = mode === 'currency' ? 'units' : 'currency';
        setMode(newMode);

        // Update profile in Supabase
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            await supabase
                .from('profiles')
                .update({ display_units: newMode === 'units' })
                .eq('id', user.id);
        }
    };

    const setUnitSize = (size: number) => {
        setUnitSizeState(size);
    };

    const formatValue = (value: number, decimals: number = 2, showSign: boolean = true): string => {
        if (mode === 'units') {
            const units = value / unitSize;
            const sign = (units > 0 && showSign) ? '+' : '';
            return `${sign}${units.toFixed(decimals)}u`;
        }
        return value < 0
            ? `-$${Math.abs(value).toFixed(decimals)}`
            : `$${value.toFixed(decimals)}`;
    };

    return (
        <CurrencyContext.Provider value={{ mode, unitSize, toggleMode, formatValue, setUnitSize, isLoading }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}
