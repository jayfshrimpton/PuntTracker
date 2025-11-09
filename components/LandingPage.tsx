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

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      Object.values(sectionRefs.current).forEach((ref) => {
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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700"></div>
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div
            ref={(el) => (sectionRefs.current['hero'] = el)}
            className="opacity-0 transition-opacity duration-1000"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
              Track Your Punts Like a Pro
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto">
              The first bet tracker built specifically for Australian horse racing punters. No spreadsheets, no formulas, just insights.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link
                href="/signup"
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 hover:bg-blue-50"
              >
                Start Tracking Free
              </Link>
              <button
                onClick={() => scrollToSection('features')}
                className="px-8 py-4 border-2 border-white text-white rounded-lg font-bold text-lg hover:bg-white/10 transition-all duration-300"
              >
                See How It Works
              </button>
            </div>

            {/* Floating stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
              {[
                { label: 'Bets Tracked', value: '10,000+', icon: '📊' },
                { label: 'Active Users', value: '500+', icon: '👥' },
                { label: 'Avg. ROI', value: '+12%', icon: '📈' },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 animate-float"
                  style={{ animationDelay: `${idx * 200}ms` }}
                >
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-blue-100 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Problem Statement */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div
          ref={(el) => (sectionRefs.current['problem'] = el)}
          className="opacity-0 transition-opacity duration-1000 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900 dark:text-white">
            Tired of Tracking Bets in Spreadsheets?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: AlertCircle,
                title: 'Broken formulas and manual calculations',
                description: 'One wrong cell reference and your entire tracking system breaks. Hours wasted fixing formulas.',
                bgColor: 'bg-red-50 dark:bg-red-900/20',
                iconColor: 'text-red-600 dark:text-red-400',
              },
              {
                icon: Smartphone,
                title: 'No mobile access at the track',
                description: 'Spreadsheets don\'t work well on your phone. You\'re stuck waiting until you get home to log bets.',
                bgColor: 'bg-orange-50 dark:bg-orange-900/20',
                iconColor: 'text-orange-600 dark:text-orange-400',
              },
              {
                icon: TrendingDown,
                title: 'Can\'t see what\'s actually profitable',
                description: 'Raw numbers don\'t tell the full story. You need insights to understand what\'s working.',
                bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
                iconColor: 'text-yellow-600 dark:text-yellow-400',
              },
            ].map((pain, idx) => (
              <div
                key={idx}
                className={`${pain.bgColor} rounded-xl p-8 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2`}
              >
                <div className={`${pain.iconColor} mb-4`}>
                  <pain.icon className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{pain.title}</h3>
                <p className="text-gray-700 dark:text-gray-300">{pain.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: Features Grid */}
      <section id="features" className="py-20 bg-white dark:bg-gray-800">
        <div
          ref={(el) => (sectionRefs.current['features'] = el)}
          className="opacity-0 transition-opacity duration-1000 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            Everything You Need to Track Your Betting
          </h2>
          <p className="text-center text-xl text-gray-600 dark:text-gray-400 mb-16">
            Built specifically for Australian horse racing punters
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: 'Quick Bet Entry',
                description: 'Log bets in seconds from your phone. Works perfectly at the track or from home.',
                color: 'from-yellow-400 to-orange-500',
              },
              {
                icon: Calculator,
                title: 'Smart Calculations',
                description: 'Automatic P&L for wins, places, each-ways, multis, and all exotics. No formulas to break.',
                color: 'from-blue-400 to-blue-600',
              },
              {
                icon: BarChart3,
                title: 'Comprehensive Stats',
                description: 'Strike rate, POT%, ROI, streaks, and more. See exactly what\'s working.',
                color: 'from-green-400 to-green-600',
              },
              {
                icon: PieChart,
                title: 'Beautiful Insights',
                description: 'Visual charts show your performance over time. Spot trends instantly.',
                color: 'from-purple-400 to-purple-600',
              },
              {
                icon: Target,
                title: 'Bet Type Breakdown',
                description: 'Compare profitability across wins, places, multis, and exotics. Know your strengths.',
                color: 'from-pink-400 to-pink-600',
              },
              {
                icon: Tablet,
                title: 'Mobile First',
                description: 'Fully responsive design. Use it anywhere, anytime. Dark mode included.',
                color: 'from-indigo-400 to-indigo-600',
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-700 rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-600"
              >
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 transform hover:scale-110 transition-transform`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/signup"
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Start Tracking Free
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 4: How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div
          ref={(el) => (sectionRefs.current['how-it-works'] = el)}
          className="opacity-0 transition-opacity duration-1000 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900 dark:text-white">
            Start Tracking in 3 Simple Steps
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 border-t-2 border-dashed border-blue-300 dark:border-blue-600"></div>
            
            {[
              {
                number: 1,
                icon: UserPlus,
                title: 'Sign Up Free',
                description: 'Create your account in 30 seconds. No credit card required.',
                color: 'from-blue-500 to-blue-600',
              },
              {
                number: 2,
                icon: PlusCircle,
                title: 'Log Your Bets',
                description: 'Enter your bets with just a few taps. Add results as races finish.',
                color: 'from-purple-500 to-purple-600',
              },
              {
                number: 3,
                icon: LineChart,
                title: 'Get Insights',
                description: 'Watch your stats update automatically. See what\'s profitable.',
                color: 'from-pink-500 to-pink-600',
              },
            ].map((step, idx) => (
              <div key={idx} className="relative text-center">
                <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white text-3xl font-bold shadow-lg`}>
                  {step.number}
                </div>
                <div className="bg-white dark:bg-gray-700 rounded-xl p-8 shadow-lg">
                  <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: Screenshot/Demo Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div
          ref={(el) => (sectionRefs.current['demo'] = el)}
          className="opacity-0 transition-opacity duration-1000 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            Built for Aussie Punters
          </h2>
          <p className="text-center text-xl text-gray-600 dark:text-gray-400 mb-16">
            See your betting performance at a glance
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Total Profit</div>
                      <div className="text-3xl font-bold text-green-600">$2,450</div>
                    </div>
                    <BarChart3 className="w-12 h-12 text-blue-600" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Strike Rate</div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white">68%</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">ROI</div>
                      <div className="text-xl font-bold text-green-600">+12.5%</div>
                    </div>
                  </div>
                  <div className="pt-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">Recent Bets</div>
                    <div className="space-y-2">
                      {['Win - $50 → $120', 'Place - $30 → $45', 'Each-Way - $40 → $0'].map((bet, idx) => (
                        <div key={idx} className="text-sm bg-gray-50 dark:bg-gray-700 p-2 rounded">
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
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-lg text-gray-700 dark:text-gray-300">{feature.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: Built for You */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div
          ref={(el) => (sectionRefs.current['built-for-you'] = el)}
          className="opacity-0 transition-opacity duration-1000 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-gray-900 dark:text-white">
            Why Aussie Punters Love PuntTracker
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Track Every Bet Type',
                description: 'Win, place, each-way, multis, quinellas, exactas, trifectas, first fours - we\'ve got you covered.',
                borderColor: 'border-blue-500',
              },
              {
                title: 'Your Data, Your Privacy',
                description: 'Completely private. Your bets are secure and only visible to you.',
                borderColor: 'border-purple-500',
              },
              {
                title: 'Free to Start',
                description: 'No hidden costs. Start tracking for free and see the value for yourself.',
                borderColor: 'border-pink-500',
              },
            ].map((benefit, idx) => (
              <div
                key={idx}
                className={`bg-white dark:bg-gray-700 rounded-xl p-8 border-l-4 ${benefit.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2`}
              >
                <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{benefit.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: Pricing/CTA Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700">
        <div
          ref={(el) => (sectionRefs.current['pricing'] = el)}
          className="opacity-0 transition-opacity duration-1000 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Track Like a Pro?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join Australian punters already using PuntTracker
          </p>
          
          <Link
            href="/signup"
            className="inline-block px-10 py-5 bg-white text-blue-600 rounded-lg font-bold text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 mb-8"
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
          
          <p className="text-sm text-blue-200">
            Currently free for all users while in beta
          </p>
        </div>
      </section>

      {/* SECTION 8: Footer */}
      <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16">
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

