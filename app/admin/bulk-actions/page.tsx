'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/button';
import { Zap, Crown, Shield, AlertTriangle } from 'lucide-react';
import { showToast } from '@/lib/toast';

export default function AdminBulkActionsPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [foundingMemberSpots, setFoundingMemberSpots] = useState('100');
  const [foundingMemberCutoff, setFoundingMemberCutoff] = useState('2024-01-01');
  const [revokeUserId, setRevokeUserId] = useState('');
  const [revokeTier, setRevokeTier] = useState('free');
  const [revokeReason, setRevokeReason] = useState('');

  const handleBulkAction = async (action: string, params?: any) => {
    setIsLoading(action);

    try {
      const response = await fetch('/api/admin/bulk-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          ...params,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(data.message || 'Action completed successfully', 'success');
      } else {
        showToast(data.error || 'Action failed', 'error');
      }
    } catch (error) {
      console.error('Bulk action error:', error);
      showToast('An error occurred', 'error');
    } finally {
      setIsLoading(null);
    }
  };

  const handleGrantBetaTestersPro = () => {
    if (!confirm('Are you sure you want to grant all beta testers Pro access? This action cannot be undone.')) {
      return;
    }
    handleBulkAction('grant_beta_testers_pro');
  };

  const handleLockFoundingMembers = () => {
    if (!confirm(`Are you sure you want to lock founding member pricing for up to ${foundingMemberSpots} users? This action cannot be undone.`)) {
      return;
    }
    handleBulkAction('lock_founding_members', {
      maxSpots: parseInt(foundingMemberSpots),
      cutoffDate: foundingMemberCutoff,
    });
  };

  const handleRevokeAccess = () => {
    if (!revokeUserId || !revokeReason) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    if (!confirm(`Are you sure you want to revoke access for user ${revokeUserId}? This action cannot be undone.`)) {
      return;
    }

    handleBulkAction('revoke_access', {
      userId: revokeUserId,
      newTier: revokeTier,
      reason: revokeReason,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bulk Actions</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Perform bulk operations on users</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-600" />
            <CardTitle>Grant All Beta Testers Pro Access</CardTitle>
          </div>
          <CardDescription>
            Upgrade all users with beta_tester special pricing to Pro tier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            This will upgrade all beta testers from Free to Pro tier. They will keep their beta_tester special pricing.
          </p>
          <Button
            onClick={handleGrantBetaTestersPro}
            isLoading={isLoading === 'grant_beta_testers_pro'}
            disabled={!!isLoading}
            variant="outline"
          >
            <Zap className="h-4 w-4 mr-2" />
            Grant All Beta Testers Pro Access
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-indigo-600" />
            <CardTitle>Lock Founding Member Pricing</CardTitle>
          </div>
          <CardDescription>
            Grant founding member pricing to early users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Input
                type="number"
                label="Number of Spots"
                value={foundingMemberSpots}
                onChange={(e) => setFoundingMemberSpots(e.target.value)}
                placeholder="100"
                min="1"
              />
            </div>
            <div>
              <Input
                type="date"
                label="Cutoff Date"
                value={foundingMemberCutoff}
                onChange={(e) => setFoundingMemberCutoff(e.target.value)}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Users who signed up before this date will be eligible
              </p>
            </div>
            <Button
              onClick={handleLockFoundingMembers}
              isLoading={isLoading === 'lock_founding_members'}
              disabled={!!isLoading}
              variant="outline"
            >
              <Crown className="h-4 w-4 mr-2" />
              Lock Founding Member Pricing
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-red-600" />
            <CardTitle>Revoke Access</CardTitle>
          </div>
          <CardDescription>
            Downgrade a user&apos;s subscription tier
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Input
                type="text"
                label="User ID or Email"
                value={revokeUserId}
                onChange={(e) => setRevokeUserId(e.target.value)}
                placeholder="Enter user ID or email"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                New Tier *
              </label>
              <select
                className="w-full h-11 rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value={revokeTier}
                onChange={(e) => setRevokeTier(e.target.value)}
                required
              >
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="elite">Elite</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Reason *
              </label>
              <textarea
                className="w-full min-h-[100px] rounded-lg border border-input bg-background px-3 py-2 text-sm"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                placeholder="Enter reason for revoking access..."
                required
              />
            </div>
            <div className="flex items-center space-x-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                This action will immediately downgrade the user&apos;s subscription. Make sure you have a valid reason.
              </p>
            </div>
            <Button
              onClick={handleRevokeAccess}
              isLoading={isLoading === 'revoke_access'}
              disabled={!!isLoading || !revokeUserId || !revokeReason}
              variant="destructive"
            >
              <Shield className="h-4 w-4 mr-2" />
              Revoke Access
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

