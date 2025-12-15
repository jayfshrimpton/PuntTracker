import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardNav from '@/components/DashboardNav';
import VerificationBanner from '@/components/VerificationBanner';
// import ContentSidebar from '@/components/dashboard/ContentSidebar';
import dynamic from 'next/dynamic';

// Lazy load FeedbackButton to improve initial page load
const FeedbackButton = dynamic(() => import('@/components/FeedbackButton'), {
  ssr: false,
});

// Lazy load KeyboardShortcuts
const KeyboardShortcuts = dynamic(() => import('@/components/KeyboardShortcuts').then(mod => ({ default: mod.KeyboardShortcuts })), {
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

  return (
    <div className="min-h-screen bg-background flex flex-col h-screen overflow-hidden">
      <VerificationBanner email={user.email || ''} isVerified={isVerified} />

      {/* Navigation - spans full width */}
      <DashboardNav user={user} />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto focus:outline-none scroll-smooth pt-16 lg:pt-0 pb-20 lg:pb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
            {children}
          </div>
        </main>

        {/* Right Sidebar for widgets/content - Currently hidden as per user request */}
        {/* <ContentSidebar /> */}
      </div>

      <FeedbackButton />
      <KeyboardShortcuts />
    </div>
  );
}
