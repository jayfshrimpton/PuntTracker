'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X, Activity, Home, PlusCircle, Settings, UserCog, Coins, DollarSign, BookOpen, LogOut, Sparkles, CreditCard, MessageSquare } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import ThemeToggle from '@/components/ThemeToggle';
import { useCurrency } from '@/components/CurrencyContext';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface DashboardNavProps {
  user: User;
}

export default function DashboardNav({ user }: DashboardNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { mode, toggleMode } = useCurrency();

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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="px-4 py-3 flex justify-between items-center">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-1.5 rounded-lg">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Punter's Journal
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMode}
              className="h-8 w-8 p-0 rounded-full"
            >
              {mode === 'currency' ? <DollarSign className="h-4 w-4" /> : <Coins className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-t border-border pb-safe">
        <nav className="flex justify-around items-center h-16 px-2">
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
      <div className="hidden lg:block sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 mr-8">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-1.5 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                Punter's Journal
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
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-foreground">{user.email?.split('@')[0]}</span>
                <span className="text-xs text-muted-foreground">Pro Plan</span>
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
