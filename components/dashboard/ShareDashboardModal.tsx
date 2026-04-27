'use client';

import { useState } from 'react';
import { X, Link2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import type { DashboardPeriodState } from '@/lib/dashboard-period';
import { formatDashboardPeriodLabel } from '@/lib/dashboard-period';
import { showToast } from '@/lib/toast';

interface ShareDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  period: DashboardPeriodState;
}

export function ShareDashboardModal({ isOpen, onClose, period }: ShareDashboardModalProps) {
  const [showProfit, setShowProfit] = useState(true);
  const [showStrike, setShowStrike] = useState(true);
  const [showRoi, setShowRoi] = useState(true);
  const [showTurnover, setShowTurnover] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || '';

  const handleCreate = async () => {
    setLoading(true);
    setCopied(false);
    try {
      const res = await fetch('/api/share/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          period,
          show_profit: showProfit,
          show_strike_rate: showStrike,
          show_roi: showRoi,
          show_turnover: showTurnover,
          display_name: displayName.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Could not create share link', 'error');
        return;
      }
      const url = `${baseUrl}/share/${data.token}`;
      setShareUrl(url);
      showToast('Share link ready', 'success');
    } catch {
      showToast('Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      showToast('Link copied', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Could not copy', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        className="relative w-full max-w-md rounded-2xl border border-border bg-card shadow-xl"
        role="dialog"
        aria-labelledby="share-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-2 text-muted-foreground hover:bg-muted"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 pt-10">
          <div className="flex items-center gap-2 mb-1">
            <Link2 className="h-5 w-5 text-primary" />
            <h2 id="share-modal-title" className="text-xl font-semibold">
              Share stats card
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Public link for the period:{' '}
            <span className="font-medium text-foreground">
              {formatDashboardPeriodLabel(period)}
            </span>
            . Matches your dashboard filter. Anyone with the link can view the numbers you enable
            below (not your bet list).
          </p>

          <div className="space-y-3 mb-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showProfit}
                onChange={(e) => setShowProfit(e.target.checked)}
                className="rounded border-input"
              />
              Show profit / loss
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showStrike}
                onChange={(e) => setShowStrike(e.target.checked)}
                className="rounded border-input"
              />
              Show strike rate
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showRoi}
                onChange={(e) => setShowRoi(e.target.checked)}
                className="rounded border-input"
              />
              Show ROI
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showTurnover}
                onChange={(e) => setShowTurnover(e.target.checked)}
                className="rounded border-input"
              />
              Show turnover
            </label>
          </div>

          <div className="mb-6">
            <Input
              label="Display name (optional)"
              placeholder="e.g. Jay @ The Punt"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          {shareUrl ? (
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  readOnly
                  value={shareUrl}
                  className="flex-1 h-10 rounded-lg border border-input bg-muted/50 px-3 text-sm"
                />
                <Button type="button" variant="outline" size="icon" onClick={copy} className="shrink-0">
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <Button type="button" className="w-full" variant="secondary" onClick={handleCreate} disabled={loading}>
                Update link & settings
              </Button>
            </div>
          ) : (
            <Button type="button" className="w-full" onClick={handleCreate} disabled={loading}>
              {loading ? 'Saving…' : 'Create or update share link'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
