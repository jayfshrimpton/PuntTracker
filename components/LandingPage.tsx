'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Zap,
  Calculator,
  BarChart3,
  PieChart,
  Target,
  Smartphone,
  UserPlus,
  LineChart,
  AlertCircle,
  TrendingDown,
  Activity,
  Tablet,
  PlusCircle,
  Check,
} from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import Logo from './Logo';

export default function LandingPage() {
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px',
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
        }
      });
    }, observerOptions);

    const observedNodes = Object.values(sectionRefs.current);

    observedNodes.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observedNodes.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* SECTION 1: Hero Section */}
      <section className="bg-foreground text-background min-h-screen flex items-center justify-center pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div
            ref={(el) => {
              sectionRefs.current['hero'] = el;
            }}
            className="opacity-0 transition-opacity duration-700"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary border border-primary/20 mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-sm font-medium">Public Beta Now Live</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold mb-6 leading-tight">
              Track Your Punts With Ease
            </h1>
            <p className="text-xl md:text-2xl text-foreground/90 mb-6 max-w-3xl mx-auto font-medium">
              Punters Journal is an Australian race-day workbook and education hub for serious, value-driven horse racing punters.
            </p>
            <p className="text-lg md:text-xl text-foreground/80 mb-12 max-w-3xl mx-auto">
              Keep the numbers clean, the workflow smooth, and the insights sharp.
              <br />
              <span className="text-primary font-bold mt-2 block">Currently free for all users during beta.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                href="/signup"
                className="px-8 py-3 rounded-lg font-semibold text-base bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200"
              >
                Start Tracking Free
              </Link>
              <button
                onClick={() => scrollToSection('features')}
                className="px-8 py-3 rounded-lg font-semibold text-base border border-border text-background hover:bg-background/10 transition-colors duration-200"
              >
                See How It Works
              </button>
            </div>

            <CountdownTimer />
          </div>
        </div>
      </section>

      {/* SECTION 2: Problem Statement */}
      <section className="py-20 bg-muted/50">
        <div
          ref={(el) => {
            sectionRefs.current['problem'] = el;
          }}
          className="opacity-0 transition-opacity duration-1000 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12">
            Tired of Tracking Bets in Spreadsheets?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: AlertCircle,
                title: 'Broken formulas and manual calculations',
                description: 'One wrong cell reference and your entire tracking system breaks. Hours wasted fixing formulas.',
              },
              {
                icon: Smartphone,
                title: 'No mobile access at the track',
                description: 'Spreadsheets don\'t work well on your phone. You\'re stuck waiting until you get home to log bets.',
              },
              {
                icon: TrendingDown,
                title: 'Can\'t see what\'s actually profitable',
                description: 'Raw numbers don\'t tell the full story. You need insights to understand what\'s working.',
              },
            ].map((pain, idx) => (
              <div
                key={idx}
                className="rounded-xl p-8 bg-card border border-border shadow-sm"
              >
                <div className="mb-4 inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary">
                  <pain.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{pain.title}</h3>
                <p className="text-foreground/80 text-lg">{pain.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: Features Grid */}
      <section id="features" className="py-20 bg-background">
        <div
          ref={(el) => {
            sectionRefs.current['features'] = el;
          }}
          className="opacity-0 transition-opacity duration-1000 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-4">
            Everything You Need to Track Your Betting
          </h2>
          <p className="text-center text-xl text-foreground/80 mb-12 max-w-2xl mx-auto">
            Built specifically for Australian horse racing punters
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Quick Bet Entry',
                description: 'Log bets in seconds from your phone. Works perfectly at the track or from home.',
              },
              {
                icon: Calculator,
                title: 'Smart Calculations',
                description: 'Automatic P&L for wins, places, each-ways, multis, and all exotics. No formulas to break.',
              },
              {
                icon: BarChart3,
                title: 'Comprehensive Stats',
                description: 'Strike rate, POT%, ROI, streaks, and more. See exactly what\'s working.',
              },
              {
                icon: PieChart,
                title: 'Beautiful Insights',
                description: 'Visual charts show your performance over time. Spot trends instantly.',
              },
              {
                icon: Target,
                title: 'Bet Type Breakdown',
                description: 'Compare profitability across wins, places, multis, and exotics. Know your strengths.',
              },
              {
                icon: Tablet,
                title: 'Mobile First',
                description: 'Fully responsive design. Use it anywhere, anytime. Dark mode included.',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-card rounded-xl p-8 border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-foreground/80 text-lg leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/signup"
              className="inline-block px-8 py-3 rounded-lg font-semibold text-base border border-border hover:bg-muted transition-colors"
            >
              Start Tracking Free
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 4: How It Works */}
      <section id="how-it-works" className="py-20 bg-muted/50">
        <div
          ref={(el) => {
            sectionRefs.current['how-it-works'] = el;
          }}
          className="opacity-0 transition-opacity duration-1000 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12">
            Start Tracking in 3 Simple Steps
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-px bg-border"></div>

            {[
              {
                number: 1,
                icon: UserPlus,
                title: 'Sign Up Free',
                description: 'Create your account in 30 seconds. No credit card required.',
              },
              {
                number: 2,
                icon: PlusCircle,
                title: 'Log Your Bets',
                description: 'Enter your bets with just a few taps. Add results as races finish.',
              },
              {
                number: 3,
                icon: LineChart,
                title: 'Get Insights',
                description: 'Watch your stats update automatically. See what\'s profitable.',
              },
            ].map((step, idx) => (
              <div key={idx} className="relative text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-3xl font-semibold shadow-lg">
                  {step.number}
                </div>
                <div className="bg-card rounded-xl p-8 border border-border shadow-sm">
                  <div className="w-14 h-14 mx-auto mb-6 rounded-lg bg-primary/10 flex items-center justify-center">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                  <p className="text-foreground/80 text-lg">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: Screenshot/Demo Section */}
      <section className="py-20 bg-background">
        <div
          ref={(el) => {
            sectionRefs.current['demo'] = el;
          }}
          className="opacity-0 transition-opacity duration-1000 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-4">
            Built for Aussie Punters
          </h2>
          <p className="text-center text-xl text-foreground/80 mb-12">
            See your betting performance at a glance
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-muted rounded-2xl p-8 border border-border">
                <div className="bg-card rounded-lg p-6 space-y-4 border border-border shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Total Profit</div>
                      <div className="text-3xl font-bold text-green-600">$2,450</div>
                    </div>
                    <BarChart3 className="w-10 h-10 text-muted-foreground/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div>
                      <div className="text-sm text-muted-foreground">Strike Rate</div>
                      <div className="text-xl font-semibold">68%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">ROI</div>
                      <div className="text-xl font-semibold text-green-600">+12.5%</div>
                    </div>
                  </div>
                  <div className="pt-4">
                    <div className="text-sm text-muted-foreground mb-2">Recent Bets</div>
                    <div className="space-y-2">
                      {['Win - $50 → $120', 'Place - $30 → $45', 'Each-Way - $40 → $0'].map((bet, idx) => (
                        <div key={idx} className="text-sm bg-muted/50 p-2 rounded">
                          {bet}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-6">
              {[
                { icon: Activity, text: 'Real-time stats update as you log bets' },
                { icon: Target, text: 'Track all bet types: win, place, each-way, multis, exotics' },
                { icon: PieChart, text: 'Visual charts show your performance trends' },
                { icon: Smartphone, text: 'Works perfectly on mobile at the track' },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg text-foreground/90 font-medium">{feature.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: Built for You */}
      <section className="py-20 bg-muted/50">
        <div
          ref={(el) => {
            sectionRefs.current['built-for-you'] = el;
          }}
          className="opacity-0 transition-opacity duration-1000 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12">
            Why Aussie Punters Love Punter&apos;s Journal
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Track Every Bet Type',
                description: 'Win, place, each-way, multis, quinellas, exactas, trifectas, first fours - we\'ve got you covered.',
                borderColor: 'border-primary',
              },
              {
                title: 'Your Data, Your Privacy',
                description: 'Completely private. Your bets are secure and only visible to you.',
                borderColor: 'border-primary',
              },
              {
                title: 'Free to Start',
                description: 'No hidden costs. Start tracking for free and see the value for yourself.',
                borderColor: 'border-primary',
              },
            ].map((benefit, idx) => (
              <div
                key={idx}
                className={`bg-card rounded-xl p-8 border-l-4 ${benefit.borderColor} border-y border-r border-border shadow-sm`}
              >
                <h3 className="text-xl font-bold mb-4">{benefit.title}</h3>
                <p className="text-foreground/80 text-lg">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: Pricing/CTA Section */}
      <section id="pricing" className="py-20 bg-foreground text-background">
        <div
          ref={(el) => {
            sectionRefs.current['pricing'] = el;
          }}
          className="opacity-0 transition-opacity duration-1000 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-semibold mb-6">
            Ready to Track Like a Pro?
          </h2>
          <p className="text-xl text-foreground/90 mb-10">
            Join Australian punters already using Punter&apos;s Journal
          </p>

          <Link
            href="/signup"
            className="inline-block px-8 py-3 rounded-lg font-semibold text-base bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200 mb-8"
          >
            Start Tracking Free
          </Link>

          <div className="flex flex-wrap justify-center items-center gap-6 text-primary-foreground/80 mb-6">
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5" />
              <span>Free to use</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="w-5 h-5" />
              <span>Cancel anytime</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground/110">
            Currently free for all users while in beta
          </p>
        </div>
      </section>

      {/* SECTION 8: Footer */}
      <footer className="bg-background border-t border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Logo size={24} variant="landing" />
                <span className="text-xl font-bold">Punter&apos;s Journal</span>
              </div>
              <p className="text-muted-foreground text-sm">
                Punters Journal is an Australian race-day workbook and education hub for serious, value-driven horse racing punters.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <button onClick={() => scrollToSection('features')} className="hover:text-primary transition-colors">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('how-it-works')} className="hover:text-primary transition-colors">
                    How It Works
                  </button>
                </li>
                <li>
                  <Link href="/what-is-punters-journal" className="hover:text-primary transition-colors">
                    What is Punters Journal?
                  </Link>
                </li>
                <li>
                  <Link href="/getting-started" className="hover:text-primary transition-colors">
                    Getting Started
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/race-day-betting-checklist" className="hover:text-primary transition-colors">
                    Race Day Checklist
                  </Link>
                </li>
                <li>
                  <Link href="/bankroll-management-workbook-australian-punters" className="hover:text-primary transition-colors">
                    Bankroll Workbook
                  </Link>
                </li>
                <li>
                  <Link href="/betting-journal-template-horse-racing" className="hover:text-primary transition-colors">
                    Journal Template
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacy" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 Punter&apos;s Journal. Built for Aussie punters.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

