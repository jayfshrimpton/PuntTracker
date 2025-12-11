import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LandingPage from "@/components/LandingPage";
import LandingNav from "@/components/LandingNav";
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

  // Redirect authenticated users to dashboard
  if (user) {
    redirect("/dashboard");
  }

  // Show landing page for non-authenticated users
  return (
    <>
      <LandingNav />
      <LandingPage />
    </>
  );
}
