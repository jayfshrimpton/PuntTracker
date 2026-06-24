'use client';

import { useState } from 'react';
import { Calculator, ChevronDown, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { useCurrency } from '@/components/CurrencyContext';

interface StakingCalculatorProps {
    /** Pre-fill bankroll from the user's current bankroll figure, if available. */
    defaultBankroll?: number | null;
    /** Flat unit size from the user's profile. */
    unitSize?: number;
}

export function StakingCalculator({ defaultBankroll, unitSize = 10 }: StakingCalculatorProps) {
    const { formatValue } = useCurrency();
    const [open, setOpen] = useState(false);
    const [odds, setOdds] = useState('3.0');
    const [winProb, setWinProb] = useState('40');
    const [bankroll, setBankroll] = useState(
        defaultBankroll && defaultBankroll > 0 ? String(defaultBankroll) : '1000'
    );
    const [bankPct, setBankPct] = useState('2');

    const oddsNum = parseFloat(odds);
    const probNum = parseFloat(winProb) / 100;
    const bankNum = parseFloat(bankroll);
    const pctNum = parseFloat(bankPct);

    const validInputs =
        !isNaN(oddsNum) &&
        oddsNum > 1 &&
        !isNaN(probNum) &&
        probNum > 0 &&
        probNum < 1 &&
        !isNaN(bankNum) &&
        bankNum > 0;

    // Kelly criterion: f = (b*p - (1-p)) / b, where b = odds - 1
    const b = oddsNum - 1;
    const rawKellyFraction = validInputs ? (b * probNum - (1 - probNum)) / b : 0;
    const kellyFraction = Math.max(0, rawKellyFraction);
    const noValue = validInputs && rawKellyFraction <= 0;

    const fullKelly = kellyFraction * bankNum;
    const halfKelly = fullKelly * 0.5;
    const quarterKelly = fullKelly * 0.25;
    const flatStake = unitSize;
    const pctStake = validInputs && !isNaN(pctNum) ? bankNum * (pctNum / 100) : 0;

    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg dark:border-white/5 dark:bg-black/20">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex w-full items-center justify-between p-6 text-left"
            >
                <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                        <Calculator className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-foreground">Staking Calculator</h3>
                        <p className="text-sm text-muted-foreground">
                            Kelly, flat unit &amp; percentage-of-bank stakes
                        </p>
                    </div>
                </div>
                <ChevronDown
                    className={`h-5 w-5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''
                        }`}
                />
            </button>

            {open && (
                <div className="space-y-6 px-6 pb-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Input
                            label="Decimal Odds"
                            type="number"
                            min="1.01"
                            step="0.01"
                            value={odds}
                            onChange={(e) => setOdds(e.target.value)}
                        />
                        <Input
                            label="Win Probability (%)"
                            type="number"
                            min="0"
                            max="100"
                            step="1"
                            value={winProb}
                            onChange={(e) => setWinProb(e.target.value)}
                        />
                        <Input
                            label="Bankroll"
                            type="number"
                            min="0"
                            step="1"
                            value={bankroll}
                            onChange={(e) => setBankroll(e.target.value)}
                        />
                        <Input
                            label="% of Bank"
                            type="number"
                            min="0"
                            max="100"
                            step="0.5"
                            value={bankPct}
                            onChange={(e) => setBankPct(e.target.value)}
                        />
                    </div>

                    {!validInputs ? (
                        <p className="text-sm text-muted-foreground">
                            Enter valid odds (&gt;1), win probability (0-100%) and a positive bankroll
                            to see suggested stakes.
                        </p>
                    ) : (
                        <>
                            {noValue && (
                                <div className="flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-600 dark:text-yellow-400">
                                    <AlertTriangle className="h-4 w-4 shrink-0" />
                                    <span>
                                        No value bet — the implied edge is zero or negative, so Kelly
                                        suggests no stake.
                                    </span>
                                </div>
                            )}

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                <StakeTile label="Full Kelly" value={formatValue(fullKelly, 2, false)} />
                                <StakeTile label="Half Kelly" value={formatValue(halfKelly, 2, false)} />
                                <StakeTile
                                    label="Quarter Kelly"
                                    value={formatValue(quarterKelly, 2, false)}
                                />
                                <StakeTile
                                    label="Flat Unit"
                                    value={formatValue(flatStake, 2, false)}
                                />
                                <StakeTile
                                    label={`${isNaN(pctNum) ? 0 : pctNum}% of Bank`}
                                    value={formatValue(pctStake, 2, false)}
                                />
                                <StakeTile
                                    label="Kelly Fraction"
                                    value={`${(kellyFraction * 100).toFixed(1)}%`}
                                />
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

function StakeTile({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 dark:border-white/5 dark:bg-black/20">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="mt-1 text-xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
    );
}
