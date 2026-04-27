import Link from 'next/link';
import { generateMetadata } from '@/lib/seo';
import { CheckCircle2 } from 'lucide-react';

export const metadata = generateMetadata({
  title: 'Quick start — 4 steps',
  description:
    'Sign up, log sample or real bets, open your dashboard, and share your stats. Built for Aussie punters.',
  path: '/start',
});

const steps = [
  {
    title: 'Create your account',
    body: 'Sign up and verify your email so your bankroll and bets stay private to you.',
    href: '/signup',
    cta: 'Sign up',
  },
  {
    title: 'Log at least five bets',
    body: 'Add real results from the track or use Try sample data on the dashboard to see charts instantly.',
    href: '/bets',
    cta: 'Go to bets',
  },
  {
    title: 'Check your dashboard',
    body: 'Switch the date range (week, month, quarter, etc.) and review P&L, strike rate, ROI, and turnover.',
    href: '/dashboard',
    cta: 'Open dashboard',
  },
  {
    title: 'Share your stats (optional)',
    body: 'From the dashboard, use Share to create a public link — great for Discord, X, or your community.',
    href: '/dashboard',
    cta: 'Dashboard',
  },
];

export default function QuickStartPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24">
        <p className="text-sm font-medium text-primary mb-2">Punter&apos;s Journal</p>
        <h1 className="text-3xl sm:text-4xl font-display font-semibold tracking-tight text-foreground mb-4">
          Getting started in four steps
        </h1>
        <p className="text-muted-foreground text-lg mb-12">
          A short path from zero to a dashboard you can screenshot or share — no fluff.
        </p>

        <ol className="space-y-10">
          {steps.map((step, i) => (
            <li key={step.title} className="flex gap-4">
              <div className="flex-none w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <h2 className="text-xl font-semibold text-foreground">{step.title}</h2>
                </div>
                <p className="text-muted-foreground mb-4 leading-relaxed">{step.body}</p>
                <Link
                  href={step.href}
                  className="inline-flex text-sm font-semibold text-primary hover:underline"
                >
                  {step.cta} →
                </Link>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-14 pt-10 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            Want more depth? See the full{' '}
            <Link href="/getting-started" className="text-primary font-medium hover:underline">
              getting started hub
            </Link>
            .
          </p>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
