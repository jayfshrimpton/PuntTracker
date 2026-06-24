import { GoogleGenerativeAI } from '@google/generative-ai';
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
  VALID_BET_TYPES,
} from './normalize';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/** Shape we ask Gemini to return for each bet. */
interface AiBet {
  bet_date?: string | null;
  venue?: string | null;
  race_number?: number | string | null;
  race_name?: string | null;
  horse_name?: string | null;
  bet_type?: string | null;
  price?: number | string | null;
  stake?: number | string | null;
  returns?: number | string | null;
  profit_loss?: number | string | null;
  outcome?: string | null;
  finishing_position?: number | string | null;
  bookie?: string | null;
  notes?: string | null;
  confidence?: number | null;
}

const PROMPT = `You are a data extraction engine for an Australian horse racing betting journal.
You will receive a bet history / account statement from an online bookmaker (e.g. TAB, Sportsbet, Ladbrokes, bet365, Neds). It may be a PDF, screenshot, or image.

Extract EVERY individual bet you can find. Ignore deposits, withdrawals, bonus credits, and summary/total rows.

Return ONLY a JSON object (no markdown, no commentary) with this exact shape:
{
  "bets": [
    {
      "bet_date": "string, the date the bet was placed/settled",
      "venue": "string, race track / meeting name, or null",
      "race_number": number or null,
      "race_name": "string or null",
      "horse_name": "string, the selection/runner name (REQUIRED)",
      "bet_type": "one of: win, place, lay, each-way, multi, quinella, exacta, trifecta, first-four, other",
      "price": number (decimal odds) or null,
      "stake": number (amount wagered) or null,
      "returns": number (total amount returned/collected, 0 if lost) or null,
      "profit_loss": number (net profit or loss; negative if lost) or null,
      "outcome": "string e.g. Won/Lost/Void or null",
      "finishing_position": number or null,
      "bookie": "string bookmaker name or null",
      "notes": "string, any extra detail or null",
      "confidence": number between 0 and 1 indicating how sure you are
    }
  ]
}

Rules:
- Use decimal odds for "price" (convert fractional/American if needed).
- Amounts are in dollars; strip currency symbols.
- If a value is not present, use null. Never invent data.
- For multi/parlay bets, set bet_type "multi" and put the legs in "notes".
- If you cannot read any bets, return {"bets": []}.`;

/**
 * Use Gemini multimodal to extract bets from a PDF or image, then normalize
 * each extracted bet through the shared normalizers.
 */
export async function parseWithAi(
  base64Data: string,
  mimeType: string,
  fileType: ImportFileType
): Promise<ImportResult> {
  if (!process.env.GEMINI_API_KEY) {
    return {
      rows: [],
      fileType,
      parser: 'ai',
      warnings: ['AI parsing is not configured. Please upload a CSV or Excel export instead.'],
    };
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  let text: string;
  try {
    const result = await model.generateContent([
      { text: PROMPT },
      { inlineData: { mimeType, data: base64Data } },
    ]);
    text = result.response.text();
  } catch (error) {
    console.error('AI import parse error:', error);
    return {
      rows: [],
      fileType,
      parser: 'ai',
      warnings: [
        'We could not read this file automatically. Try a CSV or Excel export from your bookie, or a clearer PDF/screenshot.',
      ],
    };
  }

  let aiBets: AiBet[] = [];
  try {
    const clean = text.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(clean);
    aiBets = Array.isArray(parsed?.bets) ? parsed.bets : [];
  } catch {
    return {
      rows: [],
      fileType,
      parser: 'ai',
      warnings: ['The AI response could not be understood. Please review and add these bets manually.'],
    };
  }

  const warnings: string[] = [];
  const rows: ParsedBetRow[] = [];
  let rowIndex = 0;

  for (const b of aiBets) {
    if (rows.length >= MAX_IMPORT_ROWS) {
      warnings.push(`Only the first ${MAX_IMPORT_ROWS} bets were imported.`);
      break;
    }

    const horse = (b.horse_name || '').toString().trim();
    if (!horse) continue;

    const issues: string[] = [];

    const date = normalizeDate(b.bet_date ?? null);
    if (!date) issues.push('Missing or unrecognised date');

    const rawBetType = (b.bet_type || '').toString().trim();
    const betTypeResult = normalizeBetType(rawBetType);
    if (rawBetType && !VALID_BET_TYPES.includes(rawBetType as never) && betTypeResult.guessed) {
      issues.push(`Bet type "${rawBetType}" mapped to "${betTypeResult.value}"`);
    }

    const venueResult = normalizeVenue(b.venue ?? null);
    if (b.venue && !venueResult.matched) {
      issues.push(`Venue "${b.venue}" not in track list (kept as custom)`);
    }

    const price = normalizeNumber(b.price ?? null);
    if (price === null || price <= 0) issues.push('Missing or invalid odds/price');

    const stake = normalizeNumber(b.stake ?? null);
    if (stake === null || stake <= 0) issues.push('Missing or invalid stake');

    const profitLoss = deriveProfitLoss({
      profitLoss: normalizeNumber(b.profit_loss ?? null),
      returns: normalizeNumber(b.returns ?? null),
      stake,
      outcome: b.outcome ?? null,
    });

    const modelConfidence =
      typeof b.confidence === 'number' && b.confidence >= 0 && b.confidence <= 1
        ? b.confidence
        : 0.7;
    const confidence = issues.length === 0
      ? modelConfidence
      : Math.max(0.3, modelConfidence - issues.length * 0.15);

    rows.push({
      rowIndex: rowIndex++,
      source: 'ai',
      confidence: Number(confidence.toFixed(2)),
      issues,
      rawText: JSON.stringify(b),
      bet_date: date || '',
      horse_name: horse,
      bet_type: betTypeResult.value,
      price: price ?? 0,
      stake: stake ?? 0,
      profit_loss: profitLoss,
      finishing_position: normalizeFinishingPosition(b.finishing_position ?? null),
      venue: venueResult.value,
      race_number: normalizeRaceNumber(b.race_number ?? null),
      race_name: (b.race_name || '').toString().trim() || null,
      race_class: null,
      bookie: (b.bookie || '').toString().trim() || null,
      notes: (b.notes || '').toString().trim() || null,
      selections: null,
      exotic_numbers: null,
      num_legs: null,
      description: null,
      strategy_tags: null,
      best_starting_price: null,
    });
  }

  if (rows.length === 0 && warnings.length === 0) {
    warnings.push('No bets were detected in this file. Please check it contains bet history.');
  }

  return { rows, fileType, parser: 'ai', warnings };
}
