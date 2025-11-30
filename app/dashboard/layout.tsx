import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardNav from '@/components/DashboardNav';
import VerificationBanner from '@/components/VerificationBanner';
import { Home, PlusCircle, Settings, UserCog, Activity, BookOpen, MessageSquare } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';

// Lazy load FeedbackButton to improve initial page load
const FeedbackButton = dynamic(() => import('@/components/FeedbackButton'), {
  ssr: false,
});

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if email is confirmed
  const isVerified = !!user.email_confirmed_at;

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/dashboard/bets', label: 'Enter Bets', icon: PlusCircle },
    { href: '/dashboard/guide', label: 'User Guide', icon: BookOpen },
    { href: '/dashboard/feedback', label: 'Feedback', icon: MessageSquare },
    { href: '/dashboard/settings', label: 'Settings', icon: UserCog },
  ];

  return (
    <div className="min-h-screen bg-background">
      <VerificationBanner email={user.email || ''} isVerified={isVerified} />

      <div className="flex h-screen overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 z-50">
          <div className="flex flex-col flex-grow glass border-r border-white/20 dark:border-gray-800/50 pt-6 pb-4">
            <div className="flex items-center gap-3 px-8 mb-8">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl shadow-lg shadow-blue-500/20">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                PuntTracker
              </span>
            </div>

            <nav className="flex-1 px-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 text-muted-foreground"
                >
                  <link.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="px-8 mt-auto">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg">
                <h4 className="font-semibold mb-1">Pro Plan</h4>
                <p className="text-xs text-blue-100 mb-3">Get access to advanced insights and unlimited tracking.</p>
                <button className="text-xs bg-white/20 hover:bg-white/30 transition-colors px-3 py-1.5 rounded-lg font-medium w-full">
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex flex-col flex-1 lg:pl-72 w-full">
          <DashboardNav user={user} />

          <main className="flex-1 overflow-y-auto focus:outline-none pb-20 lg:pb-8 scroll-smooth">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      </div>

      <FeedbackButton />
    </div>
  );
}
