import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Settings, ChevronRight, LogOut } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { BottomNav } from '../components/BottomNav';
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
      <Spinner /><BottomNav />
    </div>
  );

  const displayName = profile?.displayName || clerkUser?.fullName || 'You';
  const handle = profile?.handle ? `@${profile.handle}` : '';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const score = profile?.reliabilityScore ?? 5.0;
  const gamesPlayed = profile?.gamesPlayed ?? 0;
  const gamesHosted = profile?.gamesAsOrganiser ?? 0;
  const showUpPct = gamesPlayed > 0
    ? Math.round(((gamesPlayed - (profile?.noShows ?? 0)) / gamesPlayed) * 100)
    : 100;
  const now = new Date();

  return (
    <div className="min-h-screen pb-[80px]" style={{ backgroundColor: '#F0EDE6' }}>
        {/* Header */}
        <div className="px-6 pt-6 pb-6 flex items-center justify-between">
          <h1 style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 32, color: '#1a1a1a', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
            Profile
          </h1>
          <div className="flex items-center gap-4">
            <button onClick={() => signOut().then(() => navigate('/sign-in'))}>
              <LogOut size={20} strokeWidth={1.5} color="#999" />
            </button>
            <button>
              <Settings size={20} strokeWidth={1.5} color="#1a1a1a" />
            </button>
          </div>
        </div>

        {/* Avatar + info */}
        <div className="px-6 pb-8 flex flex-col items-center">
          <div
            className="rounded-full overflow-hidden mb-5 flex items-center justify-center"
            style={{ width: 100, height: 100, backgroundColor: '#042b2b' }}
          >
            {clerkUser?.imageUrl
              ? <img src={clerkUser.imageUrl} alt="" className="w-full h-full object-cover" />
              : <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 28, color: '#F0EDE6' }}>{initials}</span>
            }
          </div>
          <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 20, color: '#1a1a1a', marginBottom: 4, textAlign: 'center', letterSpacing: '-0.01em' }}>
            {displayName}
          </div>
          {handle && (
            <div style={{ fontFamily: 'Inter', fontSize: 14, color: '#999', marginBottom: 14 }}>{handle}</div>
          )}
          {/* Reliability pill */}
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
          >
            <span style={{ fontFamily: 'Inter', fontSize: 14, color: '#1a1a1a', fontWeight: 400 }}>
              Reliable · {score.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="px-6 pb-8">
          <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 15, color: '#1a1a1a', marginBottom: 16 }}>
            Stats
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Games', value: gamesPlayed },
              { label: 'Show Up', value: `${showUpPct}%` },
              { label: 'Hosted', value: gamesHosted },
            ].map(({ label, value }) => (
              <div key={label} className="py-5 px-4 rounded-2xl" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
                <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 24, color: '#1a1a1a', lineHeight: 1, marginBottom: 8, letterSpacing: '-0.01em' }}>
                  {value}
                </div>
                <div style={{ fontFamily: 'Inter', fontSize: 12, color: '#999', fontWeight: 400 }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stripe payments */}
        <div className="px-6 pb-8">
          <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 15, color: '#1a1a1a', marginBottom: 16 }}>
            Payments
          </div>
          <div className="py-4 px-5 rounded-2xl" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
            {stripeStatus?.onboarded ? (
              <div className="flex items-center gap-2">
                <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#22c55e', flexShrink: 0 }} />
                <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#666', fontWeight: 400 }}>Stripe connected</span>
              </div>
            ) : (
              <div>
                <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#999', marginBottom: 12, lineHeight: 1.5, fontWeight: 400 }}>
                  Connect Stripe to post games and collect payments.
                </div>
                <button onClick={handleStripeOnboard} className="w-full py-3 rounded-full"
                  style={{ backgroundColor: '#635bff', color: '#fff', fontFamily: 'Inter', fontWeight: 500, fontSize: 14 }}>
                  Connect Stripe →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent games */}
        {myGames.length > 0 && (
          <div className="px-6 pb-8">
            <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 15, color: '#1a1a1a', marginBottom: 16 }}>
              Recent Games
            </div>
            <div className="space-y-3">
              {myGames.map((game: any) => {
                const d = new Date(game.kickoff_at || game.kickoffAt);
                const isUpcoming = d >= now;
                return (
                  <button
                    key={game.id}
                    onClick={() => navigate(`/game/${game.id}`)}
                    className="w-full py-4 px-5 rounded-2xl text-left flex items-center justify-between"
                    style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}
                  >
                    <div>
                      <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 15, color: '#1a1a1a', marginBottom: 4 }}>
                        {game.venue}
                      </div>
                      <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#999', fontWeight: 400 }}>
                        {d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                    <div
                      className="px-3 py-1 rounded-full"
                      style={{
                        fontFamily: 'Inter', fontSize: 11, fontWeight: 500,
                        color: isUpcoming ? '#042b2b' : '#999',
                        backgroundColor: isUpcoming ? 'rgba(4,43,43,0.1)' : 'transparent',
                      }}
                    >
                      {isUpcoming ? 'Upcoming' : 'Completed'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Connections */}
        <div className="px-6 pb-6">
          <button
            onClick={() => navigate('/connections')}
            className="w-full py-4 px-5 rounded-2xl flex items-center justify-between"
            style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}
          >
            <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 15, color: '#1a1a1a' }}>My Connections</span>
            <ChevronRight size={16} color="#ccc" />
          </button>
        </div>

      <BottomNav />
    </div>
  );
}
