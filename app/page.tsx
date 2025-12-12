import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LandingPage from "@/components/LandingPage";
import LandingNav from "@/components/LandingNav";
import PasswordRecoveryRedirect from "@/components/PasswordRecoveryRedirect";
import { generateMetadata } from "@/lib/seo";

export const metadata = generateMetadata({
  title: "Horse Racing Bet Tracker for Australian Punters",
  description: "Track your horse racing bets with ease. Automatic stats, beautiful charts, and AI-powered insights. Built for Aussie punters. Free to start.",
  keywords: ["horse racing", "bet tracker", "betting stats", "punt tracker", "racing bets", "Australian horse racing"],
  path: "/",
});

export default async function Home() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect authenticated users to dashboard (unless they have a recovery session)
  // Recovery sessions are temporary and should go to reset-password
  if (user) {
    // Check if this is a password recovery session by checking the user's metadata
    // Recovery sessions typically have specific characteristics, but we'll let
    // the reset-password page handle the validation
    // For now, redirect authenticated users to dashboard
    redirect("/dashboard");
  }

  // Show landing page for non-authenticated users
  // Note: Hash fragments (#access_token=...&type=recovery) are client-side only
  // PasswordRecoveryRedirect will check for these and redirect to reset-password
  return (
    <>
      <PasswordRecoveryRedirect />
      <LandingNav />
      <LandingPage />
    </>
  );
}
