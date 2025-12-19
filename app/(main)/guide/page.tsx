'use client';

import { BookOpen, Target, AlertTriangle, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function UserGuidePage() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-10">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">User Guide</h1>
                <p className="text-muted-foreground">
                    Welcome to Punters Journal! This guide will help you get started and make the most of your tracking.
                </p>
            </div>

            {/* Resources Section */}
            <div className="bg-card rounded-xl border border-border shadow-sm">
                <div className="p-6 pb-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Resources & Guides
                    </h2>
                </div>
                <div className="p-6 pt-0 space-y-4">
                    <p className="text-muted-foreground mb-4">
                        Explore these resources to get the most out of Punters Journal:
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Link href="/what-is-punters-journal" className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                What is Punters Journal?
                                <ExternalLink className="h-4 w-4" />
                            </h3>
                            <p className="text-sm text-muted-foreground">Complete overview of Punters Journal and how it differs from other betting resources.</p>
                        </Link>
                        <Link href="/getting-started" className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                Getting Started
                                <ExternalLink className="h-4 w-4" />
                            </h3>
                            <p className="text-sm text-muted-foreground">30-Day Challenge, Race Day Checklist, and example journal entries.</p>
                        </Link>
                        <Link href="/race-day-betting-checklist" className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                Race Day Checklist
                                <ExternalLink className="h-4 w-4" />
                            </h3>
                            <p className="text-sm text-muted-foreground">Punters Journal&apos;s systematic framework for race day preparation.</p>
                        </Link>
                        <Link href="/bankroll-management-workbook-australian-punters" className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                Bankroll Workbook
                                <ExternalLink className="h-4 w-4" />
                            </h3>
                            <p className="text-sm text-muted-foreground">Systematic bankroll management framework for Australian punters.</p>
                        </Link>
                        <Link href="/betting-journal-template-horse-racing" className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                            <h3 className="font-semibold mb-2 flex items-center gap-2">
                                Journal Template
                                <ExternalLink className="h-4 w-4" />
                            </h3>
                            <p className="text-sm text-muted-foreground">Structured template for tracking horse racing bets systematically.</p>
                        </Link>
                    </div>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Getting Started */}
                <div className="bg-card rounded-xl border border-border shadow-sm">
                    <div className="p-6 pb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-primary" />
                            Getting Started
                        </h2>
                    </div>
                    <div className="p-6 pt-0 space-y-4">
                        <div className="grid gap-4">
                            <div className="p-4 bg-muted/50 rounded-lg">
                                <h3 className="font-semibold mb-2">1. Dashboard</h3>
                                <p className="text-sm text-muted-foreground">Your main hub showing performance overview, recent activity, and key metrics.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Core Features */}
                <div className="bg-card rounded-xl border border-border shadow-sm">
                    <div className="p-6 pb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" />
                            Core Features
                        </h2>
                    </div>
                    <div className="p-6 pt-0 space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Adding a Bet</h3>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                                <li>Click the <span className="font-medium text-foreground">&quot;Add Bet&quot;</span> button in the navigation.</li>
                                <li>Fill in the details:
                                    <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                                        <li><span className="font-medium text-foreground">Bet Type</span>: Win, Place, Each Way, Multi, etc.</li>
                                        <li><span className="font-medium text-foreground">Stake</span>: How much you wagered.</li>
                                        <li><span className="font-medium text-foreground">Odds</span>: The decimal odds (e.g., 2.50).</li>
                                        <li><span className="font-medium text-foreground">Date</span>: When the bet was placed.</li>
                                        <li><span className="font-medium text-foreground">Outcome</span>: Pending, Win, Loss (can be updated later).</li>
                                    </ul>
                                </li>
                            </ul>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Managing Bets</h3>
                                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                                    <li><span className="font-medium text-foreground">Edit</span>: Update outcomes or fix mistakes via the edit icon.</li>
                                    <li><span className="font-medium text-foreground">Delete</span>: Remove bets permanently if needed.</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-3">Viewing Stats</h3>
                                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                                    <li>Dashboard updates automatically.</li>
                                    <li>Track <span className="font-medium text-foreground">Profit/Loss</span>, <span className="font-medium text-foreground">ROI</span>, and <span className="font-medium text-foreground">Strike Rate</span>.</li>
                                    <li>Analyze performance over time with charts.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reporting Issues */}
                <div className="bg-card rounded-xl border border-border shadow-sm">
                    <div className="p-6 pb-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-primary" />
                            Reporting Issues
                        </h2>
                    </div>
                    <div className="p-6 pt-0">
                        <p className="mb-4 text-muted-foreground">If you find a bug or have a suggestion:</p>
                        <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-2">
                            <li>Take a screenshot if possible.</li>
                            <li>Note what you were doing when it happened.</li>
                            <li>Send feedback via the &quot;Feedback&quot; button in the app.</li>
                        </ul>
                        <p className="mt-6 font-semibold text-center text-lg">Happy Punting! 🐎</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
