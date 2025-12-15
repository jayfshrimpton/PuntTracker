import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { CurrencyProvider } from '@/components/CurrencyContext';
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";
import { ThemeProvider } from "@/lib/theme";
import { generateMetadata as generateSEOMetadata, generateStructuredData } from "@/lib/seo";
import PWARegister from "@/components/PWARegister";
// Temporarily import directly to debug webpack issue
import PWAInstallButton from "@/components/PWAInstallButton";
import dynamic from "next/dynamic";

// Optimize fonts with next/font
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

// Lazy load analytics to improve initial page load
const Analytics = dynamic(() => import("@vercel/analytics/next").then(mod => ({ default: mod.Analytics })), {
  ssr: false,
});

const SpeedInsights = dynamic(() => import("@vercel/speed-insights/next").then(mod => ({ default: mod.SpeedInsights })), {
  ssr: false,
});

export const metadata: Metadata = {
  ...generateSEOMetadata({
    title: "Australian Horse Racing Bet Tracker",
    description: "Punters Journal is an Australian race-day workbook and education hub for serious, value-driven horse racing punters.",
    keywords: ["horse racing", "bet tracker", "betting stats", "punt tracker", "racing bets", "Australian horse racing", "betting analytics"],
    path: "/",
  }),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Punter's Journal",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

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
    <html lang="en" suppressHydrationWarning className={inter.variable}>
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
            <PWARegister />
            <PWAInstallButton />
            <Analytics />
            <SpeedInsights />
          </ThemeProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
