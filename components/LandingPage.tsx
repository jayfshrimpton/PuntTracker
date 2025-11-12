'use client';

import { useEffect, useRef } from 'react';
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
  TrendingUp,
} from 'lucide-react';

export default function LandingPage() {
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
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
    <div className="min-h-screen">
      {/* SECTION 1: Hero Section */}
      <section className="bg-slate-950 text-white min-h-screen flex items-center justify-center pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div
          ref={(el) => {
            sectionRefs.current['hero'] = el;
          }}
            className="opacity-0 transition-opacity duration-700"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white mb-6 leading-tight">
              Track Your Punts With Ease
            </h1>
            <p className="text-lg md:text-xl text-slate-200 mb-12 max-w-3xl mx-auto">
              Purpose-built for Australian horse racing punters. Keep the numbers clean, the workflow smooth, and the insights sharp.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link
                href="/signup"
                className="px-8 py-3 rounded-lg font-semibold text-base bg-slate-100 text-slate-900 hover:bg-white transition-colors duration-200"
              >
                Start Tracking Free
              </Link>
              <button
                onClick={() => scrollToSection('features')}
                className="px-8 py-3 rounded-lg font-semibold text-base border border-slate-500 text-white hover:border-white transition-colors duration-200"
              >
                See How It Works
              </button>
            </div>

            {/* Floating stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { label: 'Bets Tracked', value: '10,000+', icon: '📊' },
                { label: 'Active Users', value: '500+', icon: '👥' },
                { label: 'Avg. ROI', value: '+12%', icon: '📈' },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="rounded-xl p-6 border border-slate-800 bg-slate-900/60 text-left"
                >
                  <div className="text-2xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-semibold text-white mb-1">{stat.value}</div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Problem Statement */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div
          ref={(el) => {
            sectionRefs.current['problem'] = el;
          }}
          className="opacity-0 transition-opacity duration-1000 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12 text-slate-900 dark:text-white">
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
                className="rounded-xl p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
              >
                <div className="mb-4 inline-flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-100">
                  <pain.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900 dark:text-white">{pain.title}</h3>
                <p className="text-slate-600 dark:text-slate-300">{pain.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: Features Grid */}
      <section id="features" className="py-20 bg-white dark:bg-slate-950">
        <div
          ref={(el) => {
            sectionRefs.current['features'] = el;
          }}
          className="opacity-0 transition-opacity duration-1000 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-4 text-slate-900 dark:text-white">
            Everything You Need to Track Your Betting
          </h2>
          <p className="text-center text-lg text-slate-600 dark:text-slate-300 mb-12">
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
                className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800"
              >
                <div className="w-14 h-14 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-slate-700 dark:text-slate-100" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-300">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/signup"
              className="inline-block px-8 py-3 rounded-lg font-semibold text-base border border-slate-400 text-slate-900 dark:text-white hover:border-slate-900 dark:hover:border-white transition-colors"
            >
              Start Tracking Free
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 4: How It Works */}
      <section id="how-it-works" className="py-20 bg-slate-50 dark:bg-slate-950">
        <div
          ref={(el) => {
            sectionRefs.current['how-it-works'] = el;
          }}
          className="opacity-0 transition-opacity duration-1000 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12 text-slate-900 dark:text-white">
            Start Tracking in 3 Simple Steps
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-px bg-slate-200 dark:bg-slate-800"></div>
            
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
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center text-3xl font-semibold">
                  {step.number}
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800">
                  <div className="w-14 h-14 mx-auto mb-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <step.icon className="w-7 h-7 text-slate-700 dark:text-slate-100" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: Screenshot/Demo Section */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div
          ref={(el) => {
            sectionRefs.current['demo'] = el;
          }}
          className="opacity-0 transition-opacity duration-1000 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-4 text-slate-900 dark:text-white">
            Built for Aussie Punters
          </h2>
          <p className="text-center text-lg text-slate-600 dark:text-slate-300 mb-12">
            See your betting performance at a glance
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800">
                <div className="bg-white dark:bg-slate-900 rounded-lg p-6 space-y-4 border border-slate-200/50 dark:border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Total Profit</div>
                      <div className="text-3xl font-bold text-green-600">$2,450</div>
                    </div>
                    <BarChart3 className="w-10 h-10 text-slate-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">Strike Rate</div>
                      <div className="text-xl font-semibold text-slate-900 dark:text-white">68%</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">ROI</div>
                      <div className="text-xl font-semibold text-emerald-500">+12.5%</div>
                    </div>
                  </div>
                  <div className="pt-4">
                    <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">Recent Bets</div>
                    <div className="space-y-2">
                      {['Win - $50 → $120', 'Place - $30 → $45', 'Each-Way - $40 → $0'].map((bet, idx) => (
                        <div key={idx} className="text-sm bg-slate-50 dark:bg-slate-800 p-2 rounded">
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
                  <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-slate-700 dark:text-slate-100" />
                  </div>
                  <div>
                    <p className="text-base text-slate-600 dark:text-slate-300">{feature.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: Built for You */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div
          ref={(el) => {
            sectionRefs.current['built-for-you'] = el;
          }}
          className="opacity-0 transition-opacity duration-1000 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12 text-slate-900 dark:text-white">
            Why Aussie Punters Love PuntTracker
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Track Every Bet Type',
                description: 'Win, place, each-way, multis, quinellas, exactas, trifectas, first fours - we\'ve got you covered.',
                borderColor: 'border-slate-300 dark:border-slate-700',
              },
              {
                title: 'Your Data, Your Privacy',
                description: 'Completely private. Your bets are secure and only visible to you.',
                borderColor: 'border-slate-300 dark:border-slate-700',
              },
              {
                title: 'Free to Start',
                description: 'No hidden costs. Start tracking for free and see the value for yourself.',
                borderColor: 'border-slate-300 dark:border-slate-700',
              },
            ].map((benefit, idx) => (
              <div
                key={idx}
                className={`bg-white dark:bg-slate-900 rounded-xl p-8 border-l-4 ${benefit.borderColor} border border-slate-200 dark:border-slate-800`}
              >
                <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">{benefit.title}</h3>
                <p className="text-slate-600 dark:text-slate-300">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: Pricing/CTA Section */}
      <section id="pricing" className="py-20 bg-slate-950 text-white">
        <div
          ref={(el) => {
            sectionRefs.current['pricing'] = el;
          }}
          className="opacity-0 transition-opacity duration-1000 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-semibold mb-6">
            Ready to Track Like a Pro?
          </h2>
          <p className="text-lg text-slate-300 mb-10">
            Join Australian punters already using PuntTracker
          </p>
          
          <Link
            href="/signup"
            className="inline-block px-8 py-3 rounded-lg font-semibold text-base bg-white text-slate-900 hover:bg-slate-100 transition-colors duration-200 mb-8"
          >
            Start Tracking Free
          </Link>
          
          <div className="flex flex-wrap justify-center items-center gap-6 text-blue-100 mb-6">
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
          
          <p className="text-sm text-slate-400">
            Currently free for all users while in beta
          </p>
        </div>
      </section>

      {/* SECTION 8: Footer */}
      <footer className="bg-slate-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-6 h-6" />
                <span className="text-xl font-bold">PuntTracker</span>
              </div>
              <p className="text-gray-400 text-sm">
                The bet tracker built for Australian horse racing punters.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors">
                    How It Works
                  </button>
                </li>
                <li>
                  <Link href="/dashboard/feedback" className="hover:text-white transition-colors">
                    Feedback
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
            <p>© 2024 PuntTracker. Built for Aussie punters.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

