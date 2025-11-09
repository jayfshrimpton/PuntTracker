import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";

export const metadata: Metadata = {
  title: "PuntTracker - Horse Racing Bet Tracker for Australian Punters",
  description: "Track your horse racing bets with ease. Automatic stats, beautiful charts, and insights. Built for Aussie punters. Free to start.",
  keywords: "horse racing, bet tracker, betting stats, punt tracker, racing bets, Australian horse racing, betting analytics",
  openGraph: {
    title: "PuntTracker - Horse Racing Bet Tracker for Australian Punters",
    description: "Track your horse racing bets with ease. Automatic stats, beautiful charts, and insights. Built for Aussie punters.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 text-gray-900 dark:text-gray-100">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
