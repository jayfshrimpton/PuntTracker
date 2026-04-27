import { createServiceClient } from '@/lib/supabase/service';
import type { Bet } from '@/lib/api';
import { fetchAllBetsForUserPaginated } from '@/lib/fetch-user-bets-paginated';
import { buildPublicSharePayload, type PublicSharePayload, type ShareVisibility } from '@/lib/share-payload';

export type ShareTokenFetchResult =
  | { ok: true; payload: PublicSharePayload }
  | { ok: false; reason: 'not_found' | 'not_configured' | 'error' };

export async function fetchPublicSharePayloadByToken(token: string): Promise<ShareTokenFetchResult> {
  if (!token || token.length > 200) {
    return { ok: false, reason: 'not_found' };
  }

  let service;
  try {
    service = createServiceClient();
  } catch {
    return { ok: false, reason: 'not_configured' };
  }

  const { data: link, error: linkError } = await service
    .from('shared_dashboard_links')
    .select('user_id, period, show_profit, show_strike_rate, show_roi, show_turnover, display_name')
    .eq('token', token)
    .maybeSingle();

  if (linkError || !link) {
    return { ok: false, reason: 'not_found' };
  }

  const { data: bets, error: betsError } = await fetchAllBetsForUserPaginated(
    service,
    link.user_id
  );

  if (betsError) {
    console.error(betsError);
    return { ok: false, reason: 'error' };
  }

  const visibility: ShareVisibility = {
    show_profit: !!link.show_profit,
    show_strike_rate: !!link.show_strike_rate,
    show_roi: !!link.show_roi,
    show_turnover: !!link.show_turnover,
  };

  const payload = buildPublicSharePayload(
    (bets || []) as Bet[],
    link.period,
    visibility,
    link.display_name
  );

  return { ok: true, payload };
}
