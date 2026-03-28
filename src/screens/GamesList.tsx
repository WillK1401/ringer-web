import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { AvatarStack } from '../components/AvatarStack';
import { Spinner } from '../components/Spinner';
import { gamesApi } from '../lib/api';
import { formatTime } from '../lib/utils';

type DayFilter = 'all' | 'today' | 'week';
type TierFilter = 'all' | 'first' | 'second' | 'public';

const DAY_OPTS: { value: DayFilter; label: string }[] = [
  { value: 'all', label: 'All dates' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This week' },
];

const TIER_OPTS: { value: TierFilter; label: string }[] = [
  { value: 'all', label: 'All connections' },
  { value: 'first', label: '1st only' },
  { value: 'second', label: '2nd only' },
  { value: 'public', label: 'Public' },
];

function formatKickoff(dateVal: string | Date): string {
  const d = new Date(dateVal);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (d.toDateString() === now.toDateString()) return `Today · ${formatTime(dateVal)}`;
  if (d.toDateString() === tomorrow.toDateString()) return `Tomorrow · ${formatTime(dateVal)}`;
  return `${d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} · ${formatTime(dateVal)}`;
}

export function GamesList() {
  const navigate = useNavigate();
  const [dayFilter, setDayFilter] = useState<DayFilter>('all');
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [allGames, setAllGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    gamesApi
      .getFeed({ day: dayFilter })
      .then(setAllGames)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [dayFilter]);

  const games =
    tierFilter === 'all'
      ? allGames
      : allGames.filter((g) => {
          if (tierFilter === 'first') return g.accessTier === 'first' || g.accessTier === 'organiser';
          if (tierFilter === 'second') return g.accessTier === 'second';
          if (tierFilter === 'public') return g.accessTier === 'public';
          return true;
        });

  return (
    <div className="min-h-screen pb-[80px]" style={{ backgroundColor: '#F0EDE6' }}>
        {/* Header */}
        <div className="px-6 pt-6 pb-6 flex items-center justify-between">
          <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 22, color: '#042b2b', letterSpacing: '-0.01em' }}>
            ringer.
          </div>
        </div>

        {/* Title */}
        <div className="px-6 pb-6">
          <h1 style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 32, color: '#1a1a1a', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Nearby Games
          </h1>
        </div>

        {/* Filters */}
        <div className="px-6 pb-6 flex gap-2">
          <div style={{ position: 'relative', flex: 1 }}>
            <select
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value as DayFilter)}
              style={{
                width: '100%', appearance: 'none', WebkitAppearance: 'none',
                padding: '9px 28px 9px 12px', borderRadius: 10,
                border: '1px solid rgba(0,0,0,0.08)',
                backgroundColor: 'rgba(0,0,0,0.03)',
                fontFamily: 'Inter', fontSize: 13, fontWeight: 400, color: '#666',
              }}
            >
              {DAY_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#999', fontSize: 10 }}>▾</div>
          </div>
          <div style={{ position: 'relative', flex: 1 }}>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value as TierFilter)}
              style={{
                width: '100%', appearance: 'none', WebkitAppearance: 'none',
                padding: '9px 28px 9px 12px', borderRadius: 10,
                border: '1px solid rgba(0,0,0,0.08)',
                backgroundColor: 'rgba(0,0,0,0.03)',
                fontFamily: 'Inter', fontSize: 13, fontWeight: 400, color: '#666',
              }}
            >
              {TIER_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <div style={{ position: 'absolute', right: 9, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#999', fontSize: 10 }}>▾</div>
          </div>
        </div>

        {loading && <Spinner />}

        {error && (
          <div className="px-6 py-4 text-center">
            <div style={{ fontFamily: 'Inter', fontSize: 14, color: '#999' }}>Could not load games.</div>
          </div>
        )}

        {!loading && !error && games.length === 0 && (
          <div className="px-6 py-8 text-center">
            <div style={{ fontFamily: 'Inter', fontSize: 14, color: '#999', marginBottom: 20 }}>
              No games nearby right now.
            </div>
            <button
              onClick={() => navigate('/post')}
              className="px-6 py-3 rounded-full"
              style={{ backgroundColor: '#042b2b', color: '#F0EDE6', fontFamily: 'Inter', fontSize: 14, fontWeight: 500 }}
            >
              Post one →
            </button>
          </div>
        )}

        {!loading && games.length > 0 && (
          <div>
            {games.map((game: any, i: number) => {
              const filled = (game.confirmedPlayers?.length ?? 0) + 1;
              const total = game.playerCount ?? 10;
              const priceGBP = Math.round((game.costPerPlayer ?? 0) / 100);
              const initials = (game.confirmedPlayers || []).map((p: any) =>
                p.displayName?.slice(0, 2).toUpperCase() ?? '??'
              );

              return (
                <button
                  key={game.id}
                  onClick={() => navigate(`/game/${game.id}`)}
                  className="w-full px-6 text-left"
                >
                  <div
                    className="pb-6"
                    style={{ borderBottom: i < games.length - 1 ? '1px solid rgba(0,0,0,0.08)' : 'none', paddingTop: i === 0 ? 0 : 20 }}
                  >
                    <div style={{ marginBottom: 4 }}>
                      <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 20, color: '#1a1a1a', lineHeight: 1.3, letterSpacing: '-0.01em', marginBottom: 6 }}>
                        {game.venue}
                      </div>
                      <div style={{ fontFamily: 'Inter', fontSize: 14, color: '#999', fontWeight: 400 }}>
                        {formatKickoff(game.kickoffAt)}{game.area ? ` · ${game.area}` : ''}
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3">
                        <AvatarStack initials={initials} max={3} size={28} />
                        <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#666', fontWeight: 400 }}>
                          {filled}/{total}
                        </div>
                      </div>
                      <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 18, color: '#1a1a1a' }}>
                        £{priceGBP}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

      <BottomNav />
    </div>
  );
}
