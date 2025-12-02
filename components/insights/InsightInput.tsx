'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';

interface InsightInputProps {
    onSend: (message: string) => void;
    isLoading: boolean;
}

const QUICK_PROMPTS = [
    "What's my most profitable bet type?",
    "Am I better at favorites or longshots?",
    "Which venues should I focus on?",
    "Show my best and worst months",
    "Analyze my recent form"
];

export function InsightInput({ onSend, isLoading }: InsightInputProps) {
    const [input, setInput] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;
        onSend(input);
        setInput('');
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((prompt) => (
                    <button
                        key={prompt}
                        onClick={() => onSend(prompt)}
                        disabled={isLoading}
                        className="text-xs px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-secondary text-secondary-foreground transition-colors border border-border/50 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Sparkles className="h-3 w-3 text-blue-500" />
                        {prompt}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
                <div className="relative flex-1">
                    <Input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your betting performance..."
                        className="pr-12 h-12 text-base bg-background/50 backdrop-blur-sm border-border/50 focus:border-blue-500/50 transition-all"
                        disabled={isLoading}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={!input.trim() || isLoading}
                        className="absolute right-1 top-1 h-10 w-10 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>
            </form>
        </div>
    );
}
