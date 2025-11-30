import { CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';

type RecommendationType = 'keep' | 'change' | 'try';

interface RecommendationCardProps {
    type: RecommendationType;
    title: string;
    description: string;
    className?: string;
}

export function RecommendationCard({ type, title, description, className }: RecommendationCardProps) {
    const config = {
        keep: {
            icon: CheckCircle2,
            color: 'text-green-500',
            bg: 'bg-green-500/10',
            border: 'border-green-500/20',
            label: 'Keep Doing',
        },
        change: {
            icon: AlertTriangle,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20',
            label: 'Consider Changing',
        },
        try: {
            icon: Lightbulb,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            label: 'Try This',
        },
    };

    const style = config[type];
    const Icon = style.icon;

    return (
        <div className={cn(
            "rounded-xl p-4 border backdrop-blur-sm transition-all hover:scale-[1.02]",
            style.bg,
            style.border,
            className
        )}>
            <div className="flex items-start gap-3">
                <div className={cn("p-2 rounded-lg bg-background/50", style.color)}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                    <div className={cn("text-xs font-bold uppercase tracking-wider", style.color)}>
                        {style.label}
                    </div>
                    <h4 className="font-semibold text-foreground">{title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}
