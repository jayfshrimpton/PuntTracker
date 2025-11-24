'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, X } from 'lucide-react';

interface OnboardingChecklistProps {
    hasBets: boolean;
    hasResults: boolean;
    viewedStats: boolean;
}

export function OnboardingChecklist({ hasBets, hasResults, viewedStats }: OnboardingChecklistProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        const dismissed = localStorage.getItem('onboarding_dismissed');
        if (dismissed === 'true') {
            setIsVisible(false);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('onboarding_dismissed', 'true');
    };

    const steps = [
        { label: 'Log your first bet', completed: hasBets },
        { label: 'Add the result when race finishes', completed: hasResults },
        { label: 'Check your stats', completed: viewedStats },
    ];

    const completedCount = steps.filter(s => s.completed).length;
    const progress = (completedCount / steps.length) * 100;

    if (!isVisible) return null;

    if (isMinimized) {
        return (
            <div
                className="fixed bottom-4 right-4 z-40 bg-card border border-border shadow-lg rounded-full p-3 cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setIsMinimized(false)}
            >
                <div className="relative">
                    <div className="absolute inset-0 rounded-full border-2 border-primary opacity-20"></div>
                    <div
                        className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent transform -rotate-90"
                        style={{
                            clipPath: `polygon(50% 50%, -50% -50%, 150% -50%, ${progress > 50 ? '150% 150%' : '50% -50%'})` // Simplified circular progress
                        }}
                    ></div>
                    {/* Simple circular progress using conic-gradient is easier */}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xs"
                        style={{
                            background: `conic-gradient(hsl(var(--primary)) ${progress}%, transparent 0)`
                        }}
                    >
                        <div className="w-6 h-6 bg-card rounded-full flex items-center justify-center">
                            {completedCount}/{steps.length}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-40 w-80 bg-card border border-border shadow-xl rounded-xl overflow-hidden animate-in slide-in-from-bottom-5 duration-500">
            <div className="bg-primary/5 p-4 flex items-center justify-between border-b border-border">
                <h3 className="font-semibold text-foreground">Getting Started</h3>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <span className="sr-only">Minimize</span>
                        <div className="w-4 h-0.5 bg-current rounded-full"></div>
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="p-4 space-y-4">
                <div className="space-y-3">
                    {steps.map((step, index) => (
                        <div key={index} className="flex items-start gap-3">
                            {step.completed ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                            ) : (
                                <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                            )}
                            <span className={`text-sm ${step.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                {step.label}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="w-full bg-secondary rounded-full h-1.5 mt-2">
                    <div
                        className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
}
