import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { getSubscription } from '@/utils/subscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PAYMENTS_ENABLED } from '@/lib/stripe/stripe';
import { Lock, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default async function SubscriptionPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const subscription = await getSubscription();
    const paymentsEnabled = PAYMENTS_ENABLED;

    async function manageSubscription() {
        'use server';
        // Lazy import stripe to avoid initialization during build
        const { stripe } = await import('@/lib/stripe/stripe');

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            redirect('/login');
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('stripe_customer_id')
            .eq('id', user.id)
            .single();

        if (profile?.stripe_customer_id) {
            const session = await stripe.billingPortal.sessions.create({
                customer: profile.stripe_customer_id,
                return_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscription`,
            });
            redirect(session.url);
        }
    }

    // Show "coming soon" message if payments are disabled
    if (!paymentsEnabled) {
        return (
            <div className="container mx-auto py-10">
                <Card className="max-w-2xl mx-auto">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-muted rounded-lg">
                                <Lock className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                                <CardTitle>Subscription Plans</CardTitle>
                                <CardDescription>
                                    Paid plans are coming soon!
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-center py-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4">
                                <CreditCard className="h-8 w-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Plans Coming Soon</h3>
                            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                                We&apos;re working hard to bring you premium subscription plans with advanced features.
                                Stay tuned for updates!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Button variant="outline" asChild>
                                    <Link href="/pricing">
                                        View Pricing Plans
                                    </Link>
                                </Button>
                                <Button asChild>
                                    <Link href="/dashboard">
                                        Back to Dashboard
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <div className="border-t pt-6">
                            <div className="flex justify-between items-center p-4 border rounded-lg bg-muted/50">
                                <div>
                                    <p className="font-medium">Current Plan</p>
                                    <p className="text-sm text-muted-foreground">
                                        Free Plan
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium">Status</p>
                                    <p className="text-sm text-muted-foreground">
                                        Active
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Show normal subscription management when payments are enabled
    return (
        <div className="container mx-auto py-10">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle>Subscription Management</CardTitle>
                    <CardDescription>
                        Manage your subscription and billing details.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                            <p className="font-medium">Current Plan</p>
                            <p className="text-sm text-muted-foreground capitalize">
                                {subscription ? 'Pro Plan' : 'Free Plan'}
                                {/* We should map price ID to plan name properly */}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="font-medium">Status</p>
                            <p className="text-sm text-muted-foreground capitalize">
                                {subscription?.status || 'Active'}
                            </p>
                        </div>
                    </div>

                    {subscription && (
                        <div className="flex justify-between items-center p-4 border rounded-lg">
                            <div>
                                <p className="font-medium">Billing Period</p>
                                <p className="text-sm text-muted-foreground">
                                    Ends on {new Date(subscription.current_period_end).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        {subscription ? (
                            <form action={manageSubscription}>
                                <Button type="submit" className="w-full">
                                    Manage Subscription
                                </Button>
                            </form>
                        ) : (
                            <Button className="w-full" asChild>
                                <Link href="/pricing">
                                    Upgrade Plan
                                </Link>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
