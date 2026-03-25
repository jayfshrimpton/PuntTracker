'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Shield,
  FileText,
  ArrowLeft,
  TrendingUp,
  Zap,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/bulk-actions', label: 'Bulk Actions', icon: Zap },
  { href: '/admin/audit-log', label: 'Audit Log', icon: FileText },
  { href: '/admin/metrics', label: 'Metrics', icon: TrendingUp },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => {
      if (mq.matches) setMobileOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[60] flex h-14 items-center gap-3 border-b border-border bg-background px-3 pt-[env(safe-area-inset-top,0px)]">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <div className="flex min-w-0 items-center gap-2">
          <Shield className="h-5 w-5 shrink-0 text-primary" />
          <span className="truncate font-display text-lg font-semibold text-foreground">Admin</span>
        </div>
      </div>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-[55] bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 z-[56] flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 ease-out',
          'top-[calc(3.5rem+env(safe-area-inset-top,0px))] h-[calc(100dvh-3.5rem-env(safe-area-inset-top,0px))]',
          'lg:top-0 lg:z-[60] lg:h-dvh lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="hidden border-b border-border p-6 lg:block">
          <div className="mb-4 flex items-center space-x-2">
            <Shield className="h-6 w-6 text-primary" />
            <h2 className="font-display text-xl font-semibold text-foreground">Admin Portal</h2>
          </div>
          <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to App
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-between border-b border-border p-4 lg:hidden">
          <span className="font-display text-sm font-semibold text-foreground">Menu</span>
          <Button type="button" variant="ghost" size="icon" aria-label="Close" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center space-x-3 rounded-lg px-4 py-3 transition-colors',
                  isActive
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4 lg:hidden">
          <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
            <Button variant="outline" size="sm" className="w-full justify-start">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to App
            </Button>
          </Link>
        </div>
      </aside>
    </>
  );
}
