import { generateMetadata } from "@/lib/seo";
import Link from "next/link";
import { BookOpen, Target, Users, X, TrendingUp, FileText, BarChart3 } from "lucide-react";

export const metadata = generateMetadata({
  title: "What is Punters Journal?",
  description: "Punters Journal is an Australian race-day workbook and education hub for serious, value-driven horse racing punters. Learn how it differs from tipping sites and how serious punters use it.",
  keywords: ["punters journal", "betting workbook", "horse racing education", "betting journal", "Australian punters"],
  path: "/what-is-punters-journal",
});

export default function WhatIsPuntersJournalPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is Punters Journal?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Punters Journal is an Australian race-day workbook and education hub for serious, value-driven horse racing punters. It combines bet tracking, performance analytics, and educational resources in one platform."
        }
      },
      {
        "@type": "Question",
        "name": "Who is Punters Journal for?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Punters Journal is designed for serious punters who track their bets, analyze performance, and seek value-driven opportunities. It&apos;s not for casual punters looking for tips or quick wins."
        }
      },
      {
        "@type": "Question",
        "name": "How is Punters Journal different from Punters.com or Racing.com?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Punters Journal is a personal workbook and analytics tool, not a tipping service. While Punters.com and Racing.com provide form guides and tips, Punters Journal helps you track your own bets, analyze your performance, and build a systematic approach to value betting."
        }
      },
      {
        "@type": "Question",
        "name": "How do serious punters use Punters Journal with Betfair?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Serious punters use Punters Journal to track their Betfair bets, log back and lay positions, record starting prices, and analyze profitability across different markets. The platform helps identify which bet types and strategies are most profitable."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="space-y-12">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                What is Punters Journal?
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Punters Journal is an Australian race-day workbook and education hub for serious, value-driven horse racing punters.
              </p>
            </div>

            {/* What It Is */}
            <section className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">What Punters Journal Is</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p className="text-lg">
                      Punters Journal is a digital workbook and analytics platform designed specifically for Australian horse racing punters who take their betting seriously.
                    </p>
                    <p>
                      It combines three core functions:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong className="text-foreground">Bet Tracking:</strong> Log every bet with detailed metadata including bet type, odds, stake, venue, and outcomes</li>
                      <li><strong className="text-foreground">Performance Analytics:</strong> Automatic calculation of ROI, strike rate, profit/loss, and trend analysis across bet types and time periods</li>
                      <li><strong className="text-foreground">Education Hub:</strong> Resources, guides, and frameworks for developing systematic betting approaches</li>
                    </ul>
                    <p>
                      Unlike spreadsheets or generic tracking apps, Punters Journal understands Australian racing terminology, bet types (win, place, each-way, multis, exotics), and the specific needs of value-driven punters.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Who It&apos;s For */}
            <section className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">Who It&apos;s For (and Who It&apos;s Not For)</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-600" />
                        Punters Journal is for:
                      </h3>
                      <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                        <li>Serious punters who track their bets systematically</li>
                        <li>Value-driven bettors who analyze their performance</li>
                        <li>Punters who use Betfair, TAB, or other bookmakers and want unified tracking</li>
                        <li>Those who review Daily Sectionals, form guides, and racing data</li>
                        <li>Punters building long-term profitability through systematic approaches</li>
                        <li>Anyone who wants to understand which bet types, venues, or strategies actually work</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <X className="w-5 h-5 text-red-600" />
                        Punters Journal is NOT for:
                      </h3>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                          <li>Casual punters looking for quick tips or &quot;hot picks&quot;</li>
                          <li>Those who bet impulsively without tracking or analysis</li>
                          <li>Punters seeking a tipping service or form guide</li>
                          <li>Anyone who doesn&apos;t want to log their bets systematically</li>
                        </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* How It&apos;s Different */}
            <section className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">How It&apos;s Different from Punters.com, Racing.com, and TAB</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Punters.com & Racing.com</h3>
                      <p>
                        These sites provide form guides, race previews, and expert tips. They help you <em>find</em> bets. Punters Journal helps you <em>track and analyze</em> your bets after you place them. It&apos;s the difference between research tools and performance tracking.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">TAB</h3>
                      <p>
                        TAB is a bookmaker. Punters Journal is a tracking and analytics tool. You can use Punters Journal to track bets placed on TAB, Betfair, or any other bookmaker. It&apos;s agnostic about where you bet—it focuses on helping you understand your performance.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">The Key Difference</h3>
                      <p>
                        Punters Journal doesn&apos;t tell you <em>what</em> to bet on. It helps you understand <em>how</em> you&apos;re betting, <em>what&apos;s working</em>, and <em>where you&apos;re losing</em>. It&apos;s a personal performance tool, not a tipping service.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* How Serious Punters Use It */}
            <section className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4">How Serious Punters Use Punters Journal with Betfair and Daily Sectionals</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Serious punters integrate Punters Journal into their existing workflow:
                    </p>
                    <div className="space-y-3">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h3 className="font-semibold text-foreground mb-2">1. Pre-Race Analysis</h3>
                        <p>
                          Review Daily Sectionals, form guides, and market movements. Identify value opportunities using your own analysis or trusted sources.
                        </p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h3 className="font-semibold text-foreground mb-2">2. Place Bets on Betfair</h3>
                        <p>
                          Back or lay selections on Betfair at the odds you&apos;ve identified as value. Note your starting price (SP) and any best starting price (BSP) if applicable.
                        </p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h3 className="font-semibold text-foreground mb-2">3. Log in Punters Journal</h3>
                        <p>
                          Immediately log the bet with all details: bet type, odds, stake, venue, race class, and any strategy tags. This takes 30 seconds and can be done from your phone at the track.
                        </p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h3 className="font-semibold text-foreground mb-2">4. Update Outcomes</h3>
                        <p>
                          After the race, update the outcome (win/loss) and finishing position. Punters Journal automatically calculates profit/loss, updates your ROI, and adjusts your performance metrics.
                        </p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h3 className="font-semibold text-foreground mb-2">5. Review Performance</h3>
                        <p>
                          Weekly or monthly, review your dashboard to see:
                        </p>
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                          <li>Which bet types are most profitable (win vs place vs each-way)</li>
                          <li>Which venues or race classes show value</li>
                          <li>Your strike rate and ROI trends over time</li>
                          <li>Where you&apos;re losing money and need to adjust strategy</li>
                        </ul>
                      </div>
                    </div>
                    <p className="mt-4">
                      This systematic approach helps serious punters identify what actually works, rather than relying on gut feeling or selective memory.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Related Resources */}
            <section className="bg-muted/50 rounded-xl border border-border p-8">
              <h2 className="text-2xl font-bold mb-6">Related Resources</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <Link
                  href="/race-day-betting-checklist"
                  className="p-4 bg-card rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <FileText className="w-5 h-5 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">Race Day Checklist</h3>
                  <p className="text-sm text-muted-foreground">Step-by-step framework for race day preparation</p>
                </Link>
                <Link
                  href="/bankroll-management-workbook-australian-punters"
                  className="p-4 bg-card rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <Target className="w-5 h-5 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">Bankroll Workbook</h3>
                  <p className="text-sm text-muted-foreground">Systematic bankroll management for Australian punters</p>
                </Link>
                <Link
                  href="/betting-journal-template-horse-racing"
                  className="p-4 bg-card rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <BookOpen className="w-5 h-5 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">Journal Template</h3>
                  <p className="text-sm text-muted-foreground">Structured template for tracking horse racing bets</p>
                </Link>
              </div>
            </section>

            {/* CTA */}
            <div className="text-center space-y-4">
              <Link
                href="/signup"
                className="inline-block px-8 py-3 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Start Using Punters Journal
              </Link>
              <p className="text-sm text-muted-foreground">
                Free to start. No credit card required.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

