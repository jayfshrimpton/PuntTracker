'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { fetchProfile, updateProfile, type Profile } from '@/lib/api';
import { showToast } from '@/lib/toast';
import { User, Mail, Bell, Save, Loader2, Wallet, Target, DollarSign, Lock, CheckCircle } from 'lucide-react';
import { useCurrency } from '@/components/CurrencyContext';
import { useRouter, useSearchParams } from 'next/navigation';

// Assuming ProfileUpdate is a type derived from Profile or separately defined in '@/lib/api'
// For this edit, we'll assume it's available or compatible with Profile.
type ProfileUpdate = Partial<Profile> & { unit_size?: number | null };

export default function SettingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { mode, setUnitSize: setGlobalUnitSize } = useCurrency();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [unitSize, setUnitSize] = useState<string>('10');
  const [userEmail, setUserEmail] = useState<string>('');
  
  // Password reset state
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [passwordResetData, setPasswordResetData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState(false);
  const [passwordResetError, setPasswordResetError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email_notifications_enabled: true,
    // Bankroll management
    bankroll_starting_amount: '',
    bankroll_current_amount: '',
    bankroll_tracking_enabled: false,
    // Goals and targets
    monthly_profit_target: '',
    monthly_roi_target: '',
    strike_rate_target: '',
    annual_profit_target: '',
    goals_enabled: false,
  });

  useEffect(() => {
    loadProfile();
  }, []);

  // Check for password recovery session
  useEffect(() => {
    const checkForRecoverySession = async () => {
      if (typeof window === 'undefined') return;
      
      const hash = window.location.hash;
      const search = window.location.search;
      
      // Check for recovery hash fragments or query params
      const hasRecoveryHash = hash && hash.includes('access_token') && hash.includes('type=recovery');
      const hasRecoveryParams = search.includes('token_hash') && search.includes('type=recovery');
      
      if (hasRecoveryHash || hasRecoveryParams) {
        // Check if we have a recovery session
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Set up listener for PASSWORD_RECOVERY event
          const { data } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
              setShowPasswordReset(true);
              // Scroll to password reset section
              setTimeout(() => {
                document.getElementById('password-reset')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }
          });
          
          // Also check after a delay
          setTimeout(async () => {
            const { data: { session: currentSession } } = await supabase.auth.getSession();
            if (currentSession) {
              // If we have a session and recovery params, show password reset
              setShowPasswordReset(true);
              setTimeout(() => {
                document.getElementById('password-reset')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }
          }, 500);
          
          return () => {
            data?.subscription?.unsubscribe();
          };
        }
      }
    };
    
    checkForRecoverySession();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email) {
        setUserEmail(user.email);
      }

      const { data, error } = await fetchProfile();

      if (error) {
        showToast('Failed to load profile', 'error');
        return;
      }

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          email_notifications_enabled: data.email_notifications_enabled ?? true,
          // Bankroll management
          bankroll_starting_amount: data.bankroll_starting_amount?.toString() || '',
          bankroll_current_amount: data.bankroll_current_amount?.toString() || '',
          bankroll_tracking_enabled: data.bankroll_tracking_enabled ?? false,
          // Goals and targets
          monthly_profit_target: data.monthly_profit_target?.toString() || '',
          monthly_roi_target: data.monthly_roi_target?.toString() || '',
          strike_rate_target: data.strike_rate_target?.toString() || '',
          annual_profit_target: data.annual_profit_target?.toString() || '',
          goals_enabled: data.goals_enabled ?? false,
        });
        if (data.unit_size) setUnitSize(data.unit_size.toString());
      }
    } catch (err) {
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordResetError(null);

    if (passwordResetData.password !== passwordResetData.confirmPassword) {
      setPasswordResetError('Passwords do not match');
      return;
    }

    if (passwordResetData.password.length < 6) {
      setPasswordResetError('Password must be at least 6 characters');
      return;
    }

    setPasswordResetLoading(true);

    try {
      const supabase = createClient();
      
      // Update the user's password
      // This will only work if we have a valid recovery session
      const { error } = await supabase.auth.updateUser({
        password: passwordResetData.password,
      });

      if (error) {
        setPasswordResetError(error.message || 'Failed to update password. Please request a new reset link.');
        setPasswordResetLoading(false);
        return;
      }

      setPasswordResetSuccess(true);
      setPasswordResetData({ password: '', confirmPassword: '' });
      
      // Clear the hash/query params from URL
      window.history.replaceState(null, '', '/settings');
      
      showToast('Password updated successfully', 'success');
      
      // Hide the form after 3 seconds
      setTimeout(() => {
        setShowPasswordReset(false);
        setPasswordResetSuccess(false);
      }, 3000);
    } catch (err) {
      setPasswordResetError('An unexpected error occurred');
    } finally {
      setPasswordResetLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updates: ProfileUpdate = {
        full_name: formData.full_name || null,
        email_notifications_enabled: formData.email_notifications_enabled,
        // Bankroll management
        bankroll_starting_amount: formData.bankroll_starting_amount ? parseFloat(formData.bankroll_starting_amount) : null,
        bankroll_current_amount: formData.bankroll_current_amount ? parseFloat(formData.bankroll_current_amount) : null,
        bankroll_tracking_enabled: formData.bankroll_tracking_enabled,
        // Goals and targets
        monthly_profit_target: formData.monthly_profit_target ? parseFloat(formData.monthly_profit_target) : null,
        monthly_roi_target: formData.monthly_roi_target ? parseFloat(formData.monthly_roi_target) : null,
        strike_rate_target: formData.strike_rate_target ? parseFloat(formData.strike_rate_target) : null,
        annual_profit_target: formData.annual_profit_target ? parseFloat(formData.annual_profit_target) : null,
        goals_enabled: formData.goals_enabled,
        unit_size: parseFloat(unitSize) || 10,
        display_units: mode === 'units',
      };
      const { data, error } = await updateProfile(updates);

      if (error) {
        showToast('Failed to update settings', 'error');
        return;
      }

      if (data) {
        setProfile(data);
        setGlobalUnitSize(data.unit_size);
        showToast('Settings saved successfully', 'success');
      }
    } catch (err) {
      showToast('Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
          Settings
        </h1>
        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
          Manage your profile, email preferences, bankroll, and goals
        </p>
      </div>

      {/* Password Reset Section - Show when recovery session detected */}
      {showPasswordReset && (
        <div id="password-reset" className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl shadow-lg p-6 border-2 border-blue-500 dark:border-blue-400">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Lock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Reset Your Password
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                You&apos;ve clicked a password reset link. Please enter your new password below.
              </p>
            </div>
          </div>

          {passwordResetSuccess ? (
            <div className="flex items-center gap-3 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                Password updated successfully!
              </p>
            </div>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              {passwordResetError && (
                <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-200">{passwordResetError}</p>
                </div>
              )}

              <div>
                <label
                  htmlFor="new_password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="new_password"
                  value={passwordResetData.password}
                  onChange={(e) =>
                    setPasswordResetData({ ...passwordResetData, password: e.target.value })
                  }
                  placeholder="Enter new password"
                  required
                  minLength={6}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder:text-gray-500 transition-colors"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm_password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirm_password"
                  value={passwordResetData.confirmPassword}
                  onChange={(e) =>
                    setPasswordResetData({ ...passwordResetData, confirmPassword: e.target.value })
                  }
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder:text-gray-500 transition-colors"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={passwordResetLoading}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                >
                  {passwordResetLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Profile Information
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Update your personal information
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={userEmail}
                  disabled
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Email cannot be changed here. Contact support if you need to update your email.
              </p>
            </div>

            <div>
              <label
                htmlFor="full_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Full Name
              </label>
              <input
                type="text"
                id="full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                placeholder="Enter your full name"
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder:text-gray-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Email Preferences Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Email Preferences
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Control how you receive email notifications
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex-1">
                <label
                  htmlFor="email_notifications"
                  className="block text-sm font-medium text-gray-900 dark:text-white mb-1"
                >
                  Monthly Summary Emails
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Receive monthly summaries of your betting performance
                </p>
              </div>
              <div className="ml-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="email_notifications"
                    checked={formData.email_notifications_enabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        email_notifications_enabled: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Bankroll Management Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Wallet className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Bankroll Management
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Track and manage your betting bankroll
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-4">
              <div className="flex-1">
                <label
                  htmlFor="bankroll_tracking"
                  className="block text-sm font-medium text-gray-900 dark:text-white mb-1"
                >
                  Enable Bankroll Tracking
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Track your bankroll to monitor your betting performance
                </p>
              </div>
              <div className="ml-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="bankroll_tracking"
                    checked={formData.bankroll_tracking_enabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankroll_tracking_enabled: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                </label>
              </div>
            </div>

            {formData.bankroll_tracking_enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="bankroll_starting_amount"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Starting Bankroll ($)
                  </label>
                  <input
                    type="number"
                    id="bankroll_starting_amount"
                    step="0.01"
                    min="0"
                    value={formData.bankroll_starting_amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankroll_starting_amount: e.target.value,
                      })
                    }
                    placeholder="0.00"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder:text-gray-500 transition-colors"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Your initial bankroll amount
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="bankroll_current_amount"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Current Bankroll ($)
                  </label>
                  <input
                    type="number"
                    id="bankroll_current_amount"
                    step="0.01"
                    min="0"
                    value={formData.bankroll_current_amount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bankroll_current_amount: e.target.value,
                      })
                    }
                    placeholder="0.00"
                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder:text-gray-500 transition-colors"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Your current bankroll amount
                  </p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="unitSize" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Unit Size ($)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="unitSize"
                      type="number"
                      value={unitSize}
                      onChange={(e) => setUnitSize(e.target.value)}
                      placeholder="10"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder:text-gray-500 transition-colors"
                    />
                  </div>
                  {formData.bankroll_starting_amount && !isNaN(parseFloat(formData.bankroll_starting_amount)) && (
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setUnitSize((parseFloat(formData.bankroll_starting_amount) * 0.01).toFixed(2))}
                        className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        1% (${(parseFloat(formData.bankroll_starting_amount) * 0.01).toFixed(0)})
                      </button>
                      <button
                        type="button"
                        onClick={() => setUnitSize((parseFloat(formData.bankroll_starting_amount) * 0.02).toFixed(2))}
                        className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        2% (${(parseFloat(formData.bankroll_starting_amount) * 0.02).toFixed(0)})
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Recommended: 1-2% of your total bankroll.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Goals and Targets Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Goals and Targets
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Set performance targets to track your progress
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-4">
              <div className="flex-1">
                <label
                  htmlFor="goals_enabled"
                  className="block text-sm font-medium text-gray-900 dark:text-white mb-1"
                >
                  Enable Goals Tracking
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Set and track your betting performance goals
                </p>
              </div>
              <div className="ml-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="goals_enabled"
                    checked={formData.goals_enabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        goals_enabled: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                </label>
              </div>
            </div>

            {formData.goals_enabled && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="monthly_profit_target"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Monthly Profit Target ($)
                    </label>
                    <input
                      type="number"
                      id="monthly_profit_target"
                      step="0.01"
                      value={formData.monthly_profit_target}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          monthly_profit_target: e.target.value,
                        })
                      }
                      placeholder="0.00"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder:text-gray-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="annual_profit_target"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Annual Profit Target ($)
                    </label>
                    <input
                      type="number"
                      id="annual_profit_target"
                      step="0.01"
                      value={formData.annual_profit_target}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          annual_profit_target: e.target.value,
                        })
                      }
                      placeholder="0.00"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder:text-gray-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="monthly_roi_target"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Monthly ROI Target (%)
                    </label>
                    <input
                      type="number"
                      id="monthly_roi_target"
                      step="0.1"
                      value={formData.monthly_roi_target}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          monthly_roi_target: e.target.value,
                        })
                      }
                      placeholder="0.0"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder:text-gray-500 transition-colors"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Target return on investment percentage
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="strike_rate_target"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Strike Rate Target (%)
                    </label>
                    <input
                      type="number"
                      id="strike_rate_target"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.strike_rate_target}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          strike_rate_target: e.target.value,
                        })
                      }
                      placeholder="0.0"
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder:text-gray-500 transition-colors"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Target win percentage
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

