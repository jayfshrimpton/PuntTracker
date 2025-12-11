import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: "Subscription",
  description: "Manage your Punter's Journal subscription. View your current plan, upgrade, or manage billing.",
  keywords: ["subscription", "billing", "plan", "upgrade", "manage subscription"],
  path: "/subscription",
  noindex: true,
});

export default function SubscriptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
