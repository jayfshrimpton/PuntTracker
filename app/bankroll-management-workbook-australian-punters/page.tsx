import { generateMetadata } from "@/lib/seo";
import Link from "next/link";
import { Calculator, Target, TrendingUp, DollarSign, AlertTriangle } from "lucide-react";

export const metadata = generateMetadata({
  title: "Bankroll Management Workbook",
  description: "Punters Journal's Bankroll Management Workbook: A systematic framework for managing betting bankrolls, setting staking plans, and protecting capital for serious Australian horse racing punters.",
  keywords: ["bankroll management", "betting bankroll", "staking plan", "Australian punters", "betting capital"],
  path: "/bankroll-management-workbook-australian-punters",
});

export default function BankrollWorkbookPage() {
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Punters Journal's Bankroll Management Workbook for Australian Punters",
    "description": "A systematic framework for managing betting bankrolls and protecting capital",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Calculate Your Starting Bankroll",
        "text": "Determine the total amount you can afford to lose without affecting your lifestyle.",
        "position": 1
      },
      {
        "@type": "HowToStep",
        "name": "Set Unit Size",
        "text": "Define your standard betting unit as a percentage of your bankroll (typically 1-2%).",
        "position": 2
      },
      {
        "@type": "HowToStep",
        "name": "Establish Staking Rules",
        "text": "Create rules for bet sizing based on confidence levels and value identified.",
        "position": 3
      },
      {
        "@type": "HowToStep",
        "name": "Track Bankroll Performance",
        "text": "Monitor your bankroll balance, unit size adjustments, and overall performance.",
        "position": 4
      },
      {
        "@type": "HowToStep",
        "name": "Review and Adjust",
        "text": "Regularly review your bankroll management strategy and adjust based on performance.",
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
                Punters Journal&apos;s Bankroll Management Workbook for Australian Punters
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                A systematic framework for managing betting bankrolls and protecting capital
              </p>
            </div>

            {/* Introduction */}
            <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <p className="text-muted-foreground mb-4">
                Bankroll management is the foundation of serious punting. Without proper capital management, even the best form analysis won&apos;t lead to long-term profitability. This workbook provides a systematic approach to managing your betting bankroll.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Important:</strong> This workbook assumes you&apos;re tracking your bets systematically in Punters Journal. Without accurate tracking, bankroll management is impossible.
                </p>
              </div>
            </div>

            {/* Step 1 */}
            <section className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">Step 1: Calculate Your Starting Bankroll</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Your starting bankroll is the total amount you can afford to lose without affecting your lifestyle. This is <em>not</em> your entire savings—it&apos;s money specifically allocated for betting.
                    </p>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <h3 className="font-semibold text-foreground">Bankroll Calculation Formula:</h3>
                      <p className="text-sm">
                        <strong>Starting Bankroll = Disposable Income × Risk Tolerance %</strong>
                      </p>
                      <p className="text-sm">
                        Example: If you have $5,000 disposable income and are comfortable risking 20%, your starting bankroll is $1,000.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">Key Principles:</h3>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Never bet with money you need for essentials (rent, bills, food)</li>
                        <li>Your bankroll should be separate from your main savings</li>
                        <li>Only add to your bankroll from winnings or new disposable income</li>
                        <li>If you lose your entire bankroll, stop betting until you rebuild it</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 2 */}
            <section className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Calculator className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">Step 2: Set Your Unit Size</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      A &quot;unit&quot; is your standard betting amount. Most serious punters use 1-2% of their bankroll as one unit. This protects you from losing everything on a bad run.
                    </p>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <h3 className="font-semibold text-foreground">Unit Size Calculation:</h3>
                      <p className="text-sm">
                        <strong>1 Unit = Bankroll × Unit Percentage (1-2%)</strong>
                      </p>
                      <p className="text-sm">
                        Example: With a $1,000 bankroll and 2% unit size, 1 unit = $20.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">Unit Size Guidelines:</h3>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li><strong>Conservative (1%):</strong> For new punters or those rebuilding after losses</li>
                        <li><strong>Standard (1.5%):</strong> For experienced punters with consistent performance</li>
                        <li><strong>Aggressive (2%):</strong> Only for proven profitable punters with strong ROI</li>
                        <li>Never exceed 2% per unit—the risk of ruin increases dramatically</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 3 */}
            <section className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">Step 3: Establish Staking Rules</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Not all bets are equal. Your staking should reflect the value and confidence level of each bet.
                    </p>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                      <h3 className="font-semibold text-foreground">Recommended Staking Framework:</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong className="text-foreground">Maximum Value (5 units):</strong> Exceptional value opportunities where odds are significantly above your assessed probability
                        </div>
                        <div>
                          <strong className="text-foreground">High Value (3 units):</strong> Strong value bets with clear edge
                        </div>
                        <div>
                          <strong className="text-foreground">Standard Value (1-2 units):</strong> Regular value bets meeting your criteria
                        </div>
                        <div>
                          <strong className="text-foreground">Small Value (0.5 units):</strong> Marginal value or speculative bets
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-foreground">Staking Rules:</h3>
                      <ul className="list-disc list-inside space-y-1 ml-4">
                        <li>Never bet more than 5 units on a single bet</li>
                        <li>Never risk more than 10% of your bankroll on a single race day</li>
                        <li>Adjust unit size as your bankroll grows or shrinks</li>
                        <li>If your bankroll drops 20%, reduce unit size by 25%</li>
                        <li>If your bankroll grows 50%, you can increase unit size by 25%</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 4 */}
            <section className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">Step 4: Track Bankroll Performance</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Use Punters Journal to track your bankroll performance systematically. This requires discipline but is essential for long-term success.
                    </p>
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Daily Tracking:</h3>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>Record starting bankroll balance each day</li>
                          <li>Log all bets with exact stakes</li>
                          <li>Update bankroll balance after each race day</li>
                          <li>Calculate current unit size based on updated bankroll</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Weekly Review:</h3>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>Review total profit/loss for the week</li>
                          <li>Check ROI and strike rate</li>
                          <li>Identify which bet types and strategies are working</li>
                          <li>Adjust staking if bankroll has changed significantly</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">Monthly Analysis:</h3>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li>Review overall bankroll growth or decline</li>
                          <li>Analyze trends in your Punters Journal dashboard</li>
                          <li>Identify patterns in profitable vs unprofitable periods</li>
                          <li>Make strategic adjustments to your approach</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Step 5 */}
            <section className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">Step 5: Review and Adjust</h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Bankroll management is not set-and-forget. You must regularly review and adjust based on performance.
                    </p>
                    <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-4 border-l-4 border-red-600 space-y-2">
                      <h3 className="font-semibold text-foreground">Warning Signs (Time to Reduce Stakes):</h3>
                      <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                        <li>Bankroll drops 20% or more</li>
                        <li>Three consecutive losing weeks</li>
                        <li>ROI consistently negative over 4+ weeks</li>
                        <li>Strike rate below 30% for extended period</li>
                      </ul>
                    </div>
                    <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4 border-l-4 border-green-600 space-y-2">
                      <h3 className="font-semibold text-foreground">Positive Signs (Can Consider Increasing Stakes):</h3>
                      <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                        <li>Bankroll grows 50% or more</li>
                        <li>Consistent positive ROI over 8+ weeks</li>
                        <li>Strike rate above 40% with positive ROI</li>
                        <li>Clear patterns showing what works</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Bankroll Tracking Template */}
            <section className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <h2 className="text-2xl font-bold mb-4">Bankroll Tracking Template</h2>
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm text-muted-foreground">
                <p><strong className="text-foreground">Starting Bankroll:</strong> $_____</p>
                <p><strong className="text-foreground">Unit Size (%):</strong> _____%</p>
                <p><strong className="text-foreground">1 Unit = $_____</strong></p>
                <p className="pt-2 border-t border-border"><strong className="text-foreground">Current Bankroll:</strong> $_____</p>
                <p><strong className="text-foreground">Current Unit Size:</strong> $_____</p>
                <p><strong className="text-foreground">Total Profit/Loss:</strong> $_____</p>
                <p><strong className="text-foreground">ROI:</strong> _____%</p>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Track this weekly in Punters Journal. Use the notes feature to record bankroll adjustments and reasoning.
              </p>
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
                  href="/betting-journal-template-horse-racing"
                  className="block text-primary hover:underline"
                >
                  Betting Journal Template →
                </Link>
              </div>
            </section>

            {/* CTA */}
            <div className="text-center space-y-4">
              <Link
                href="/signup"
                className="inline-block px-8 py-3 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Start Tracking Your Bankroll in Punters Journal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

