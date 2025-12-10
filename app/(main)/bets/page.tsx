'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  fetchUserBets,
  createBet,
  updateBet,
  deleteBet,
  type Bet,
  type BetInput,
} from '@/lib/api';
import { calculateMonthlyStats } from '@/lib/stats';
import {
  calculateWinPL,
  calculatePlacePL,
  calculateEachWayPL,
  calculateLayPL,
  calculateMultiPL,
  calculateExoticPL,
  calculateOtherPL,
} from '@/lib/calculations';
import { Edit2, Trash2, X, Check, PlusCircle, DollarSign, Target, CalendarDays, Activity, Award, Calendar, List, Download, Upload, Filter, XCircle, Search, Trash, Plus, Trophy, ListChecks, Flag } from 'lucide-react';
import { format } from 'date-fns';
import { showToast } from '@/lib/toast';
import BetTypesGuide from '@/components/BetTypesGuide';
import BetCalendar from '@/components/BetCalendar';

import { exportBetsToCSV, downloadCSV } from '@/lib/csv-utils';
import { getTrackLabel } from '@/lib/racing-tracks';
import VenueCombobox from '@/components/VenueCombobox';

import { useCurrency } from '@/components/CurrencyContext';

export default function BetsPage() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingBet, setEditingBet] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Bet>>({});
  const { formatValue, isLoading: currencyLoading } = useCurrency();

  // Form state
  const [formData, setFormData] = useState<BetInput>({
    race_name: '',
    horse_name: '',
    bet_type: 'win',
    price: 0,
    stake: 0,
    finishing_position: null,
    profit_loss: null,
    bet_date: new Date().toISOString().split('T')[0],
    selections: null,
    exotic_numbers: null,
    num_legs: null,
    description: null,
    notes: null,
    strategy_tags: null,
    venue: null,
    race_number: null,
    race_class: null,
    best_starting_price: null,
  });

  const [showLayInfo, setShowLayInfo] = useState(false);
  const [manualProfitEdit, setManualProfitEdit] = useState(false);
  const [profitLossInput, setProfitLossInput] = useState('');
  const [celebrateWin, setCelebrateWin] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');

  const [hasCSVAccess, setHasCSVAccess] = useState(false);
  const [checkingCSVAccess, setCheckingCSVAccess] = useState(true);


  type MultiLeg = {
    id: string;
    horseName: string;
    betType: 'win' | 'place' | 'each-way';
    price: number;
  };
  const [multiLegs, setMultiLegs] = useState<MultiLeg[]>([
    { id: '1', horseName: '', betType: 'win', price: 0 },
    { id: '2', horseName: '', betType: 'win', price: 0 },
  ]);
  const [multiResult, setMultiResult] = useState<'Won' | 'Lost' | ''>('');

  // Enhanced search state
  const [searchQuery, setSearchQuery] = useState('');

  // Advanced filtering state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    oddsMin: '',
    oddsMax: '',
    stakeMin: '',
    stakeMax: '',
    profitLossMin: '',
    profitLossMax: '',
    betType: '',
    venue: '',
    horseName: '',
    dateFrom: '',
    dateTo: '',
    profitLossType: '', // 'win', 'loss', 'neutral', ''
  });

  useEffect(() => {
    loadBets();
    checkCSVFeatureAccess();
  }, []);

  // Focus horse name input when navigated via keyboard shortcut
  useEffect(() => {
    const shouldFocus = sessionStorage.getItem('focusBetForm');
    if (shouldFocus === 'true') {
      sessionStorage.removeItem('focusBetForm');
      // Small delay to ensure form is rendered
      setTimeout(() => {
        horseNameInputRef.current?.focus();
        // Scroll to form if needed
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, []);

  // Reset multi-legs when bet type changes away from multi
  useEffect(() => {
    if (formData.bet_type !== 'multi') {
      setMultiLegs([
        { id: '1', horseName: '', betType: 'win', price: 0 },
        { id: '2', horseName: '', betType: 'win', price: 0 },
      ]);
      setMultiResult('');
    }
  }, [formData.bet_type]);

  // Auto-recalculate multi-bet P&L when stake or result changes
  useEffect(() => {
    if (formData.bet_type === 'multi' && multiResult && formData.stake > 0) {
      const combinedOdds = multiLegs.reduce((acc, leg) => acc * (leg.price || 1), 1);
      const allWon = multiResult === 'Won';
      const pl = calculateProfitLoss('multi', combinedOdds, formData.stake, null, {
        multiAllWon: allWon,
        combinedOdds: combinedOdds,
      });

      const horseName = multiLegs.map(leg => leg.horseName).filter(n => n).join(', ') || `${multiLegs.length}-leg Multi`;
      const selections = multiLegs.map(leg => ({
        horse: leg.horseName,
        betType: leg.betType,
        price: leg.price,
      }));

      setFormData(prev => ({
        ...prev,
        horse_name: horseName,
        profit_loss: pl,
        price: combinedOdds,
        num_legs: multiLegs.length,
        selections: selections as any,
      }));
    }
  }, [formData.stake, multiResult, multiLegs, formData.bet_type]);

  const checkCSVFeatureAccess = async () => {
    try {
      const response = await fetch('/api/check-feature?feature=csv_import_export');
      const data = await response.json();
      setHasCSVAccess(data.hasAccess || false);
    } catch (error) {
      console.error('Error checking CSV feature access:', error);
      setHasCSVAccess(false);
    } finally {
      setCheckingCSVAccess(false);
    }
  };

  const formRef = useRef<HTMLDivElement>(null);
  const horseNameInputRef = useRef<HTMLInputElement>(null);

  // Update form date when selected date changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      bet_date: format(selectedDate, 'yyyy-MM-dd'),
    }));

    // Auto-scroll to form on mobile/desktop when date is selected
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedDate]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const loadBets = async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError('User not authenticated');
        return;
      }

      const { data, error: fetchError } = await fetchUserBets(user.id, 'all');

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setBets(data || []);
      }
    } catch (err) {
      setError('Failed to load bets');
    } finally {
      setLoading(false);
    }
  };

  const calculateProfitLoss = (
    betType: string,
    price: number,
    stake: number,
    position: number | null,
    extras?: {
      placeTerms?: string;
      placeOdds?: number | null;
      multiAllWon?: boolean;
      combinedOdds?: number;
      dividend?: number | string | null;
      flexiPercent?: number;
      payout?: number | null;
      won?: boolean;
    }
  ): number | null => {
    switch (betType) {
      case 'win':
        return calculateWinPL(stake, price, position);
      case 'place':
        return calculatePlacePL(stake, price, position);
      case 'lay':
        return calculateLayPL(stake, price, position);
      case 'each-way':
        return calculateEachWayPL(
          stake,
          price,
          extras?.placeTerms || '1/4 odds, 3 places',
          position,
          extras?.placeOdds
        );
      case 'multi':
        return calculateMultiPL(
          stake,
          extras?.combinedOdds ?? price,
          !!extras?.multiAllWon
        );
      case 'quinella':
      case 'exacta':
      case 'trifecta':
      case 'first-four':
        return calculateExoticPL(
          stake,
          extras?.dividend ?? null,
          extras?.flexiPercent ?? 100
        );
      case 'other':
        return calculateOtherPL(stake, extras?.payout ?? null, !!extras?.won);
      default:
        return null;
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    let updatedForm = {
      ...formData,
      [name]:
        name === 'price' || name === 'stake'
          ? parseFloat(value) || 0
          : name === 'finishing_position'
            ? value === '' ? null : parseInt(value, 10)
            : value,
    };

    // Auto-calculate profit/loss when position is entered (unless manually editing)
    if (!manualProfitEdit && (name === 'finishing_position' || name === 'bet_type' || name === 'price' || name === 'stake')) {
      const position =
        name === 'finishing_position'
          ? value === '' ? null : parseInt(value, 10)
          : updatedForm.finishing_position || null;
      const price = name === 'price' ? parseFloat(value) || 0 : updatedForm.price;
      const stake = name === 'stake' ? parseFloat(value) || 0 : updatedForm.stake;
      const betType = name === 'bet_type' ? value : updatedForm.bet_type;

      // Get place terms and place odds from selections if available
      const placeTerms = (updatedForm.selections as any)?.place_terms;
      const placeOdds = (updatedForm.selections as any)?.place_odds;

      if (position === null) {
        // Default to loss (-stake) if no position entered
        updatedForm.profit_loss = -stake;
      } else {
        updatedForm.profit_loss = calculateProfitLoss(
          betType,
          price,
          stake,
          position,
          { placeTerms, placeOdds }
        );
      }
    }

    setFormData(updatedForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // For multi-bets, ensure horse_name is set from legs if not already set
      let submitData = { ...formData };
      if (formData.bet_type === 'multi' && !formData.horse_name) {
        const horseName = multiLegs.map(leg => leg.horseName).filter(n => n).join(', ') || `${multiLegs.length}-leg Multi`;
        submitData.horse_name = horseName;
      }

      // For exotic bets, ensure horse_name and price are set (defaults)
      if (['quinella', 'exacta', 'trifecta', 'first-four'].includes(formData.bet_type)) {
        if (!submitData.horse_name) {
          submitData.horse_name = submitData.exotic_numbers
            ? `Boxed: ${submitData.exotic_numbers}`
            : `${formData.bet_type.charAt(0).toUpperCase() + formData.bet_type.slice(1)} Bet`;
        }
        if (!submitData.price) {
          submitData.price = 0; // Exotics don't have a single "price" (odds), just a dividend
        }
      }

      const { error: createError } = await createBet(submitData);

      if (createError) {
        setError(createError.message);
        showToast(createError.message, 'error');
        return;
      }

      // Celebration for winning bets
      if (formData.profit_loss !== null && Number(formData.profit_loss) > 0) {
        setCelebrateWin(true);
        setTimeout(() => setCelebrateWin(false), 1200);
      }

      // Reset form
      setFormData({
        race_name: '',
        horse_name: '',
        bet_type: 'win',
        price: 0,
        stake: 0,
        finishing_position: null,
        profit_loss: null,
        bet_date: new Date().toISOString().split('T')[0],
        selections: null,
        exotic_numbers: null,
        num_legs: null,
        description: null,
        notes: null,
        strategy_tags: null,
        venue: null,
        race_number: null,
        race_class: null,
        best_starting_price: null,
      });
      setManualProfitEdit(false);
      // Reset multi-legs and result
      setMultiLegs([
        { id: '1', horseName: '', betType: 'win', price: 0 },
        { id: '2', horseName: '', betType: 'win', price: 0 },
      ]);
      setMultiResult('');

      showToast('Bet added successfully!', 'success');
      await loadBets();
    } catch (err) {
      setError('Failed to create bet');
    }
  };

  const handleEdit = (bet: Bet) => {
    setEditingBet(bet.id);
    setEditForm({ ...bet });
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let updated = {
      ...editForm,
      [name]:
        name === 'price' || name === 'stake' || name === 'profit_loss'
          ? parseFloat(value) || 0
          : name === 'finishing_position'
            ? value === '' ? null : parseInt(value, 10)
            : value,
    };

    // Recalculate profit/loss (skip if manually editing profit_loss)
    if (
      name !== 'profit_loss' &&
      (name === 'finishing_position' ||
        name === 'bet_type' ||
        name === 'price' ||
        name === 'stake')
    ) {
      const position =
        name === 'finishing_position'
          ? value === '' ? null : parseInt(value, 10)
          : (updated.finishing_position as number | null);
      const price =
        name === 'price' ? parseFloat(value) || 0 : Number(updated.price);
      const stake =
        name === 'stake' ? parseFloat(value) || 0 : Number(updated.stake);
      const betType = (name === 'bet_type' ? value : updated.bet_type) as string;

      updated.profit_loss = calculateProfitLoss(
        betType,
        price,
        stake,
        position
      );
    }

    setEditForm(updated);
  };

  const handleUpdate = async (betId: string) => {
    setError(null);

    try {
      const { error: updateError } = await updateBet(betId, {
        race_name: editForm.race_name || '',
        horse_name: editForm.horse_name || '',
        bet_type:
          (editForm.bet_type as
            | 'win'
            | 'place'
            | 'lay'
            | 'each-way'
            | 'multi'
            | 'quinella'
            | 'exacta'
            | 'trifecta'
            | 'first-four'
            | 'other') || 'win',
        price: Number(editForm.price) || 0,
        stake: Number(editForm.stake) || 0,
        finishing_position: editForm.finishing_position ?? null,
        profit_loss: editForm.profit_loss ?? null,
        bet_date: editForm.bet_date || '',
        notes: editForm.notes ?? null,
        strategy_tags: editForm.strategy_tags ?? null,
        venue: editForm.venue ?? null,
        race_number: editForm.race_number ?? null,
        race_class: editForm.race_class ?? null,
        best_starting_price: editForm.best_starting_price ?? null,
      });

      if (updateError) {
        setError(updateError.message);
        showToast(updateError.message, 'error');
        return;
      }

      setEditingBet(null);
      showToast('Bet updated successfully!', 'success');
      await loadBets();
    } catch (err) {
      setError('Failed to update bet');
    }
  };

  const handleDelete = async (betId: string) => {
    if (!confirm('Are you sure you want to delete this bet?')) {
      return;
    }

    setError(null);

    try {
      const { error: deleteError } = await deleteBet(betId);

      if (deleteError) {
        setError(deleteError.message);
        showToast(deleteError.message, 'error');
        return;
      }

      showToast('Bet deleted successfully!', 'success');
      await loadBets();
    } catch (err) {
      setError('Failed to delete bet');
      showToast('Failed to delete bet', 'error');
    }
  };

  const handleExportCSV = () => {
    if (!hasCSVAccess) {
      showToast('CSV Export is available for Elite members only. Upgrade to Elite to access this feature.', 'error');
      return;
    }

    try {
      if (bets.length === 0) {
        showToast('No bets to export', 'error');
        return;
      }

      const csvContent = exportBetsToCSV(bets);
      const filename = `bets_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      downloadCSV(csvContent, filename);
      showToast('Bets exported successfully!', 'success');
    } catch (err) {
      showToast('Failed to export bets', 'error');
      setError('Failed to export bets');
    }
  };



  // Apply filters and search to bets
  const filteredBets = bets.filter((bet) => {
    // Enhanced search - searches across multiple fields
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      const searchableFields = [
        bet.horse_name || '',
        bet.race_name || '',
        bet.venue || '',
        bet.race_class || '',
        bet.notes || '',
        bet.description || '',
        bet.exotic_numbers || '',
        bet.strategy_tags?.join(' ') || '',
      ].join(' ').toLowerCase();

      if (!searchableFields.includes(query)) {
        return false;
      }
    }

    // Odds range filter
    if (filters.oddsMin && Number(bet.price) < Number(filters.oddsMin)) return false;
    if (filters.oddsMax && Number(bet.price) > Number(filters.oddsMax)) return false;

    // Stake range filter
    if (filters.stakeMin && Number(bet.stake) < Number(filters.stakeMin)) return false;
    if (filters.stakeMax && Number(bet.stake) > Number(filters.stakeMax)) return false;

    // Profit/Loss range filter
    if (bet.profit_loss !== null) {
      if (filters.profitLossMin && Number(bet.profit_loss) < Number(filters.profitLossMin)) return false;
      if (filters.profitLossMax && Number(bet.profit_loss) > Number(filters.profitLossMax)) return false;

      // Profit/Loss type filter
      if (filters.profitLossType === 'win' && Number(bet.profit_loss) <= 0) return false;
      if (filters.profitLossType === 'loss' && Number(bet.profit_loss) >= 0) return false;
      if (filters.profitLossType === 'neutral' && Number(bet.profit_loss) !== 0) return false;
    } else {
      // If profit_loss is null and we're filtering for win/loss, exclude it
      if (filters.profitLossType === 'win' || filters.profitLossType === 'loss' || filters.profitLossType === 'neutral') return false;
    }

    // Bet type filter
    if (filters.betType && bet.bet_type !== filters.betType) return false;

    // Venue filter
    if (filters.venue && bet.venue !== filters.venue) return false;

    // Horse name filter (case-insensitive)
    if (filters.horseName && !bet.horse_name.toLowerCase().includes(filters.horseName.toLowerCase())) return false;

    // Date range filter
    if (filters.dateFrom && bet.bet_date < filters.dateFrom) return false;
    if (filters.dateTo && bet.bet_date > filters.dateTo) return false;

    return true;
  });

  const monthlyStats = calculateMonthlyStats(filteredBets);

  const hasActiveFilters = Object.values(filters).some((value) => value !== '') || searchQuery.trim() !== '';

  const clearFilters = () => {
    setFilters({
      oddsMin: '',
      oddsMax: '',
      stakeMin: '',
      stakeMax: '',
      profitLossMin: '',
      profitLossMax: '',
      betType: '',
      venue: '',
      horseName: '',
      dateFrom: '',
      dateTo: '',
      profitLossType: '',
    });
    setSearchQuery('');
  };



  if (loading || currencyLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-900">Loading bets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {celebrateWin && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <div className="absolute inset-0 animate-pulse bg-green-400/10" />
        </div>
      )}

      {/* View Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Enter Bets</h1>
          <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
            Add and manage your horse racing bets
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${viewMode === 'calendar'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Calendar</span>
            <span className="sm:hidden">Cal</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${viewMode === 'list'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
          >
            <List className="w-4 h-4" />
            List
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <BetCalendar
          bets={bets}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
        />
      )}



      {/* Bet Entry Form */}
      <div ref={formRef} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-shadow">
        <div className="flex items-center mb-4">
          <h2 className="text-lg font-semibold text-foreground">Add New Bet</h2>
          <BetTypesGuide />
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group 1: Core Bet Details */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Trophy className="h-5 w-5 text-blue-500" />
                Core Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Venue */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Venue <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <VenueCombobox
                  value={formData.venue ?? null}
                  onChange={(value) => setFormData({ ...formData, venue: value })}
                />
              </div>

              {/* Race Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Race Number <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="number"
                  name="race_number"
                  min="1"
                  max="12"
                  value={formData.race_number || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      race_number: e.target.value === '' ? null : parseInt(e.target.value, 10),
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-500"
                  placeholder="e.g. 1"
                />
              </div>

              {/* Bet Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bet Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="bet_type"
                  value={formData.bet_type}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                >
                  <option value="win">Win</option>
                  <option value="place">Place</option>
                  <option value="each-way">Each-Way</option>
                  <option value="lay">Lay</option>
                  <option value="multi">Multi</option>
                  <option value="quinella">Quinella</option>
                  <option value="exacta">Exacta</option>
                  <option value="trifecta">Trifecta</option>
                  <option value="first-four">First Four</option>
                  <option value="other">Other</option>
                </select>
                {formData.bet_type === 'lay' && (
                  <p className="mt-1 text-xs text-gray-700 dark:text-gray-300">
                    Lay: You&apos;re betting against the horse. If it wins, you lose the
                    liability (stake × (odds - 1)). If it loses, you win the
                    stake.
                  </p>
                )}
              </div>

              {/* Stake */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stake ($) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="stake"
                    step="0.01"
                    min="0"
                    required
                    value={formData.stake || ''}
                    onChange={handleFormChange}
                    placeholder="10.00"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-500"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Group 2: Selection Information */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-purple-500" />
                Selection Details
              </h3>
            </div>

            <div className="space-y-6">
              {/* Standard Fields (Non-Multi and Non-Exotic) */}
              {formData.bet_type !== 'multi' && !['quinella', 'exacta', 'trifecta', 'first-four'].includes(formData.bet_type) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Horse/Dog Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      ref={horseNameInputRef}
                      type="text"
                      name="horse_name"
                      required
                      value={formData.horse_name}
                      onChange={handleFormChange}
                      placeholder="Enter horse or dog name"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Price/Odds <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      step="0.01"
                      min="1"
                      required
                      value={formData.price || ''}
                      onChange={handleFormChange}
                      placeholder="3.50"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-500"
                    />
                  </div>
                </div>
              )}

              {/* Date Field */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Date <span className="text-red-500">*</span>
                    {viewMode === 'calendar' && (
                      <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                        (Select from calendar above)
                      </span>
                    )}
                  </label>
                  <input
                    type="date"
                    name="bet_date"
                    required
                    value={formData.bet_date}
                    onChange={(e) => {
                      handleFormChange(e);
                      const newDate = new Date(e.target.value);
                      if (!isNaN(newDate.getTime())) {
                        setSelectedDate(newDate);
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                  />
                </div>
              </div>

              {/* Each-Way Extras */}
              {formData.bet_type === 'each-way' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Each-Way Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Place Price / Odds <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <div className="flex gap-4">
                        <div className="w-full">
                          <input
                            type="number"
                            name="place_odds"
                            step="0.01"
                            min="1"
                            placeholder="Place Price / Odds"
                            value={(formData.selections as any)?.place_odds || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              const placeOdds = val ? parseFloat(val) : null;
                              const placeTerms = (formData.selections as any)?.place_terms; // Keep reading if it exists in legacy data, or just undefined
                              const newSelections = { ...(formData.selections || {}), place_odds: placeOdds };

                              // Recalculate P&L with new place odds if position is set
                              let newPL = formData.profit_loss;
                              if (!manualProfitEdit && formData.finishing_position !== null && formData.finishing_position !== undefined) {
                                newPL = calculateProfitLoss(
                                  'each-way',
                                  formData.price,
                                  formData.stake,
                                  formData.finishing_position ?? null,
                                  { placeTerms, placeOdds }
                                );
                              }

                              setFormData({
                                ...formData,
                                selections: newSelections,
                                profit_loss: newPL as any
                              });
                            }}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-500"
                          />
                          <p className="text-xs text-gray-700 dark:text-gray-300 mt-1">Leave empty to use default calculation (1/4 of Win Odds)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Multi Extras */}
              {formData.bet_type === 'multi' && (
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Multi Bet Legs</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">Add each leg of your multi bet below. The combined odds will be calculated automatically.</p>

                  <div className="space-y-3">
                    {multiLegs.map((leg, index) => (
                      <div key={leg.id} className="grid grid-cols-12 gap-2 items-end p-3 bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-700">
                        <div className="col-span-12 sm:col-span-5">
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Horse/Dog Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={leg.horseName}
                            onChange={(e) => {
                              const newLegs = [...multiLegs];
                              newLegs[index].horseName = e.target.value;
                              setMultiLegs(newLegs);
                            }}
                            placeholder="e.g., Via Sistina"
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder:text-gray-500"
                          />
                        </div>
                        <div className="col-span-6 sm:col-span-3">
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Bet Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={leg.betType}
                            onChange={(e) => {
                              const newLegs = [...multiLegs];
                              newLegs[index].betType = e.target.value as 'win' | 'place' | 'each-way';
                              setMultiLegs(newLegs);
                            }}
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                          >
                            <option value="win">Win</option>
                            <option value="place">Place</option>
                            <option value="each-way">Each-Way</option>
                          </select>
                        </div>
                        <div className="col-span-5 sm:col-span-3">
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Price <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="1"
                            value={leg.price || ''}
                            onChange={(e) => {
                              const newLegs = [...multiLegs];
                              newLegs[index].price = parseFloat(e.target.value) || 0;
                              setMultiLegs(newLegs);
                              // Auto-calculate combined odds
                              const combinedOdds = newLegs.reduce((acc, l) => acc * (l.price || 1), 1);
                              setFormData({ ...formData, price: combinedOdds, num_legs: newLegs.length });
                            }}
                            placeholder="2.50"
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder:text-gray-500"
                          />
                        </div>
                        <div className="col-span-1">
                          {multiLegs.length > 2 && (
                            <button
                              type="button"
                              onClick={() => {
                                const newLegs = multiLegs.filter((_, i) => i !== index);
                                setMultiLegs(newLegs);
                                // Recalculate combined odds
                                const combinedOdds = newLegs.reduce((acc, l) => acc * (l.price || 1), 1);
                                setFormData({ ...formData, price: combinedOdds, num_legs: newLegs.length });
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Remove leg"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const newLeg: MultiLeg = {
                        id: Date.now().toString(),
                        horseName: '',
                        betType: 'win',
                        price: 0,
                      };
                      setMultiLegs([...multiLegs, newLeg]);
                    }}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Another Leg
                  </button>

                  <div className="mt-4 p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">Combined Odds:</span>
                      <span className="text-lg font-bold text-purple-700 dark:text-purple-300">
                        {multiLegs.reduce((acc, leg) => acc * (leg.price || 1), 1).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="font-medium text-gray-900 dark:text-white">Number of Legs:</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{multiLegs.length}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Multi Result</label>
                    <select
                      name="multi_result"
                      value={multiResult}
                      onChange={(e) => {
                        setMultiResult(e.target.value as 'Won' | 'Lost' | '');
                      }}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                    >
                      <option value="">Select result...</option>
                      <option value="Won">Won</option>
                      <option value="Lost">Lost</option>
                    </select>
                    {multiResult && formData.stake > 0 && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        P&L will be calculated automatically
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Exotics */}
              {(formData.bet_type === 'quinella' || formData.bet_type === 'exacta' || formData.bet_type === 'trifecta' || formData.bet_type === 'first-four') && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Exotic Bet Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Numbers Selected <span className="text-gray-400 font-normal">(optional)</span></label>
                      <input
                        type="text"
                        name="exotic_numbers"
                        placeholder="3, 7, 12"
                        onChange={(e) => setFormData({ ...formData, exotic_numbers: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Flexi % <span className="text-gray-400 font-normal">(optional)</span></label>
                      <input
                        type="number"
                        name="flexi_percent"
                        step="1"
                        min="1"
                        max="100"
                        defaultValue={100}
                        onChange={(e) => {
                          const flexi = parseFloat(e.target.value) || 100;
                          const pl = calculateProfitLoss(formData.bet_type, 0, formData.stake, null, {
                            dividend: undefined,
                            flexiPercent: flexi,
                          });
                          setFormData({ ...formData, profit_loss: pl as any });
                        }}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dividend Paid ($) <span className="text-gray-400 font-normal">(optional)</span></label>
                      <input
                        type="text"
                        name="dividend"
                        placeholder="$5.60"
                        onChange={(e) => {
                          const pl = calculateProfitLoss(formData.bet_type, 0, formData.stake, null, {
                            dividend: e.target.value,
                            flexiPercent: 100,
                          });
                          setFormData({ ...formData, profit_loss: pl as any });
                        }}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-500"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <p className="text-xs text-gray-700 dark:text-gray-300">If not won, P&L will be -stake. Dividend in AU is per $1 unit.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Other */}
              {formData.bet_type === 'other' && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Custom Bet Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description <span className="text-gray-400 font-normal">(optional)</span></label>
                      <input
                        type="text"
                        name="description"
                        placeholder="Custom bet description"
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Result</label>
                      <select
                        name="other_result"
                        onChange={(e) => {
                          const won = e.target.value === 'Won';
                          const pl = calculateProfitLoss('other', formData.price, formData.stake, null, {
                            payout: won ? formData.price * formData.stake : 0,
                            won,
                          });
                          setFormData({ ...formData, profit_loss: pl as any });
                        }}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                      >
                        <option>Won</option>
                        <option>Lost</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Group 3: Race Context */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Flag className="h-5 w-5 text-green-500" />
                Race Context
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Race Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Race Name <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  name="race_name"
                  value={formData.race_name || ''}
                  onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-500"
                  placeholder="e.g. Melbourne Cup"
                />
              </div>

              {/* Class */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Class <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  name="race_class"
                  value={formData.race_class || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      race_class: e.target.value || null,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-500"
                  placeholder="e.g. Maiden"
                />
              </div>

              {/* Best Starting Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Best Starting Price <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="number"
                  name="best_starting_price"
                  step="0.01"
                  min="1"
                  value={formData.best_starting_price || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      best_starting_price: e.target.value === '' ? null : parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-500"
                  placeholder="Best odds available"
                />
              </div>
            </div>
          </div>
          {/* Group 4: Outcome & Analysis */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-red-500" />
                Outcome & Analysis
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Finishing Position */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Finishing Position <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="number"
                  name="finishing_position"
                  min="1"
                  value={formData.finishing_position || ''}
                  onChange={handleFormChange}
                  placeholder="e.g. 1"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-500"
                />
              </div>

              {/* Profit/Loss */}
              {/* Profit/Loss */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white">
                    Profit/Loss <span className="text-xs font-normal text-gray-500">(auto)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={manualProfitEdit}
                      onChange={(e) => {
                        setManualProfitEdit(e.target.checked);
                        if (e.target.checked) {
                          setProfitLossInput(formData.profit_loss?.toString() ?? '');
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Edit Manually</span>
                  </label>
                </div>
                <input
                  type="number"
                  step="0.01"
                  name="profit_loss"
                  value={manualProfitEdit ? profitLossInput : (formData.profit_loss ?? '')}
                  readOnly={!manualProfitEdit}
                  onChange={(e) => {
                    const val = e.target.value;
                    setProfitLossInput(val);
                    // Allow clearing (null) or partial inputs like "-"
                    if (val === '') {
                      setFormData({ ...formData, profit_loss: null });
                    } else {
                      const parsed = parseFloat(val);
                      // Update formData only if it's a valid number. 
                      // If it's "-", parsed is NaN, so we set null to avoid '0' coercion issues
                      setFormData({ ...formData, profit_loss: isNaN(parsed) ? null : parsed });
                    }
                  }}
                  onBlur={() => {
                    // On blur, if valid number, normalize the input string
                    if (formData.profit_loss !== null && formData.profit_loss !== undefined) {
                      setProfitLossInput(formData.profit_loss.toString());
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg ${manualProfitEdit ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'
                    } ${formData.profit_loss !== null && formData.profit_loss !== undefined && Number(formData.profit_loss) >= 0
                      ? 'border-green-300 text-green-700 dark:text-green-400'
                      : formData.profit_loss !== null && formData.profit_loss !== undefined
                        ? 'border-red-300 text-red-700 dark:text-red-400'
                        : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'
                    }`}
                  placeholder={manualProfitEdit ? "Enter P&L..." : "Calculated automatically"}
                />
              </div>

              {/* Strategy/Tags */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Strategy/Tags <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  name="strategy_tags"
                  placeholder="e.g. value bet, favorite, longshot"
                  value={formData.strategy_tags?.join(', ') || ''}
                  onChange={(e) => {
                    const tags = e.target.value
                      .split(',')
                      .map((tag) => tag.trim())
                      .filter((tag) => tag.length > 0);
                    setFormData({
                      ...formData,
                      strategy_tags: tags.length > 0 ? tags : null,
                    });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-500"
                />
                <p className="mt-1 text-xs text-gray-500">Separate multiple tags with commas</p>
              </div>

              {/* Notes */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Add any additional notes about this bet..."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all hover:scale-105 font-medium text-lg"
            >
              <PlusCircle className="h-6 w-6" /> Add Bet
            </button>
          </div>
        </form>
      </div>

      {/* Filtered Stats */}
      {hasActiveFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-foreground">Filtered Stats</h2>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              Clear Filters
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2"><DollarSign className="h-4 w-4" /> Total Stake</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formatValue(monthlyStats.totalStake)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2"><Award className="h-4 w-4" /> Total P&L</p>
              <p
                className={`text-2xl font-semibold ${monthlyStats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
              >
                {formatValue(monthlyStats.totalProfit)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2"><Activity className="h-4 w-4" /> Total Bets</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{monthlyStats.totalBets}</p>
            </div>
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2"><Target className="h-4 w-4" /> Strike Rate</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {monthlyStats.strikeRate.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bets Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-700 to-gray-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">All Bets</h2>
              <p className="text-sm text-white/80 mt-1">
                {filteredBets.length} bet{filteredBets.length !== 1 ? 's' : ''} {hasActiveFilters || searchQuery ? 'filtered' : 'total'}
                {(hasActiveFilters || searchQuery) && bets.length !== filteredBets.length && (
                  <span className="ml-1 text-blue-300">
                    (of {bets.length} total)
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${showFilters || hasActiveFilters
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
                {hasActiveFilters && (
                  <span className="bg-white/20 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                    {Object.values(filters).filter((v) => v !== '').length}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  if (!hasCSVAccess) {
                    showToast('CSV Export is available for Elite members only. Upgrade to Elite to access this feature.', 'error');
                    return;
                  }
                  const csvContent = exportBetsToCSV(filteredBets);
                  const filename = `bets_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
                  downloadCSV(csvContent, filename);
                  showToast('Filtered bets exported successfully!', 'success');
                }}
                disabled={filteredBets.length === 0 || !hasCSVAccess || checkingCSVAccess}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${filteredBets.length === 0 || !hasCSVAccess || checkingCSVAccess
                  ? 'bg-gray-500 text-white cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                title={!hasCSVAccess ? 'Elite feature - Upgrade to access CSV Export' : ''}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {checkingCSVAccess ? 'Loading...' : !hasCSVAccess ? 'Export CSV (Elite)' : 'Export CSV'}
                </span>
                <span className="sm:hidden">
                  {checkingCSVAccess ? '...' : !hasCSVAccess ? 'Export (Elite)' : 'Export'}
                </span>
              </button>
            </div>
          </div>
          {/* Enhanced Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/60" />
            <input
              type="text"
              placeholder="Search bets by horse, race, venue, notes, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white"
                title="Clear search"
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Advanced Filters
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
                >
                  <XCircle className="h-4 w-4" />
                  Clear All
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Odds Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Odds Range
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="Min"
                    value={filters.oddsMin}
                    onChange={(e) => setFilters({ ...filters, oddsMin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    placeholder="Max"
                    value={filters.oddsMax}
                    onChange={(e) => setFilters({ ...filters, oddsMax: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm"
                  />
                </div>
              </div>

              {/* Stake Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stake Range ($)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Min"
                    value={filters.stakeMin}
                    onChange={(e) => setFilters({ ...filters, stakeMin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Max"
                    value={filters.stakeMax}
                    onChange={(e) => setFilters({ ...filters, stakeMax: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm"
                  />
                </div>
              </div>

              {/* Profit/Loss Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Profit/Loss Range ($)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Min"
                    value={filters.profitLossMin}
                    onChange={(e) => setFilters({ ...filters, profitLossMin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm"
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Max"
                    value={filters.profitLossMax}
                    onChange={(e) => setFilters({ ...filters, profitLossMax: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm"
                  />
                </div>
              </div>

              {/* Profit/Loss Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Result Type
                </label>
                <select
                  value={filters.profitLossType}
                  onChange={(e) => setFilters({ ...filters, profitLossType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="">All Types</option>
                  <option value="win">Winning Bets</option>
                  <option value="loss">Losing Bets</option>
                  <option value="neutral">Break Even</option>
                </select>
              </div>

              {/* Bet Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bet Type
                </label>
                <select
                  value={filters.betType}
                  onChange={(e) => setFilters({ ...filters, betType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm"
                >
                  <option value="">All Types</option>
                  <option value="win">Win</option>
                  <option value="place">Place</option>
                  <option value="each-way">Each-Way</option>
                  <option value="lay">Lay</option>
                  <option value="multi">Multi</option>
                  <option value="quinella">Quinella</option>
                  <option value="exacta">Exacta</option>
                  <option value="trifecta">Trifecta</option>
                  <option value="first-four">First Four</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Venue */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Venue
                </label>
                <VenueCombobox
                  value={filters.venue}
                  onChange={(value) => setFilters({ ...filters, venue: value || '' })}
                />
              </div>

              {/* Horse Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Horse Name
                </label>
                <input
                  type="text"
                  placeholder="Search horse name..."
                  value={filters.horseName}
                  onChange={(e) => setFilters({ ...filters, horseName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm"
                />
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date From
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date To
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4 px-4 pb-4">
          {filteredBets.length === 0 ? (
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <Activity className="h-10 w-10 text-blue-600 mx-auto mb-3" />
              <p className="text-gray-900 dark:text-gray-100 font-medium">No bets yet</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Track your first bet to see stats.</p>
            </div>
          ) : (
            filteredBets.map((bet) => (
              <div key={bet.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                {editingBet === bet.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Date</label>
                        <input
                          type="date"
                          name="bet_date"
                          value={editForm.bet_date || ''}
                          onChange={handleEditChange}
                          className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Venue</label>
                        <VenueCombobox
                          value={editForm.venue || null}
                          onChange={(value) => setEditForm({ ...editForm, venue: value })}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Race #</label>
                        <input
                          type="number"
                          name="race_number"
                          value={editForm.race_number || ''}
                          onChange={(e) => setEditForm({ ...editForm, race_number: e.target.value ? parseInt(e.target.value) : null })}
                          className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Horse</label>
                        <input
                          type="text"
                          name="horse_name"
                          value={editForm.horse_name || ''}
                          onChange={handleEditChange}
                          className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Stake</label>
                        <input
                          type="number"
                          name="stake"
                          value={editForm.stake || ''}
                          onChange={handleEditChange}
                          className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Odds</label>
                        <input
                          type="number"
                          name="price"
                          value={editForm.price || ''}
                          onChange={handleEditChange}
                          className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">BSP</label>
                        <input
                          type="number"
                          name="best_starting_price"
                          step="0.01"
                          value={editForm.best_starting_price || ''}
                          onChange={(e) => setEditForm({ ...editForm, best_starting_price: e.target.value ? parseFloat(e.target.value) : null })}
                          className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Position</label>
                        <input
                          type="number"
                          name="finishing_position"
                          value={editForm.finishing_position || ''}
                          onChange={handleEditChange}
                          className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">P&L</label>
                        <input
                          type="number"
                          name="profit_loss"
                          value={editForm.profit_loss !== null ? editForm.profit_loss : ''}
                          onChange={handleEditChange}
                          className="w-full px-2 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <button onClick={() => setEditingBet(null)} className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><X className="w-5 h-5" /></button>
                      <button onClick={() => handleUpdate(bet.id)} className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"><Check className="w-5 h-5" /></button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                          <span>{format(new Date(bet.bet_date), 'MMM dd')}</span>
                          <span>•</span>
                          <span>{bet.venue || 'Unknown Venue'}</span>
                          {bet.race_number && <span>• R{bet.race_number}</span>}
                        </div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                          {bet.horse_name || (bet.exotic_numbers ? `#${bet.exotic_numbers}` : bet.description || 'No Selection')}
                        </h3>
                      </div>
                      <span
                        className={
                          'px-2.5 py-1 rounded-full text-xs font-semibold text-white ' +
                          (bet.bet_type === 'win'
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                            : bet.bet_type === 'place'
                              ? 'bg-gradient-to-r from-green-500 to-teal-500'
                              : bet.bet_type === 'each-way'
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                                : bet.bet_type === 'lay'
                                  ? 'bg-gradient-to-r from-red-500 to-pink-500'
                                  : bet.bet_type === 'multi'
                                    ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                                    : bet.bet_type === 'other'
                                      ? 'bg-gradient-to-r from-gray-500 to-gray-700'
                                      : 'bg-gradient-to-r from-teal-500 to-cyan-500')
                        }
                      >
                        {bet.bet_type === 'each-way' ? 'E/W' : bet.bet_type.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-2 border-t border-b border-gray-100 dark:border-gray-700">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Stake</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{formatValue(bet.stake)}</p>
                      </div>
                      <div className="text-center border-l border-r border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Odds</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{Number(bet.price).toFixed(2)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">P&L</p>
                        <p className={`font-bold ${Number(bet.profit_loss) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {bet.profit_loss !== null ? formatValue(bet.profit_loss) : '-'}
                        </p>
                      </div>
                    </div>

                    {/* BSP Comparison - Show if BSP exists */}
                    {bet.best_starting_price && (
                      <div className="py-2 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Best Starting Price</p>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900 dark:text-white">{Number(bet.best_starting_price).toFixed(2)}</p>
                            {Number(bet.price) > Number(bet.best_starting_price) && (
                              <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">
                                Better odds
                              </span>
                            )}
                            {Number(bet.price) < Number(bet.best_starting_price) && (
                              <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full font-medium">
                                Missed value
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {bet.finishing_position && <span>Finished: {bet.finishing_position}</span>}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEdit(bet)}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          <Edit2 className="h-4 w-4" /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(bet.id)}
                          className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gradient-to-r from-gray-700 to-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Race
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Venue
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Horse
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Type
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Odds
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  BSP
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Stake
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Position
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  P&L
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider sticky right-0 bg-gray-800 z-10 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredBets.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Activity className="h-10 w-10 text-blue-600" />
                      <p className="text-gray-900 dark:text-gray-100 font-medium">No bets yet</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Track your first bet to see stats and insights.</p>
                      <a href="/dashboard/bets" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow hover:from-blue-700 hover:to-purple-700 transition-all hover:shadow-xl">
                        <PlusCircle className="h-4 w-4" /> Add your first bet
                      </a>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBets.map((bet, idx) =>
                  editingBet === bet.id ? (
                    <>
                      <tr key={bet.id} className="bg-amber-50 dark:bg-gray-700/50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="date"
                            name="bet_date"
                            value={editForm.bet_date || ''}
                            onChange={handleEditChange}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex gap-1">
                            <input
                              type="number"
                              name="race_number"
                              min="1"
                              max="12"
                              value={editForm.race_number || ''}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  race_number: e.target.value === '' ? null : parseInt(e.target.value, 10),
                                })
                              }
                              className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                              placeholder="#"
                            />
                            <input
                              type="text"
                              name="race_name"
                              value={editForm.race_name || ''}
                              onChange={handleEditChange}
                              className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                              placeholder="Race name"
                            />
                            <input
                              type="text"
                              name="race_class"
                              value={editForm.race_class || ''}
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  race_class: e.target.value || null,
                                })
                              }
                              className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                              placeholder="Class"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <VenueCombobox
                            value={editForm.venue || null}
                            onChange={(value) => setEditForm({ ...editForm, venue: value })}
                            className="text-sm"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="text"
                            name="horse_name"
                            value={editForm.horse_name || ''}
                            onChange={handleEditChange}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <select
                            name="bet_type"
                            value={editForm.bet_type || 'win'}
                            onChange={handleEditChange}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                          >
                            <option value="win">Win</option>
                            <option value="place">Place</option>
                            <option value="each-way">Each-Way</option>
                            <option value="lay">Lay</option>
                            <option value="multi">Multi</option>
                            <option value="quinella">Quinella</option>
                            <option value="exacta">Exacta</option>
                            <option value="trifecta">Trifecta</option>
                            <option value="first-four">First Four</option>
                            <option value="other">Other</option>
                          </select>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <input
                            type="number"
                            name="price"
                            step="0.01"
                            value={editForm.price || 0}
                            onChange={handleEditChange}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                          />
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <input
                            type="number"
                            name="best_starting_price"
                            step="0.01"
                            value={editForm.best_starting_price || ''}
                            onChange={(e) => setEditForm({ ...editForm, best_starting_price: e.target.value ? parseFloat(e.target.value) : null })}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                            placeholder="BSP"
                          />
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <input
                            type="number"
                            name="stake"
                            step="0.01"
                            value={editForm.stake || 0}
                            onChange={handleEditChange}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                          />
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <input
                            type="number"
                            name="finishing_position"
                            value={editForm.finishing_position || ''}
                            onChange={handleEditChange}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                          />
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                          <input
                            type="number"
                            name="profit_loss"
                            step="0.01"
                            value={editForm.profit_loss !== null && editForm.profit_loss !== undefined ? Number(editForm.profit_loss) : ''}
                            onChange={handleEditChange}
                            className={`w-full px-2 py-1 border rounded text-sm ${(editForm.profit_loss !== null && editForm.profit_loss !== undefined && Number(editForm.profit_loss) >= 0)
                              ? 'border-green-300 text-green-700 dark:text-green-400'
                              : editForm.profit_loss !== null && editForm.profit_loss !== undefined
                                ? 'border-red-300 text-red-700 dark:text-red-400'
                                : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'
                              }`}
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap sticky right-0 bg-amber-50 dark:bg-gray-700 z-20 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleUpdate(bet.id)}
                              className="text-green-600 hover:text-green-800"
                              title="Save"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => setEditingBet(null)}
                              className="text-gray-600 hover:text-gray-800"
                              title="Cancel"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr key={`${bet.id}-edit-extra`} className="bg-amber-50 dark:bg-gray-700/50">
                        <td colSpan={10} className="px-4 py-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Strategy/Tags (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={editForm.strategy_tags?.join(', ') || ''}
                                onChange={(e) => {
                                  const tags = e.target.value
                                    .split(',')
                                    .map((tag) => tag.trim())
                                    .filter((tag) => tag.length > 0);
                                  setEditForm({
                                    ...editForm,
                                    strategy_tags: tags.length > 0 ? tags : null,
                                  });
                                }}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                                placeholder="e.g., value bet, favorite"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Notes
                              </label>
                              <textarea
                                value={editForm.notes || ''}
                                onChange={(e) =>
                                  setEditForm({ ...editForm, notes: e.target.value || null })
                                }
                                rows={2}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                                placeholder="Add notes..."
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    </>
                  ) : (
                    <tr key={bet.id} className={`${(idx % 2 === 0) ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'} hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors`}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {format(new Date(bet.bet_date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <div>
                          {bet.race_number && <span className="font-semibold">R{bet.race_number} </span>}
                          {bet.race_name || '-'}
                          {bet.race_class && (
                            <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                              ({bet.race_class})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {bet.venue ? getTrackLabel(bet.venue) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        <div>
                          <div className="whitespace-nowrap">
                            {bet.horse_name || (bet.exotic_numbers ? `# ${bet.exotic_numbers}` : bet.description || '-')}
                          </div>
                          {bet.strategy_tags && bet.strategy_tags.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {bet.strategy_tags.map((tag, tagIdx) => (
                                <span
                                  key={tagIdx}
                                  className="inline-block px-2 py-0.5 text-xs rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          {bet.notes && (
                            <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 italic truncate max-w-xs" title={bet.notes}>
                              {bet.notes}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        <span
                          className={
                            'px-3 py-1 rounded-full text-xs font-semibold text-white ' +
                            (bet.bet_type === 'win'
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600'
                              : bet.bet_type === 'place'
                                ? 'bg-gradient-to-r from-green-500 to-teal-500'
                                : bet.bet_type === 'each-way'
                                  ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                                  : bet.bet_type === 'lay'
                                    ? 'bg-gradient-to-r from-red-500 to-pink-500'
                                    : bet.bet_type === 'multi'
                                      ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                                      : bet.bet_type === 'other'
                                        ? 'bg-gradient-to-r from-gray-500 to-gray-700'
                                        : 'bg-gradient-to-r from-teal-500 to-cyan-500')
                          }
                          title={bet.bet_type}
                        >
                          {bet.bet_type === 'each-way'
                            ? 'E/W'
                            : bet.bet_type === 'quinella'
                              ? 'Q'
                              : bet.bet_type === 'exacta'
                                ? 'E'
                                : bet.bet_type === 'trifecta'
                                  ? 'T'
                                  : bet.bet_type === 'first-four'
                                    ? 'FF'
                                    : bet.bet_type.toUpperCase()}
                        </span>
                        {bet.bet_type === 'multi' && bet.num_legs ? (
                          <span className="ml-2 text-xs text-gray-700 dark:text-gray-300">{bet.num_legs}-leg</span>
                        ) : null}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-foreground">
                        {Number(bet.price).toFixed(2)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-foreground">
                        {bet.best_starting_price ? (
                          <div className="flex items-center gap-2">
                            <span>{Number(bet.best_starting_price).toFixed(2)}</span>
                            {Number(bet.price) > Number(bet.best_starting_price) && (
                              <span className="text-xs px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded font-medium">
                                ↑
                              </span>
                            )}
                            {Number(bet.price) < Number(bet.best_starting_price) && (
                              <span className="text-xs px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded font-medium">
                                ↓
                              </span>
                            )}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-foreground">
                        {formatValue(bet.stake)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {bet.finishing_position || '-'}
                      </td>
                      <td
                        className={`px-3 py-3 whitespace-nowrap text-sm font-medium ${bet.profit_loss !== null && Number(bet.profit_loss) >= 0
                          ? 'text-green-600'
                          : bet.profit_loss !== null
                            ? 'text-red-600'
                            : 'text-gray-500'
                          }`}
                      >
                        {bet.profit_loss !== null
                          ? `$${Number(bet.profit_loss).toFixed(2)}`
                          : '-'}
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm sticky right-0 z-20 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] ${(idx % 2 === 0) ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}`}>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(bet)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(bet.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>

                  )
                )
              )}
            </tbody >
          </table >
        </div >
      </div >
    </div >
  );
}
