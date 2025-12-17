import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: "Privacy Policy",
  description: "Privacy Policy for Punter's Journal - Learn how we collect, use, and protect your personal information.",
  keywords: ["privacy policy", "data protection", "privacy"],
  path: "/privacy",
});

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

