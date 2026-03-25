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
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden focus:outline-none scroll-smooth">
          <div
            className={
              isVerified
                ? 'max-w-7xl mx-auto px-3 sm:px-6 md:px-8 pt-[calc(4rem+env(safe-area-inset-top,0px))] pb-24 lg:pt-8 lg:pb-8'
                : 'max-w-7xl mx-auto px-3 sm:px-6 md:px-8 pt-4 pb-24 lg:pt-8 lg:pb-8'
            }
          >
            {children}
          </div>
        </main>

        {/* Right Sidebar for widgets/content - Currently hidden as per user request */}
        {/* <ContentSidebar /> */}
      </div>

      <FeedbackButton />
    </div>
  );
}
