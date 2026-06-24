import type { BetInput } from '@/lib/api';

export type ImportFileType = 'csv' | 'xlsx' | 'pdf' | 'image' | 'unknown';
export type ImportParser = 'spreadsheet' | 'ai';

/**
 * A single bet extracted from an uploaded summary, plus metadata used by the
 * review UI so the user can verify/fix anything uncertain before committing.
 */
export interface ParsedBetRow extends BetInput {
  /** Stable index within the parse result (used as a React key). */
  rowIndex: number;
  /** Which parser produced this row. */
  source: ImportParser;
  /** 0-1 confidence in the extraction (heuristic for spreadsheets, model-reported for AI). */
  confidence: number;
  /** Human-readable warnings (e.g. "Unknown venue", "Bet type guessed"). */
  issues: string[];
  /** Raw source text/row for debugging and manual reconciliation. */
  rawText?: string;
}

export interface ImportResult {
  rows: ParsedBetRow[];
  fileType: ImportFileType;
  parser: ImportParser;
  /** File-level warnings not tied to a specific row. */
  warnings: string[];
}

/** Maximum upload size accepted by the import endpoint (10 MB). */
export const MAX_IMPORT_FILE_BYTES = 10 * 1024 * 1024;

/** Maximum number of bets we will parse/commit in a single import. */
export const MAX_IMPORT_ROWS = 500;
