import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: "Reset Password",
  description: "Set a new password for your Punter's Journal account.",
  keywords: ["reset password", "new password", "change password"],
  path: "/reset-password",
  noindex: true,
});

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}







