export function round2(value: number): number {
  return Math.round((Number.isFinite(value) ? value : 0) * 100) / 100;
}

export function calculateWinPL(
  stake: number,
  odds: number,
  position: number | null | undefined
): number | null {
  if (!isValidMoney(stake) || !isValidOdds(odds) || !isValidPosition(position)) return null;
  return round2(position === 1 ? stake * (odds - 1) : -stake);
}

export function calculatePlacePL(
  stake: number,
  odds: number,
  position: number | null | undefined,
  paidPlaces: number = 3
): number | null {
  if (!isValidMoney(stake) || !isValidOdds(odds) || !isValidPosition(position)) return null;
  return round2(position! >= 1 && position! <= paidPlaces ? stake * (odds - 1) : -stake);
}

// placeTerms example: "1/4 odds, 3 places". If not parsable, default to quarter odds and 3 places.
export function calculateEachWayPL(
  stake: number,
  winOdds: number,
  placeTerms: string,
  position: number | null | undefined
): number | null {
  if (!isValidMoney(stake) || !isValidOdds(winOdds) || !isValidPosition(position)) return null;
  const { fraction, places } = parsePlaceTerms(placeTerms);
  const winStake = stake / 2;
  const placeStake = stake / 2;
  const placeOdds = 1 + (winOdds - 1) * fraction; // fractional place odds applied to the win overround
  const winPL = position === 1 ? winStake * (winOdds - 1) : -winStake;
  const placePL = position! >= 1 && position! <= places ? placeStake * (placeOdds - 1) : -placeStake;
  return round2(winPL + placePL);
}

export function calculateLayPL(
  stake: number,
  odds: number,
  position: number | null | undefined
): number | null {
  if (!isValidMoney(stake) || !isValidOdds(odds) || !isValidPosition(position)) return null;
  // If selection wins, we lose liability; otherwise we win stake
  return round2(position === 1 ? -(stake * (odds - 1)) : stake);
}

export function calculateMultiPL(
  stake: number,
  combinedOdds: number,
  allLegsWon: boolean
): number | null {
  if (!isValidMoney(stake) || !isValidOdds(combinedOdds)) return null;
  return round2(allLegsWon ? stake * (combinedOdds - 1) : -stake);
}

// dividend is the posted payout per $1 unit. flexiPercent is 0-100 (default 100)
export function calculateExoticPL(
  totalStake: number,
  dividend: number | string | null,
  flexiPercent: number = 100
): number | null {
  if (!isValidMoney(totalStake)) return null;
  if (!isFiniteNumber(flexiPercent) || flexiPercent <= 0) flexiPercent = 100;
  const parsedDividend = parseDividend(dividend);
  if (parsedDividend === null) return round2(-totalStake);
  // Payout equals dividend * (flexi proportion of $1 unit). A 100% flexi corresponds to 1.0 of the unit.
  const unitProportion = Math.max(0, Math.min(100, flexiPercent)) / 100;
  const returnAmount = parsedDividend * unitProportion;
  return round2(returnAmount - totalStake);
}

export function calculateOtherPL(
  stake: number,
  payout: number | null | undefined,
  won: boolean
): number | null {
  if (!isValidMoney(stake)) return null;
  if (!won) return round2(-stake);
  if (!isFiniteNumber(payout)) return null;
  return round2((payout as number) - stake);
}

function isValidMoney(v: unknown): v is number {
  return typeof v === 'number' && isFinite(v) && v >= 0;
}

function isValidOdds(v: unknown): v is number {
  return typeof v === 'number' && isFinite(v) && v >= 1;
}

function isValidPosition(v: unknown): v is number | null | undefined {
  return v === null || v === undefined || (typeof v === 'number' && v >= 1 && Number.isInteger(v));
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && isFinite(v);
}

function parsePlaceTerms(terms: string): { fraction: number; places: number } {
  const defaultTerms = { fraction: 0.25, places: 3 };
  if (!terms || typeof terms !== 'string') return defaultTerms;
  // Try to extract something like "1/4" and a number of places
  const fracMatch = terms.match(/(\d+)\s*\/\s*(\d+)/);
  const placesMatch = terms.match(/(\d+)\s*places?/i);
  let fraction = defaultTerms.fraction;
  let places = defaultTerms.places;
  if (fracMatch) {
    const num = Number(fracMatch[1]);
    const den = Number(fracMatch[2]);
    if (num > 0 && den > 0) fraction = num / den;
  }
  if (placesMatch) {
    const p = Number(placesMatch[1]);
    if (p >= 1 && p <= 6) places = p;
  }
  return { fraction, places };
}

function parseDividend(dividend: number | string | null): number | null {
  if (dividend === null || dividend === undefined) return null;
  if (typeof dividend === 'number' && isFinite(dividend)) return dividend;
  if (typeof dividend === 'string') {
    // Accept formats like "$5.60", "5.60", "5", "5.6"
    const cleaned = dividend.replace(/[^0-9.]/g, '');
    const parsed = Number(cleaned);
    return isFinite(parsed) ? parsed : null;
  }
  return null;
}











