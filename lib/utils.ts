import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatValue(value: number, decimals: number = 2, showCurrency: boolean = true): string {
    if (typeof value !== 'number') return '0.00';

    const formatted = new Intl.NumberFormat('en-AU', {
        style: showCurrency ? 'currency' : 'decimal',
        currency: 'AUD',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(value);

    return formatted;
}
