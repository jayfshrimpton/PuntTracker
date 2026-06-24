import { RACE_TRACKS } from '@/lib/racing-tracks';
import type { BetInput } from '@/lib/api';

export type BetType = BetInput['bet_type'];

export const VALID_BET_TYPES: BetType[] = [
  'win',
  'place',
  'lay',
  'each-way',
  'multi',
  'quinella',
  'exacta',
  'trifecta',
  'first-four',
  'other',
];

/**
 * Map a free-text bet type from a bookie export to the app's enum.
 * Returns the normalized value and whether it was a confident match.
 */
export function normalizeBetType(raw: string | null | undefined): {
  value: BetType;
  guessed: boolean;
} {
  const text = (raw || '').toLowerCase().trim();
  if (!text) return { value: 'win', guessed: true };

  // Direct enum match.
  const direct = VALID_BET_TYPES.find((t) => t === text);
  if (direct) return { value: direct, guessed: false };

  const has = (...needles: string[]) => needles.some((n) => text.includes(n));

  // Order matters: check the more specific exotics before win/place.
  if (has('first four', 'first-four', 'first 4', 'ff')) return { value: 'first-four', guessed: false };
  if (has('trifecta', 'tri')) return { value: 'trifecta', guessed: false };
  if (has('exacta')) return { value: 'exacta', guessed: false };
  if (has('quinella', 'quin')) return { value: 'quinella', guessed: false };
  if (has('each way', 'each-way', 'e/w', 'ew', 'win & place', 'win and place', 'win/place'))
    return { value: 'each-way', guessed: false };
  if (has('multi', 'parlay', 'accumulator', 'acca', 'same game', 'sgm', 'doubles', 'treble'))
    return { value: 'multi', guessed: false };
  if (has('lay')) return { value: 'lay', guessed: false };
  if (has('place', 'plc')) return { value: 'place', guessed: false };
  if (has('win', 'fixed', 'tote', 'sp', 'starting price', 'head to head', 'h2h'))
    return { value: 'win', guessed: false };

  return { value: 'other', guessed: true };
}

/** Lowercased label/value lookup table for venue matching, built once. */
const VENUE_LOOKUP = (() => {
  const map = new Map<string, string>();
  for (const t of RACE_TRACKS) {
    map.set(t.label.toLowerCase(), t.value);
    map.set(t.value.toLowerCase(), t.value);
    // Also index without common suffixes (e.g. "Rosehill Gardens" -> "rosehill").
    map.set(t.label.toLowerCase().replace(/\s+(gardens|park|racecourse|racing club)$/i, '').trim(), t.value);
  }
  return map;
})();

/**
 * Match a bookie venue string to a known track slug. Falls back to the cleaned
 * raw string (the app accepts custom venues) and flags it as unmatched.
 */
export function normalizeVenue(raw: string | null | undefined): {
  value: string | null;
  matched: boolean;
} {
  const text = (raw || '').trim();
  if (!text) return { value: null, matched: false };

  // Strip a leading race number / "R3" style prefix some bookies prepend.
  const cleaned = text.replace(/^\s*r?\d+\s*[-:.]?\s*/i, '').trim() || text;
  const key = cleaned.toLowerCase();

  const exact = VENUE_LOOKUP.get(key);
  if (exact) return { value: exact, matched: true };

  // Partial contains match (handles "Flemington (VIC)" etc.).
  for (const [label, value] of Array.from(VENUE_LOOKUP.entries())) {
    if (label.length >= 4 && key.includes(label)) {
      return { value, matched: true };
    }
  }

  return { value: cleaned, matched: false };
}

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

/**
 * Convert common AU date formats into YYYY-MM-DD. Returns null if unparseable.
 * Handles: dd/mm/yyyy, dd-mm-yyyy, yyyy-mm-dd, "05 Jun 2026", "5 June 26".
 */
export function normalizeDate(raw: string | null | undefined): string | null {
  if (raw === null || raw === undefined) return null;
  const text = String(raw).trim();
  if (!text) return null;

  // Already ISO (yyyy-mm-dd, optionally with time).
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  // dd/mm/yyyy or dd-mm-yyyy (AU day-first convention).
  const dmy = text.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if (dmy) {
    const day = parseInt(dmy[1], 10);
    const month = parseInt(dmy[2], 10);
    let year = parseInt(dmy[3], 10);
    if (year < 100) year += 2000;
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return toIso(year, month, day);
    }
  }

  // "05 Jun 2026" / "5 June 26" / "Jun 5 2026".
  const named = text.match(/(\d{1,2})\s+([a-z]{3,})\.?\s*,?\s*(\d{2,4})/i);
  if (named) {
    const day = parseInt(named[1], 10);
    const month = MONTHS[named[2].slice(0, 3).toLowerCase()];
    let year = parseInt(named[3], 10);
    if (year < 100) year += 2000;
    if (month) return toIso(year, month, day);
  }
  const namedFirst = text.match(/([a-z]{3,})\.?\s+(\d{1,2})\s*,?\s*(\d{2,4})/i);
  if (namedFirst) {
    const month = MONTHS[namedFirst[1].slice(0, 3).toLowerCase()];
    const day = parseInt(namedFirst[2], 10);
    let year = parseInt(namedFirst[3], 10);
    if (year < 100) year += 2000;
    if (month) return toIso(year, month, day);
  }

  // Last resort: let the JS Date parser try (handles Excel serial-derived strings).
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return toIso(parsed.getFullYear(), parsed.getMonth() + 1, parsed.getDate());
  }

  return null;
}

function toIso(year: number, month: number, day: number): string {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

/**
 * Parse a money/odds value that may contain $, commas, or surrounding text.
 * Negative amounts in parentheses (accounting style) are honoured.
 */
export function normalizeNumber(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number') return isFinite(raw) ? raw : null;

  let text = String(raw).trim();
  if (!text) return null;

  let sign = 1;
  if (/^\(.*\)$/.test(text)) {
    sign = -1;
    text = text.slice(1, -1);
  }
  text = text.replace(/[^0-9.\-]/g, '');
  if (!text || text === '-' || text === '.') return null;

  const value = parseFloat(text);
  if (isNaN(value)) return null;
  return sign * value;
}

/**
 * Work out profit/loss when the export only provides partial outcome info.
 * Priority: explicit P/L -> returns minus stake -> outcome keyword + stake.
 */
export function deriveProfitLoss(input: {
  profitLoss?: number | null;
  returns?: number | null;
  stake?: number | null;
  outcome?: string | null;
}): number | null {
  const { profitLoss, returns, stake, outcome } = input;

  if (profitLoss !== null && profitLoss !== undefined && !isNaN(profitLoss)) {
    return profitLoss;
  }

  if (
    returns !== null && returns !== undefined && !isNaN(returns) &&
    stake !== null && stake !== undefined && !isNaN(stake)
  ) {
    return Number((returns - stake).toFixed(2));
  }

  const result = (outcome || '').toLowerCase().trim();
  if (!result) return null;

  if (stake !== null && stake !== undefined && !isNaN(stake)) {
    if (/(lost|loss|lose|unsuccessful|no return)/.test(result)) {
      return -Math.abs(stake);
    }
    if (/(void|refund|cancel|push|abandon)/.test(result)) {
      return 0;
    }
  }

  return null;
}

/**
 * Validate and clamp a finishing position to a sane integer, or null.
 */
export function normalizeFinishingPosition(raw: string | number | null | undefined): number | null {
  const n = normalizeNumber(raw);
  if (n === null) return null;
  const int = Math.round(n);
  return int >= 1 && int <= 99 ? int : null;
}

/**
 * Validate and clamp a race number (1-12), or null.
 */
export function normalizeRaceNumber(raw: string | number | null | undefined): number | null {
  const n = normalizeNumber(raw);
  if (n === null) return null;
  const int = Math.round(n);
  return int >= 1 && int <= 12 ? int : null;
}
