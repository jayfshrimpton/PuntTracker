import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: "Dashboard",
  description: "View your betting performance overview, statistics, charts, and insights. Track your profit/loss, ROI, strike rate, and more.",
  keywords: ["dashboard", "betting stats", "performance", "analytics", "betting dashboard"],
  path: "/dashboard",
  noindex: true, // Authenticated pages typically shouldn't be indexed
});

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}













