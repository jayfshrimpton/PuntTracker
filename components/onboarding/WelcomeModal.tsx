'use client';

import { useState, useEffect } from 'react';
import { X, BookOpen } from 'lucide-react';

interface WelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddFirstBet: () => void;
}

export function WelcomeModal({ isOpen, onClose, onAddFirstBet }: WelcomeModalProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShow(true);
        } else {
            setTimeout(() => setShow(false), 300); // Wait for animation
        }
    }, [isOpen]);

    if (!show && !isOpen) return null;

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative bg-card w-full max-w-md rounded-2xl shadow-xl border border-border p-6 transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="text-center space-y-4 pt-4">
                    <div className="text-4xl animate-bounce">🐴</div>
                    <h2 className="text-2xl font-bold text-foreground">Welcome to Punters Journal!</h2>
                    <p className="text-muted-foreground">
                        Let&apos;s log your first bet to get started tracking your performance like a pro.
                    </p>

                    <div className="pt-4 space-y-3">
                        <button
                            onClick={onAddFirstBet}
                            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                        >
                            Add My First Bet
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-2 px-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                            I&apos;ll do it later
                        </button>

                        <div className="pt-2 border-t border-border mt-4">
                            <a
                                href="/guide"
                                className="flex items-center justify-center gap-2 text-sm text-primary hover:underline py-2"
                                onClick={onClose}
                            >
                                <BookOpen className="h-4 w-4" />
                                Read the User Guide
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
