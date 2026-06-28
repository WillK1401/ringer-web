import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Settings, ChevronRight, LogOut } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Spinner } from '../components/Spinner';
import { usersApi, paymentsApi, chatsApi } from '../lib/api';

export function Profile() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const [profile, setProfile] = useState<any>(null);
  const [myGames, setMyGames] = useState<any[]>([]);
  const [stripeStatus, setStripeStatus] = useState<{ onboarded: boolean; chargesEnabled: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      usersApi.getMe().catch(() => null),
      chatsApi.getMyChats().catch(() => []),
      paymentsApi.getStatus().catch(() => null),
    ]).then(([prof, games, stripe]) => {
      setProfile(prof);
      setMyGames(Array.isArray(games) ? games.slice(0, 4) : []);
      setStripeStatus(stripe);
    }).finally(() => setLoading(false));
  }, []);

  const handleStripeOnboard = async () => {
    try {
      const { onboardingUrl } = await paymentsApi.startOnboarding();
      window.location.href = onboardingUrl;
    } catch (e: any) { alert(e.message); }
  };

  if (loading) return (
    <div className="min-h-screen pb-[80px]" style={{ backgroundColor: '#F0EDE6' }}>
      <Spinner />
    </div>
  );

  const displayName = profile?.displayName || clerkUser?.fullName || 'You';
  const handle      = profile?.handle ? `@${profile.handle}` : '';
  const initials    = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const score       = profile?.reliabilityScore ?? 5.0;
  const gamesPlayed = profile?.gamesPlayed ?? 0;
  const gamesHosted = profile?.gamesAsOrganiser ?? 0;
  const noShows     = profile?.noShows ?? 0;
  const showUpPct   = gamesPlayed > 0
    ? Math.round(((gamesPlayed - noShows) / gamesPlayed) * 100)
    : 100;
  const now = new Date();

  return (
    <div className="min-h-screen pb-[80px]" style={{ backgroundColor: '#F0EDE6' }}>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px' }}>

        {/* Page header */}
        <div style={{ paddingTop: 40, paddingBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <h1 style={{
            fontFamily: 'Inter',
            fontWeight: 700,
            fontSize: 42,
            color: '#1a1a1a',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}>
            Profile
          </h1>
          <div className="flex items-center gap-3" style={{ paddingTop: 8 }}>
            <button
              onClick={() => signOut().then(() => navigate('/sign-in'))}
              aria-label="Sign out"
              style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}
            >
              <LogOut size={20} strokeWidth={1.5} />
            </button>
            <button
              aria-label="Settings"
              style={{ padding: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#1a1a1a' }}
            >
              <Settings size={20} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Avatar + identity */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', paddingBottom: 40 }}>
          <div
            className="rounded-full overflow-hidden flex items-center justify-center"
            style={{ width: 96, height: 96, backgroundColor: '#042b2b', marginBottom: 16, flexShrink: 0 }}
          >
            {clerkUser?.imageUrl
              ? <img src={clerkUser.imageUrl} alt={`${displayName}'s avatar`} className="w-full h-full object-cover" />
              : <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 28, color: '#F0EDE6' }}>{initials}</span>
            }
          </div>

          <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 20, color: '#1a1a1a', marginBottom: 4, letterSpacing: '-0.01em' }}>
            {displayName}
          </div>
          {handle && (
            <div style={{ fontFamily: 'Inter', fontSize: 14, color: '#666', marginBottom: 12 }}>{handle}</div>
          )}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
          >
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e', flexShrink: 0 }} />
            <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#1a1a1a', fontWeight: 500 }}>
              Reliable · {score.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Stats */}
        <section aria-label="Stats" style={{ paddingBottom: 40 }}>
          <h2 style={sectionHeading}>Stats</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: 'Games played',  value: gamesPlayed },
              { label: 'Show-up rate',  value: `${showUpPct}%` },
              { label: 'Games hosted',  value: gamesHosted },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: '20px 16px', borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.04)' }}>
                <div style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 28, color: '#1a1a1a', letterSpacing: '-0.02em', marginBottom: 6, lineHeight: 1 }}>
                  {value}
                </div>
                <div style={{ fontFamily: 'Inter', fontSize: 12, color: '#666', fontWeight: 400, lineHeight: 1.3 }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Payments */}
        <section aria-label="Payments" style={{ paddingBottom: 40 }}>
          <h2 style={sectionHeading}>Payments</h2>
          <div style={{ padding: '16px 20px', borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.04)' }}>
            {stripeStatus?.onboarded ? (
              <div className="flex items-center gap-3">
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e', flexShrink: 0 }} />
                <span style={{ fontFamily: 'Inter', fontSize: 14, color: '#1a1a1a', fontWeight: 500 }}>Stripe connected</span>
              </div>
            ) : (
              <div>
                <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#666', marginBottom: 16, lineHeight: 1.6, fontWeight: 400 }}>
                  Connect Stripe to post games and collect payments automatically.
                </p>
                <button
                  onClick={handleStripeOnboard}
                  className="btn-primary w-full"
                  style={{ backgroundColor: '#042b2b', color: '#F0EDE6', fontFamily: 'Inter', fontWeight: 600, fontSize: 14, padding: '13px 24px', borderRadius: 50, border: 'none', cursor: 'pointer', minHeight: 48 }}
                >
                  Connect Stripe →
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Recent Games */}
        {myGames.length > 0 && (
          <section aria-label="Recent games" style={{ paddingBottom: 40 }}>
            <h2 style={sectionHeading}>Recent Games</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {myGames.map((game: any) => {
                const d         = new Date(game.kickoff_at || game.kickoffAt);
                const isUpcoming = d >= now;
                return (
                  <button
                    key={game.id}
                    onClick={() => navigate(`/game/${game.id}`)}
                    className="game-card w-full text-left flex items-center justify-between"
                    style={{ padding: '16px 20px', borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.04)', border: 'none', cursor: 'pointer' }}
                  >
                    <div>
                      <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 15, color: '#1a1a1a', marginBottom: 4 }}>
                        {game.venue}
                      </div>
                      <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#666', fontWeight: 400 }}>
                        {d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: 'Inter',
                        fontSize: 12,
                        fontWeight: 500,
                        padding: '4px 12px',
                        borderRadius: 999,
                        color:           isUpcoming ? '#042b2b' : '#666',
                        backgroundColor: isUpcoming ? 'rgba(4,43,43,0.10)' : 'rgba(0,0,0,0.06)',
                        flexShrink: 0,
                        marginLeft: 12,
                      }}
                    >
                      {isUpcoming ? 'Upcoming' : 'Completed'}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Shortcuts */}
        <section aria-label="Navigation shortcuts" style={{ paddingBottom: 40, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'My Connections', path: '/connections' },
            { label: 'My Chats',       path: '/chat'        },
          ].map(({ label, path }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="game-card w-full flex items-center justify-between"
              style={{ padding: '16px 20px', borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.04)', border: 'none', cursor: 'pointer' }}
            >
              <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 15, color: '#1a1a1a' }}>{label}</span>
              <ChevronRight size={16} color="#bbb" aria-hidden="true" />
            </button>
          ))}
        </section>

      </div>
    </div>
  );
}

const sectionHeading: React.CSSProperties = {
  fontFamily:     'Inter',
  fontWeight:     600,
  fontSize:       22,
  color:          '#1a1a1a',
  letterSpacing:  '-0.02em',
  marginBottom:   16,
};
