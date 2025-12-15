import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: "My Bets",
  description: "Manage your horse racing bets. Add, edit, delete, and track all your betting activity. Import/export CSV, filter by date, venue, and bet type.",
  keywords: ["bets", "betting", "horse racing bets", "bet management", "bet tracker"],
  path: "/bets",
  noindex: true,
});

export default function BetsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}



