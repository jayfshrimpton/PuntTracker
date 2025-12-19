import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: "User Guide",
  description: "Learn how to use Punter's Journal to track your horse racing bets. Complete guide covering all features, bet types, and tips.",
  keywords: ["user guide", "help", "tutorial", "how to", "betting guide", "bet tracker guide"],
  path: "/guide",
  noindex: true,
});

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}









