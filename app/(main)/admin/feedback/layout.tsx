import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: "Admin Feedback",
  description: "Admin panel for managing user feedback and feature requests.",
  keywords: ["admin", "feedback management"],
  path: "/admin/feedback",
  noindex: true,
});

export default function AdminFeedbackLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}









