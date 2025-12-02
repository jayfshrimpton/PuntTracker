'use client';

import { useState } from 'react';
import { Check, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const plans = [
    {
        name: 'Free',
        price: '$0',
        description: 'Perfect for casual punters',
        features: [
            'Track up to 50 bets',
            'Basic performance stats',
            'Manual bet entry',
            'Community support',
        ],
        priceId: null,
    },
    {
        name: 'Pro',
        price: '$15',
        period: '/month',
        description: 'For serious bettors',
        features: [
            'Unlimited bets',
            'Advanced analytics',
            'Priority support',
        ],
        // IMPORTANT: Use Price ID (starts with 'price_'), NOT Product ID (starts with 'prod_')
        // Get this from Stripe Dashboard → Products → [Your Product] → Pricing → Copy Price ID
        priceId: 'price_1SZVqG7Uv9v0RZydSebiiCsw', // Replace with actual Price ID from Stripe
        popular: true,
    },
    {
        name: 'Elite',
        price: '$25',
        period: '/month',
        description: 'Best value for pros',
        features: [
            'All Pro features',
            'AI Insights',
            'CSV Import/Export',
            'Early access to new features',
            'Exclusive discord role',
        ],
        // IMPORTANT: Use Price ID (starts with 'price_'), NOT Product ID (starts with 'prod_')
        // Get this from Stripe Dashboard → Products → [Your Product] → Pricing → Copy Price ID
        priceId: 'price_1SZVQM7Uv9v0RZydzVRWIcPs', // Replace with actual Price ID from Stripe
    },
];

export default function PricingPage() {
    const [loading, setLoading] = useState<string | null>(null);
    const router = useRouter();
    const { toast } = useToast();

    // Check if payments are enabled (client-side check)
    const paymentsEnabled = process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true';

    const handleSubscribe = async (priceId: string | null) => {
        if (!priceId) {
            router.push('/dashboard');
            return;
        }

        if (!paymentsEnabled) {
            toast({
                title: 'Payments Disabled',
                description: 'Payments are currently disabled. Please contact support for more information.',
                variant: 'destructive',
            });
            return;
        }

        setLoading(priceId);

        try {
            const response = await fetch('/api/stripe/create-checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ priceId }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Provide more helpful error messages
                let errorMessage = data.message || 'Something went wrong';
                if (errorMessage.includes('No such price') || errorMessage.includes('Price ID not found')) {
                    errorMessage = `The price ID "${priceId}" was not found in your Stripe account. Please verify:\n\n1. You're using the correct Stripe account (test vs live)\n2. The price ID exists in that account\n3. The price is active (not archived)\n\nCheck your Stripe Dashboard → Products to find the correct Price ID.`;
                }
                throw new Error(errorMessage);
            }

            window.location.href = data.url;
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-background py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto text-center">
                <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">
                    Simple, transparent pricing
                </h2>
                <p className="mt-4 text-xl text-muted-foreground">
                    Choose the plan that fits your betting style.
                </p>
                {!paymentsEnabled && (
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg text-sm text-muted-foreground">
                        <Lock className="h-4 w-4" />
                        <span>Paid plans are coming December 20th. Free plan is available now!</span>
                    </div>
                )}
            </div>

            <div className="mt-16 grid gap-8 lg:grid-cols-3 lg:gap-x-8 max-w-7xl mx-auto">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={`relative flex flex-col rounded-2xl border p-8 shadow-sm ${plan.popular
                            ? 'border-primary shadow-lg scale-105 z-10'
                            : 'border-border'
                            } bg-card`}
                    >
                        {plan.popular && (
                            <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-primary px-3 py-1 text-center text-sm font-medium text-primary-foreground">
                                Most Popular
                            </div>
                        )}
                        <div className="mb-8">
                            <h3 className="text-lg font-medium text-foreground">{plan.name}</h3>
                            <p className="mt-4 text-sm text-muted-foreground">
                                {plan.description}
                            </p>
                            <div className="mt-8 flex items-baseline text-foreground">
                                <span className="text-4xl font-extrabold tracking-tight">
                                    {plan.price}
                                </span>
                                {plan.period && (
                                    <span className="text-base font-medium text-muted-foreground">
                                        {plan.period}
                                    </span>
                                )}
                            </div>
                        </div>
                        <ul className="mb-8 space-y-4 flex-1">
                            {plan.features.map((feature) => (
                                <li key={feature} className="flex items-start">
                                    <Check className="h-5 w-5 text-primary shrink-0" />
                                    <span className="ml-3 text-sm text-muted-foreground">
                                        {feature}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <Button
                            onClick={() => handleSubscribe(plan.priceId)}
                            disabled={loading === plan.priceId || (!!plan.priceId && !paymentsEnabled)}
                            className={`w-full ${plan.popular ? 'bg-primary text-primary-foreground' : ''
                                }`}
                            variant={plan.popular ? 'primary' : 'outline'}
                        >
                            {loading === plan.priceId
                                ? 'Processing...'
                                : plan.priceId && !paymentsEnabled
                                    ? (
                                        <>
                                            <Lock className="h-4 w-4 mr-2" />
                                            Coming Dec 20th
                                        </>
                                    )
                                    : plan.priceId
                                        ? 'Subscribe'
                                        : 'Get Started'}
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}
