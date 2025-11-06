import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import DashboardNav from '@/components/DashboardNav';
import { Home, PlusCircle, Settings } from 'lucide-react';
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

  return (
    <div className="min-h-screen">
      <DashboardNav user={user} />
      <div className="flex">
        <aside className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-64">
            <div className="flex flex-col flex-grow bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">PuntTracker</h1>
              </div>
              <div className="mt-5 flex-grow flex flex-col">
                <nav className="flex-1 px-2 space-y-1">
                  <a
                    href="/dashboard"
                    className="group flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md text-gray-900 dark:text-gray-100 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Home className="h-4 w-4" />
                    Dashboard
                  </a>
                  <a
                    href="/dashboard/bets"
                    className="text-gray-900 dark:text-gray-100 hover:bg-gray-50 hover:text-blue-600 dark:hover:bg-gray-700 group flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md transition-colors"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Enter Bets
                  </a>
                  <a
                    href="/dashboard/feedback"
                    className="text-gray-900 dark:text-gray-100 hover:bg-gray-50 hover:text-blue-600 dark:hover:bg-gray-700 group flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-md transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Feedback
                  </a>
                </nav>
              </div>
            </div>
          </div>
        </aside>
        <div className="flex flex-col w-0 flex-1 overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
      <FeedbackButton />
    </div>
  );
}
