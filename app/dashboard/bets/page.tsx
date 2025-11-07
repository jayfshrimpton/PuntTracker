'use client';

import { useState, useEffect } from 'react';
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
import { Edit2, Trash2, X, Check, PlusCircle, DollarSign, Target, CalendarDays, Activity, Award } from 'lucide-react';
import { format } from 'date-fns';
import { showToast } from '@/lib/toast';
import BetTypesGuide from '@/components/BetTypesGuide';

export default function BetsPage() {
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingBet, setEditingBet] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Bet>>({});

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
  });

  const [showLayInfo, setShowLayInfo] = useState(false);
  const [manualProfitEdit, setManualProfitEdit] = useState(false);
  const [celebrateWin, setCelebrateWin] = useState(false);

  useEffect(() => {
    loadBets();
  }, []);

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
          position
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
          : updatedForm.finishing_position;
      const price = name === 'price' ? parseFloat(value) || 0 : updatedForm.price;
      const stake = name === 'stake' ? parseFloat(value) || 0 : updatedForm.stake;
      const betType = name === 'bet_type' ? value : updatedForm.bet_type;

      updatedForm.profit_loss = calculateProfitLoss(
        betType,
        price,
        stake,
        position ?? null
      );
    }

    setFormData(updatedForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const { error: createError } = await createBet(formData);

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
      });
      setManualProfitEdit(false);

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

  const monthlyStats = calculateMonthlyStats(bets);

  if (loading) {
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Enter Bets</h1>
        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
          Add and manage your horse racing bets
        </p>
      </div>

      {/* Monthly Totals */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-shadow">
        <h2 className="text-lg font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Monthly Totals</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2"><DollarSign className="h-4 w-4" /> Total Stake</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              ${monthlyStats.totalStake.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2"><Award className="h-4 w-4" /> Total P&L</p>
            <p
              className={`text-2xl font-semibold ${
                monthlyStats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              ${monthlyStats.totalProfit.toFixed(2)}
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

      {/* Bet Entry Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-shadow">
        <div className="flex items-center mb-4">
          <h2 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Add New Bet</h2>
          <BetTypesGuide />
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Race Name
              </label>
              <input
                type="text"
                name="race_name"
                required
                value={formData.race_name}
                onChange={handleFormChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Horse Name
              </label>
              <input
                type="text"
                name="horse_name"
                required
                value={formData.horse_name}
                onChange={handleFormChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bet Type
              </label>
              <select
                name="bet_type"
                value={formData.bet_type}
                onChange={handleFormChange}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price/Odds
              </label>
              <input
                type="number"
                name="price"
                step="0.01"
                min="1"
                required
                value={formData.price || ''}
                onChange={handleFormChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stake ($)
              </label>
              <input
                type="number"
                name="stake"
                step="0.01"
                min="0"
                required
                value={formData.stake || ''}
                onChange={handleFormChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Finishing Position (optional)
              </label>
              <input
                type="number"
                name="finishing_position"
                min="1"
                value={formData.finishing_position || ''}
                onChange={handleFormChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-500"
              />
            </div>
            {/* Each-Way Extras */}
            {formData.bet_type === 'each-way' && (
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Place Terms (e.g., &quot;1/4 odds, 3 places&quot;)
                  </label>
                  <input
                    type="text"
                    name="place_terms"
                    placeholder="1/4 odds, 3 places"
                    onChange={(e) => {
                      const placeTerms = e.target.value;
                      const pl = calculateProfitLoss(
                        'each-way',
                        formData.price,
                        formData.stake,
                        formData.finishing_position ?? null,
                        { placeTerms }
                      );
                      setFormData({ ...formData, profit_loss: pl as any });
                    }}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-500"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-700 dark:text-gray-300 mt-7">Stake is split 50/50 across Win and Place</p>
                </div>
              </div>
            )}

            {/* Multi Extras */}
            {formData.bet_type === 'multi' && (
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Number of Legs</label>
                  <input
                    type="number"
                    name="num_legs"
                    min="1"
                    value={formData.num_legs || ''}
                    onChange={(e) => {
                      const num = e.target.value === '' ? null : parseInt(e.target.value, 10);
                      setFormData({ ...formData, num_legs: isNaN(Number(num)) ? null : (num as any) });
                    }}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Multi Result</label>
                  <select
                    name="multi_result"
                    onChange={(e) => {
                      const allWon = e.target.value === 'Won';
                      const pl = calculateProfitLoss('multi', formData.price, formData.stake, null, {
                        multiAllWon: allWon,
                        combinedOdds: formData.price,
                      });
                      setFormData({ ...formData, profit_loss: pl as any });
                    }}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                  >
                    <option>Won</option>
                    <option>Lost</option>
                  </select>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Selections (JSON, optional)</label>
                  <textarea
                    name="selections"
                    rows={3}
                    placeholder='[{"race":"R3","horse":"#4","result":"Won"}]'
                    onChange={(e) => {
                      let json: any = null;
                      try { json = JSON.parse(e.target.value); } catch {}
                      setFormData({ ...formData, selections: json });
                    }}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-500"
                  />
                </div>
              </div>
            )}

            {/* Exotics */}
            {(formData.bet_type === 'quinella' || formData.bet_type === 'exacta' || formData.bet_type === 'trifecta' || formData.bet_type === 'first-four') && (
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Numbers Selected</label>
                  <input
                    type="text"
                    name="exotic_numbers"
                    placeholder="3, 7, 12"
                    onChange={(e) => setFormData({ ...formData, exotic_numbers: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder:text-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Flexi %</label>
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dividend Paid ($)</label>
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
            )}

            {/* Other */}
            {formData.bet_type === 'other' && (
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    name="description"
                    placeholder="Custom bet description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Result</label>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  >
                    <option>Won</option>
                    <option>Lost</option>
                  </select>
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Date
              </label>
              <input
                type="date"
                name="bet_date"
                required
                value={formData.bet_date}
                onChange={handleFormChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              />
            </div>
            {formData.profit_loss !== null && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white">
                    Profit/Loss
                  </label>
                  <label className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={manualProfitEdit}
                      onChange={(e) => setManualProfitEdit(e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span>Edit manually</span>
                  </label>
                </div>
                <input
                  type="number"
                  step="0.01"
                  name="profit_loss"
                  value={formData.profit_loss !== null ? formData.profit_loss : ''}
                  readOnly={!manualProfitEdit}
                  onChange={(e) => {
                    const value = e.target.value === '' ? null : parseFloat(e.target.value) || 0;
                    setFormData({ ...formData, profit_loss: value });
                  }}
                  className={`w-full px-4 py-3 border rounded-lg ${
                    manualProfitEdit ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'
                  } ${
                    formData.profit_loss !== null && formData.profit_loss !== undefined && Number(formData.profit_loss) >= 0
                      ? 'border-green-300 text-green-700 dark:text-green-400'
                      : formData.profit_loss !== null && formData.profit_loss !== undefined
                      ? 'border-red-300 text-red-700 dark:text-red-400'
                      : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'
                  }`}
                />
              </div>
            )}
          </div>
          <button
            type="submit"
            className="w-full md:w-auto inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <PlusCircle className="h-5 w-5" /> Add Bet
          </button>
        </form>
      </div>

      {/* Bets Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-700 to-gray-800">
          <h2 className="text-lg font-semibold text-white">All Bets</h2>
        </div>
        <div className="overflow-x-auto">
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
                  Horse
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Odds
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Stake
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Position
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  P&L
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {bets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center">
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
                bets.map((bet, idx) =>
                  editingBet === bet.id ? (
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
                        <input
                          type="text"
                          name="race_name"
                          value={editForm.race_name || ''}
                          onChange={handleEditChange}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
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
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          name="price"
                          step="0.01"
                          value={editForm.price || 0}
                          onChange={handleEditChange}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          name="stake"
                          step="0.01"
                          value={editForm.stake || 0}
                          onChange={handleEditChange}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          name="finishing_position"
                          value={editForm.finishing_position || ''}
                          onChange={handleEditChange}
                          className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          name="profit_loss"
                          step="0.01"
                          value={editForm.profit_loss !== null && editForm.profit_loss !== undefined ? Number(editForm.profit_loss) : ''}
                          onChange={handleEditChange}
                          className={`w-full px-2 py-1 border rounded text-sm ${
                            (editForm.profit_loss !== null && editForm.profit_loss !== undefined && Number(editForm.profit_loss) >= 0)
                              ? 'border-green-300 text-green-700 dark:text-green-400'
                              : editForm.profit_loss !== null && editForm.profit_loss !== undefined
                              ? 'border-red-300 text-red-700 dark:text-red-400'
                              : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'
                          }`}
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
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
                  ) : (
                    <tr key={bet.id} className={`${(idx % 2 === 0) ? 'bg-white dark:bg-gray-800/50' : 'bg-gray-50 dark:bg-gray-800/30'} hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors`}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {format(new Date(bet.bet_date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {bet.race_name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {bet.horse_name || (bet.exotic_numbers ? `# ${bet.exotic_numbers}` : bet.description || '-')}
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
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {Number(bet.price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        ${Number(bet.stake).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {bet.finishing_position || '-'}
                      </td>
                      <td
                        className={`px-4 py-3 whitespace-nowrap text-sm font-semibold ${
                          bet.profit_loss !== null && Number(bet.profit_loss) >= 0
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
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
