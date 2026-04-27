'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChatInterface, Message } from '@/components/insights/ChatInterface';
import { InsightInput } from '@/components/insights/InsightInput';
import { FeatureGate } from '@/components/FeatureGate';
import {
    DASHBOARD_PERIOD_STORAGE_KEY,
    DEFAULT_DASHBOARD_PERIOD,
    formatDashboardPeriodLabel,
    normalizeDashboardPeriod,
    type DashboardPeriodState,
} from '@/lib/dashboard-period';

import { Bot } from 'lucide-react';

function readStoredDashboardPeriod(): DashboardPeriodState {
    if (typeof window === 'undefined') return DEFAULT_DASHBOARD_PERIOD;
    try {
        const raw = localStorage.getItem(DASHBOARD_PERIOD_STORAGE_KEY);
        if (!raw) return DEFAULT_DASHBOARD_PERIOD;
        return normalizeDashboardPeriod(JSON.parse(raw));
    } catch {
        return DEFAULT_DASHBOARD_PERIOD;
    }
}

export default function InsightsPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [periodLabel, setPeriodLabel] = useState('all time');

    const refreshPeriodLabel = useCallback(() => {
        const p = readStoredDashboardPeriod();
        setPeriodLabel(formatDashboardPeriodLabel(p));
    }, []);

    useEffect(() => {
        refreshPeriodLabel();
        const onStorage = (e: StorageEvent) => {
            if (e.key === DASHBOARD_PERIOD_STORAGE_KEY) refreshPeriodLabel();
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, [refreshPeriodLabel]);

    const handleSend = async (content: string) => {
        const period = readStoredDashboardPeriod();
        setPeriodLabel(formatDashboardPeriodLabel(period));

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const historyPayload = [
                ...messages.map((m) => ({ role: m.role, content: m.content })),
                { role: 'user' as const, content },
            ];
            const response = await fetch('/api/insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: content,
                    period,
                    history: historyPayload,
                }),
            });

            if (!response.ok) throw new Error('Failed to get insights');

            const data = await response.json();

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.message,
                timestamp: new Date(),
                data: data.chartData
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error getting insights:', error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "I'm sorry, I encountered an error analyzing your data. Please try again.",
                timestamp: new Date(),
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <FeatureGate requiredTier={['pro', 'elite']} featureName="AI Insights">
            <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] max-w-5xl mx-auto">
                <div className="flex-none p-4 border-b border-border/50 bg-background/80 backdrop-blur-md z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Bot className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                            AI Punting Insights
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                        Ask questions about your betting — analysis matches your{' '}
                        <span className="font-medium text-foreground">dashboard date range</span>
                        {periodLabel !== 'all time' ? <> ({periodLabel})</> : ' (all time)'}
                        . Say &quot;all bets&quot; in your question to use your full history instead.
                    </p>
                    <div className="text-xs text-muted-foreground/80 bg-secondary/50 p-2 rounded-md border border-border/50 inline-flex items-center gap-2">
                        <span className="i-lucide-info w-3 h-3" />
                        <span>
                            <strong>Tip:</strong> Change the period on the Dashboard to update this scope (same filter applies here).
                        </span>
                    </div>
                </div>

                <ChatInterface messages={messages} isLoading={isLoading} />

                <div className="flex-none p-4 bg-background/80 backdrop-blur-md border-t border-border/50">
                    <div className="max-w-3xl mx-auto">
                        <InsightInput onSend={handleSend} isLoading={isLoading} />
                    </div>
                </div>
            </div>
        </FeatureGate>
    );
}
