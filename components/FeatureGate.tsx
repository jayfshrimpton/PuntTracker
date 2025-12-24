'use client';

import { ReactNode, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { UpgradePrompt, SubscriptionTier } from './UpgradePrompt';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureGateProps {
  requiredTier: SubscriptionTier | SubscriptionTier[];
  children: ReactNode;
  fallback?: ReactNode;
  showLockedState?: boolean;
  featureName?: string;
  className?: string;
  upgradeUrl?: string;
}

interface SubscriptionData {
  tier: SubscriptionTier;
  status: string;
  isActive: boolean;
}

export function FeatureGate({
  requiredTier,
  children,
  fallback,
  showLockedState = true,
  featureName,
  className,
  upgradeUrl = '/pricing',
}: FeatureGateProps) {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setSubscription({ tier: 'free', status: 'none', isActive: false });
          setLoading(false);
          return;
        }

        // Fetch subscription from API
        const response = await fetch('/api/check-subscription');
        if (response.ok) {
          const data = await response.json();
          setSubscription({
            tier: data.tier || 'free',
            status: data.status || 'active',
            isActive: data.isActive !== false,
          });
        } else {
          setSubscription({ tier: 'free', status: 'active', isActive: true });
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        setSubscription({ tier: 'free', status: 'active', isActive: true });
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, []);

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!subscription) {
    return null;
  }

  const allowedTiers = Array.isArray(requiredTier) ? requiredTier : [requiredTier];
  const hasAccess = subscription.isActive && allowedTiers.includes(subscription.tier);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showLockedState) {
    const minRequiredTier = Array.isArray(requiredTier)
      ? requiredTier[0]
      : requiredTier;

    return (
      <div className={cn('relative', className)}>
        <div className="opacity-50 pointer-events-none select-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg">
          <div className="text-center space-y-4 p-6">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Lock className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Feature Locked</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {featureName || 'This feature'} requires {minRequiredTier === 'pro' ? 'Pro' : 'Elite'} tier
              </p>
              <a
                href={upgradeUrl}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
              >
                Upgrade Now
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <UpgradePrompt
      featureName={featureName || 'This feature'}
      requiredTier={Array.isArray(requiredTier) ? requiredTier[0] : requiredTier}
      currentTier={subscription.tier}
      upgradeUrl={upgradeUrl}
      variant="compact"
    />
  );
}

