'use client';

import Link from 'next/link';
import { Lock, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SubscriptionTier = 'free' | 'pro' | 'elite';

interface UpgradePromptProps {
  featureName: string;
  requiredTier: SubscriptionTier;
  currentTier?: SubscriptionTier;
  upgradeUrl?: string;
  className?: string;
  variant?: 'default' | 'compact' | 'inline';
  message?: string;
  currentUsage?: number;
  limit?: number;
}

const tierNames: Record<SubscriptionTier, string> = {
  free: 'Free',
  pro: 'Pro',
  elite: 'Elite',
};

const tierDescriptions: Record<SubscriptionTier, string> = {
  free: 'Basic features for casual punters',
  pro: 'Advanced analytics and unlimited bets',
  elite: 'Everything in Pro plus unlimited AI insights',
};

export function UpgradePrompt({
  featureName,
  requiredTier,
  currentTier = 'free',
  upgradeUrl = '/pricing',
  className,
  variant = 'default',
  message,
  currentUsage,
  limit,
}: UpgradePromptProps) {
  const isLimitExceeded = currentUsage !== undefined && limit !== undefined && currentUsage >= limit;

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}>
        <Lock className="h-4 w-4" />
        <span>
          {message || `${featureName} requires ${tierNames[requiredTier]} tier`}
        </span>
        <Link
          href={upgradeUrl}
          className="text-primary hover:underline font-medium inline-flex items-center gap-1"
        >
          Upgrade
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'rounded-lg border border-border bg-card p-4 space-y-3',
          className
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <Lock className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm">Upgrade Required</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {message ||
                (isLimitExceeded
                  ? `You've reached your limit. Upgrade to ${tierNames[requiredTier]} for ${featureName}.`
                  : `${featureName} is available with ${tierNames[requiredTier]} tier.`)}
            </p>
            {isLimitExceeded && currentUsage !== undefined && limit !== undefined && (
              <p className="text-xs text-muted-foreground mt-1">
                Current usage: {currentUsage} / {limit}
              </p>
            )}
          </div>
        </div>
        <Link
          href={upgradeUrl}
          className="inline-flex items-center justify-center gap-2 w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
        >
          <Sparkles className="h-4 w-4" />
          Upgrade to {tierNames[requiredTier]}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        'rounded-xl border-2 border-dashed border-border bg-card/50 p-8 text-center space-y-4',
        className
      )}
    >
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
          <Lock className="h-8 w-8 text-white" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Upgrade to {tierNames[requiredTier]}</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          {message ||
            (isLimitExceeded
              ? `You've reached your ${currentTier === 'free' ? 'monthly' : 'daily'} limit for ${featureName}. Upgrade to ${tierNames[requiredTier]} to continue.`
              : `${featureName} is available with a ${tierNames[requiredTier]} subscription.`)}
        </p>
        {isLimitExceeded && currentUsage !== undefined && limit !== undefined && (
          <div className="pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-sm">
              <span className="text-muted-foreground">Usage:</span>
              <span className="font-semibold">
                {currentUsage} / {limit}
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="pt-4">
        <Link
          href={upgradeUrl}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl"
        >
          <Sparkles className="h-5 w-5" />
          Upgrade to {tierNames[requiredTier]}
          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
      <div className="pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">
          {tierDescriptions[requiredTier]}
        </p>
      </div>
    </div>
  );
}

