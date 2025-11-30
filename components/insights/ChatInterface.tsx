'use client';

import { useEffect, useRef } from 'react';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatComparison } from './StatComparison';
import { RecommendationCard } from './RecommendationCard';
import { BetTypeBreakdown } from './BetTypeBreakdown';
import { TrendChart } from './TrendChart';

export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    data?: any; // Structured data for visualization
}

interface ChatInterfaceProps {
    messages: Message[];
    isLoading: boolean;
}

export function ChatInterface({ messages, isLoading }: ChatInterfaceProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const renderVisualization = (data: any) => {
        if (!data) return null;

        switch (data.type) {
            case 'comparison':
                return <StatComparison {...data.props} className="mt-4 max-w-md" />;
            case 'recommendation':
                return <RecommendationCard {...data.props} className="mt-4 max-w-md" />;
            case 'breakdown':
                return <BetTypeBreakdown {...data.props} className="mt-4 max-w-md" />;
            case 'trend':
                return <TrendChart {...data.props} className="mt-4 max-w-lg" />;
            default:
                return null;
        }
    };

    if (messages.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-6 opacity-0 animate-in fade-in duration-500">
                <div className="relative">
                    <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
                    <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-2xl shadow-xl">
                        <Bot className="h-12 w-12 text-white" />
                    </div>
                </div>
                <div className="space-y-2 max-w-md">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                        AI Punting Insights
                    </h2>
                    <p className="text-muted-foreground">
                        I can analyze your betting history to find patterns, strengths, and areas for improvement.
                        Ask me anything!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.map((message) => (
                <div
                    key={message.id}
                    className={cn(
                        "flex gap-4 max-w-3xl mx-auto",
                        message.role === 'user' ? "justify-end" : "justify-start"
                    )}
                >
                    {message.role === 'assistant' && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                            <Bot className="h-4 w-4 text-white" />
                        </div>
                    )}

                    <div className={cn(
                        "space-y-2 max-w-[85%]",
                        message.role === 'user' ? "items-end" : "items-start"
                    )}>
                        <div className={cn(
                            "p-4 rounded-2xl shadow-sm",
                            message.role === 'user'
                                ? "bg-blue-600 text-white rounded-tr-none"
                                : "bg-card border border-border/50 rounded-tl-none"
                        )}>
                            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                            {message.data && renderVisualization(message.data)}
                        </div>
                        <span className="text-[10px] text-muted-foreground px-2">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>

                    {message.role === 'user' && (
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                    )}
                </div>
            ))}

            {isLoading && (
                <div className="flex gap-4 max-w-3xl mx-auto">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                        <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-card border border-border/50 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" />
                    </div>
                </div>
            )}
            <div ref={bottomRef} />
        </div>
    );
}
