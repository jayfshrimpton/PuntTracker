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
        <div className="bg-blue-50 dark:bg-blue-900/30 border-b border-blue-100 dark:border-blue-800">
            <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between flex-wrap">
                    <div className="w-0 flex-1 flex items-center">
                        <span className="flex p-2 rounded-lg bg-blue-600 dark:bg-blue-500">
                            <Mail className="h-6 w-6 text-white" aria-hidden="true" />
                        </span>
                        <div className="ml-3 font-medium text-blue-900 dark:text-blue-100 truncate">
                            <span className="md:hidden">Verify your email address</span>
                            <span className="hidden md:inline">
                                Please verify your email address ({email}) to secure your account.
                            </span>
                        </div>
                    </div>
                    <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
                        {status === 'success' ? (
                            <div className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium px-4 py-2">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {message}
                            </div>
                        ) : (
                            <button
                                onClick={handleResend}
                                disabled={sending}
                                className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                            >
                                {sending ? 'Sending...' : 'Resend Verification Email'}
                            </button>
                        )}
                        {status === 'error' && (
                            <p className="mt-1 text-xs text-red-600 dark:text-red-400 text-center sm:text-left">
                                {message}
                            </p>
                        )}
                    </div>
                    <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-3">
                        <button
                            type="button"
                            onClick={handleDismiss}
                            className="-mr-1 flex p-2 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-white sm:-mr-2"
                        >
                            <span className="sr-only">Dismiss</span>
                            <X className="h-6 w-6 text-blue-600 dark:text-blue-300" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
