import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CurrencyProvider } from '@/components/CurrencyContext';
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";
import { ThemeProvider } from "@/lib/theme";
import { generateMetadata as generateSEOMetadata, generateStructuredData } from "@/lib/seo";

export const metadata: Metadata = generateSEOMetadata({
  title: "Horse Racing Bet Tracker for Australian Punters",
  description: "Track your horse racing bets with ease. Automatic stats, beautiful charts, and insights. Built for Aussie punters. Free to start.",
  keywords: ["horse racing", "bet tracker", "betting stats", "punt tracker", "racing bets", "Australian horse racing", "betting analytics"],
  path: "/",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(generateStructuredData('WebApplication', {
              applicationCategory: 'FinanceApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'AUD',
              },
            })),
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 'system';
                  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  const resolvedTheme = theme === 'system' ? systemTheme : theme;
                  document.documentElement.classList.add(resolvedTheme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <CurrencyProvider>
          <ThemeProvider>
            {children}
            <ToastProvider />
            <Analytics />
            <SpeedInsights />
          </ThemeProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
