'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, Activity, Home, PlusCircle, Settings, UserCog, Coins, DollarSign, BookOpen } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import ThemeToggle from '@/components/ThemeToggle';
import { useCurrency } from '@/components/CurrencyContext';

interface DashboardNavProps {
  user: User;
}

export default function DashboardNav({ user }: DashboardNavProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { mode, toggleMode } = useCurrency();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      {/* Mobile menu */}
      <div className="lg:hidden">
        <div className="bg-card border-b border-border shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground focus:outline-none"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <h1 className="text-lg font-bold text-foreground">PuntTracker</h1>
              </div>
              <div className="flex items-center space-x-3">
                <ThemeToggle />
                <button
                  onClick={toggleMode}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  {mode === 'currency' ? (
                    <>
                      <DollarSign className="h-4 w-4" />
                      <span>Currency</span>
                    </>
                  ) : (
                    <>
                      <Coins className="h-4 w-4" />
                      <span>Units</span>
                    </>
                  )}
                </button>
                <span className="text-sm text-muted-foreground">{user.email}</span>
                <button
                  onClick={handleLogout}
                  className="text-sm bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-1 rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="border-t border-border bg-card">
              <nav className="px-4 py-2 space-y-1">
                <a
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="h-5 w-5 text-primary" /> Dashboard
                </a>
                <a
                  href="/dashboard/bets"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <PlusCircle className="h-5 w-5 text-primary" /> Enter Bets
                </a>
                <a
                  href="/dashboard/guide"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BookOpen className="h-5 w-5 text-primary" /> User Guide
                </a>
                <a
                  href="/dashboard/feedback"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="h-5 w-5 text-primary" /> Feedback
                </a>
                <a
                  href="/dashboard/settings"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium text-foreground hover:bg-muted transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <UserCog className="h-5 w-5 text-primary" /> Settings
                </a>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Desktop top bar */}
      <div className="hidden lg:block bg-card border-b border-border shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">PuntTracker</h1>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <button
                onClick={toggleMode}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                {mode === 'currency' ? (
                  <>
                    <DollarSign className="h-4 w-4" />
                    <span>Currency</span>
                  </>
                ) : (
                  <>
                    <Coins className="h-4 w-4" />
                    <span>Units</span>
                  </>
                )}
              </button>
              <span className="text-sm text-muted-foreground">{user.email}</span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-1 rounded-md transition-colors"
              >
                Logout
              </button>
              <div className="h-6 w-px bg-border mx-2" />
              <a
                href="/dashboard/guide"
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                title="User Guide"
              >
                <BookOpen className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
