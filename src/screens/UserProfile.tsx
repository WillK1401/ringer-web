import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ChevronLeft, MoreHorizontal, MapPin, Check, ChevronRight } from 'lucide-react';
import { usersApi, connectionsApi } from '../lib/api';
import { Spinner } from '../components/Spinner';

// Design tokens (mirror src/styles/index.css — never hardcode elsewhere)
const BG = '#F0EDE6';
const FG = '#1a1a1a';
const GREEN = '#042b2b';
const MUTED = '#999';
const CARD = 'rgba(0,0,0,0.03)';

type ConnectState = 'idle' | 'sending' | 'sent';

// Degree label off the connection graph value the API returns (1 | 2 | null/3+)
function degreeLabel(degree?: number): { short: string; long: string } | null {
  if (degree === 1) return { short: '1°', long: '1st-degree connection' };
  if (degree === 2) return { short: '2°', long: '2nd-degree connection' };
  return null; // not in network — render nothing / "Outside your network"
}

function initials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connect, setConnect] = useState<ConnectState>('idle');

  useEffect(() => {
    let active = true;
    setLoading(true);
    usersApi
      .getUser(id!)
      .then((u) => {
        if (!active) return;
        setUser(u);
        // If the API already tells us a request is pending, reflect it
        if (u?.connectionStatus === 'pending' || u?.connectionStatus === 'requested') {
          setConnect('sent');
        }
      })
      .catch(() => active && setError('Could not load this profile.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [id]);

  async function handleConnect() {
    if (!id || connect !== 'idle') return;
    setConnect('sending');
    try {
      await connectionsApi.send(id);
      setConnect('sent');
    } catch {
      setConnect('idle');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height: '100%', background: BG }}>
        <Spinner size={28} />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-6" style={{ height: '100%', background: BG }}>
        <p style={{ fontSize: 15, color: '#666', textAlign: 'center' }}>{error ?? 'Profile not found.'}</p>
        <button
          onClick={() => navigate(-1)}
          style={{ background: CARD, color: FG, borderRadius: 999, padding: '12px 24px', fontSize: 15, fontWeight: 500, border: 'none' }}
        >
          Go back
        </button>
      </div>
    );
  }

  const deg = degreeLabel(user.degree);
  const reliability = user.reliabilityScore ?? 0;
  const mutualCount = user.mutualConnections ?? user.mutualCount ?? 0;
  const mutualPreview: string[] = user.mutualPreview ?? []; // optional [{name}] or initials

  return (
    <div className="flex flex-col" style={{ height: '100%', background: BG }}>
      {/* Header */}
      <header className="flex items-center justify-between" style={{ padding: '8px 18px', flexShrink: 0 }}>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center"
          style={{ width: 38, height: 38, borderRadius: 999, background: 'rgba(0,0,0,0.04)', border: 'none' }}
          aria-label="Back"
        >
          <ChevronLeft size={22} color={FG} />
        </button>
        <span style={{ fontSize: 15, fontWeight: 500, color: FG }}>Profile</span>
        <button
          className="flex items-center justify-center"
          style={{ width: 38, height: 38, borderRadius: 999, background: 'rgba(0,0,0,0.04)', border: 'none' }}
          aria-label="More"
        >
          <MoreHorizontal size={18} color={FG} />
        </button>
      </header>

      {/* Scroll body */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '12px 22px 28px' }}>
        {/* Identity */}
        <div className="flex items-center" style={{ gap: 16 }}>
          <div
            className="flex items-center justify-center"
            style={{ width: 64, height: 64, borderRadius: 999, background: 'rgba(4,43,43,0.1)', color: GREEN, fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', flexShrink: 0 }}
          >
            {initials(user.displayName)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.02em', color: FG, margin: 0 }}>
              {user.displayName}
            </h1>
            <div style={{ fontSize: 14, color: MUTED, marginTop: 2 }}>
              @{user.handle}
              {user.city ? ` · ${user.city}` : ''}
            </div>
          </div>
        </div>

        {/* Degree banner */}
        {deg && (
          <div className="flex items-center" style={{ gap: 12, marginTop: 18, padding: '14px 16px', background: GREEN, borderRadius: 16 }}>
            <div
              className="flex items-center justify-center"
              style={{ width: 34, height: 34, borderRadius: 999, background: 'rgba(240,237,230,0.12)', color: BG, fontSize: 14, fontWeight: 600, flexShrink: 0 }}
            >
              {deg.short}
            </div>
            <div className="flex-1">
              <div style={{ fontSize: 14, fontWeight: 500, color: BG }}>{deg.long}</div>
              {user.connectionVia && (
                <div style={{ fontSize: 12, color: 'rgba(240,237,230,0.6)', marginTop: 1 }}>via {user.connectionVia}</div>
              )}
            </div>
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-2" style={{ gap: 10, marginTop: 18 }}>
          <StatCard value={user.gamesPlayed ?? 0} label="Games played" />
          <StatCard value={user.gamesAsOrganiser ?? 0} label="Games hosted" />
          <StatCard value={user.noShows ?? 0} label="No-shows" />
          {/* Reliability ring */}
          <div className="flex items-center" style={{ gap: 14, background: CARD, borderRadius: 18, padding: 18 }}>
            <div
              className="flex items-center justify-center"
              style={{ width: 54, height: 54, borderRadius: 999, flexShrink: 0, background: `conic-gradient(${GREEN} ${reliability}%, rgba(0,0,0,0.08) 0)` }}
            >
              <div
                className="flex items-center justify-center"
                style={{ width: 40, height: 40, borderRadius: 999, background: BG, fontSize: 14, fontWeight: 600, color: GREEN }}
              >
                {reliability}%
              </div>
            </div>
            <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.3 }}>
              Reliability
              <br />
              score
            </div>
          </div>
        </div>

        {/* About */}
        {user.bio && (
          <div style={{ marginTop: 18, padding: '16px 18px', background: CARD, borderRadius: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: FG, marginBottom: 8 }}>About</div>
            <p style={{ fontSize: 14, lineHeight: 1.55, color: '#555', margin: 0 }}>{user.bio}</p>
          </div>
        )}

        {/* Mutual connections */}
        {mutualCount > 0 && (
          <button
            onClick={() => navigate(`/users/${id}/mutual`)}
            className="flex items-center w-full text-left"
            style={{ gap: 14, marginTop: 14, padding: '16px 18px', background: CARD, borderRadius: 18, border: 'none' }}
          >
            <div className="flex">
              {mutualPreview.slice(0, 3).map((m, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center"
                  style={{ width: 30, height: 30, borderRadius: 999, background: '#e4dfd5', border: `2px solid ${BG}`, fontSize: 10, fontWeight: 600, color: '#555', marginLeft: i === 0 ? 0 : -9 }}
                >
                  {typeof m === 'string' ? m : initials((m as any).name)}
                </div>
              ))}
            </div>
            <div className="flex-1" style={{ fontSize: 14, fontWeight: 500, color: FG }}>
              {mutualCount} mutual connection{mutualCount === 1 ? '' : 's'}
            </div>
            <ChevronRight size={20} color="#ccc" />
          </button>
        )}
      </div>

      {/* Sticky Connect CTA */}
      <div style={{ flexShrink: 0, padding: '14px 22px 28px', borderTop: '1px solid rgba(0,0,0,0.06)', background: BG }}>
        {connect === 'sent' ? (
          <div
            className="flex items-center justify-center"
            style={{ width: '100%', gap: 8, background: 'rgba(0,0,0,0.04)', color: '#666', borderRadius: 999, padding: 16, fontSize: 16, fontWeight: 500 }}
          >
            <Check size={18} color="#16a34a" /> Request sent
          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={connect === 'sending'}
            style={{ width: '100%', background: GREEN, color: BG, borderRadius: 999, padding: 16, fontSize: 16, fontWeight: 500, border: 'none', opacity: connect === 'sending' ? 0.6 : 1 }}
          >
            {connect === 'sending' ? 'Sending…' : `Connect with ${user.displayName?.split(' ')[0] ?? ''}`.trim()}
          </button>
        )}
      </div>
    </div>
  );
}

function StatCard({ value, label }: { value: number | string; label: string }) {
  return (
    <div style={{ background: CARD, borderRadius: 18, padding: 18 }}>
      <div style={{ fontSize: 32, fontWeight: 600, color: FG, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: MUTED, marginTop: 8 }}>{label}</div>
    </div>
  );
}
