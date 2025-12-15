import { generateMetadata } from "@/lib/seo";
import Link from "next/link";
import { BookOpen, FileText, CheckSquare, Target } from "lucide-react";

export const metadata = generateMetadata({
  title: "Betting Journal Template for Horse Racing",
  description: "Punters Journal's Betting Journal Template: A structured framework for tracking horse racing bets, analyzing performance, and building systematic betting approaches for Australian punters.",
  keywords: ["betting journal", "betting template", "horse racing journal", "bet tracking template", "Australian punters"],
  path: "/betting-journal-template-horse-racing",
});

export default function BettingJournalTemplatePage() {
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Punters Journal's Betting Journal Template for Horse Racing",
    "description": "A structured framework for tracking horse racing bets and analyzing performance",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Set Up Your Journal Structure",
        "text": "Define the fields and categories you'll track for each bet.",
        "position": 1
      },
      {
        "@type": "HowToStep",
        "name": "Log Pre-Race Information",
        "text": "Record race details, form analysis, and betting rationale before placing bets.",
        "position": 2
      },
      {
        "@type": "HowToStep",
        "name": "Record Bet Details",
        "text": "Log exact bet type, odds, stake, and all relevant metadata.",
        "position": 3
      },
      {
        "@type": "HowToStep",
        "name": "Update Outcomes",
        "text": "Record race results, finishing positions, and profit/loss.",
        "position": 4
      },
      {
        "@type": "HowToStep",
        "name": "Review and Analyze",
        "text": "Regularly review your journal to identify patterns and improve your approach.",
        "position": 5
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToSchema),
        }}
      />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Punters Journal&apos;s Betting Journal Template for Horse Racing
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                A structured framework for tracking bets and analyzing performance
              </p>
            </div>

            {/* Introduction */}
            <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <p className="text-muted-foreground">
                A betting journal is more than just a record of bets—it&apos;s a tool for learning and improvement. This template provides the structure serious punters need to track their bets systematically and identify what actually works.
              </p>
            </div>

            {/* Core Fields */}
            <section className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">Core Fields to Track</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Race Information</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>Race name and number</li>
                        <li>Venue (track name)</li>
                        <li>Race class (Group 1, Listed, Benchmark, etc.)</li>
                        <li>Distance and track condition</li>
                        <li>Date and time</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Bet Details</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>Horse name(s)</li>
                        <li>Bet type (win, place, each-way, multi, exotic)</li>
                        <li>Odds (exact odds received)</li>
                        <li>Stake amount</li>
                        <li>Starting price (SP) if applicable</li>
                        <li>Best starting price (BSP) if using Betfair</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Analysis & Strategy</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>Strategy tags (e.g., &quot;pace play&quot;, &quot;value bet&quot;, &quot;system bet&quot;)</li>
                        <li>Pre-race notes (form factors, market movements, value assessment)</li>
                        <li>Confidence level (1-5 scale)</li>
                        <li>Bankroll percentage staked</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-2">Outcome</h3>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>Result (Win/Loss)</li>
                        <li>Finishing position</li>
                        <li>Profit/Loss amount</li>
                        <li>Post-race notes (what went right/wrong, lessons learned)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Template Structure */}
            <section className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">Journal Entry Template</h2>
                  <div className="bg-muted/50 rounded-lg p-6 space-y-4 text-sm">
                    <div className="border-b border-border pb-2">
                      <strong className="text-foreground">Date:</strong> _____
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <strong className="text-foreground">Venue:</strong> _____
                      </div>
                      <div>
                        <strong className="text-foreground">Race:</strong> _____
                      </div>
                      <div>
                        <strong className="text-foreground">Race Class:</strong> _____
                      </div>
                      <div>
                        <strong className="text-foreground">Track Condition:</strong> _____
                      </div>
                    </div>
                    <div className="border-t border-border pt-2">
                      <strong className="text-foreground">Horse:</strong> _____
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <strong className="text-foreground">Bet Type:</strong> _____
                      </div>
                      <div>
                        <strong className="text-foreground">Odds:</strong> _____
                      </div>
                      <div>
                        <strong className="text-foreground">Stake:</strong> $_____
                      </div>
                      <div>
                        <strong className="text-foreground">SP/BSP:</strong> _____
                      </div>
                    </div>
                    <div className="border-t border-border pt-2">
                      <strong className="text-foreground">Strategy Tags:</strong> _____
                    </div>
                    <div className="border-t border-border pt-2">
                      <strong className="text-foreground">Pre-Race Notes:</strong>
                      <p className="text-muted-foreground mt-1">_____</p>
                    </div>
                    <div className="border-t border-border pt-2">
                      <strong className="text-foreground">Confidence Level:</strong> _____ / 5
                    </div>
                    <div className="border-t border-border pt-2">
                      <strong className="text-foreground">Result:</strong> _____
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <strong className="text-foreground">Finishing Position:</strong> _____
                      </div>
                      <div>
                        <strong className="text-foreground">Profit/Loss:</strong> $_____
                      </div>
                    </div>
                    <div className="border-t border-border pt-2">
                      <strong className="text-foreground">Post-Race Notes:</strong>
                      <p className="text-muted-foreground mt-1">_____</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Using Punters Journal */}
            <section className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CheckSquare className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">Using This Template in Punters Journal</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Punters Journal automates most of this template, but understanding the structure helps you use it effectively:
                    </p>
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">When Adding a Bet:</h3>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>Fill in all race and bet details</li>
                          <li>Add strategy tags in the tags field</li>
                          <li>Use the notes field for pre-race analysis</li>
                          <li>Set outcome to &quot;Pending&quot; initially</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">After the Race:</h3>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>Update outcome (Win/Loss)</li>
                          <li>Record finishing position</li>
                          <li>Add post-race notes explaining what happened</li>
                          <li>Punters Journal automatically calculates profit/loss</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Weekly Review:</h3>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>Review your dashboard for performance metrics</li>
                          <li>Filter by strategy tags to see what&apos;s working</li>
                          <li>Read through your notes to identify patterns</li>
                          <li>Adjust your approach based on what you learn</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Best Practices */}
            <section className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
                  <div className="space-y-3 text-muted-foreground">
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong className="text-foreground">Be Consistent:</strong> Log every bet, even small ones. Incomplete data leads to poor analysis.</li>
                      <li><strong className="text-foreground">Be Honest:</strong> Record actual odds received, not what you wish you got. Accurate data is essential.</li>
                      <li><strong className="text-foreground">Be Detailed:</strong> More notes mean better analysis later. Explain your reasoning.</li>
                      <li><strong className="text-foreground">Review Regularly:</strong> Don&apos;t just log and forget. Weekly reviews help identify patterns.</li>
                      <li><strong className="text-foreground">Use Strategy Tags:</strong> Consistent tagging helps you analyze which strategies work.</li>
                      <li><strong className="text-foreground">Learn from Losses:</strong> Review losing bets more carefully than winners. They teach more.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Related Resources */}
            <section className="bg-muted/50 rounded-xl border border-border p-8">
              <h2 className="text-2xl font-bold mb-4">Related Resources</h2>
              <div className="space-y-2">
                <Link
                  href="/what-is-punters-journal"
                  className="block text-primary hover:underline"
                >
                  Learn more about Punters Journal →
                </Link>
                <Link
                  href="/race-day-betting-checklist"
                  className="block text-primary hover:underline"
                >
                  Race Day Betting Checklist →
                </Link>
                <Link
                  href="/bankroll-management-workbook-australian-punters"
                  className="block text-primary hover:underline"
                >
                  Bankroll Management Workbook →
                </Link>
              </div>
            </section>

            {/* CTA */}
            <div className="text-center space-y-4">
              <Link
                href="/signup"
                className="inline-block px-8 py-3 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Start Your Betting Journal in Punters Journal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

