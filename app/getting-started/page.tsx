import { generateMetadata } from "@/lib/seo";
import Link from "next/link";
import { BookOpen, Calendar, FileText, Target, CheckCircle2 } from "lucide-react";

export const metadata = generateMetadata({
  title: "Getting Started with Punters Journal",
  description: "Get started with Punters Journal: 30-Day Journaling Challenge, Race Day Checklist, and example journal entries for Australian horse racing punters.",
  keywords: ["getting started", "betting journal", "horse racing", "Australian punters"],
  path: "/getting-started",
});

export default function GettingStartedPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Getting Started with Punters Journal
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Entry-level resources to help you start tracking your bets systematically
            </p>
          </div>

          {/* Introduction */}
          <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
            <p className="text-muted-foreground">
              These resources are designed as entry points for new users. They provide light, accessible content to help you get started. For the full power of Punters Journal, explore our <Link href="/what-is-punters-journal" className="text-primary hover:underline">main explainer</Link> and advanced resources.
            </p>
          </div>

          {/* 30-Day Challenge */}
          <section className="bg-card rounded-xl border border-border p-8 shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-4">30-Day Journaling Challenge</h2>
                <p className="text-muted-foreground mb-6">
                  Build the habit of tracking your bets with this simple 30-day challenge. Perfect for beginners who want to establish consistency.
                </p>
                <div className="bg-muted/50 rounded-lg p-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Week 1: Foundation</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      <li>Days 1-3: Log at least 1 bet per day (even if it&apos;s a small one)</li>
                      <li>Days 4-7: Log all bets from one race meeting</li>
                      <li>Focus on accuracy—get the details right</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Week 2: Consistency</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      <li>Days 8-14: Log every bet, no exceptions</li>
                      <li>Start adding notes to at least 2 bets per day</li>
                      <li>Update outcomes within 24 hours of races finishing</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Week 3: Analysis</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      <li>Days 15-21: Review your dashboard weekly</li>
                      <li>Add strategy tags to your bets</li>
                      <li>Identify your most common bet types</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Week 4: Mastery</h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      <li>Days 22-30: Full systematic tracking</li>
                      <li>Use all features: tags, notes, outcomes</li>
                      <li>Complete your first monthly review</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Tip:</strong> Set a daily reminder on your phone. Consistency is more important than volume—even logging 1 bet per day builds the habit.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Race Day Checklist */}
          <section className="bg-card rounded-xl border border-border p-8 shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-4">One-Page Race Day Checklist</h2>
                <p className="text-muted-foreground mb-6">
                  A simplified checklist for race day. Print this or save it on your phone.
                </p>
                <div className="bg-muted/50 rounded-lg p-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Check scratchings and track conditions</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Review form guides and identify value</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Place bets at identified odds</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Log bets immediately in Punters Journal</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Update outcomes after races</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Review end-of-day performance</span>
                  </div>
                </div>
                <div className="mt-6">
                  <Link
                    href="/race-day-betting-checklist"
                    className="text-primary hover:underline font-semibold"
                  >
                    View full detailed checklist →
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Example Journal */}
          <section className="bg-card rounded-xl border border-border p-8 shadow-sm">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-4">Example Fictional Journal Entry</h2>
                <p className="text-muted-foreground mb-6">
                  See how a serious punter structures their journal entries. This is a fictional example showing best practices.
                </p>
                <div className="bg-muted/50 rounded-lg p-6 space-y-4 text-sm">
                  <div>
                    <strong className="text-foreground">Date:</strong> Saturday, 15 March 2025
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <strong className="text-foreground">Venue:</strong> Flemington
                    </div>
                    <div>
                      <strong className="text-foreground">Race:</strong> Race 7 - Group 1 Australian Cup
                    </div>
                    <div>
                      <strong className="text-foreground">Track Condition:</strong> Good 4
                    </div>
                    <div>
                      <strong className="text-foreground">Distance:</strong> 2000m
                    </div>
                  </div>
                  <div className="border-t border-border pt-4">
                    <strong className="text-foreground">Horse:</strong> Thunder Strike
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <strong className="text-foreground">Bet Type:</strong> Win
                    </div>
                    <div>
                      <strong className="text-foreground">Odds:</strong> 4.50
                    </div>
                    <div>
                      <strong className="text-foreground">Stake:</strong> $50 (2 units)
                    </div>
                    <div>
                      <strong className="text-foreground">SP:</strong> 4.20
                    </div>
                  </div>
                  <div className="border-t border-border pt-4">
                    <strong className="text-foreground">Strategy Tags:</strong> value bet, pace play
                  </div>
                  <div className="border-t border-border pt-4">
                    <strong className="text-foreground">Pre-Race Notes:</strong>
                    <p className="text-muted-foreground mt-1">
                      Strong form last start, good barrier draw (3), expected to lead or sit second. Market has drifted from 3.80 to 4.50—value at current odds. Pace map suggests front runners have advantage.
                    </p>
                  </div>
                  <div className="border-t border-border pt-4">
                    <strong className="text-foreground">Confidence Level:</strong> 4 / 5
                  </div>
                  <div className="border-t border-border pt-4">
                    <strong className="text-foreground">Result:</strong> Win
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <strong className="text-foreground">Finishing Position:</strong> 1st
                    </div>
                    <div>
                      <strong className="text-foreground">Profit:</strong> +$175
                    </div>
                  </div>
                  <div className="border-t border-border pt-4">
                    <strong className="text-foreground">Post-Race Notes:</strong>
                    <p className="text-muted-foreground mt-1">
                      Led throughout as expected. Jockey rode perfectly, controlled pace. Value was there—should have been shorter odds. Pace play strategy worked well.
                    </p>
                  </div>
                </div>
                <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Key Takeaways:</strong> Notice how this entry includes reasoning (pre-race notes), strategy tags, and post-race analysis. This level of detail enables meaningful review later.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Next Steps */}
          <section className="bg-muted/50 rounded-xl border border-border p-8">
            <h2 className="text-2xl font-bold mb-4">Ready for More?</h2>
            <p className="text-muted-foreground mb-6">
              Once you&apos;ve completed the 30-day challenge, explore these advanced resources:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <Link
                href="/what-is-punters-journal"
                className="p-4 bg-card rounded-lg border border-border hover:border-primary transition-colors"
              >
                <BookOpen className="w-5 h-5 text-primary mb-2" />
                <h3 className="font-semibold mb-1">What is Punters Journal?</h3>
                <p className="text-sm text-muted-foreground">Complete overview of the platform</p>
              </Link>
              <Link
                href="/race-day-betting-checklist"
                className="p-4 bg-card rounded-lg border border-border hover:border-primary transition-colors"
              >
                <Target className="w-5 h-5 text-primary mb-2" />
                <h3 className="font-semibold mb-1">Race Day Checklist</h3>
                <p className="text-sm text-muted-foreground">Detailed systematic framework</p>
              </Link>
              <Link
                href="/bankroll-management-workbook-australian-punters"
                className="p-4 bg-card rounded-lg border border-border hover:border-primary transition-colors"
              >
                <FileText className="w-5 h-5 text-primary mb-2" />
                <h3 className="font-semibold mb-1">Bankroll Workbook</h3>
                <p className="text-sm text-muted-foreground">Capital management framework</p>
              </Link>
            </div>
          </section>

          {/* CTA */}
          <div className="text-center space-y-4">
            <Link
              href="/signup"
              className="inline-block px-8 py-3 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Start Your 30-Day Challenge
            </Link>
            <p className="text-sm text-muted-foreground">
              Free to start. No credit card required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

