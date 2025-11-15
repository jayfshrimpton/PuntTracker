'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, Activity, Home, PlusCircle, Settings } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import ThemeToggle from '@/components/ThemeToggle';

interface DashboardNavProps {
  user: User;
}

export default function DashboardNav({ user }: DashboardNavProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4 text-white">
              <button
                type="button"
                className="text-white/90 hover:text-white focus:outline-none"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-white drop-shadow" />
                <h1 className="text-lg font-bold text-white drop-shadow">PuntTracker</h1>
              </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <span className="text-sm text-white/90">{user.email}</span>
              <button
                onClick={handleLogout}
                className="text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-md transition-colors"
              >
                Logout
              </button>
            </div>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="border-t border-white/20 bg-gradient-to-b from-blue-700 via-purple-700 to-blue-800 text-white">
              <nav className="px-4 py-2 space-y-1">
                <a
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium hover:bg-white/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="h-5 w-5" /> Dashboard
                </a>
                <a
                  href="/dashboard/bets"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium hover:bg-white/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <PlusCircle className="h-5 w-5" /> Enter Bets
                </a>
                <a
                  href="/dashboard/feedback"
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium hover:bg-white/10 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Settings className="h-5 w-5" /> Feedback
                </a>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Desktop top bar */}
      <div className="hidden lg:block bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 text-white">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 drop-shadow" />
              <h1 className="text-xl font-bold drop-shadow">PuntTracker</h1>
            </div>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <span className="text-sm text-white/90">{user.email}</span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-md transition-colors shadow-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
