import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: "Settings",
  description: "Manage your Punter's Journal account settings, preferences, bankroll, goals, and email notifications.",
  keywords: ["settings", "account settings", "preferences", "profile"],
  path: "/settings",
  noindex: true,
});

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
