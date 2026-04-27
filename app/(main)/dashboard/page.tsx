'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { fetchUserBets, fetchProfile, type Bet, type Profile } from '@/lib/api';
import {
  DEFAULT_DASHBOARD_PERIOD,
  filterBetsByPeriod,
  loadDashboardPeriodFromStorage,
  saveDashboardPeriodToStorage,
  type DashboardPeriodState,
} from '@/lib/dashboard-period';
import {
  calculateMonthlyStats,
  calculateStatsByBetType,
  getProfitLossTimeSeries,
  getMonthlyProfitData,
  getMonthlyROIData,
  calculateStreaks,
  getOddsRangePerformance,
  getDayOfWeekPerformance,
  getWeeklyPerformance,
  getPerformanceInsights,
  ALL_BET_TYPES,
} from '@/lib/stats';
import { useCurrency } from '@/components/CurrencyContext';
import { useRouter } from 'next/navigation';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';
import { EmptyState } from '@/components/onboarding/EmptyState';
import { Celebration } from '@/components/onboarding/Celebration';

import { EarlyInsightCard } from '@/components/onboarding/EarlyInsightCard';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ShareDashboardModal } from '@/components/dashboard/ShareDashboardModal';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';
import { showToast } from '@/lib/toast';
// Dynamically import heavy chart components to improve initial page load
import dynamic from 'next/dynamic';

const PerformanceCharts = dynamic(() => import('@/components/dashboard/PerformanceCharts'), {
  ssr: false,
  loading: () => <div className="rounded-2xl border border-border p-8 text-center text-muted-foreground">Loading charts...</div>,
});

const InsightsSection = dynamic(() => import('@/components/dashboard/InsightsSection'), {
  ssr: false,
  loading: () => <div className="rounded-2xl border border-border p-8 text-center text-muted-foreground">Loading insights...</div>,
});

export default function DashboardPage() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriodState] = useState<DashboardPeriodState>(DEFAULT_DASHBOARD_PERIOD);
  const [filteredBets, setFilteredBets] = useState<Bet[]>([]);
  const [userEmail, setUserEmail] = useState<string>('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const { formatValue, isLoading: currencyLoading } = useCurrency();
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState<boolean | null>(null);
  const [wantsTruth, setWantsTruth] = useState<boolean | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [sampleLoading, setSampleLoading] = useState(false);
  useEffect(() => {
    const dismissed = localStorage.getItem('welcome_dismissed');
    if (dismissed === 'true') {
      setWelcomeDismissed(true);
    }
    setPeriodState(loadDashboardPeriodFromStorage());
  }, []);

  const setPeriod = useCallback((next: DashboardPeriodState) => {
    setPeriodState(next);
    saveDashboardPeriodToStorage(next);
  }, []);

  useEffect(() => {
    loadBets();
    loadProfile();
    checkOnboardingStatus();
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setUserEmail(user.email);
    })();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed, wants_truth')
        .eq('id', user.id)
        .maybeSingle();

      const completed = profile?.onboarding_completed ?? false;
      const truth = profile?.wants_truth ?? true; // Default to true so users see insights without prompt

      setOnboardingCompleted(completed);
      setWantsTruth(truth);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const loadProfile = async () => {
    const { data } = await fetchProfile();
    if (data) setProfile(data);
  };

  const filterBets = useCallback(() => {
    setFilteredBets(filterBetsByPeriod(bets, period));
  }, [bets, period]);

  useEffect(() => {
    filterBets();
  }, [filterBets]);

  const loadBets = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      // Wait for user session to be available (retry up to 5 times)
      // This handles cases where magic link auth hasn't fully synced yet
      let user = null;
      for (let i = 0; i < 5; i++) {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();
        
        if (currentUser) {
          user = currentUser;
          break;
        }
        
        // Wait 200ms before retrying
        if (i < 4) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      if (!user) {
        return;
      }

      const { data } = await fetchUserBets(user.id, 'all');
      const userBets = data || [];
      setBets(userBets);

      // FTUE Logic
      if (userBets.length === 0 && !localStorage.getItem('welcome_dismissed')) {
        setShowWelcome(true);
      }

      // Check for first bet celebration
      if (userBets.length === 1 && !localStorage.getItem('has_celebrated_first_bet')) {
        setShowCelebration(true);
        localStorage.setItem('has_celebrated_first_bet', 'true');
      }

    } catch (err) {
      console.error('Failed to load bets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    setWelcomeDismissed(true);
    localStorage.setItem('welcome_dismissed', 'true');
  };

  const handleAddFirstBet = () => {
    router.push('/bets');
  };

  const handleLoadSampleBets = async () => {
    setSampleLoading(true);
    try {
      const res = await fetch('/api/onboarding/seed-demo-bets', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(typeof data.error === 'string' ? data.error : 'Could not load sample data', 'error');
        return;
      }
      await loadBets();
      showToast('Sample bets added — explore your dashboard', 'success');
    } catch {
      showToast('Could not load sample data', 'error');
    } finally {
      setSampleLoading(false);
    }
  };



  const stats = calculateMonthlyStats(filteredBets);
  const betTypeStats = calculateStatsByBetType(filteredBets);
  const profitLossData = getProfitLossTimeSeries(filteredBets);
  const monthlyProfitData = getMonthlyProfitData(filteredBets, 6);
  const monthlyROIData = getMonthlyROIData(filteredBets, 6);
  const streakStats = calculateStreaks(filteredBets);
  const oddsRangeData = getOddsRangePerformance(filteredBets);
  const dayOfWeekData = getDayOfWeekPerformance(filteredBets);
  const weeklyData = getWeeklyPerformance(filteredBets, 12);
  const insights = getPerformanceInsights(filteredBets);

  const BET_TYPE_LABELS: Record<string, string> = {
    'win': 'Win',
    'place': 'Place',
    'lay': 'Lay',
    'each-way': 'Each-Way',
    'multi': 'Multi',
    'quinella': 'Quinella',
    'exacta': 'Exacta',
    'trifecta': 'Trifecta',
    'first-four': 'First Four',
    'other': 'Other',
  };

  const pieData = ALL_BET_TYPES.map((t) => ({
    name: BET_TYPE_LABELS[t],
    value: filteredBets.filter((b) => b.bet_type === (t as any)).length,
    type: t,
  }));

  const strikeRateData = ALL_BET_TYPES.map((t) => ({
    type: BET_TYPE_LABELS[t],
    strikeRate: (betTypeStats as any)[t]?.totalBets > 0 ? (betTypeStats as any)[t].strikeRate : 0,
  }));



  if (loading || currencyLoading || onboardingCompleted === null) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 md:p-8 pt-6">
      <DashboardHeader
        userEmail={userEmail}
        period={period}
        setPeriod={setPeriod}
        actions={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2 shrink-0"
            onClick={() => setShareOpen(true)}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        }
      />

      <StatsOverview
        stats={stats}
        betsCount={filteredBets.length}
        totalBetsAllTime={bets.length}
      />

      {filteredBets.length === 0 ? (
        <>
          {bets.length === 0 ? (
            <EmptyState
              onAddFirstBet={handleAddFirstBet}
              onLoadSampleBets={handleLoadSampleBets}
              sampleLoading={sampleLoading}
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground">No data available for this period.</p>
            </div>
          )}
        </>
      ) : (
        <>
          <PerformanceCharts
            profitLossData={profitLossData}
            monthlyProfitData={monthlyProfitData}
            monthlyROIData={monthlyROIData}
            strikeRateData={strikeRateData}
            pieData={pieData}
            stats={stats}
            afterProfitLossChart={
              wantsTruth === true && bets.length > 0 ? (
                <EarlyInsightCard bets={filteredBets} wantsTruth={true} />
              ) : undefined
            }
          />

          {/* Only show advanced insights if user wants truth */}
          {wantsTruth === true && (
            <InsightsSection
              insights={insights}
              streakStats={streakStats}
              weeklyData={weeklyData}
              oddsRangeData={oddsRangeData}
              dayOfWeekData={dayOfWeekData}
            />
          )}
        </>
      )}

      <WelcomeModal
        isOpen={showWelcome}
        onClose={handleWelcomeClose}
        onAddFirstBet={handleAddFirstBet}
        onTrySampleBets={() => {
          handleWelcomeClose();
          void handleLoadSampleBets();
        }}
        sampleLoading={sampleLoading}
      />

      {showCelebration && (
        <Celebration show={showCelebration} onClose={() => setShowCelebration(false)} />
      )}

      <ShareDashboardModal isOpen={shareOpen} onClose={() => setShareOpen(false)} period={period} />
    </div>
  );
}
