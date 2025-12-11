import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: "Feedback",
  description: "Submit feedback, feature requests, or report issues for Punter's Journal.",
  keywords: ["feedback", "support", "contact", "feature request"],
  path: "/feedback",
  noindex: true,
});

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
