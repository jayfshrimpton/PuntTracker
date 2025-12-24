'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { showToast } from '@/lib/toast';

interface GrantAccessByEmailModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function GrantAccessByEmailModal({ onClose, onSuccess }: GrantAccessByEmailModalProps) {
  const [email, setEmail] = useState('');
  const [tier, setTier] = useState<'free' | 'pro' | 'elite'>('pro');
  const [specialPricing, setSpecialPricing] = useState<string>('none');
  const [customPrice, setCustomPrice] = useState<string>('');
  const [reason, setReason] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      showToast('Email is required', 'error');
      return;
    }

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
          email: email.trim(),
          tier,
          specialPricing: specialPricing === 'none' ? undefined : specialPricing,
          customPrice: customPrice ? parseFloat(customPrice) : undefined,
          reason,
          expiryDate: expiryDate || undefined,
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
            <CardTitle>Grant Access by Email</CardTitle>
            <CardDescription>
              Grant access to a user by their email address
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="email"
                label="User Email *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                The user will be found in Supabase auth.users. A profile will be created if it doesn&apos;t exist.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Tier *
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
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Special Pricing Type
              </label>
              <select
                className="w-full h-11 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value={specialPricing}
                onChange={(e) => setSpecialPricing(e.target.value)}
              >
                <option value="none">None</option>
                <option value="beta_tester">Beta Tester</option>
                <option value="founding_member">Founding Member</option>
                <option value="influencer">Influencer</option>
              </select>
            </div>

            <div>
              <Input
                type="number"
                label="Custom Price (optional)"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                placeholder="e.g., 19.99"
                step="0.01"
                min="0"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Leave empty to use default tier pricing
              </p>
            </div>

            <div>
              <Input
                type="date"
                label="Expiry Date (optional)"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                For temporary access grants
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Reason for Grant *
              </label>
              <textarea
                className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for granting access..."
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isLoading} disabled={isLoading}>
                Grant Access
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}



