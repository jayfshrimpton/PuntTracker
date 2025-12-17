import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: "Terms of Service",
  description: "Terms of Service for Punter's Journal - Read our terms and conditions for using our betting journal platform.",
  keywords: ["terms of service", "terms and conditions", "legal"],
  path: "/terms",
});

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

