import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: {
        value: number;
        label: string;
    };
    className?: string;
    valueClassName?: string;
    description?: string;
}

export function StatsCard({
    title,
    value,
    icon: Icon,
    trend,
    className,
    valueClassName,
    description,
}: StatsCardProps) {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg transition-all hover:bg-white/10 hover:shadow-lg dark:border-white/5 dark:bg-black/20',
                className
            )}
        >
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <Icon className="h-4 w-4" />
                </div>
            </div>
            <div className="mt-4">
                <h3 className={cn('text-3xl font-bold tracking-tight', valueClassName)}>
                    {value}
                </h3>
                {description && (
                    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                )}
                {trend && (
                    <div className="mt-2 flex items-center text-xs">
                        <span
                            className={cn(
                                'font-medium',
                                trend.value >= 0 ? 'text-green-500' : 'text-red-500'
                            )}
                        >
                            {trend.value > 0 ? '+' : ''}
                            {trend.value}%
                        </span>
                        <span className="ml-1 text-muted-foreground">{trend.label}</span>
                    </div>
                )}
            </div>

            {/* Decorative gradient background */}
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl" />
        </div>
    );
}
