'use client';

import { useRef, useState } from 'react';
import { Upload, FileText, X, Loader2, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';
import { showToast } from '@/lib/toast';
import { getTrackLabel } from '@/lib/racing-tracks';
import type { ImportResult, ParsedBetRow } from '@/lib/bet-import/types';

type EditableRow = ParsedBetRow & { include: boolean };

interface ImportBetsModalProps {
  onClose: () => void;
  onImported: () => void;
}

const BET_TYPES = [
  'win', 'place', 'each-way', 'lay', 'multi',
  'quinella', 'exacta', 'trifecta', 'first-four', 'other',
] as const;

const ACCEPT = '.csv,.xlsx,.xls,.pdf,.png,.jpg,.jpeg,.webp';

export default function ImportBetsModal({ onClose, onImported }: ImportBetsModalProps) {
  const [step, setStep] = useState<'upload' | 'preview'>('upload');
  const [parsing, setParsing] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState('');
  const [rows, setRows] = useState<EditableRow[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [parser, setParser] = useState<ImportResult['parser'] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedCount = rows.filter((r) => r.include).length;

  const handleFile = async (file: File) => {
    setParsing(true);
    setFileName(file.name);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/bets/import', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        showToast(data?.message || 'Could not read this file.', 'error');
        setParsing(false);
        return;
      }

      const result = data as ImportResult;
      setParser(result.parser);
      setWarnings(result.warnings || []);

      if (!result.rows || result.rows.length === 0) {
        showToast(
          result.warnings?.[0] || 'No bets were found in this file.',
          'error'
        );
        setParsing(false);
        return;
      }

      setRows(result.rows.map((r) => ({ ...r, include: true })));
      setStep('preview');
    } catch (error) {
      console.error('Import parse failed:', error);
      showToast('Something went wrong reading that file.', 'error');
    } finally {
      setParsing(false);
    }
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const updateRow = (rowIndex: number, patch: Partial<EditableRow>) => {
    setRows((prev) => prev.map((r) => (r.rowIndex === rowIndex ? { ...r, ...patch } : r)));
  };

  const rowIsValid = (r: EditableRow): boolean =>
    !!r.horse_name?.trim() &&
    BET_TYPES.includes(r.bet_type as never) &&
    Number(r.price) > 0 &&
    Number(r.stake) > 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(r.bet_date || '');

  const handleCommit = async () => {
    const toImport = rows.filter((r) => r.include);
    if (toImport.length === 0) {
      showToast('Select at least one bet to import.', 'error');
      return;
    }
    const invalidSelected = toImport.filter((r) => !rowIsValid(r));
    if (invalidSelected.length > 0) {
      showToast(
        `${invalidSelected.length} selected bet${invalidSelected.length === 1 ? ' has' : 's have'} missing or invalid fields. Fix or deselect them.`,
        'error'
      );
      return;
    }

    setCommitting(true);
    try {
      const bets = toImport.map((r) => ({
        bet_date: r.bet_date,
        horse_name: r.horse_name,
        bet_type: r.bet_type,
        price: Number(r.price),
        stake: Number(r.stake),
        profit_loss: r.profit_loss ?? null,
        finishing_position: r.finishing_position ?? null,
        venue: r.venue ?? null,
        race_number: r.race_number ?? null,
        race_name: r.race_name ?? null,
        race_class: r.race_class ?? null,
        bookie: r.bookie ?? null,
        notes: r.notes ?? null,
        description: r.description ?? null,
        exotic_numbers: r.exotic_numbers ?? null,
        num_legs: r.num_legs ?? null,
        strategy_tags: r.strategy_tags ?? null,
        selections: r.selections ?? null,
      }));

      const res = await fetch('/api/bets/import/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bets }),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data?.message || 'Failed to import bets.', 'error');
        setCommitting(false);
        return;
      }

      let msg = `Imported ${data.inserted} bet${data.inserted === 1 ? '' : 's'}.`;
      if (data.skippedForLimit > 0) {
        msg += ` ${data.skippedForLimit} skipped (monthly free-tier limit).`;
      }
      showToast(msg, 'success');
      onImported();
      onClose();
    } catch (error) {
      console.error('Import commit failed:', error);
      showToast('Something went wrong importing your bets.', 'error');
    } finally {
      setCommitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-5xl max-h-[90vh] flex flex-col bg-card rounded-xl shadow-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Bets
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Upload a bet summary from your bookie (CSV, Excel, PDF, or screenshot).
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-6">
          {step === 'upload' && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
                dragOver ? 'border-blue-500 bg-blue-500/5' : 'border-border'
              }`}
            >
              {parsing ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                  <p className="text-foreground font-medium">Reading your bet summary...</p>
                  <p className="text-sm text-muted-foreground">
                    {fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDFs and screenshots may take a few seconds while we extract your bets.
                  </p>
                </div>
              ) : (
                <>
                  <FileText className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-foreground font-medium">Drag &amp; drop your file here</p>
                  <p className="text-sm text-muted-foreground mb-4">or</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium transition-colors"
                  >
                    Choose file
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPT}
                    onChange={onFileInput}
                    className="hidden"
                  />
                  <p className="text-xs text-muted-foreground mt-4 max-w-md">
                    Supported: CSV / Excel exports (parsed exactly), and PDF / image
                    statements (read with AI). You&apos;ll review everything before saving.
                  </p>
                </>
              )}
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              {parser === 'ai' && (
                <div className="flex items-start gap-2 rounded-lg bg-purple-500/10 border border-purple-500/30 px-3 py-2 text-sm text-foreground">
                  <Sparkles className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                  <span>
                    These bets were read by AI from your file. Please double-check the
                    details, especially odds, stakes, and dates, before importing.
                  </span>
                </div>
              )}

              {warnings.length > 0 && (
                <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-2 text-sm text-foreground">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <ul className="list-disc list-inside space-y-0.5">
                    {warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{selectedCount}</span> of{' '}
                  {rows.length} bets selected
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRows((prev) => prev.map((r) => ({ ...r, include: true })))}
                    className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/70 text-foreground"
                  >
                    Select all
                  </button>
                  <button
                    onClick={() => setRows((prev) => prev.map((r) => ({ ...r, include: false })))}
                    className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/70 text-foreground"
                  >
                    Clear all
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="p-2 w-8"></th>
                      <th className="p-2">Date</th>
                      <th className="p-2">Venue</th>
                      <th className="p-2 w-14">Race</th>
                      <th className="p-2">Selection</th>
                      <th className="p-2">Type</th>
                      <th className="p-2 w-20">Odds</th>
                      <th className="p-2 w-20">Stake</th>
                      <th className="p-2 w-24">P/L</th>
                      <th className="p-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => {
                      const valid = rowIsValid(r);
                      return (
                        <tr
                          key={r.rowIndex}
                          className={`border-t border-border ${r.include ? '' : 'opacity-50'} ${
                            !valid ? 'bg-red-500/5' : ''
                          }`}
                        >
                          <td className="p-2 align-top">
                            <input
                              type="checkbox"
                              checked={r.include}
                              onChange={(e) => updateRow(r.rowIndex, { include: e.target.checked })}
                              className="mt-1"
                            />
                          </td>
                          <td className="p-2 align-top">
                            <input
                              type="date"
                              value={r.bet_date || ''}
                              onChange={(e) => updateRow(r.rowIndex, { bet_date: e.target.value })}
                              className="w-32 bg-background border border-input rounded px-1.5 py-1 text-xs text-foreground"
                            />
                          </td>
                          <td className="p-2 align-top">
                            <input
                              type="text"
                              value={r.venue ?? ''}
                              placeholder="Venue"
                              onChange={(e) => updateRow(r.rowIndex, { venue: e.target.value || null })}
                              className="w-28 bg-background border border-input rounded px-1.5 py-1 text-xs text-foreground"
                              title={r.venue ? getTrackLabel(r.venue) : ''}
                            />
                          </td>
                          <td className="p-2 align-top">
                            <input
                              type="number"
                              min={1}
                              max={12}
                              value={r.race_number ?? ''}
                              onChange={(e) =>
                                updateRow(r.rowIndex, {
                                  race_number: e.target.value ? parseInt(e.target.value, 10) : null,
                                })
                              }
                              className="w-12 bg-background border border-input rounded px-1.5 py-1 text-xs text-foreground"
                            />
                          </td>
                          <td className="p-2 align-top">
                            <input
                              type="text"
                              value={r.horse_name ?? ''}
                              placeholder="Selection"
                              onChange={(e) => updateRow(r.rowIndex, { horse_name: e.target.value })}
                              className={`w-36 bg-background border rounded px-1.5 py-1 text-xs text-foreground ${
                                r.horse_name?.trim() ? 'border-input' : 'border-red-500'
                              }`}
                            />
                          </td>
                          <td className="p-2 align-top">
                            <select
                              value={r.bet_type}
                              onChange={(e) =>
                                updateRow(r.rowIndex, { bet_type: e.target.value as EditableRow['bet_type'] })
                              }
                              className="bg-background border border-input rounded px-1.5 py-1 text-xs text-foreground"
                            >
                              {BET_TYPES.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2 align-top">
                            <input
                              type="number"
                              step="0.01"
                              value={r.price ?? ''}
                              onChange={(e) =>
                                updateRow(r.rowIndex, { price: parseFloat(e.target.value) || 0 })
                              }
                              className={`w-16 bg-background border rounded px-1.5 py-1 text-xs text-foreground ${
                                Number(r.price) > 0 ? 'border-input' : 'border-red-500'
                              }`}
                            />
                          </td>
                          <td className="p-2 align-top">
                            <input
                              type="number"
                              step="0.01"
                              value={r.stake ?? ''}
                              onChange={(e) =>
                                updateRow(r.rowIndex, { stake: parseFloat(e.target.value) || 0 })
                              }
                              className={`w-16 bg-background border rounded px-1.5 py-1 text-xs text-foreground ${
                                Number(r.stake) > 0 ? 'border-input' : 'border-red-500'
                              }`}
                            />
                          </td>
                          <td className="p-2 align-top">
                            <input
                              type="number"
                              step="0.01"
                              value={r.profit_loss ?? ''}
                              placeholder="—"
                              onChange={(e) =>
                                updateRow(r.rowIndex, {
                                  profit_loss: e.target.value === '' ? null : parseFloat(e.target.value),
                                })
                              }
                              className="w-20 bg-background border border-input rounded px-1.5 py-1 text-xs text-foreground"
                            />
                          </td>
                          <td className="p-2 align-top">
                            <div className="flex flex-col gap-1">
                              <input
                                type="text"
                                value={r.notes ?? ''}
                                placeholder="Notes"
                                onChange={(e) => updateRow(r.rowIndex, { notes: e.target.value || null })}
                                className="w-40 bg-background border border-input rounded px-1.5 py-1 text-xs text-foreground"
                              />
                              {r.issues.length > 0 && (
                                <span
                                  className="text-[10px] text-amber-600 dark:text-amber-400"
                                  title={r.issues.join('\n')}
                                >
                                  {r.issues.length} note{r.issues.length === 1 ? '' : 's'} to review
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'preview' && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <button
              onClick={() => {
                setStep('upload');
                setRows([]);
                setWarnings([]);
              }}
              className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/70 text-foreground text-sm transition-colors"
            >
              Upload a different file
            </button>
            <button
              onClick={handleCommit}
              disabled={committing || selectedCount === 0}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg text-white text-sm font-medium transition-colors ${
                committing || selectedCount === 0
                  ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500'
              }`}
            >
              {committing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Import {selectedCount} bet{selectedCount === 1 ? '' : 's'}
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
