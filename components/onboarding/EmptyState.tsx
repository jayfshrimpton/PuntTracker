'use client';

import { PlusCircle, Sparkles } from 'lucide-react';

interface EmptyStateProps {
    onAddFirstBet: () => void;
    onLoadSampleBets?: () => void;
    sampleLoading?: boolean;
}

export function EmptyState({ onAddFirstBet, onLoadSampleBets, sampleLoading }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-card rounded-2xl border border-border border-dashed">
            <div className="bg-primary/10 p-4 rounded-full mb-6">
                <PlusCircle className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">No bets tracked yet!</h3>
            <p className="text-muted-foreground max-w-md mb-8">
                Add your first bet to see your stats come alive. Track your wins, losses, and ROI over time.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-sm">
                <button
                    type="button"
                    onClick={onAddFirstBet}
                    className="inline-flex justify-center items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                    <PlusCircle className="h-5 w-5" />
                    Add first bet
                </button>
                {onLoadSampleBets && (
                    <button
                        type="button"
                        onClick={onLoadSampleBets}
                        disabled={sampleLoading}
                        className="inline-flex justify-center items-center gap-2 px-6 py-3 rounded-xl font-semibold border border-border bg-background hover:bg-muted/80 transition-colors disabled:opacity-60"
                    >
                        <Sparkles className="h-5 w-5 text-primary" />
                        {sampleLoading ? 'Loading…' : 'Try sample data'}
                    </button>
                )}
            </div>
        </div>
    );
}
