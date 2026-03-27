/**
 * Maps Stripe Price IDs to app tiers. Include every live/test price used in checkout.
 * Optional env (comma-separated): STRIPE_PRICE_ID_PRO, STRIPE_PRICE_ID_ELITE
 */
const DEFAULT_PRO_PRICE_IDS = [
  'price_1SZP2o4kQE4g2R11vjO4bw5Q', // pricing page (live-style)
  'price_1SZVqG7Uv9v0RZydSebiiCsw', // legacy / alternate
];

const DEFAULT_ELITE_PRICE_IDS = [
  'price_1SZP4P4kQE4g2R11ziTF4DFX', // pricing page
  'price_1SZVQM7Uv9v0RZydzVRWIcPs', // legacy / alternate
];

function parseEnvPriceIds(env: string | undefined): string[] {
  if (!env?.trim()) return [];
  return env.split(',').map((s) => s.trim()).filter(Boolean);
}

function buildPriceSet(defaults: string[], envKey: 'STRIPE_PRICE_ID_PRO' | 'STRIPE_PRICE_ID_ELITE'): Set<string> {
  const env =
    envKey === 'STRIPE_PRICE_ID_PRO'
      ? process.env.STRIPE_PRICE_ID_PRO
      : process.env.STRIPE_PRICE_ID_ELITE;
  return new Set([...defaults, ...parseEnvPriceIds(env)]);
}

let proIds: Set<string> | null = null;
let eliteIds: Set<string> | null = null;

export function getProPriceIds(): Set<string> {
  if (!proIds) proIds = buildPriceSet(DEFAULT_PRO_PRICE_IDS, 'STRIPE_PRICE_ID_PRO');
  return proIds;
}

export function getElitePriceIds(): Set<string> {
  if (!eliteIds) eliteIds = buildPriceSet(DEFAULT_ELITE_PRICE_IDS, 'STRIPE_PRICE_ID_ELITE');
  return eliteIds;
}

export function priceIdToTier(
  priceId: string | null | undefined
): 'pro' | 'elite' | null {
  if (!priceId) return null;
  if (getElitePriceIds().has(priceId)) return 'elite';
  if (getProPriceIds().has(priceId)) return 'pro';
  return null;
}

export type AppSubscriptionTier = 'free' | 'pro' | 'elite';

/**
 * Derive the app tier row from Stripe subscription state and the subscribed price.
 */
export function appTierFromStripeSubscription(
  subscription: { status: string; items: { data: Array<{ price?: { id?: string } | string }> } }
): AppSubscriptionTier {
  const status = subscription.status;

  if (status === 'canceled' || status === 'incomplete_expired') {
    return 'free';
  }

  if (status === 'incomplete') {
    return 'free';
  }

  const rawPrice = subscription.items.data[0]?.price;
  const priceId =
    typeof rawPrice === 'string' ? rawPrice : rawPrice?.id ?? null;

  const tier = priceIdToTier(priceId);
  if (tier) return tier;

  if (['active', 'trialing', 'past_due', 'unpaid', 'paused'].includes(status)) {
    console.warn(
      `[stripe] Unknown price_id "${priceId}" for subscription (status=${status}). Add it to lib/stripe/price-tier.ts or STRIPE_PRICE_ID_PRO / STRIPE_PRICE_ID_ELITE.`
    );
  }

  return 'free';
}
