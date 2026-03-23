'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Mail, CheckCircle, AlertCircle } from 'lucide-react';

interface VerificationBannerProps {
    email: string;
    isVerified: boolean;
}

export default function VerificationBanner({ email, isVerified }: VerificationBannerProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Check if user dismissed the banner previously
        const dismissed = localStorage.getItem('verification_banner_dismissed');
        if (!isVerified && !dismissed) {
            setIsVisible(true);
        }
    }, [isVerified]);

    const handleDismiss = () => {
        setIsVisible(false);
        localStorage.setItem('verification_banner_dismissed', 'true');
    };

    const handleResend = async () => {
        setSending(true);
        setStatus('idle');
        setMessage('');

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                throw error;
            }

            setStatus('success');
            setMessage('Verification email sent! Please check your inbox.');
        } catch (error) {
            console.error('Error resending verification email:', error);
            setStatus('error');
            setMessage(error instanceof Error ? error.message : 'Failed to send email');
        } finally {
            setSending(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="bg-primary/10 border-b border-primary/20">
            <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between flex-wrap">
                    <div className="w-0 flex-1 flex items-center">
                        <span className="flex p-2 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-primary-foreground shadow-sm">
                            <Mail className="h-6 w-6 text-white" aria-hidden="true" />
                        </span>
                        <div className="ml-3 font-medium text-foreground truncate">
                            <span className="md:hidden">Verify your email address</span>
                            <span className="hidden md:inline">
                                Please verify your email address ({email}) to secure your account.
                            </span>
                        </div>
                    </div>
                    <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
                        {status === 'success' ? (
                            <div className="flex items-center text-emerald-600 dark:text-emerald-400 text-sm font-medium px-4 py-2">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {message}
                            </div>
                        ) : (
                            <button
                                onClick={handleResend}
                                disabled={sending}
                                className="flex items-center justify-center px-4 py-2 border border-border rounded-lg shadow-sm text-sm font-medium text-primary bg-card hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                            >
                                {sending ? 'Sending...' : 'Resend Verification Email'}
                            </button>
                        )}
                        {status === 'error' && (
                            <p className="mt-1 text-xs text-destructive text-center sm:text-left">
                                {message}
                            </p>
                        )}
                    </div>
                    <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
                        <button
                            type="button"
                            onClick={handleDismiss}
                            className="-mr-1 flex p-2 rounded-md hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:-mr-2"
                        >
                            <span className="sr-only">Dismiss</span>
                            <X className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
