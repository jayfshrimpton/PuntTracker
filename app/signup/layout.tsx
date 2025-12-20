import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: "Sign Up",
  description: "Create your free Punter's Journal account to start tracking your horse racing bets with comprehensive statistics and insights.",
  keywords: ["sign up", "register", "create account", "bet tracker signup"],
  path: "/signup",
});

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}










