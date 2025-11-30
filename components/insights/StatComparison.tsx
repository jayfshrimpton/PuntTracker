import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatComparisonProps {
    label: string;
    value1: {
        label: string;
        value: string | number;
        trend?: 'up' | 'down' | 'neutral';
    };
    value2: {
        label: string;
        value: string | number;
        trend?: 'up' | 'down' | 'neutral';
    };
    className?: string;
}

export function StatComparison({ label, value1, value2, className }: StatComparisonProps) {
    const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
        switch (trend) {
            case 'up':
                return <ArrowUpRight className="h-4 w-4 text-green-500" />;
            case 'down':
                return <ArrowDownRight className="h-4 w-4 text-red-500" />;
            default:
                return <Minus className="h-4 w-4 text-gray-400" />;
        }
    };

    return (
        <div className={cn("bg-card/50 border border-border/50 rounded-xl p-4 backdrop-blur-sm", className)}>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">{label}</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">{value1.label}</div>
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{value1.value}</span>
                        {getTrendIcon(value1.trend)}
                    </div>
                </div>
                <div className="space-y-1 border-l border-border/50 pl-4">
                    <div className="text-xs text-muted-foreground">{value2.label}</div>
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{value2.value}</span>
                        {getTrendIcon(value2.trend)}
                    </div>
                </div>
            </div>
        </div>
    );
}
