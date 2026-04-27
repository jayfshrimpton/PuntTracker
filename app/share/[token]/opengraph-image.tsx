import { ImageResponse } from 'next/og';
import { fetchPublicSharePayloadByToken } from '@/lib/share-by-token';

export const runtime = 'nodejs';
export const alt = 'Shared punting stats';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function formatMoney(n: number): string {
  const sign = n >= 0 ? '+' : '';
  return `${sign}$${Math.round(Math.abs(n)).toLocaleString('en-AU')}`;
}

export default async function Image({ params }: { params: { token: string } }) {
  const result = await fetchPublicSharePayloadByToken(params.token);

  if (!result.ok) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
          }}
        >
          <p style={{ color: '#94a3b8', fontSize: 28, marginBottom: 12 }}>Punter&apos;s Journal</p>
          <p style={{ color: '#e2e8f0', fontSize: 36, fontWeight: 600 }}>Shared stats</p>
          <p style={{ color: '#64748b', fontSize: 22, marginTop: 16 }}>This link is unavailable.</p>
        </div>
      ),
      { ...size }
    );
  }

  const { payload: p } = result;
  const name = p.displayName || 'Punter';
  const stats = p.stats;

  const tiles: { label: string; value: string; tone: 'pos' | 'neg' | 'neutral' }[] = [];
  if (stats.totalProfit != null) {
    tiles.push({
      label: 'P/L',
      value: formatMoney(stats.totalProfit),
      tone: stats.totalProfit >= 0 ? 'pos' : 'neg',
    });
  }
  if (stats.strikeRate != null) {
    tiles.push({
      label: 'Strike rate',
      value: `${stats.strikeRate.toFixed(1)}%`,
      tone: 'neutral',
    });
  }
  if (stats.roi != null) {
    tiles.push({
      label: 'ROI',
      value: `${stats.roi >= 0 ? '+' : ''}${stats.roi.toFixed(1)}%`,
      tone: stats.roi >= 0 ? 'pos' : 'neg',
    });
  }
  if (stats.totalStake != null) {
    tiles.push({
      label: 'Turnover',
      value: `$${Math.round(stats.totalStake).toLocaleString('en-AU')}`,
      tone: 'neutral',
    });
  }

  const valueColor = (tone: 'pos' | 'neg' | 'neutral') => {
    if (tone === 'pos') return '#34d399';
    if (tone === 'neg') return '#fb7185';
    return '#f1f5f9';
  };

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: 56,
          background: 'linear-gradient(145deg, #0f172a 0%, #1e293b 45%, #0c4a6e 100%)',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <p style={{ color: '#64748b', fontSize: 22, letterSpacing: 4, textTransform: 'uppercase', margin: 0 }}>
              Shared punting stats
            </p>
            <p style={{ color: '#f8fafc', fontSize: 56, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>{name}</p>
            <p style={{ color: '#94a3b8', fontSize: 26, margin: 0 }}>{p.periodLabel}</p>
          </div>
          <p style={{ color: '#475569', fontSize: 20, margin: 0 }}>puntersjournal.com.au</p>
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 20,
            marginTop: 48,
            flex: 1,
            alignContent: 'flex-start',
          }}
        >
          {tiles.map((t) => (
            <div
              key={t.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                padding: '28px 36px',
                borderRadius: 20,
                background: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(148, 163, 184, 0.25)',
                minWidth: 240,
              }}
            >
              <p style={{ color: '#94a3b8', fontSize: 20, margin: 0, marginBottom: 8 }}>{t.label}</p>
              <p style={{ color: valueColor(t.tone), fontSize: 40, fontWeight: 700, margin: 0 }}>{t.value}</p>
            </div>
          ))}
        </div>

        <p style={{ color: '#64748b', fontSize: 22, margin: 0, marginTop: 'auto' }}>
          {p.totalBets} bet{p.totalBets === 1 ? '' : 's'} in period · Punter&apos;s Journal
        </p>
      </div>
    ),
    { ...size }
  );
}
