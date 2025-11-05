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
import { Edit2, Trash2, X, Check } from 'lucide-react';
import { format } from 'date-fns';
import { showToast } from '@/lib/toast';

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
  });

  const [showLayInfo, setShowLayInfo] = useState(false);
  const [manualProfitEdit, setManualProfitEdit] = useState(false);

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
    position: number | null
  ): number | null => {
    if (position === null || position === undefined) return null;

    if (betType === 'win') {
      return position === 1 ? stake * (price - 1) : -stake;
    } else if (betType === 'place') {
      // Use place odds directly - no conversion needed
      return position <= 3 ? stake * (price - 1) : -stake;
    } else if (betType === 'lay') {
      return position === 1 ? -(stake * (price - 1)) : stake;
    }

    return null;
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
        bet_type: (editForm.bet_type as 'win' | 'place' | 'lay') || 'win',
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Enter Bets</h1>
        <p className="mt-1 text-sm text-gray-900">
          Add and manage your horse racing bets
        </p>
      </div>

      {/* Monthly Totals */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Monthly Totals</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-900 font-medium">Total Stake</p>
            <p className="text-lg font-semibold text-gray-900">
              ${monthlyStats.totalStake.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-900 font-medium">Total P&L</p>
            <p
              className={`text-lg font-semibold ${
                monthlyStats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              ${monthlyStats.totalProfit.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-900 font-medium">Total Bets</p>
            <p className="text-lg font-semibold text-gray-900">{monthlyStats.totalBets}</p>
          </div>
          <div>
            <p className="text-sm text-gray-900 font-medium">Strike Rate</p>
            <p className="text-lg font-semibold text-gray-900">
              {monthlyStats.strikeRate.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Bet Entry Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Add New Bet</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Race Name
              </label>
              <input
                type="text"
                name="race_name"
                required
                value={formData.race_name}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horse Name
              </label>
              <input
                type="text"
                name="horse_name"
                required
                value={formData.horse_name}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bet Type
              </label>
              <select
                name="bet_type"
                value={formData.bet_type}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              >
                <option value="win">Win</option>
                <option value="place">Place</option>
                <option value="lay">Lay</option>
              </select>
              {formData.bet_type === 'lay' && (
                <p className="mt-1 text-xs text-gray-900">
                  Lay: You&apos;re betting against the horse. If it wins, you lose the
                  liability (stake × (odds - 1)). If it loses, you win the
                  stake.
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Finishing Position (optional)
              </label>
              <input
                type="number"
                name="finishing_position"
                min="1"
                value={formData.finishing_position || ''}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                name="bet_date"
                required
                value={formData.bet_date}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
            {formData.profit_loss !== null && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="block text-sm font-medium text-gray-900">
                    Profit/Loss
                  </label>
                  <label className="flex items-center gap-1 text-xs text-gray-700">
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
                  className={`w-full px-3 py-2 border rounded-md ${
                    manualProfitEdit ? 'bg-white' : 'bg-gray-50'
                  } ${
                    formData.profit_loss !== null && formData.profit_loss >= 0
                      ? 'border-green-300 text-green-700'
                      : formData.profit_loss !== null
                      ? 'border-red-300 text-red-700'
                      : 'border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            )}
          </div>
          <button
            type="submit"
            className="w-full md:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-lg transition-all"
          >
            Add Bet
          </button>
        </form>
      </div>

      {/* Bets Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">All Bets</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Race
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Horse
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Odds
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Stake
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  P&L
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-900">
                    No bets yet. Add your first bet above!
                  </td>
                </tr>
              ) : (
                bets.map((bet) =>
                  editingBet === bet.id ? (
                    <tr key={bet.id} className="bg-yellow-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="date"
                          name="bet_date"
                          value={editForm.bet_date || ''}
                          onChange={handleEditChange}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="text"
                          name="race_name"
                          value={editForm.race_name || ''}
                          onChange={handleEditChange}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="text"
                          name="horse_name"
                          value={editForm.horse_name || ''}
                          onChange={handleEditChange}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <select
                          name="bet_type"
                          value={editForm.bet_type || 'win'}
                          onChange={handleEditChange}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="win">Win</option>
                          <option value="place">Place</option>
                          <option value="lay">Lay</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          name="price"
                          step="0.01"
                          value={editForm.price || 0}
                          onChange={handleEditChange}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          name="stake"
                          step="0.01"
                          value={editForm.stake || 0}
                          onChange={handleEditChange}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <input
                          type="number"
                          name="finishing_position"
                          value={editForm.finishing_position || ''}
                          onChange={handleEditChange}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
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
                              ? 'border-green-300 text-green-700'
                              : editForm.profit_loss !== null && editForm.profit_loss !== undefined
                              ? 'border-red-300 text-red-700'
                              : 'border-gray-300 text-gray-900'
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
                    <tr key={bet.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {format(new Date(bet.bet_date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {bet.race_name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {bet.horse_name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 uppercase">
                        {bet.bet_type}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {Number(bet.price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        ${Number(bet.stake).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
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
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(bet.id)}
                            className="text-red-600 hover:text-red-800"
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
