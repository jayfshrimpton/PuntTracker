import { generateMetadata } from "@/lib/seo";
import Link from "next/link";
import { CheckCircle2, Clock, FileText, Target } from "lucide-react";

export const metadata = generateMetadata({
  title: "Race Day Betting Checklist",
  description: "Punters Journal's Race Day Betting Checklist: A step-by-step framework for serious Australian horse racing punters to prepare for race day and track bets systematically.",
  keywords: ["race day checklist", "betting checklist", "horse racing preparation", "Australian punters"],
  path: "/race-day-betting-checklist",
});

export default function RaceDayChecklistPage() {
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "Punters Journal's Race Day Betting Checklist",
    "description": "A systematic framework for preparing and executing bets on Australian horse racing race days",
    "step": [
      {
        "@type": "HowToStep",
        "name": "Pre-Race Day Preparation",
        "text": "Review upcoming race meetings, identify target races, and prepare your analysis tools.",
        "position": 1
      },
      {
        "@type": "HowToStep",
        "name": "Race Day Morning Review",
        "text": "Check scratchings, track conditions, jockey changes, and market movements.",
        "position": 2
      },
      {
        "@type": "HowToStep",
        "name": "Pre-Race Analysis",
        "text": "Review form guides, Daily Sectionals, and identify value opportunities.",
        "position": 3
      },
      {
        "@type": "HowToStep",
        "name": "Place Bets",
        "text": "Execute bets at identified value odds on your chosen bookmaker.",
        "position": 4
      },
      {
        "@type": "HowToStep",
        "name": "Log in Punters Journal",
        "text": "Immediately log all bet details including type, odds, stake, and strategy tags.",
        "position": 5
      },
      {
        "@type": "HowToStep",
        "name": "Post-Race Update",
        "text": "Update outcomes, finishing positions, and review performance.",
        "position": 6
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
                Punters Journal&apos;s Race Day Betting Checklist
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                A systematic framework for serious Australian horse racing punters
              </p>
            </div>

            {/* Introduction */}
            <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <p className="text-muted-foreground">
                This checklist ensures you don&apos;t miss critical steps on race day. Use it as a reference before, during, and after race meetings. Serious punters follow systematic processes—this checklist helps you build that discipline.
              </p>
            </div>

            {/* Pre-Race Day */}
            <section className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">Pre-Race Day Preparation</h2>
                  <div className="space-y-3">
                    {[
                      "Review upcoming race meetings and identify target races",
                      "Check race fields and nominations",
                      "Set bankroll allocation for the day",
                      "Prepare analysis tools (form guides, Daily Sectionals access)",
                      "Review your recent performance in Punters Journal to identify patterns",
                      "Set betting limits and stick to them"
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Race Day Morning */}
            <section className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">Race Day Morning Review</h2>
                  <div className="space-y-3">
                    {[
                      "Check final scratchings and jockey changes",
                      "Review track conditions and weather forecast",
                      "Check barrier draws and any late market movements",
                      "Verify your bankroll balance and betting limits",
                      "Open Punters Journal and prepare to log bets",
                      "Review any notes from previous meetings at the same venue"
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Pre-Race Analysis */}
            <section className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">Pre-Race Analysis (30-60 minutes before race)</h2>
                  <div className="space-y-3">
                    {[
                      "Review form guides and identify key form factors",
                      "Check Daily Sectionals for pace maps and section times",
                      "Analyze market movements and identify value",
                      "Compare your assessment with market odds",
                      "Identify specific bet types (win, place, each-way, exotic)",
                      "Set target odds and stake amounts",
                      "Note any strategy tags (e.g., 'pace play', 'value bet', 'system bet')"
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Place Bets */}
            <section className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">Place Bets</h2>
                  <div className="space-y-3">
                    {[
                      "Execute bets at your identified value odds",
                      "Note the exact odds you received (not just the market odds)",
                      "Record starting price (SP) if betting on Betfair",
                      "Confirm stake amounts match your bankroll allocation",
                      "Keep bet receipts or confirmation numbers"
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Log in Punters Journal */}
            <section className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">Log in Punters Journal (Immediately)</h2>
                  <div className="space-y-3">
                    {[
                      "Open Punters Journal on your phone or device",
                      "Click 'Add Bet' and enter all details:",
                      "  • Bet type (win, place, each-way, multi, exotic)",
                      "  • Horse name and race name",
                      "  • Odds (exact odds received)",
                      "  • Stake amount",
                      "  • Venue and race class",
                      "  • Strategy tags (if applicable)",
                      "  • Notes (e.g., 'pace play', 'value at 3.50')",
                      "Set outcome to 'Pending' initially",
                      "This should take 30-60 seconds per bet"
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Post-Race Update */}
            <section className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">Post-Race Update</h2>
                  <div className="space-y-3">
                    {[
                      "Update bet outcome (Win/Loss) in Punters Journal",
                      "Record finishing position",
                      "Add any post-race notes (e.g., 'poor barrier', 'slow start')",
                      "Review if the bet matched your pre-race analysis",
                      "Check if odds represented value in hindsight"
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* End of Day Review */}
            <section className="bg-card rounded-xl border border-border p-8 shadow-sm">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold mb-4">End of Day Review</h2>
                  <div className="space-y-3">
                    {[
                      "Review your Punters Journal dashboard for the day",
                      "Check total profit/loss and ROI",
                      "Identify which bet types performed best",
                      "Note any patterns or lessons learned",
                      "Update bankroll balance",
                      "Plan adjustments for next race day"
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{item}</span>
                      </div>
                    ))}
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
                  href="/bankroll-management-workbook-australian-punters"
                  className="block text-primary hover:underline"
                >
                  Bankroll Management Workbook →
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
                Start Using Punters Journal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

