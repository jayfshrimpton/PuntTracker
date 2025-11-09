import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LandingPage from "@/components/LandingPage";
import LandingNav from "@/components/LandingNav";

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
