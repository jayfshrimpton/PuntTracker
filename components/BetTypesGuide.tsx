'use client';

import { useState } from 'react';

export default function BetTypesGuide() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        aria-label="Bet Types Guide"
        className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"
        onClick={() => setOpen(true)}
        title="Bet Types Guide"
      >
        ?
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Bet Types Guide</h3>
              <button className="text-gray-600 hover:text-gray-800" onClick={() => setOpen(false)}>✕</button>
            </div>
            <div className="space-y-3 text-sm text-gray-900">
              <Section title="Win">Back a horse to win. P&L = stake × (odds − 1) if 1st, else −stake.</Section>
              <Section title="Place">Back a horse to place. Use place odds. If in paid places, P&L = stake × (odds − 1), else −stake.</Section>
              <Section title="Each-Way">Half stake on Win, half on Place. Place returns use terms (e.g., 1/4 odds, 3 places). P&L = Win portion + Place portion.</Section>
              <Section title="Lay">Bet against a horse. If it wins, lose liability = stake × (odds − 1); otherwise, win stake.</Section>
              <Section title="Multi">Multiple legs combined. If all legs win: P&L = stake × (combined odds − 1); else −stake.</Section>
              <Section title="Exotics (Quinella/Exacta/Trifecta/First Four)">Enter selected numbers and dividend. P&L = (dividend × flexi%) − total stake; if no collect, −stake.</Section>
              <Section title="Other">Custom. If won: P&L = payout − stake; else −stake.</Section>
              <p className="text-xs text-gray-700">All currency values rounded to 2 decimals. AU totes/dividends are per $1 unit.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: any }) {
  return (
    <div>
      <p className="font-semibold">{title}</p>
      <p>{children}</p>
    </div>
  );
}











