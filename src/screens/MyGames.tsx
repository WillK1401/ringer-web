import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus } from 'lucide-react';
import { Spinner } from '../components/Spinner';
import { gamesApi } from '../lib/api';
import { formatDate, formatTime } from '../lib/utils';

const BG = '#F0EDE6';
const FG = '#1a1a1a';
const GREEN = '#042b2b';
const MUTED = '#666';

type Tab = 'upcoming' | 'hosting' | 'history';

function formatKickoff(iso: string): string {
  const d   = new Date(iso);
  const now = new Date();
  const tmr = new Date(now); tmr.setDate(now.getDate() + 1);
  if (d.toDateString() === now.toDateString()) return `Today · ${formatTime(iso)}`;
  if (d.toDateString() === tmr.toDateString()) return `Tomorrow · ${formatTime(iso)}`;
  return `${d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} · ${formatTime(iso)}`;
}

function GameRow({ game, role, onClick }: { game: any; role: 'organiser' | 'player'; onClick: () => void }) {
  const filled     = (game.confirmedCount ?? 0) + 1;
  const total      = game.playerCount ?? 10;
  const spotsLeft  = Math.max(0, total - filled);
  const isPast     = new Date(game.kickoffAt) < new Date();
  const priceGBP   = Math.round((game.costPerPlayer ?? 0) / 100);

  return (
    <button
      onClick={onClick}
      className="game-card w-full text-left"
      style={{ padding: '16px 0', display: 'block', background: 'none', border: 'none', cursor: 'pointer', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 16, color: isPast ? MUTED : FG, marginBottom: 4, letterSpacing: '-0.01em' }}>
            {game.venue}
          </div>
          <div style={{ fontFamily: 'Inter', fontSize: 13, color: MUTED, marginBottom: 10 }}>
            {formatKickoff(game.kickoffAt)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontFamily: 'Inter', fontSize: 12, fontWeight: 500,
              color: role === 'organiser' ? GREEN : MUTED,
              backgroundColor: role === 'organiser' ? 'rgba(4,43,43,0.08)' : 'rgba(0,0,0,0.05)',
              padding: '3px 10px', borderRadius: 999,
            }}>
              {role === 'organiser' ? 'Organising' : 'Playing'}
            </span>
            <span style={{ fontFamily: 'Inter', fontSize: 12, color: MUTED }}>
              {filled}/{total}
              {!isPast && spotsLeft <= 3 && spotsLeft > 0 && (
                <span style={{ color: '#c8102e', marginLeft: 4, fontWeight: 500 }}> · {spotsLeft} left</span>
              )}
            </span>
          </div>
        </div>
        <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 16, color: isPast ? MUTED : FG, flexShrink: 0 }}>
          £{priceGBP}
        </div>
      </div>
    </button>
  );
}

function EmptyTab({ tab, onPost }: { tab: Tab; onPost: () => void }) {
  const messages: Record<Tab, { heading: string; body: string; cta?: string }> = {
    upcoming: { heading: 'No upcoming games', body: 'Join a game from Discover or post one yourself.', cta: 'Post a game' },
    hosting:  { heading: 'No games yet', body: 'Post your first game — it only takes a minute.', cta: 'Post a game' },
    history:  { heading: 'No history yet', body: 'Games you play will appear here once completed.' },
  };
  const msg = messages[tab];
  return (
    <div style={{ padding: '60px 0 40px', textAlign: 'center' }}>
      <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 18, color: FG, marginBottom: 8 }}>{msg.heading}</div>
      <div style={{ fontFamily: 'Inter', fontSize: 14, color: MUTED, marginBottom: msg.cta ? 28 : 0, lineHeight: 1.6 }}>{msg.body}</div>
      {msg.cta && (
        <button
          onClick={onPost}
          className="btn-primary"
          style={{ backgroundColor: GREEN, color: BG, fontFamily: 'Inter', fontWeight: 600, fontSize: 14, padding: '13px 28px', borderRadius: 50, border: 'none', cursor: 'pointer' }}
        >
          {msg.cta}
        </button>
      )}
    </div>
  );
}

export function MyGames() {
  const navigate = useNavigate();
  const [tab,     setTab]     = useState<Tab>('upcoming');
  const [hosting, setHosting] = useState<any[]>([]);
  const [playing, setPlaying] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    gamesApi.getMyGames()
      .then(({ hosting: h, playing: p }) => { setHosting(h); setPlaying(p); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();

  const upcoming = [
    ...hosting.filter(g => new Date(g.kickoffAt) >= now).map(g => ({ ...g, role: 'organiser' as const })),
    ...playing.filter(g => new Date(g.kickoffAt) >= now).map(g => ({ ...g, role: 'player' as const })),
  ].sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime());

  const hostingUpcoming = hosting.filter(g => new Date(g.kickoffAt) >= now);

  const history = [
    ...hosting.filter(g => new Date(g.kickoffAt) < now).map(g => ({ ...g, role: 'organiser' as const })),
    ...playing.filter(g => new Date(g.kickoffAt) < now).map(g => ({ ...g, role: 'player' as const })),
  ].sort((a, b) => new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime());

  const tabGames: Record<Tab, { games: any[]; role?: 'organiser' | 'player' }> = {
    upcoming: { games: upcoming },
    hosting:  { games: hostingUpcoming, role: 'organiser' },
    history:  { games: history },
  };

  const current = tabGames[tab];

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: 'upcoming', label: 'Upcoming', count: upcoming.length || undefined },
    { key: 'hosting',  label: 'Hosting',  count: hostingUpcoming.length || undefined },
    { key: 'history',  label: 'History' },
  ];

  return (
    <div className="min-h-screen pb-[80px]" style={{ backgroundColor: BG }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ paddingTop: 40, paddingBottom: 28, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <h1 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 42, color: FG, lineHeight: 1.1, letterSpacing: '-0.03em', margin: 0 }}>
            Games
          </h1>
          <button
            onClick={() => navigate('/post')}
            className="flex items-center gap-2"
            style={{ backgroundColor: GREEN, color: BG, fontFamily: 'Inter', fontWeight: 600, fontSize: 14, padding: '10px 18px', borderRadius: 50, border: 'none', cursor: 'pointer', marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Plus size={16} strokeWidth={2} />
            Post a game
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 28, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
          {TABS.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                fontFamily: 'Inter',
                fontSize: 14,
                fontWeight: tab === key ? 600 : 400,
                color: tab === key ? GREEN : '#888',
                background: 'none',
                border: 'none',
                borderBottom: tab === key ? `2px solid ${GREEN}` : '2px solid transparent',
                padding: '0 0 14px',
                marginRight: 28,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: -1,
              }}
            >
              {label}
              {count !== undefined && (
                <span style={{
                  backgroundColor: tab === key ? GREEN : 'rgba(0,0,0,0.08)',
                  color: tab === key ? BG : '#666',
                  borderRadius: 999, fontSize: 11, fontWeight: 600,
                  padding: '1px 7px',
                }}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <Spinner />
        ) : current.games.length === 0 ? (
          <EmptyTab tab={tab} onPost={() => navigate('/post')} />
        ) : (
          <div>
            {current.games.map((g) => (
              <GameRow
                key={g.id}
                game={g}
                role={current.role ?? g.role}
                onClick={() => navigate(`/game/${g.id}`)}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
