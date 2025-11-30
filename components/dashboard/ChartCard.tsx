import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ChartCardProps {
    title: string;
    children: ReactNode;
    className?: string;
    action?: ReactNode;
}

export function ChartCard({ title, children, className, action }: ChartCardProps) {
    return (
        <div
            className={cn(
                'rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg dark:border-white/5 dark:bg-black/20',
                className
            )}
        >
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                {action}
            </div>
            <div className="h-[300px] w-full">{children}</div>
        </div>
    );
}
