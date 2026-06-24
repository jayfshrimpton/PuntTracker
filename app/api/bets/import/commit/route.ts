import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { withAuth } from '@/lib/api-auth';
import { getUserSubscription, checkUsageLimit, incrementUsage } from '@/lib/subscription-guard';
import { VALID_BET_TYPES } from '@/lib/bet-import/normalize';
import { MAX_IMPORT_ROWS } from '@/lib/bet-import/types';
import type { BetInput } from '@/lib/api';

export const dynamic = 'force-dynamic';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Pick only DB-backed columns and coerce types; reject invalid rows. */
function sanitize(raw: any): { bet: Record<string, unknown> | null; error: string | null } {
  const horse = typeof raw?.horse_name === 'string' ? raw.horse_name.trim() : '';
  if (!horse) return { bet: null, error: 'Missing horse/selection name' };

  const betType = typeof raw?.bet_type === 'string' ? raw.bet_type.trim() : '';
  if (!VALID_BET_TYPES.includes(betType as never)) {
    return { bet: null, error: `Invalid bet type "${betType}"` };
  }

  const price = Number(raw?.price);
  if (!isFinite(price) || price <= 0) return { bet: null, error: 'Invalid odds/price' };

  const stake = Number(raw?.stake);
  if (!isFinite(stake) || stake <= 0) return { bet: null, error: 'Invalid stake' };

  const betDate = typeof raw?.bet_date === 'string' ? raw.bet_date.trim() : '';
  if (!ISO_DATE.test(betDate)) return { bet: null, error: 'Invalid date (expected YYYY-MM-DD)' };

  const num = (v: unknown): number | null => {
    if (v === null || v === undefined || v === '') return null;
    const n = Number(v);
    return isFinite(n) ? n : null;
  };
  const int = (v: unknown): number | null => {
    const n = num(v);
    return n === null ? null : Math.round(n);
  };
  const str = (v: unknown): string | null => {
    if (typeof v !== 'string') return null;
    const t = v.trim();
    return t.length ? t : null;
  };

  const bet: Record<string, unknown> = {
    horse_name: horse,
    bet_type: betType,
    price,
    stake,
    bet_date: betDate,
    race_name: str(raw?.race_name),
    venue: str(raw?.venue),
    race_number: int(raw?.race_number),
    race_class: str(raw?.race_class),
    finishing_position: int(raw?.finishing_position),
    profit_loss: num(raw?.profit_loss),
    bookie: str(raw?.bookie),
    notes: str(raw?.notes),
    description: str(raw?.description),
    exotic_numbers: str(raw?.exotic_numbers),
    num_legs: int(raw?.num_legs),
    strategy_tags: Array.isArray(raw?.strategy_tags)
      ? raw.strategy_tags.filter((t: unknown) => typeof t === 'string' && t.trim()).map((t: string) => t.trim())
      : null,
    selections: raw?.selections && typeof raw.selections === 'object' ? raw.selections : null,
    best_starting_price: num(raw?.best_starting_price),
  };

  return { bet, error: null };
}

export const POST = withAuth(async (req: NextRequest, userId: string) => {
  try {
    const body = await req.json();
    const incoming: BetInput[] = Array.isArray(body?.bets) ? body.bets : [];

    if (incoming.length === 0) {
      return NextResponse.json(
        { error: 'Validation error', message: 'No bets provided', code: 'NO_BETS' },
        { status: 400 }
      );
    }

    if (incoming.length > MAX_IMPORT_ROWS) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: `You can import at most ${MAX_IMPORT_ROWS} bets at once.`,
          code: 'TOO_MANY_BETS',
        },
        { status: 400 }
      );
    }

    // Server-side re-validation (never trust the client/AI output).
    const valid: Record<string, unknown>[] = [];
    const invalid: { index: number; error: string }[] = [];
    incoming.forEach((raw, index) => {
      const { bet, error } = sanitize(raw);
      if (bet) valid.push(bet);
      else invalid.push({ index, error: error || 'Invalid row' });
    });

    if (valid.length === 0) {
      return NextResponse.json(
        {
          error: 'Validation error',
          message: 'None of the bets were valid.',
          code: 'ALL_INVALID',
          invalid,
        },
        { status: 400 }
      );
    }

    // Enforce free-tier monthly bet limit.
    const subscription = await getUserSubscription(userId);
    let betsToInsert = valid;
    let skippedForLimit = 0;

    if (subscription.tier === 'free') {
      const usage = await checkUsageLimit(userId, subscription, 'bet', 'month');
      if (usage.limit !== -1) {
        if (usage.remaining <= 0) {
          return NextResponse.json(
            {
              error: 'Monthly limit exceeded',
              message: `You've reached your monthly limit of ${usage.limit} bets. Upgrade to Pro or Elite for unlimited bets.`,
              currentTier: subscription.tier,
              requiredTier: 'pro' as const,
              upgradeUrl: '/pricing',
              code: 'LIMIT_EXCEEDED',
            },
            { status: 402 }
          );
        }
        if (valid.length > usage.remaining) {
          betsToInsert = valid.slice(0, usage.remaining);
          skippedForLimit = valid.length - usage.remaining;
        }
      }
    }

    const supabase = createClient();
    const { data: inserted, error: insertError } = await supabase
      .from('bets')
      .insert(betsToInsert.map((b) => ({ ...b, user_id: userId })))
      .select('id');

    if (insertError) {
      console.error('Bet import insert error:', insertError);
      return NextResponse.json(
        { error: 'Database error', message: 'Failed to import bets', code: 'DATABASE_ERROR' },
        { status: 500 }
      );
    }

    const insertedCount = inserted?.length ?? 0;

    if (subscription.tier === 'free' && insertedCount > 0) {
      await incrementUsage(userId, 'bet', 'month', insertedCount);
    }

    return NextResponse.json(
      {
        inserted: insertedCount,
        invalidCount: invalid.length,
        invalid,
        skippedForLimit,
        message: `Imported ${insertedCount} bet${insertedCount === 1 ? '' : 's'}.`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Bet import commit error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Failed to import bets',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
});
