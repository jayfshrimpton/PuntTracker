'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Shield, Send } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { GrantAccessModal } from '@/components/admin/GrantAccessModal';

interface UserDetail {
  profile: any;
  subscription: any;
  stats: {
    totalBets: number;
    betsPerMonth: Record<string, number>;
    usageStats: any[];
  };
  recentBets: any[];
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserDetail() {
      try {
        const response = await fetch(`/api/admin/users/${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user details');
        }
        const data = await response.json();
        setUserDetail(data);
      } catch (error) {
        console.error('Error fetching user detail:', error);
        showToast('Failed to load user details', 'error');
      } finally {
        setIsLoading(false);
      }
    }

    if (userId) {
      fetchUserDetail();
    }
  }, [userId]);

  if (isLoading || !userDetail) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600 dark:text-gray-400">Loading user details...</div>
      </div>
    );
  }

  const { profile, subscription, stats, recentBets } = userDetail;

  const handleSendEmail = async (emailType: 'password_reset' | 'verification' | 'welcome') => {
    setSendingEmail(emailType);
    try {
      const response = await fetch('/api/admin/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          emailType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(data.message || 'Email sent successfully', 'success');
      } else {
        showToast(data.error || 'Failed to send email', 'error');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      showToast('An error occurred while sending email', 'error');
    } finally {
      setSendingEmail(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {profile.full_name || 'User'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{profile.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
              <p className="text-gray-900 dark:text-white">{profile.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</label>
              <p className="text-gray-900 dark:text-white">{profile.full_name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Joined</label>
              <p className="text-gray-900 dark:text-white">
                {new Date(profile.created_at).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Tier</label>
              <p className="text-gray-900 dark:text-white">
                {subscription?.tier?.toUpperCase() || 'FREE'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
              <p className="text-gray-900 dark:text-white">
                {subscription?.status || 'active'}
              </p>
            </div>
            <Button
              onClick={() => setShowGrantModal(true)}
              className="w-full"
            >
              <Shield className="h-4 w-4 mr-2" />
              Grant/Update Access
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Send Email</CardTitle>
          <CardDescription>Send authentication or welcome emails to this user</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => handleSendEmail('password_reset')}
              disabled={sendingEmail !== null}
              className="flex items-center justify-center"
            >
              {sendingEmail === 'password_reset' ? (
                <>Sending...</>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Password Reset
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSendEmail('verification')}
              disabled={sendingEmail !== null}
              className="flex items-center justify-center"
            >
              {sendingEmail === 'verification' ? (
                <>Sending...</>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Verification Email
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSendEmail('welcome')}
              disabled={sendingEmail !== null}
              className="flex items-center justify-center"
            >
              {sendingEmail === 'welcome' ? (
                <>Sending...</>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Welcome Email
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Bets</label>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalBets}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Bets This Month</label>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Object.values(stats.betsPerMonth)[0] || 0}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Usage Stats</label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stats.usageStats.length} periods tracked
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bets</CardTitle>
          <CardDescription>Last 20 bets</CardDescription>
        </CardHeader>
        <CardContent>
          {recentBets.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No bets found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-400">Date</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-400">Race</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-400">Horse</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-400">Stake</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 dark:text-gray-400">P/L</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBets.map((bet) => (
                    <tr
                      key={bet.id}
                      className="border-b border-gray-100 dark:border-gray-800"
                    >
                      <td className="p-4 text-sm text-gray-900 dark:text-white">
                        {new Date(bet.bet_date).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm text-gray-900 dark:text-white">{bet.race_name}</td>
                      <td className="p-4 text-sm text-gray-900 dark:text-white">{bet.horse_name}</td>
                      <td className="p-4 text-sm text-gray-900 dark:text-white">${bet.stake}</td>
                      <td className={`p-4 text-sm font-medium ${
                        bet.profit_loss >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        ${bet.profit_loss || '0.00'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {showGrantModal && userDetail && (
        <GrantAccessModal
          user={{
            id: userId,
            email: profile.email,
            name: profile.full_name || 'User',
            tier: subscription?.tier || 'free',
            status: subscription?.status || 'active',
            specialPricing: subscription?.special_pricing || null,
            currentPrice: subscription?.current_price || null,
          }}
          onClose={() => setShowGrantModal(false)}
          onSuccess={() => {
            setShowGrantModal(false);
            // Refresh user detail
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}

