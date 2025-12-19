import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CurrencyProvider } from '@/components/CurrencyContext';
import "./globals.css";
import { ToastProvider } from "@/components/ToastProvider";
import { ThemeProvider } from "@/lib/theme";
import { generateMetadata as generateSEOMetadata, generateStructuredData } from "@/lib/seo";
import PWARegister from "@/components/PWARegister";
import PasswordRecoveryRedirect from "@/components/PasswordRecoveryRedirect";

export const metadata: Metadata = {
  ...generateSEOMetadata({
    title: "Horse Racing Bet Tracker for Australian Punters",
    description: "Track your horse racing bets with ease. Automatic stats, beautiful charts, and insights. Built for Aussie punters. Free to start.",
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
                  // Check if we're on landing page - always use dark mode
                  const isLandingPage = window.location.pathname === '/';
                  if (isLandingPage) {
                    document.documentElement.classList.add('dark');
                  } else {
                    // For dashboard, default to dark if no preference saved
                    const theme = localStorage.getItem('theme') || 'dark';
                    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    const resolvedTheme = theme === 'system' ? systemTheme : theme;
                    document.documentElement.classList.add(resolvedTheme);
                  }
                } catch (e) {}
                
                // Immediately check for password recovery hash fragments and redirect
                // This runs before React hydrates to catch Supabase redirects
                (function() {
                  // Check immediately
                  function checkAndRedirect() {
                    const hash = window.location.hash;
                    const search = window.location.search;
                    const pathname = window.location.pathname;
                    
                    // Only redirect if we're NOT already on /reset-password
                    if (pathname === '/reset-password') {
                      return false;
                    }
                    
                    // Debug logging (remove in production if needed)
                    if (hash || search.includes('token_hash') || search.includes('type=recovery')) {
                      console.log('[Password Reset] Detected:', { hash, search, pathname });
                    }
                    
                    // Check for password recovery hash fragments
                    if (hash && hash.includes('access_token') && hash.includes('type=recovery')) {
                      console.log('[Password Reset] Redirecting to /reset-password with hash');
                      window.location.replace('/reset-password' + hash + search);
                      return true;
                    }
                    
                    // Also check for query parameters (alternative format)
                    if (search) {
                      const params = new URLSearchParams(search);
                      const token_hash = params.get('token_hash');
                      const type = params.get('type');
                      
                      if (token_hash && type === 'recovery') {
                        console.log('[Password Reset] Redirecting to /reset-password with query params');
                        window.location.replace('/reset-password?token_hash=' + encodeURIComponent(token_hash) + '&type=' + encodeURIComponent(type));
                        return true;
                      }
                    }
                    
                    return false;
                  }
                  
                  // Check immediately (before anything else)
                  if (checkAndRedirect()) {
                    return;
                  }
                  
                  // Check multiple times with increasing delays (hash might appear after page load)
                  // This is important because Supabase might add the hash dynamically
                  [10, 50, 100, 200, 500, 1000].forEach(function(delay) {
                    setTimeout(function() {
                      checkAndRedirect();
                    }, delay);
                  });
                  
                  // Listen for hash changes (in case Supabase adds it dynamically)
                  window.addEventListener('hashchange', function() {
                    checkAndRedirect();
                  }, { once: false });
                  
                  // Also listen for popstate (back/forward navigation)
                  window.addEventListener('popstate', function() {
                    setTimeout(checkAndRedirect, 10);
                  }, { once: false });
                })();
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <CurrencyProvider>
          <ThemeProvider>
            <PasswordRecoveryRedirect />
            {children}
            <ToastProvider />
            <PWARegister />
            <Analytics />
            <SpeedInsights />
          </ThemeProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
