"use client";

import { useState, useEffect, useRef } from "react";
import Logo from "@/components/Logo";
export default function LandingPage() {
  const [billingAnnual, setBillingAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsVisible, setStatsVisible] = useState(false);
  const year = new Date().getFullYear();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsVisible(true);
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const faqs = [
    {
      q: "Is this only for horse racing?",
      a: "Yes — Punters Journal is built specifically for Australian horse racing punters. Every feature, stat, and insight is designed around the way Aussies bet on the races.",
    },
    {
      q: "What bet types can I track?",
      a: "Win, place, each-way, lay, multi, quinella, exacta, trifecta, first four, and more. If you're putting money on it, you can track it.",
    },
    {
      q: "How is this different from a spreadsheet?",
      a: "Automatic P&L calculations, AI-powered insights, visualisations, mobile-first design, and streak tracking — all without touching a formula. Your spreadsheet can't tell you your ROI is down 12% on wet tracks.",
    },
    {
      q: "What's the founding member deal?",
      a: "First 100 paying users lock in $10/month forever — even as the standard price rises. That's our way of saying thanks to the early believers.",
    },
    {
      q: "Can I cancel anytime?",
      a: "Yes, no lock-in contracts. Cancel from your account settings any time. We'd rather earn your subscription every month.",
    },
    {
      q: "Is my data private?",
      a: "Absolutely. Your bet history is private to you and stored securely. We'll never share or sell your data.",
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        html { scroll-behavior: smooth; }

        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 100;
          padding: 0 2rem;
          padding-top: env(safe-area-inset-top, 0px);
          transition: all 0.3s ease;
        }
        .nav.scrolled {
          background: rgba(250,250,249,0.92);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .nav-inner {
          max-width: 1100px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          height: 64px;
        }
        .nav-logo {
          display: flex; align-items: center; gap: 10px;
          font-family: var(--font-dm-serif-display), ui-serif, Georgia, serif;
          font-size: 1.2rem; color: #1a1a18; text-decoration: none;
        }
        .nav-logo .logo-wrap { flex-shrink: 0; }
        .nav-links {
          display: flex; align-items: center; gap: 2rem; list-style: none;
        }
        .nav-links a {
          font-size: 0.875rem; color: #555; text-decoration: none;
          font-weight: 400; transition: color 0.2s;
        }
        .nav-links a:hover { color: #1a1a18; }
        .nav-cta {
          background: #1a1a18; color: #fff !important;
          padding: 0.5rem 1.25rem; border-radius: 8px;
          font-weight: 500 !important;
          transition: background 0.2s, opacity 0.2s !important;
        }
        .nav-cta:hover { background: #333; opacity: 1 !important; }

        .nav-mobile-shortcuts {
          display: none; align-items: center; gap: 1rem;
        }
        .nav-mobile-shortcuts a {
          font-size: 0.8rem; color: #555; text-decoration: none; font-weight: 400;
        }
        .nav-mobile-shortcuts a:hover { color: #1a1a18; }
        .nav-cta-mini {
          background: #1a1a18; color: #fff !important;
          padding: 0.4rem 0.85rem; border-radius: 8px; font-weight: 500 !important; font-size: 0.8rem !important;
        }
        .nav-cta-mini:hover { background: #333; }

        .hero {
          padding: calc(140px + env(safe-area-inset-top, 0px)) 2rem 80px;
          max-width: 1100px; margin: 0 auto;
          display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center;
        }
        @media (max-width: 768px) {
          .hero { grid-template-columns: 1fr; padding: calc(120px + env(safe-area-inset-top, 0px)) 1rem 56px; gap: 2.5rem; }
          .nav { padding: 0 1rem; }
          .nav-inner { height: auto; min-height: 56px; }
          .nav-links { display: none; }
          .nav-mobile-shortcuts { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 0.5rem 0.75rem; max-width: 58%; }
          .hero-visual { order: -1; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .stat-block {
            border-right: none !important;
            padding: 2.25rem 1rem;
          }
          .stat-block:nth-child(-n+2) { border-bottom: 1px solid rgba(255,255,255,0.08); }
          .features-grid { grid-template-columns: 1fr !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .pricing-card.featured { transform: none; }
          .pricing-card.featured:hover { transform: translateY(-4px); }
          .social-grid { grid-template-columns: 1fr !important; }
          section { padding: 72px 1rem; }
          .cta-section { padding: 72px 1rem; }
          footer { padding: 2.5rem 1rem; }
          .billing-toggle { flex-wrap: wrap; justify-content: center; row-gap: 0.75rem; column-gap: 1rem; }
          .faq-btn { padding: 1rem 1.1rem; font-size: 0.9rem; }
          .faq-answer { padding: 0 1.1rem 1.1rem; }
        }
        @media (max-width: 480px) {
          .db-stats { gap: 0.65rem; }
          .db-stat-val { font-size: 1.1rem; }
          .db-chart { gap: 2px; }
        }

        .eyebrow {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 0.75rem; font-weight: 500; letter-spacing: 0.08em;
          text-transform: uppercase; color: #6d28d9;
          background: #ede9fe; padding: 4px 12px; border-radius: 20px;
          margin-bottom: 1.5rem;
        }
        .eyebrow-dot { width: 6px; height: 6px; background: #6d28d9; border-radius: 50%; }

        h1 {
          font-family: var(--font-dm-serif-display), ui-serif, Georgia, serif;
          font-size: clamp(2.4rem, 5vw, 3.6rem);
          line-height: 1.1; color: #1a1a18;
          margin-bottom: 1.5rem;
        }
        h1 em { font-style: italic; color: #6d28d9; }

        .hero-sub {
          font-size: 1.05rem; color: #555; line-height: 1.7;
          margin-bottom: 2.5rem; font-weight: 300;
        }

        .hero-actions {
          display: flex; gap: 1rem; align-items: center; flex-wrap: wrap;
        }

        .btn-primary {
          background: #1a1a18; color: #fff;
          padding: 0.875rem 1.75rem; border-radius: 10px;
          font-size: 0.95rem; font-weight: 500;
          text-decoration: none; display: inline-block;
          transition: all 0.2s; border: none; cursor: pointer;
          font-family: var(--font-dm-sans), system-ui, sans-serif;
        }
        .btn-primary:hover { background: #333; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }

        .btn-secondary {
          color: #1a1a18; font-size: 0.95rem; font-weight: 400;
          text-decoration: none; display: inline-flex; align-items: center; gap: 6px;
          padding: 0.875rem 0; transition: gap 0.2s;
          background: none; border: none; cursor: pointer;
          font-family: var(--font-dm-sans), system-ui, sans-serif;
        }
        .btn-secondary:hover { gap: 10px; }

        .trust-row {
          display: flex; align-items: center; gap: 1.5rem; margin-top: 2.5rem;
          flex-wrap: wrap;
        }
        .trust-avatars { display: flex; }
        .trust-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          border: 2px solid #fff; margin-left: -8px;
          background: #ddd; overflow: hidden; font-size: 0.7rem;
          display: flex; align-items: center; justify-content: center;
          font-weight: 600; color: #555;
        }
        .trust-avatar:first-child { margin-left: 0; }
        .trust-text { font-size: 0.8rem; color: #777; line-height: 1.4; }
        .trust-text strong { color: #1a1a18; }

        /* Dashboard mockup */
        .dashboard-card {
          background: #fff; border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.08);
          box-shadow: 0 20px 60px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04);
          padding: 1.5rem; position: relative; overflow: hidden;
        }
        .dashboard-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #6d28d9, #8b5cf6);
        }
        .db-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
        .db-title { font-size: 0.8rem; font-weight: 500; color: #888; text-transform: uppercase; letter-spacing: 0.06em; }
        .db-badge { font-size: 0.7rem; background: #ede9fe; color: #6d28d9; padding: 3px 8px; border-radius: 6px; font-weight: 500; }
        .db-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.25rem; }
        .db-stat-label { font-size: 0.7rem; color: #aaa; margin-bottom: 4px; }
        .db-stat-val { font-size: 1.3rem; font-weight: 600; color: #1a1a18; }
        .db-stat-val.green { color: #6d28d9; }
        .db-stat-val.red { color: #e05252; }
        .db-chart { height: 80px; display: flex; align-items: flex-end; gap: 4px; margin-bottom: 1.25rem; }
        .db-bar {
          flex: 1; border-radius: 4px 4px 0 0;
          transition: height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .db-recent { border-top: 1px solid #f0f0ee; padding-top: 1rem; }
        .db-recent-title { font-size: 0.7rem; color: #aaa; margin-bottom: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; }
        .db-bet-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #f8f8f7; }
        .db-bet-row:last-child { border-bottom: none; }
        .db-bet-name { font-size: 0.8rem; color: #333; }
        .db-bet-type { font-size: 0.7rem; color: #aaa; }
        .db-bet-amount { font-size: 0.8rem; font-weight: 500; }

        /* Sections */
        section { padding: 100px 2rem; }
        .section-inner { max-width: 1100px; margin: 0 auto; }

        .section-eyebrow {
          font-size: 0.75rem; font-weight: 500; letter-spacing: 0.1em;
          text-transform: uppercase; color: #6d28d9; margin-bottom: 1rem;
        }
        h2 {
          font-family: var(--font-dm-serif-display), ui-serif, Georgia, serif;
          font-size: clamp(2rem, 4vw, 2.8rem);
          line-height: 1.15; color: #1a1a18; margin-bottom: 1.25rem;
        }
        h2 em { font-style: italic; color: #6d28d9; }
        .section-sub {
          font-size: 1rem; color: #666; line-height: 1.7; max-width: 500px;
          font-weight: 300;
        }

        /* Stats bar */
        .stats-section { background: #1a1a18; }
        .stats-grid {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 0; max-width: 1100px; margin: 0 auto;
        }
        .stat-block {
          padding: 3.5rem 2rem; border-right: 1px solid rgba(255,255,255,0.08);
          text-align: center;
        }
        .stat-block:last-child { border-right: none; }
        .stat-num {
          font-family: var(--font-dm-serif-display), ui-serif, Georgia, serif;
          font-size: clamp(2rem, 4vw, 3rem); color: #fff;
          margin-bottom: 0.5rem;
          opacity: 0; transform: translateY(20px);
          transition: all 0.6s ease;
        }
        .stat-num.visible { opacity: 1; transform: translateY(0); }
        .stat-num:nth-child(1) { transition-delay: 0s; }
        .stat-label { font-size: 0.8rem; color: rgba(255,255,255,0.45); text-transform: uppercase; letter-spacing: 0.08em; }

        /* Features */
        .features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5px; background: #e8e8e6; border-radius: 16px; overflow: hidden; }
        .feature-card {
          background: #fff; padding: 2rem;
          transition: background 0.2s;
        }
        .feature-card:hover { background: #fdfdf9; }
        .feature-icon {
          width: 40px; height: 40px; background: #f5f3ff; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.1rem; margin-bottom: 1rem;
        }
        .feature-title { font-size: 0.95rem; font-weight: 600; color: #1a1a18; margin-bottom: 0.5rem; }
        .feature-desc { font-size: 0.85rem; color: #777; line-height: 1.6; }

        /* Pricing */
        .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .pricing-card {
          background: #fff; border: 1px solid #e8e8e6; border-radius: 16px;
          padding: 2rem; position: relative;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .pricing-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.08); }
        .pricing-card.featured {
          background: #1a1a18; color: #fff; border-color: #1a1a18;
          transform: scale(1.03);
        }
        .pricing-card.featured:hover { transform: scale(1.03) translateY(-4px); }
        .pricing-badge {
          position: absolute; top: -12px; left: 50%; transform: translateX(-50%);
          background: #6d28d9; color: #fff;
          font-size: 0.7rem; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase;
          padding: 4px 14px; border-radius: 20px;
        }
        .plan-name { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #aaa; margin-bottom: 0.75rem; }
        .pricing-card.featured .plan-name { color: rgba(255,255,255,0.5); }
        .plan-price { display: flex; align-items: baseline; gap: 4px; margin-bottom: 0.5rem; }
        .price-amount { font-family: var(--font-dm-serif-display), ui-serif, Georgia, serif; font-size: 2.5rem; color: #1a1a18; }
        .pricing-card.featured .price-amount { color: #fff; }
        .price-period { font-size: 0.85rem; color: #aaa; }
        .pricing-card.featured .price-period { color: rgba(255,255,255,0.45); }
        .plan-tagline { font-size: 0.85rem; color: #777; margin-bottom: 1.5rem; line-height: 1.5; }
        .pricing-card.featured .plan-tagline { color: rgba(255,255,255,0.6); }
        .plan-features { list-style: none; margin-bottom: 2rem; display: flex; flex-direction: column; gap: 0.625rem; }
        .plan-features li { display: flex; gap: 8px; align-items: flex-start; font-size: 0.85rem; color: #444; }
        .pricing-card.featured .plan-features li { color: rgba(255,255,255,0.8); }
        .check { color: #6d28d9; font-size: 0.9rem; flex-shrink: 0; margin-top: 1px; }
        .pricing-card.featured .check { color: #8b5cf6; }
        .plan-cta {
          display: block; text-align: center; padding: 0.875rem;
          border-radius: 10px; font-size: 0.9rem; font-weight: 500;
          text-decoration: none; cursor: pointer; border: none;
          font-family: var(--font-dm-sans), system-ui, sans-serif;
          transition: all 0.2s;
        }
        .cta-dark { background: #1a1a18; color: #fff; }
        .cta-dark:hover { background: #333; }
        .cta-white { background: #fff; color: #1a1a18; }
        .cta-white:hover { background: #f5f5f4; }
        .cta-outline { background: transparent; color: #1a1a18; border: 1px solid #e8e8e6; }
        .cta-outline:hover { background: #f8f8f7; }
        .founding-note { text-align: center; margin-top: 1.5rem; font-size: 0.8rem; color: #999; }
        .founding-note strong { color: #6d28d9; }

        /* Billing toggle */
        .billing-toggle { display: flex; align-items: center; gap: 1rem; margin-bottom: 3rem; justify-content: center; }
        .toggle-label { font-size: 0.9rem; color: #555; }
        .toggle-label.active { color: #1a1a18; font-weight: 500; }
        .toggle {
          width: 44px; height: 24px; background: #e8e8e6; border-radius: 12px;
          cursor: pointer; position: relative; border: none; transition: background 0.2s;
        }
        .toggle.on { background: #6d28d9; }
        .toggle-thumb {
          position: absolute; top: 3px; left: 3px;
          width: 18px; height: 18px; background: #fff; border-radius: 50%;
          transition: transform 0.2s; box-shadow: 0 1px 4px rgba(0,0,0,0.15);
        }
        .toggle.on .toggle-thumb { transform: translateX(20px); }
        .save-badge { background: #ede9fe; color: #6d28d9; font-size: 0.7rem; font-weight: 600; padding: 2px 8px; border-radius: 4px; }

        /* Social proof */
        .social-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; }
        .testimonial {
          background: #fff; border: 1px solid #e8e8e6; border-radius: 14px;
          padding: 1.5rem;
        }
        .testimonial-text { font-size: 0.9rem; color: #444; line-height: 1.7; margin-bottom: 1.25rem; font-style: italic; }
        .testimonial-author { display: flex; align-items: center; gap: 10px; }
        .author-avatar {
          width: 36px; height: 36px; border-radius: 50%;
          background: #1a1a18; color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; font-weight: 600; flex-shrink: 0;
        }
        .author-name { font-size: 0.85rem; font-weight: 600; color: #1a1a18; }
        .author-sub { font-size: 0.75rem; color: #aaa; }
        .stars { color: #f5a623; font-size: 0.8rem; margin-bottom: 0.75rem; }

        /* FAQ */
        .faq-list { max-width: 680px; margin: 3rem auto 0; display: flex; flex-direction: column; gap: 1px; background: #e8e8e6; border-radius: 14px; overflow: hidden; }
        .faq-item { background: #fff; }
        .faq-btn {
          width: 100%; text-align: left; padding: 1.25rem 1.5rem;
          background: none; border: none; cursor: pointer;
          display: flex; justify-content: space-between; align-items: center;
          font-family: var(--font-dm-sans), system-ui, sans-serif; font-size: 0.95rem; color: #1a1a18;
          font-weight: 500;
        }
        .faq-icon { color: #aaa; font-size: 1.1rem; transition: transform 0.2s; flex-shrink: 0; }
        .faq-icon.open { transform: rotate(45deg); }
        .faq-answer { font-size: 0.875rem; color: #666; line-height: 1.7; padding: 0 1.5rem 1.25rem; }

        /* CTA section */
        .cta-section {
          background: #1a1a18; padding: 100px 2rem; text-align: center;
        }
        .cta-section h2 { color: #fff; }
        .cta-section h2 em { color: #8b5cf6; }
        .cta-section p { color: rgba(255,255,255,0.5); font-size: 1rem; margin: 1rem auto 2.5rem; max-width: 460px; line-height: 1.7; }
        .btn-light { background: #fff; color: #1a1a18; }
        .btn-light:hover { background: #f5f5f4; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(255,255,255,0.15); }

        /* Footer */
        footer { background: #fafaf9; border-top: 1px solid #e8e8e6; padding: 3rem 2rem; }
        .footer-inner { max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 1.75rem; }
        .footer-top {
          display: flex; justify-content: space-between; align-items: flex-start;
          flex-wrap: wrap; gap: 1.5rem;
        }
        .footer-brand {
          display: flex; align-items: center; gap: 10px;
          font-family: var(--font-dm-serif-display), ui-serif, Georgia, serif; font-size: 1rem; color: #1a1a18;
          text-decoration: none;
        }
        .footer-columns { display: flex; flex-wrap: wrap; gap: 2rem 3rem; }
        .footer-col h3 {
          font-size: 0.7rem; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase;
          color: #888; margin-bottom: 0.75rem;
        }
        .footer-col ul { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
        .footer-col a { font-size: 0.8rem; color: #aaa; text-decoration: none; }
        .footer-col a:hover { color: #555; }
        .footer-bottom {
          display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;
          padding-top: 1rem; border-top: 1px solid #e8e8e6;
        }
        .footer-links { display: flex; gap: 2rem; flex-wrap: wrap; }
        .footer-links a { font-size: 0.8rem; color: #aaa; text-decoration: none; }
        .footer-links a:hover { color: #555; }
        .footer-legal { font-size: 0.75rem; color: #bbb; }
        .guides-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;
        }
        @media (max-width: 768px) {
          .guides-grid { grid-template-columns: 1fr; }
        }
        .guide-card {
          display: block; background: #fff; border: 1px solid #e8e8e6; border-radius: 12px;
          padding: 1.25rem 1.5rem; text-decoration: none; color: inherit;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .guide-card:hover { border-color: #c4b5fd; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
        .guide-card-title { font-size: 0.95rem; font-weight: 600; color: #1a1a18; margin-bottom: 0.35rem; }
        .guide-card-desc { font-size: 0.8rem; color: #777; line-height: 1.5; }
      `}</style>

      {/* NAV */}
      <nav className={`nav${scrolled ? " scrolled" : ""}`}>
        <div className="nav-inner">
          <a href="/" className="nav-logo">
            <span className="logo-wrap">
              <Logo size={32} variant="landing" />
            </span>
            Punter&apos;s Journal
          </a>
          <ul className="nav-links">
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#guides">Guides</a>
            </li>
            <li>
              <a href="#pricing">Pricing</a>
            </li>
            <li>
              <a href="#faq">FAQ</a>
            </li>
            <li>
              <a href="/login">Sign in</a>
            </li>
            <li>
              <a href="/signup" className="nav-cta">
                Get started free
              </a>
            </li>
          </ul>
          <div className="nav-mobile-shortcuts">
            <a href="#guides">Guides</a>
            <a href="/login">Sign in</a>
            <a href="/signup" className="nav-cta-mini">
              Start free
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <div className="hero">
        <div>
          <div className="eyebrow">
            <span className="eyebrow-dot" />
            Built for Australian punters
          </div>
          <h1>
            Know <em>exactly</em> how your betting is performing
          </h1>
          <p className="hero-sub">
            Track every bet, see your real P&L, and get AI-powered insights that tell you where you&apos;re winning — and where you&apos;re bleeding money.
          </p>
          <div className="hero-actions">
            <a href="/signup" className="btn-primary">
              Start tracking free →
            </a>
            <a href="#features" className="btn-secondary">
              See how it works ↓
            </a>
          </div>
          <div className="trust-row">
            <div className="trust-avatars">
              {["JM", "RS", "TK", "AB", "LW"].map((ini, i) => (
                <div
                  key={i}
                  className="trust-avatar"
                  style={{
                    background: ["#c8e6c9", "#bbdefb", "#f8bbd0", "#fff9c4", "#d7ccc8"][i],
                  }}
                >
                  <span style={{ color: "#555" }}>{ini}</span>
                </div>
              ))}
            </div>
            <div className="trust-text">
              <strong>50+ punters</strong> tracking bets in beta
              <br />
              Join the Wolfden community
            </div>
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="hero-visual">
          <div className="dashboard-card">
            <div className="db-header">
              <span className="db-title">Performance this month</span>
              <span className="db-badge">↑ 12.4% ROI</span>
            </div>
            <div className="db-stats">
              <div>
                <div className="db-stat-label">P&L</div>
                <div className="db-stat-val green">+$482</div>
              </div>
              <div>
                <div className="db-stat-label">Strike rate</div>
                <div className="db-stat-val">34%</div>
              </div>
              <div>
                <div className="db-stat-label">Turnover</div>
                <div className="db-stat-val">$3,880</div>
              </div>
            </div>
            <div className="db-chart">
              {[35, 55, 40, 70, 45, 85, 60, 90, 50, 75, 95, 65].map((h, i) => (
                <div
                  key={i}
                  className="db-bar"
                  style={{
                    height: `${h}%`,
                    background: h > 70 ? "#6d28d9" : h > 50 ? "#c4b5fd" : "#e8e8e6",
                  }}
                />
              ))}
            </div>
            <div className="db-recent">
              <div className="db-recent-title">Recent bets</div>
              {[
                { name: "Winx St – R6", type: "WIN", amount: "+$96", win: true },
                { name: "Flemington – R3", type: "EW", amount: "-$50", win: false },
                { name: "Eagle Farm – R8", type: "PLACE", amount: "+$38", win: true },
              ].map((bet, i) => (
                <div key={i} className="db-bet-row">
                  <div>
                    <div className="db-bet-name">{bet.name}</div>
                    <div className="db-bet-type">{bet.type}</div>
                  </div>
                  <div className="db-bet-amount" style={{ color: bet.win ? "#6d28d9" : "#e05252" }}>
                    {bet.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* STATS */}
      <section className="stats-section" style={{ padding: 0 }}>
        <div className="stats-grid" ref={statsRef}>
          {[
            { num: "50+", label: "Beta users" },
            { num: "All", label: "Bet types covered" },
            { num: "AI", label: "Powered insights" },
            { num: "100%", label: "Mobile optimised" },
          ].map((s, i) => (
            <div key={i} className="stat-block">
              <div
                className={`stat-num${statsVisible ? " visible" : ""}`}
                style={{ transitionDelay: `${i * 0.12}s` }}
              >
                {s.num}
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features">
        <div className="section-inner">
          <div style={{ marginBottom: "3rem" }}>
            <div className="section-eyebrow">Features</div>
            <h2>
              Everything you need to <em>punt smarter</em>
            </h2>
            <p className="section-sub">No spreadsheets, no guesswork. Just clean data that tells you what&apos;s working.</p>
          </div>
          <div className="features-grid">
            {[
              {
                icon: "📊",
                title: "Automatic P&L",
                desc: "Every win, loss, place and each-way calculated instantly. Your real numbers, always up to date.",
              },
              {
                icon: "📈",
                title: "ROI & strike rate",
                desc: "See your return on investment and win rate across any date range, bet type, or track.",
              },
              {
                icon: "🤖",
                title: "AI insights",
                desc: "With Pro or Elite: personalised analysis of your betting patterns — where your edge is and where it is not.",
              },
              {
                icon: "🏇",
                title: "All bet types",
                desc: "Win, place, each-way, lay, multi, quinella, exacta, trifecta, first four. Every bet, tracked properly.",
              },
              {
                icon: "📱",
                title: "Mobile first",
                desc: "Built for trackside. Log bets between races, check your running P&L, get insights on the go.",
              },
              {
                icon: "📉",
                title: "Streak tracking",
                desc: "Know your current win streak, longest losing run, and how your form changes through a meeting.",
              },
              {
                icon: "📤",
                title: "CSV export",
                desc: "Pro and Elite: export your full bet history for your own analysis or tax records.",
              },
              {
                icon: "🏟️",
                title: "Venue breakdown",
                desc: "Pro and Elite: see your performance track-by-track — Flemington vs Eagle Farm and beyond.",
              },
              {
                icon: "💰",
                title: "Bankroll tools",
                desc: "Pro and Elite: set bankroll targets, track staking consistency, and manage your betting bank.",
              },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GUIDES — internal links for SEO (same hub as /what-is-punters-journal) */}
      <section id="guides" style={{ background: "#f5f5f3" }}>
        <div className="section-inner">
          <div style={{ marginBottom: "2.5rem" }}>
            <div className="section-eyebrow">Guides &amp; resources</div>
            <h2>
              New to systematic <em>tracking?</em>
            </h2>
            <p className="section-sub" style={{ maxWidth: "560px" }}>
              Start with the explainer and entry-level guides — the same paths we use across the site for Australian horse racing punters.
            </p>
          </div>
          <div className="guides-grid">
            <a href="/what-is-punters-journal" className="guide-card">
              <div className="guide-card-title">What is Punters Journal?</div>
              <div className="guide-card-desc">Workbook, analytics, and how serious punters use it.</div>
            </a>
            <a href="/getting-started" className="guide-card">
              <div className="guide-card-title">Getting started</div>
              <div className="guide-card-desc">30-day challenge, habits, and example journal entries.</div>
            </a>
            <a href="/race-day-betting-checklist" className="guide-card">
              <div className="guide-card-title">Race day checklist</div>
              <div className="guide-card-desc">Step-by-step framework before and during the meeting.</div>
            </a>
            <a href="/betting-journal-template-horse-racing" className="guide-card">
              <div className="guide-card-title">Betting journal template</div>
              <div className="guide-card-desc">Structured fields for horse racing bet records.</div>
            </a>
            <a href="/bankroll-management-workbook-australian-punters" className="guide-card">
              <div className="guide-card-title">Bankroll workbook</div>
              <div className="guide-card-desc">Staking, capital, and bankroll discipline for Aussies.</div>
            </a>
            <a href="/pricing" className="guide-card">
              <div className="guide-card-title">Pricing</div>
              <div className="guide-card-desc">Compare Free, Pro, and Elite in one place.</div>
            </a>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section style={{ background: "#fafaf9" }}>
        <div className="section-inner">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div className="section-eyebrow">From the community</div>
            <h2>
              What punters are <em>saying</em>
            </h2>
          </div>
          <div className="social-grid">
            {[
              {
                text: "Finally know what my actual ROI is. Turns out I thought I was up but the numbers said otherwise. Game changer for the way I bet.",
                name: "Jake M.",
                sub: "Wolfden member",
                init: "JM",
              },
              {
                text: "Tracked my first 20 bets and the AI insight straight away picked up that I was losing money on wet track favourites. Would never have spotted that myself.",
                name: "Ryan S.",
                sub: "Beta tester",
                init: "RS",
              },
              {
                text: "Tried to do this in Excel for years. The automatic calculations alone make it worth it. On my phone at the track it's mint.",
                name: "Tom K.",
                sub: "Founding member",
                init: "TK",
              },
            ].map((t, i) => (
              <div key={i} className="testimonial">
                <div className="stars">★★★★★</div>
                <p className="testimonial-text">&ldquo;{t.text}&rdquo;</p>
                <div className="testimonial-author">
                  <div className="author-avatar">{t.init}</div>
                  <div>
                    <div className="author-name">{t.name}</div>
                    <div className="author-sub">{t.sub}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing">
        <div className="section-inner">
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <div className="section-eyebrow">Pricing</div>
            <h2>
              Simple, honest <em>pricing</em>
            </h2>
            <p className="section-sub" style={{ margin: "0 auto 2rem" }}>
              Start free, upgrade when you&apos;re ready. No lock-in, cancel anytime.
            </p>
          </div>

          <div className="billing-toggle">
            <span className={`toggle-label${!billingAnnual ? " active" : ""}`}>Monthly</span>
            <button type="button" className={`toggle${billingAnnual ? " on" : ""}`} onClick={() => setBillingAnnual(!billingAnnual)} aria-label="Toggle yearly billing">
              <div className="toggle-thumb" />
            </button>
            <span className={`toggle-label${billingAnnual ? " active" : ""}`}>Yearly</span>
            <span className="save-badge">Save up to 33%</span>
          </div>

          <div className="pricing-grid">
            {[
              {
                name: "Free",
                price: "0",
                tagline: "50 bets/month. See if it clicks.",
                featured: false,
                features: [
                  "50 bets per month",
                  "Core P&L, strike rate & ROI",
                  "Dashboard charts & date filters",
                  "Mobile-friendly (trackside)",
                  "Upgrade for AI insights & CSV export",
                ],
                cta: "Start for free",
                ctaStyle: "cta-outline",
                href: "/signup",
              },
              {
                name: "Pro",
                price: billingAnnual ? "10" : "15",
                yearlyNote: billingAnnual ? "billed $120/yr" : "",
                tagline: "Unlimited bets. AI insights. Serious tools.",
                featured: true,
                badge: "Most popular",
                features: [
                  "Unlimited bets",
                  "All bet types",
                  "Full stats & visualisations",
                  "Venue & track breakdown",
                  "Bankroll tools",
                  "AI insights (50/day)",
                  "CSV export",
                  "Unlimited history",
                  "Monthly email summary",
                ],
                cta: "Get Pro →",
                ctaStyle: "cta-white",
                href: "/signup?plan=pro",
              },
              {
                name: "Elite",
                price: billingAnnual ? "20.75" : "25",
                yearlyNote: billingAnnual ? "billed $249/yr" : "",
                tagline: "Every tool. Unlimited AI. Priority support.",
                featured: false,
                features: [
                  "Everything in Pro",
                  "Unlimited AI insights (no daily cap)",
                  "Priority support",
                ],
                cta: "Get Elite",
                ctaStyle: "cta-dark",
                href: "/signup?plan=elite",
              },
            ].map((plan, i) => (
              <div key={i} className={`pricing-card${plan.featured ? " featured" : ""}`}>
                {plan.badge && <div className="pricing-badge">{plan.badge}</div>}
                <div className="plan-name">{plan.name}</div>
                <div className="plan-price">
                  <span className="price-amount">${plan.price}</span>
                  <span className="price-period">/mo{plan.yearlyNote ? ` — ${plan.yearlyNote}` : ""}</span>
                </div>
                <p className="plan-tagline">{plan.tagline}</p>
                <ul className="plan-features">
                  {plan.features.map((f, j) => (
                    <li key={j}>
                      <span className="check">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href={plan.href} className={`plan-cta ${plan.ctaStyle}`}>
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
          <p className="founding-note">
            🎯 <strong>Founding member deal:</strong> First 100 paying users lock in Pro at $10/month forever.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ background: "#f5f5f3" }}>
        <div className="section-inner">
          <div style={{ textAlign: "center" }}>
            <div className="section-eyebrow">Questions</div>
            <h2>
              Anything else you&apos;re <em>wondering?</em>
            </h2>
          </div>
          <div className="faq-list">
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item">
                <button type="button" className="faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {faq.q}
                  <span className={`faq-icon${openFaq === i ? " open" : ""}`}>+</span>
                </button>
                {openFaq === i && <div className="faq-answer">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="cta-section">
        <h2>
          Ready to know your <em>real numbers?</em>
        </h2>
        <p>Free to start, takes 2 minutes. Start tracking your bets today.</p>
        <a href="/signup" className="btn-primary btn-light">
          Start for free — no card needed →
        </a>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <a href="/" className="footer-brand">
              <Logo size={28} variant="landing" />
              Punters Journal
            </a>
            <div className="footer-columns">
              <div className="footer-col">
                <h3>Guides</h3>
                <ul>
                  <li>
                    <a href="/what-is-punters-journal">What is Punters Journal?</a>
                  </li>
                  <li>
                    <a href="/getting-started">Getting started</a>
                  </li>
                  <li>
                    <a href="/race-day-betting-checklist">Race day checklist</a>
                  </li>
                  <li>
                    <a href="/betting-journal-template-horse-racing">Journal template</a>
                  </li>
                  <li>
                    <a href="/bankroll-management-workbook-australian-punters">Bankroll workbook</a>
                  </li>
                  <li>
                    <a href="/pricing">Pricing</a>
                  </li>
                </ul>
              </div>
              <div className="footer-col">
                <h3>Product</h3>
                <ul>
                  <li>
                    <a href="#features">Features</a>
                  </li>
                  <li>
                    <a href="#guides">Guides</a>
                  </li>
                  <li>
                    <a href="#pricing">Pricing</a>
                  </li>
                  <li>
                    <a href="/signup">Sign up</a>
                  </li>
                  <li>
                    <a href="/login">Sign in</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-links">
              <a href="/what-is-punters-journal">About</a>
              <a href="/privacy">Privacy</a>
              <a href="/terms">Terms</a>
              <a href="mailto:hello@puntersjournal.com.au">Contact</a>
            </div>
            <div className="footer-legal">
              © {year} Punters Journal. Gamble responsibly. 18+
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
