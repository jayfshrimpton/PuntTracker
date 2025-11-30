'use client';

import { useState } from 'react';
import { ChatInterface, Message } from '@/components/insights/ChatInterface';
import { InsightInput } from '@/components/insights/InsightInput';

export default function InsightsPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSend = async (content: string) => {
        // Add user message immediately
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await fetch('/api/insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: content,
                    history: messages.map(m => ({ role: m.role, content: m.content }))
                }),
            });

            if (!response.ok) throw new Error('Failed to get insights');

            const data = await response.json();

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.message,
                timestamp: new Date(),
                data: data.chartData // Attach structured data if present
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Error getting insights:', error);
            // Add error message
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
        <div className="flex flex-col h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] max-w-5xl mx-auto">
            <div className="flex-none p-4 border-b border-border/50 bg-background/80 backdrop-blur-md z-10">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                    AI Punting Insights 🤖
                </h1>
                <p className="text-sm text-muted-foreground">
                    Ask me anything about your betting performance
                </p>
            </div>

            <ChatInterface messages={messages} isLoading={isLoading} />

            <div className="flex-none p-4 bg-background/80 backdrop-blur-md border-t border-border/50">
                <div className="max-w-3xl mx-auto">
                    <InsightInput onSend={handleSend} isLoading={isLoading} />
                </div>
            </div>
        </div>
    );
}
