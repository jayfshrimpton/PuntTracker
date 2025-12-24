import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: "Sign In",
  description: "Sign in to Punter's Journal to track your horse racing bets, view performance stats, and get insights.",
  keywords: ["login", "sign in", "bet tracker login"],
  path: "/login",
  noindex: true, // Login pages typically shouldn't be indexed
});

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}













