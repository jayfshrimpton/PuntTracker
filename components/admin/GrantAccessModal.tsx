'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { showToast } from '@/lib/toast';

interface User {
  id: string;
  email: string;
  name: string;
  tier: 'free' | 'pro' | 'elite';
  status: string;
  specialPricing: string | null;
  currentPrice: number | null;
}

interface GrantAccessModalProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}

export function GrantAccessModal({ user, onClose, onSuccess }: GrantAccessModalProps) {
  const [tier, setTier] = useState<'free' | 'pro' | 'elite'>(user.tier);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      showToast('Reason is required', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/grant-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          tier,
          reason,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('Access granted successfully', 'success');
        onSuccess();
      } else {
        showToast(data.error || 'Failed to grant access', 'error');
      }
    } catch (error) {
      console.error('Error granting access:', error);
      showToast('An error occurred', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Grant Access</CardTitle>
            <CardDescription>
              Update subscription for {user.email}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Current Tier
              </label>
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400">
                {user.tier.toUpperCase()}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                New Tier *
              </label>
              <select
                className="w-full h-11 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value={tier}
                onChange={(e) => setTier(e.target.value as 'free' | 'pro' | 'elite')}
                required
              >
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="elite">Elite</option>
              </select>
            </div>

            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Note: Pricing and special pricing are managed in Stripe. This only grants free access to tier features.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Reason for Change *
              </label>
              <textarea
                className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for this change..."
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading} disabled={isLoading}>
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

