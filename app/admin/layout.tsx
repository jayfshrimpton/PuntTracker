import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Admin auth is handled by middleware
  // This layout just provides the structure

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <main className="flex-1 overflow-x-auto px-3 pb-8 pt-[calc(3.5rem+env(safe-area-inset-top,0px))] sm:px-4 lg:ml-64 lg:px-8 lg:pt-8">
        {children}
      </main>
    </div>
  );
}

