import * as XLSX from 'xlsx';
import type { ImportResult, ParsedBetRow, ImportFileType } from './types';
import { MAX_IMPORT_ROWS } from './types';
import {
  normalizeBetType,
  normalizeVenue,
  normalizeDate,
  normalizeNumber,
  normalizeFinishingPosition,
  normalizeRaceNumber,
  deriveProfitLoss,
} from './normalize';

/** Canonical fields we try to locate within a bookie spreadsheet. */
type Field =
  | 'date'
  | 'venue'
  | 'race'
  | 'horse'
  | 'betType'
  | 'price'
  | 'stake'
  | 'returns'
  | 'profitLoss'
  | 'outcome'
  | 'position'
  | 'bookie'
  | 'notes';

/** Header synonyms per field, matched case-insensitively as substrings. */
const FIELD_SYNONYMS: Record<Field, string[]> = {
  date: ['date', 'placed', 'settled', 'event date', 'transaction', 'day'],
  venue: ['track', 'venue', 'course', 'meeting', 'location'],
  race: ['race no', 'race number', 'race #', 'race'],
  horse: ['selection', 'runner', 'horse', 'pick', 'event/market', 'market', 'name', 'details'],
  betType: ['bet type', 'type', 'product', 'market type', 'bet'],
  price: ['decimal odds', 'odds', 'price'],
  stake: ['stake', 'bet amount', 'wager', 'risk', 'outlay', 'amount', 'unit'],
  returns: ['returns', 'return', 'payout', 'collect', 'winnings', 'paid', 'dividend'],
  profitLoss: ['profit/loss', 'profit', 'p/l', 'p&l', 'pnl', 'net', 'result amount'],
  outcome: ['result', 'status', 'outcome', 'won/lost'],
  position: ['finishing', 'finish', 'position', 'placing'],
  bookie: ['bookmaker', 'bookie', 'operator', 'agency'],
  notes: ['notes', 'comment', 'description'],
};

/**
 * Score how well a row of cells works as a header by counting recognised columns.
 */
function scoreHeaderRow(cells: string[]): number {
  let score = 0;
  const used = new Set<Field>();
  for (const cell of cells) {
    const text = (cell || '').toString().toLowerCase().trim();
    if (!text) continue;
    for (const field of Object.keys(FIELD_SYNONYMS) as Field[]) {
      if (used.has(field)) continue;
      if (FIELD_SYNONYMS[field].some((syn) => text.includes(syn))) {
        score += 1;
        used.add(field);
        break;
      }
    }
  }
  return score;
}

/**
 * Build a map from canonical field -> column index using header text.
 * Each column is assigned to at most one field (first/best match wins).
 */
function mapColumns(header: string[]): Partial<Record<Field, number>> {
  const map: Partial<Record<Field, number>> = {};
  const takenCols = new Set<number>();

  // Assign in priority order so e.g. "bet type" wins over generic "bet".
  const order: Field[] = [
    'date', 'venue', 'race', 'betType', 'price', 'stake', 'returns',
    'profitLoss', 'outcome', 'position', 'bookie', 'horse', 'notes',
  ];

  for (const field of order) {
    for (let col = 0; col < header.length; col++) {
      if (takenCols.has(col)) continue;
      const text = (header[col] || '').toString().toLowerCase().trim();
      if (!text) continue;
      if (FIELD_SYNONYMS[field].some((syn) => text.includes(syn))) {
        map[field] = col;
        takenCols.add(col);
        break;
      }
    }
  }
  return map;
}

/**
 * Parse a CSV/XLSX/XLS bet export into structured rows.
 * Deterministic: relies on header detection + per-cell normalization.
 */
export function parseSpreadsheet(data: ArrayBuffer, fileType: ImportFileType): ImportResult {
  const warnings: string[] = [];
  const rows: ParsedBetRow[] = [];

  const workbook = XLSX.read(data, { type: 'array', cellDates: false });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { rows, fileType, parser: 'spreadsheet', warnings: ['No sheets found in file'] };
  }

  const sheet = workbook.Sheets[sheetName];
  const matrix = XLSX.utils.sheet_to_json<string[]>(sheet, {
    header: 1,
    raw: false,
    defval: '',
    blankrows: false,
  });

  if (matrix.length < 2) {
    return { rows, fileType, parser: 'spreadsheet', warnings: ['File has no data rows'] };
  }

  // Locate the header row within the first several rows (bookies often add a title/preamble).
  let headerIdx = 0;
  let bestScore = -1;
  const searchLimit = Math.min(matrix.length, 10);
  for (let i = 0; i < searchLimit; i++) {
    const score = scoreHeaderRow(matrix[i]);
    if (score > bestScore) {
      bestScore = score;
      headerIdx = i;
    }
  }

  if (bestScore < 2) {
    warnings.push(
      'Could not confidently detect column headers. Please review every row carefully.'
    );
  }

  const header = matrix[headerIdx].map((c) => (c || '').toString());
  const cols = mapColumns(header);

  const get = (rowCells: string[], field: Field): string => {
    const idx = cols[field];
    if (idx === undefined) return '';
    return (rowCells[idx] ?? '').toString().trim();
  };

  let rowIndex = 0;
  for (let i = headerIdx + 1; i < matrix.length; i++) {
    if (rows.length >= MAX_IMPORT_ROWS) {
      warnings.push(`Only the first ${MAX_IMPORT_ROWS} rows were imported.`);
      break;
    }

    const cells = matrix[i];
    if (!cells || cells.every((c) => !((c ?? '').toString().trim()))) continue;

    const issues: string[] = [];

    const horseRaw = get(cells, 'horse');
    if (!horseRaw) {
      // Rows without any selection are almost certainly summary/footer rows.
      continue;
    }

    const date = normalizeDate(get(cells, 'date'));
    if (!date) issues.push('Missing or unrecognised date');

    const betTypeResult = normalizeBetType(get(cells, 'betType'));
    if (betTypeResult.guessed && get(cells, 'betType')) {
      issues.push(`Bet type "${get(cells, 'betType')}" mapped to "${betTypeResult.value}"`);
    } else if (!get(cells, 'betType')) {
      issues.push('Bet type not provided; defaulted to win');
    }

    const venueResult = normalizeVenue(get(cells, 'venue'));
    if (get(cells, 'venue') && !venueResult.matched) {
      issues.push(`Venue "${get(cells, 'venue')}" not in track list (kept as custom)`);
    }

    const price = normalizeNumber(get(cells, 'price'));
    if (price === null || price <= 0) issues.push('Missing or invalid odds/price');

    const stake = normalizeNumber(get(cells, 'stake'));
    if (stake === null || stake <= 0) issues.push('Missing or invalid stake');

    const returns = normalizeNumber(get(cells, 'returns'));
    const explicitPL = normalizeNumber(get(cells, 'profitLoss'));
    const profitLoss = deriveProfitLoss({
      profitLoss: explicitPL,
      returns,
      stake,
      outcome: get(cells, 'outcome'),
    });

    const bookieRaw = get(cells, 'bookie');
    const notesRaw = get(cells, 'notes');

    const row: ParsedBetRow = {
      rowIndex: rowIndex++,
      source: 'spreadsheet',
      confidence: issues.length === 0 ? 0.95 : Math.max(0.4, 0.9 - issues.length * 0.15),
      issues,
      rawText: cells.join(' | '),
      bet_date: date || '',
      horse_name: horseRaw,
      bet_type: betTypeResult.value,
      price: price ?? 0,
      stake: stake ?? 0,
      profit_loss: profitLoss,
      finishing_position: normalizeFinishingPosition(get(cells, 'position')),
      venue: venueResult.value,
      race_number: normalizeRaceNumber(get(cells, 'race')),
      race_name: null,
      race_class: null,
      bookie: bookieRaw || null,
      notes: notesRaw || null,
      selections: null,
      exotic_numbers: null,
      num_legs: null,
      description: null,
      strategy_tags: null,
      best_starting_price: null,
    };

    rows.push(row);
  }

  if (rows.length === 0 && warnings.length === 0) {
    warnings.push('No bet rows could be extracted from this file.');
  }

  return { rows, fileType, parser: 'spreadsheet', warnings };
}
