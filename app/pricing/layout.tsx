import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: "Pricing",
  description: "Choose the perfect plan for your betting needs. Free plan available with up to 50 bets. Pro and Elite plans with advanced analytics and AI insights.",
  keywords: ["pricing", "plans", "subscription", "bet tracker pricing", "pro plan", "elite plan"],
  path: "/pricing",
});

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}













