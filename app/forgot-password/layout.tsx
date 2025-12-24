import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: "Forgot Password",
  description: "Reset your Punter's Journal password. Enter your email to receive a password reset link.",
  keywords: ["forgot password", "reset password", "password recovery"],
  path: "/forgot-password",
  noindex: true,
});

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}













