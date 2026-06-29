import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { MapPin } from 'lucide-react';
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

function GameCard({ game, navigate }: { game: any; navigate: (path: string) => void }) {
  const filled    = (game.confirmedPlayers?.length ?? 0) + 1;
  const total     = game.playerCount ?? 10;
  const priceGBP  = Math.round((game.costPerPlayer ?? 0) / 100);
  const initials  = (game.confirmedPlayers || []).map((p: any) =>
    typeof p === 'string' ? p.slice(0, 2).toUpperCase() : (p.displayName?.slice(0, 2).toUpperCase() ?? '??')
  );
  const spotsLeft = total - filled;
  const isNetwork = game.accessTier === 'first' || game.accessTier === 'organiser';

  return (
    <button
      onClick={() => navigate(`/game/${game.id}`)}
      className="game-card w-full text-left"
      aria-label={`${game.venue}, ${formatKickoff(game.kickoffAt)}, £${priceGBP} per player, ${filled} of ${total} spots filled`}
    >
      <div style={{ paddingTop: 20, paddingBottom: 20, borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 20, color: '#1a1a1a', lineHeight: 1.3, letterSpacing: '-0.01em' }}>
            {game.venue}
          </div>
          <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 18, color: '#1a1a1a', flexShrink: 0, marginLeft: 12 }}>
            £{priceGBP}
          </div>
        </div>
        <div style={{ fontFamily: 'Inter', fontSize: 14, color: '#666', fontWeight: 400, marginBottom: 14 }}>
          {formatKickoff(game.kickoffAt)}{game.area ? ` · ${game.area}` : ''}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <AvatarStack initials={initials} max={3} size={28} />
            <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#666', fontWeight: 400 }}>
              {filled}/{total}
              {spotsLeft <= 3 && spotsLeft > 0 && (
                <span style={{ color: '#c8102e', marginLeft: 6, fontWeight: 500 }}>· {spotsLeft} left</span>
              )}
            </div>
          </div>
          {isNetwork && (
            <span style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 500, color: '#042b2b', backgroundColor: 'rgba(4,43,43,0.08)', padding: '3px 10px', borderRadius: 999 }}>
              In your network
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function GameSection({ label, games, navigate }: { label: string; games: any[]; navigate: (path: string) => void }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 13, color: '#666', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
        {label}
      </h2>
      <ul style={{ listStyle: 'none' }}>
        {games.map((game: any) => (
          <li key={game.id}>
            <GameCard game={game} navigate={navigate} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function EmptyState({ onPost }: { onPost: () => void }) {
  return (
    <div
      className="px-6 py-16 flex flex-col items-center text-center"
      role="status"
      aria-label="No games available"
    >
      <div
        className="flex items-center justify-center rounded-full"
        style={{ width: 64, height: 64, backgroundColor: 'rgba(4,43,43,0.07)', marginBottom: 20 }}
        aria-hidden="true"
      >
        <MapPin size={28} strokeWidth={1.5} color="#042b2b" />
      </div>
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

  const networkGames = games.filter(g => g.accessTier === 'first' || g.accessTier === 'second' || g.accessTier === 'organiser');
  const nearbyGames  = games.filter(g => g.accessTier === 'public');
  const hasSections  = !loading && !error && networkGames.length > 0 && nearbyGames.length > 0;
  const singleSection = !loading && !error && games.length > 0 && !hasSections;

  return (
    <div className="min-h-screen pb-[80px]" style={{ backgroundColor: '#F0EDE6' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>

      {/* Title */}
      <div className="pt-10 pb-8">
        <h1 style={{
          fontFamily: 'Inter',
          fontWeight: 700,
          fontSize: 42,
          color: '#1a1a1a',
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
        }}>
          Discover
        </h1>
      </div>

      {/* Filters */}
      <div className="pb-8 flex gap-3" role="group" aria-label="Filter games">
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
        <div role="alert">
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

      {hasSections && (
        <>
          <GameSection label="Your network" games={networkGames} navigate={navigate} />
          <GameSection label="Nearby" games={nearbyGames} navigate={navigate} />
        </>
      )}

      {singleSection && (
        <GameSection
          label={networkGames.length > 0 ? 'Your network' : 'Nearby'}
          games={games}
          navigate={navigate}
        />
      )}

      </div>{/* /max-width container */}
    </div>
  );
}
