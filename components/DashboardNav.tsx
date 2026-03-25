'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Home, PlusCircle, Settings, UserCog, Coins, DollarSign, BookOpen, LogOut, Sparkles, CreditCard, MessageSquare, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import ThemeToggle from '@/components/ThemeToggle';
import { useCurrency } from '@/components/CurrencyContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';

interface DashboardNavProps {
  user: User;
}

interface SubscriptionData {
  tier: 'free' | 'pro' | 'elite';
  status: string;
  isActive: boolean;
}

// Admin emails that have automatic access
const ADMIN_EMAILS = [
  'jayfshrimpton@gmail.com',
  // Add more admin emails here as needed
];

export default function DashboardNav({ user }: DashboardNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { mode, toggleMode } = useCurrency();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);

  // Check if user is an admin
  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());

  // Fetch subscription data
  useEffect(() => {
    async function fetchSubscription() {
      try {
        const response = await fetch('/api/check-subscription');
        if (response.ok) {
          const data = await response.json();
          setSubscription({
            tier: data.tier || 'free',
            status: data.status || 'active',
            isActive: data.isActive !== false,
          });
        } else {
          // Default to free if API fails
          setSubscription({ tier: 'free', status: 'active', isActive: true });
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        // Default to free on error
        setSubscription({ tier: 'free', status: 'active', isActive: true });
      }
    }

    fetchSubscription();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const navItems = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/bets', label: 'Bets', icon: PlusCircle },
    { href: '/insights', label: 'AI Insights', icon: Sparkles },
    { href: '/subscription', label: 'Subscription', icon: CreditCard },
    { href: '/guide', label: 'Guide', icon: BookOpen },
    { href: '/feedback', label: 'Feedback', icon: MessageSquare },
    { href: '/settings', label: 'Settings', icon: UserCog },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/92 backdrop-blur-xl border-b border-border/60 pt-[env(safe-area-inset-top,0px)]">
        <div className="px-2 sm:px-4 py-2.5 flex justify-between items-center gap-2 min-h-[3rem]">
          <Link href="/dashboard" className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink">
            <Logo size={28} variant="dashboard" className="rounded-lg shrink-0" />
            <span className="font-display font-semibold text-sm sm:text-lg tracking-tight text-foreground truncate max-w-[9rem] min-[380px]:max-w-none">
              <span className="hidden min-[380px]:inline">Punter&apos;s </span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Journal</span>
            </span>
          </Link>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {isAdmin && (
              <Link href="/admin/dashboard">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0 sm:w-auto sm:px-3 rounded-md border-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 hover:from-purple-700 hover:to-blue-700 transition-all shadow-sm"
                  title="Admin Portal"
                >
                  <Shield className="h-4 w-4 sm:mr-1" />
                  <span className="hidden sm:inline text-xs font-semibold">Admin</span>
                </Button>
              </Link>
            )}
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMode}
              className="h-9 w-9 p-0 sm:w-auto sm:px-2.5 rounded-md border-2 bg-background hover:bg-muted transition-colors"
              title={mode === 'currency' ? 'Switch to Units' : 'Switch to Currency'}
            >
              {mode === 'currency' ? (
                <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400 mx-auto" />
              ) : (
                <Coins className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mx-auto" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="h-9 w-9 p-0 sm:w-auto sm:px-3 rounded-md border-2 border-destructive/30 hover:border-destructive bg-background hover:bg-destructive/10 text-destructive transition-colors font-medium"
              title="Sign out"
            >
              <LogOut className="h-4 w-4 sm:mr-1 mx-auto sm:mx-0" />
              <span className="hidden sm:inline text-xs font-semibold">Out</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/92 backdrop-blur-xl border-t border-border/60 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]">
        <nav className="flex justify-around items-center min-h-14 h-14 px-1 sm:px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
                  }`}
              >
                <Icon className={`h-6 w-6 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Desktop Top Bar */}
      <div className="hidden lg:block sticky top-0 z-40 bg-background/92 backdrop-blur-xl border-b border-border/60">
        <div className="px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 mr-8">
              <Logo size={32} variant="dashboard" className="rounded-lg" />
              <span className="font-display font-semibold text-xl tracking-tight text-foreground">
                Punter&apos;s <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Journal</span>
              </span>
            </Link>

            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                      }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border border-border/50">
              <ThemeToggle />
              <div className="w-px h-4 bg-border" />
              <button
                onClick={toggleMode}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all hover:bg-background shadow-sm"
              >
                {mode === 'currency' ? (
                  <>
                    <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-full">
                      <DollarSign className="h-3 w-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span>Currency</span>
                  </>
                ) : (
                  <>
                    <div className="p-1 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                      <Coins className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <span>Units</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-border">
              {isAdmin && (
                <Link href="/admin/dashboard">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 hover:from-purple-700 hover:to-blue-700 transition-all shadow-sm"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-foreground">{user.email?.split('@')[0]}</span>
                <span className="text-xs text-muted-foreground">
                  {subscription ? (
                    subscription.tier === 'free' ? 'Free Plan' :
                    subscription.tier === 'pro' ? 'Pro Plan' :
                    'Elite Plan'
                  ) : 'Loading...'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
