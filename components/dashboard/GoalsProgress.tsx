'use client';

import { CheckCircle2, Target } from 'lucide-react';
import { useCurrency } from '@/components/CurrencyContext';
import type { GoalProgress } from '@/lib/stats';

interface GoalsProgressProps {
    progress: GoalProgress[];
}

export function GoalsProgress({ progress }: GoalsProgressProps) {
    const { formatValue } = useCurrency();

    if (!progress || progress.length === 0) return null;

    const formatGoalValue = (value: number, unit: GoalProgress['unit']) =>
        unit === 'currency' ? formatValue(value) : `${value.toFixed(1)}%`;

    const metGoals = progress.filter((g) => g.met);

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg dark:border-white/5 dark:bg-black/20">
            <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-foreground">Goals &amp; Targets</h3>
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <Target className="h-4 w-4" />
                </div>
            </div>

            {metGoals.length > 0 && (
                <div className="mb-5 space-y-2">
                    {metGoals.map((goal) => (
                        <div
                            key={`alert-${goal.id}`}
                            className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-sm text-green-600 dark:text-green-400"
                        >
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            <span>{goal.label} target reached</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="space-y-5">
                {progress.map((goal) => (
                    <div key={goal.id} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-foreground">{goal.label}</span>
                            <span className="text-muted-foreground">
                                {formatGoalValue(goal.current, goal.unit)}
                                <span className="mx-1">/</span>
                                {formatGoalValue(goal.target, goal.unit)}
                            </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                                className={`h-2 rounded-full transition-all duration-500 ${goal.met ? 'bg-green-500' : 'bg-primary'
                                    }`}
                                style={{ width: `${goal.pct}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
