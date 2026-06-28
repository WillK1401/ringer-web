import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { AvatarStack } from '../components/AvatarStack';
import { Spinner } from '../components/Spinner';
import { gamesApi } from '../lib/api';
import { formatTime } from '../lib/utils';

type DayFilter  = 'all' | 'today' | 'week';
type TierFilter = 'all' | 'first' | 'second' | 'public';

const DAY_OPTS: { value: DayFilter; label: string }[] = [
  { value: 'all',   label: 'All dates'  },
  { value: 'today', label: 'Today'      },
  { value: 'week',  label: 'This week'  },
];

const TIER_OPTS: { value: TierFilter; label: string }[] = [
  { value: 'all',    label: 'All connections'    },
  { value: 'first',  label: 'Friends only'       },
  { value: 'second', label: 'Friends of friends' },
  { value: 'public', label: 'Public'             },
];

function formatKickoff(dateVal: string | Date): string {
  const d    = new Date(dateVal);
  const now  = new Date();
  const tmrw = new Date(now);
  tmrw.setDate(now.getDate() + 1);
  if (d.toDateString() === now.toDateString())  return `Today · ${formatTime(dateVal)}`;
  if (d.toDateString() === tmrw.toDateString()) return `Tomorrow · ${formatTime(dateVal)}`;
  return `${d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} · ${formatTime(dateVal)}`;
}

function EmptyState({ onPost }: { onPost: () => void }) {
  return (
    <div
      className="px-6 py-16 flex flex-col items-center text-center"
      role="status"
      aria-label="No games available"
    >
      <div style={{ fontSize: 48, marginBottom: 20, lineHeight: 1 }} aria-hidden="true">⚽</div>
      <h2 style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 22, color: '#1a1a1a', marginBottom: 10, letterSpacing: '-0.02em' }}>
        No games nearby yet
      </h2>
      <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#666', lineHeight: 1.6, maxWidth: 280, marginBottom: 32, fontWeight: 400 }}>
        Be the first player to organise a game in your area. It only takes a minute.
      </p>
      <button
        onClick={onPost}
        className="btn-primary"
        style={{
          backgroundColor: '#042b2b',
          color: '#F0EDE6',
          fontFamily: 'Inter',
          fontWeight: 600,
          fontSize: 15,
          padding: '14px 32px',
          borderRadius: 50,
          border: 'none',
          cursor: 'pointer',
          minHeight: 52,
        }}
      >
        Post a Game
      </button>
    </div>
  );
}

export function GamesList() {
  const navigate = useNavigate();
  const [dayFilter,  setDayFilter]  = useState<DayFilter>('all');
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [allGames,   setAllGames]   = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    gamesApi
      .getFeed({ day: dayFilter })
      .then(setAllGames)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [dayFilter]);

  const games = tierFilter === 'all'
    ? allGames
    : allGames.filter((g) => {
        if (tierFilter === 'first')  return g.accessTier === 'first' || g.accessTier === 'organiser';
        if (tierFilter === 'second') return g.accessTier === 'second';
        if (tierFilter === 'public') return g.accessTier === 'public';
        return true;
      });

  return (
    <div className="min-h-screen pb-[80px]" style={{ backgroundColor: '#F0EDE6' }}>

      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 22, color: '#042b2b', letterSpacing: '-0.01em' }}>
          ringer.
        </div>
      </div>

      {/* Title */}
      <div className="px-6 pb-8">
        <h1 style={{
          fontFamily: 'Inter',
          fontWeight: 700,
          fontSize: 42,
          color: '#1a1a1a',
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
        }}>
          Nearby<br />Games
        </h1>
      </div>

      {/* Filters */}
      <div className="px-6 pb-8 flex gap-3" role="group" aria-label="Filter games">
        <div style={{ position: 'relative', flex: 1 }}>
          <label htmlFor="filter-day" className="sr-only">Filter by date</label>
          <select
            id="filter-day"
            value={dayFilter}
            onChange={(e) => setDayFilter(e.target.value as DayFilter)}
            className="filter-select"
            style={{
              width: '100%',
              appearance: 'none',
              WebkitAppearance: 'none',
              padding: '10px 32px 10px 14px',
              borderRadius: 12,
              border: '1px solid rgba(0,0,0,0.08)',
              backgroundColor: 'rgba(0,0,0,0.03)',
              fontFamily: 'Inter',
              fontSize: 14,
              fontWeight: 400,
              color: '#2a2a2a',
            }}
          >
            {DAY_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#666', fontSize: 10 }} aria-hidden="true">▾</div>
        </div>

        <div style={{ position: 'relative', flex: 1 }}>
          <label htmlFor="filter-tier" className="sr-only">Filter by connections</label>
          <select
            id="filter-tier"
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as TierFilter)}
            className="filter-select"
            style={{
              width: '100%',
              appearance: 'none',
              WebkitAppearance: 'none',
              padding: '10px 32px 10px 14px',
              borderRadius: 12,
              border: '1px solid rgba(0,0,0,0.08)',
              backgroundColor: 'rgba(0,0,0,0.03)',
              fontFamily: 'Inter',
              fontSize: 14,
              fontWeight: 400,
              color: '#2a2a2a',
            }}
          >
            {TIER_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#666', fontSize: 10 }} aria-hidden="true">▾</div>
        </div>
      </div>

      {loading && <Spinner />}

      {error && (
        <div className="px-6" role="alert">
          <div style={{
            fontFamily: 'Inter',
            fontSize: 14,
            color: '#c8102e',
            backgroundColor: 'rgba(200,16,46,0.06)',
            padding: '12px 16px',
            borderRadius: 12,
          }}>
            Could not load games. Check your connection and try again.
          </div>
        </div>
      )}

      {!loading && !error && games.length === 0 && (
        <EmptyState onPost={() => navigate('/post')} />
      )}

      {!loading && games.length > 0 && (
        <ul style={{ listStyle: 'none' }} aria-label="Games list">
          {games.map((game: any, i: number) => {
            const filled   = (game.confirmedPlayers?.length ?? 0) + 1;
            const total    = game.playerCount ?? 10;
            const priceGBP = Math.round((game.costPerPlayer ?? 0) / 100);
            const initials = (game.confirmedPlayers || []).map((p: any) =>
              p.displayName?.slice(0, 2).toUpperCase() ?? '??'
            );
            const spotsLeft = total - filled;

            return (
              <li key={game.id}>
                <button
                  onClick={() => navigate(`/game/${game.id}`)}
                  className="game-card w-full px-6 text-left"
                  aria-label={`${game.venue}, ${formatKickoff(game.kickoffAt)}, £${priceGBP} per player, ${filled} of ${total} spots filled`}
                >
                  <div
                    style={{
                      paddingTop: i === 0 ? 0 : 20,
                      paddingBottom: 20,
                      borderBottom: i < games.length - 1 ? '1px solid rgba(0,0,0,0.07)' : 'none',
                    }}
                  >
                    <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 20, color: '#1a1a1a', lineHeight: 1.3, letterSpacing: '-0.01em', marginBottom: 4 }}>
                      {game.venue}
                    </div>
                    <div style={{ fontFamily: 'Inter', fontSize: 14, color: '#666', fontWeight: 400, marginBottom: 16 }}>
                      {formatKickoff(game.kickoffAt)}{game.area ? ` · ${game.area}` : ''}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AvatarStack initials={initials} max={3} size={28} />
                        <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#666', fontWeight: 400 }}>
                          {filled}/{total}
                          {spotsLeft <= 3 && spotsLeft > 0 && (
                            <span style={{ color: '#c8102e', marginLeft: 6, fontWeight: 500 }}>
                              · {spotsLeft} left
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 18, color: '#1a1a1a' }}>
                        £{priceGBP}
                      </div>
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

    </div>
  );
}
