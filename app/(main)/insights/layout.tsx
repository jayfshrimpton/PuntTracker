import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: "AI Insights",
  description: "Get AI-powered insights about your betting performance. Ask questions about your stats, trends, and patterns.",
  keywords: ["AI insights", "betting insights", "analytics", "betting analysis", "AI betting"],
  path: "/insights",
  noindex: true,
});

export default function InsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}







