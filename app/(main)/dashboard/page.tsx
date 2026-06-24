'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { fetchUserBets, fetchProfile, fetchBankTransactions, type Bet, type Profile, type BankTransaction } from '@/lib/api';
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
  getVenuePerformance,
  getTopHorsePerformance,
  getTopRacePerformance,
  getGoalProgress,
  getBankrollSummary,
  getBankBalanceTimeSeries,
  ALL_BET_TYPES,
} from '@/lib/stats';
import { useCurrency } from '@/components/CurrencyContext';
import { useRouter } from 'next/navigation';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';
import { EmptyState } from '@/components/onboarding/EmptyState';

import { EarlyInsightCard } from '@/components/onboarding/EarlyInsightCard';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ShareDashboardModal } from '@/components/dashboard/ShareDashboardModal';
import { StatsOverview } from '@/components/dashboard/StatsOverview';
import { BankrollSummary } from '@/components/dashboard/BankrollSummary';
import { GoalsProgress } from '@/components/dashboard/GoalsProgress';
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

const VenuePerformanceSection = dynamic(() => import('@/components/dashboard/VenuePerformanceSection'), {
  ssr: false,
  loading: () => <div className="rounded-2xl border border-border p-8 text-center text-muted-foreground">Loading venue performance...</div>,
});

const StakingCalculator = dynamic(() => import('@/components/StakingCalculator').then((m) => m.StakingCalculator), {
  ssr: false,
});

const BankHistoryChart = dynamic(() => import('@/components/dashboard/BankHistoryChart').then((m) => m.BankHistoryChart), {
  ssr: false,
});

const Celebration = dynamic(
  () => import('@/components/onboarding/Celebration').then((m) => m.Celebration),
  { ssr: false }
);

export default function DashboardPage() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriodState] = useState<DashboardPeriodState>(DEFAULT_DASHBOARD_PERIOD);
  const [userEmail, setUserEmail] = useState<string>('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [bankTableMissing, setBankTableMissing] = useState(false);
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
    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user || cancelled) {
          return;
        }

        if (user.email) {
          setUserEmail(user.email);
        }

        const [betsResult, profileResult, bankResult] = await Promise.all([
          fetchUserBets(user.id, 'all'),
          fetchProfile(),
          fetchBankTransactions(user.id),
        ]);

        if (cancelled) return;

        const userBets = betsResult.data || [];
        setBets(userBets);
        setBankTableMissing(bankResult.tableMissing);
        setBankTransactions(bankResult.data ?? []);

        if (profileResult.data) {
          setProfile(profileResult.data);
          setOnboardingCompleted(profileResult.data.onboarding_completed ?? false);
          setWantsTruth(profileResult.data.wants_truth ?? true);
        } else {
          setOnboardingCompleted(false);
          setWantsTruth(true);
        }

        if (userBets.length === 0 && !localStorage.getItem('welcome_dismissed')) {
          setShowWelcome(true);
        }

        if (userBets.length === 1 && !localStorage.getItem('has_celebrated_first_bet')) {
          setShowCelebration(true);
          localStorage.setItem('has_celebrated_first_bet', 'true');
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const loadBets = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await fetchUserBets(user.id, 'all');
      setBets(data || []);
    } catch (err) {
      console.error('Failed to load bets:', err);
    }
  };

  const filteredBets = useMemo(
    () => filterBetsByPeriod(bets, period),
    [bets, period]
  );

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



  const stats = useMemo(() => calculateMonthlyStats(filteredBets), [filteredBets]);
  const betTypeStats = useMemo(() => calculateStatsByBetType(filteredBets), [filteredBets]);
  const profitLossData = useMemo(() => getProfitLossTimeSeries(filteredBets), [filteredBets]);
  const monthlyProfitData = useMemo(() => getMonthlyProfitData(filteredBets, 6), [filteredBets]);
  const monthlyROIData = useMemo(() => getMonthlyROIData(filteredBets, 6), [filteredBets]);
  const streakStats = useMemo(() => calculateStreaks(filteredBets), [filteredBets]);
  const oddsRangeData = useMemo(() => getOddsRangePerformance(filteredBets), [filteredBets]);
  const dayOfWeekData = useMemo(() => getDayOfWeekPerformance(filteredBets), [filteredBets]);
  const weeklyData = useMemo(() => getWeeklyPerformance(filteredBets, 12), [filteredBets]);
  const insights = useMemo(() => getPerformanceInsights(filteredBets), [filteredBets]);
  const venueData = useMemo(() => getVenuePerformance(filteredBets), [filteredBets]);
  const topHorses = useMemo(() => getTopHorsePerformance(filteredBets), [filteredBets]);
  const topRaces = useMemo(() => getTopRacePerformance(filteredBets), [filteredBets]);

  const goalProgress = useMemo(() => getGoalProgress(bets, profile), [bets, profile]);
  const bankroll = useMemo(
    () => getBankrollSummary(bets, profile, bankTableMissing ? null : bankTransactions),
    [bets, profile, bankTableMissing, bankTransactions]
  );
  const bankBalanceSeries = useMemo(
    () => getBankBalanceTimeSeries(bets, bankTransactions, profile),
    [bets, bankTransactions, profile]
  );

  const BET_TYPE_LABELS: Record<string, string> = useMemo(() => ({
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
  }), []);

  const pieData = useMemo(
    () => ALL_BET_TYPES.map((t) => ({
      name: BET_TYPE_LABELS[t],
      value: filteredBets.filter((b) => b.bet_type === (t as any)).length,
      type: t,
    })),
    [filteredBets, BET_TYPE_LABELS]
  );

  const strikeRateData = useMemo(
    () => ALL_BET_TYPES.map((t) => ({
      type: BET_TYPE_LABELS[t],
      strikeRate: (betTypeStats as any)[t]?.totalBets > 0 ? (betTypeStats as any)[t].strikeRate : 0,
    })),
    [betTypeStats, BET_TYPE_LABELS]
  );



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

      {profile && <BankrollSummary summary={bankroll} />}

      {profile && bankroll.enabled && (
        <BankHistoryChart
          enabled={bankroll.enabled}
          tableMissing={bankTableMissing}
          series={bankBalanceSeries}
          starting={bankroll.starting}
        />
      )}

      {profile && <GoalsProgress progress={goalProgress} />}

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
            <>
              <InsightsSection
                insights={insights}
                streakStats={streakStats}
                weeklyData={weeklyData}
                oddsRangeData={oddsRangeData}
                dayOfWeekData={dayOfWeekData}
              />

              <VenuePerformanceSection
                venueData={venueData}
                topHorses={topHorses}
                topRaces={topRaces}
              />
            </>
          )}
        </>
      )}

      {profile && (
        <StakingCalculator
          defaultBankroll={profile.bankroll_current_amount}
          unitSize={profile.unit_size}
        />
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
