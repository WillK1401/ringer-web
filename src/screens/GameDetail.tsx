import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, MessageCircle, Trash2, CheckCircle2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { useUser } from '@clerk/clerk-react';
import { Spinner } from '../components/Spinner';
import { gamesApi, usersApi } from '../lib/api';
import { formatDate, formatTime } from '../lib/utils';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

type State = 'idle' | 'paying' | 'success' | 'error' | 'cancelling';

export function GameDetail() {
  const navigate = useNavigate();
  const { id }   = useParams<{ id: string }>();
  const { user: clerkUser } = useUser();
  const [data,       setData]       = useState<{ game: any; players: any[] } | null>(null);
  const [myProfile,  setMyProfile]  = useState<any>(null);
  const [loading,    setLoading]    = useState(true);
  const [state,      setState]      = useState<State>('idle');
  const [errorMsg,   setErrorMsg]   = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason,      setCancelReason]      = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      gamesApi.getGame(id),
      usersApi.getMe().catch(() => null),
    ]).then(([gameData, profile]) => {
      setData(gameData);
      setMyProfile(profile);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleClaim = async () => {
    if (!id || !data) return;
    setState('paying');
    setErrorMsg('');
    try {
      const res = await gamesApi.joinGame(id);
      const { clientSecret } = res.payment || {};
      if (clientSecret) {
        const stripe = await stripePromise;
        if (!stripe) throw new Error('Stripe not loaded');
        const { error } = await stripe.confirmPayment({
          clientSecret,
          confirmParams: { return_url: `${window.location.origin}/game/${id}?success=1` },
        });
        if (error) throw new Error(error.message);
      }
      setState('success');
    } catch (e: any) {
      setState('error');
      setErrorMsg(e.message || 'Something went wrong');
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    setState('cancelling');
    setErrorMsg('');
    try {
      await gamesApi.cancelGame(id, cancelReason || undefined);
      navigate('/', { replace: true });
    } catch (e: any) {
      setState('idle');
      setErrorMsg(e.message || 'Failed to cancel game');
      setShowCancelConfirm(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen pb-[80px]" style={{ backgroundColor: '#F0EDE6' }}>
      <Spinner />
    </div>
  );

  if (state === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: '#F0EDE6' }}>
        <div
          className="flex items-center justify-center rounded-full"
          style={{ width: 72, height: 72, backgroundColor: 'rgba(4,43,43,0.08)', marginBottom: 24 }}
        >
          <CheckCircle2 size={32} strokeWidth={1.5} color="#042b2b" />
        </div>
        <h1 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 28, color: '#1a1a1a', marginBottom: 8, textAlign: 'center', letterSpacing: '-0.02em' }}>
          Spot Claimed
        </h1>
        <p style={{ fontFamily: 'Inter', fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 40, fontWeight: 400 }}>
          Payment confirmed. Your spot is secured.
        </p>
        <button
          onClick={() => navigate(`/chat?gameId=${id}&name=${data?.game?.venue}`)}
          className="btn-primary"
          style={{ backgroundColor: '#042b2b', color: '#F0EDE6', fontFamily: 'Inter', fontWeight: 600, fontSize: 16, padding: '16px 40px', borderRadius: 50, border: 'none', cursor: 'pointer', marginBottom: 16, minHeight: 52 }}
        >
          Open game chat
        </button>
        <button
          onClick={() => navigate('/')}
          style={{ fontFamily: 'Inter', fontSize: 14, color: '#666', fontWeight: 400, background: 'none', border: 'none', cursor: 'pointer' }}
        >
          Back to games
        </button>
      </div>
    );
  }

  const game        = data?.game;
  const players     = data?.players?.filter((p) => p.status === 'confirmed') ?? [];
  const totalSlots  = game?.playerCount ?? 10;
  const filled      = players.length + 1;
  const open        = Math.max(0, totalSlots - filled);
  const pricePence  = game?.costPerPlayer ?? 0;
  const priceStr    = `£${(pricePence / 100).toFixed(2)}`;
  const pitchCostStr = `£${((pricePence * totalSlots) / 100).toFixed(2)}`;

  const isOrganiser = myProfile?.id && game?.organiserId &&
    String(myProfile.id) === String(game.organiserId);

  const squad = [
    { name: isOrganiser ? 'You' : 'Organiser', isYou: isOrganiser, isOpen: false, isOrg: true },
    ...players.map((p: any) => ({ name: p.displayName?.split(' ')[0] ?? '?', isYou: false, isOpen: false, isOrg: false })),
    ...Array(open).fill({ name: 'Open', isYou: false, isOpen: true, isOrg: false }),
  ];

  return (
    <div className="min-h-screen pb-[80px]" style={{ backgroundColor: '#F0EDE6' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>

        {/* Back + actions */}
        <div style={{ paddingTop: 24, paddingBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 0' }}
          >
            <ArrowLeft size={22} strokeWidth={1.5} color="#1a1a1a" />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => navigate(`/chat?gameId=${id}&name=${encodeURIComponent(game?.venue ?? 'Game')}&sub=${encodeURIComponent(game?.kickoffAt ? formatDate(game.kickoffAt) + ' · ' + formatTime(game.kickoffAt) : '')}`)}
              style={{ padding: '8px 14px', borderRadius: 50, backgroundColor: 'rgba(4,43,43,0.08)', display: 'flex', alignItems: 'center', gap: 6, border: 'none', cursor: 'pointer' }}
            >
              <MessageCircle size={14} strokeWidth={1.5} color="#042b2b" aria-hidden="true" />
              <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#042b2b', fontWeight: 500 }}>Chat</span>
            </button>
            {isOrganiser && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                style={{ padding: '8px 14px', borderRadius: 50, backgroundColor: 'rgba(200,16,46,0.08)', display: 'flex', alignItems: 'center', gap: 6, border: 'none', cursor: 'pointer' }}
              >
                <Trash2 size={14} strokeWidth={1.5} color="#c8102e" aria-hidden="true" />
                <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#c8102e', fontWeight: 500 }}>Cancel</span>
              </button>
            )}
          </div>
        </div>

        {/* Venue + subtitle */}
        <div style={{ paddingBottom: 32 }}>
          <h1 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 42, color: '#1a1a1a', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 10 }}>
            {game?.venue ?? '—'}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {game?.format && (
              <span style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 500, color: '#042b2b', backgroundColor: 'rgba(4,43,43,0.08)', padding: '4px 12px', borderRadius: 999 }}>
                {game.format}
              </span>
            )}
            {game?.area && (
              <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#666', fontWeight: 400 }}>
                {game.area}
              </span>
            )}
          </div>
        </div>

        {/* Info cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, paddingBottom: 40 }}>
          {([
            ['Date',    game?.kickoffAt ? formatDate(game.kickoffAt) : '—'],
            ['Kickoff', game?.kickoffAt ? formatTime(game.kickoffAt) : '—'],
            ['Format',  game?.format ?? '5-a-side'],
          ] as [string, string][]).map(([label, val]) => (
            <div key={label} style={{ padding: '14px 16px', borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.04)' }}>
              <div style={{ fontFamily: 'Inter', fontSize: 12, color: '#666', marginBottom: 6, fontWeight: 400 }}>{label}</div>
              <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 16, color: '#1a1a1a' }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Squad */}
        <section aria-label="Squad" style={{ paddingBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <h2 style={sectionHeading}>Squad</h2>
            <span style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: '#042b2b', backgroundColor: 'rgba(4,43,43,0.08)', padding: '3px 10px', borderRadius: 999 }}>
              {filled}/{totalSlots}
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: 16 }}>
            {squad.slice(0, totalSlots).map((p, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: p.isYou
                      ? '#042b2b'
                      : p.isOpen
                      ? 'transparent'
                      : 'rgba(4,43,43,0.10)',
                    border: p.isOpen ? '1.5px dashed rgba(0,0,0,0.15)' : 'none',
                  }}
                >
                  {!p.isOpen && (
                    <span style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 600, color: p.isYou ? '#F0EDE6' : '#042b2b', letterSpacing: '-0.01em' }}>
                      {p.name?.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <span style={{ fontFamily: 'Inter', fontSize: 11, color: p.isOpen ? '#bbb' : '#555', textAlign: 'center', fontWeight: p.isYou ? 500 : 400, lineHeight: 1.3 }}>
                  {p.isYou ? 'You (org)' : p.isOpen ? 'Open' : p.name}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Cost */}
        <section aria-label="Cost breakdown" style={{ paddingBottom: 40 }}>
          <h2 style={{ ...sectionHeading, marginBottom: 16 }}>Cost</h2>
          <div style={{ borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.04)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <span style={{ fontFamily: 'Inter', fontSize: 14, color: '#666', fontWeight: 400 }}>Pitch hire</span>
              <span style={{ fontFamily: 'Inter', fontSize: 14, color: '#1a1a1a', fontWeight: 400 }}>{pitchCostStr}</span>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
              <span style={{ fontFamily: 'Inter', fontSize: 14, color: '#666', fontWeight: 400 }}>Per player</span>
              <span style={{ fontFamily: 'Inter', fontSize: 14, color: '#1a1a1a', fontWeight: 400 }}>{priceStr}</span>
            </div>
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Inter', fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>Your cost</span>
              <span style={{ fontFamily: 'Inter', fontSize: 24, fontWeight: 700, color: '#042b2b', letterSpacing: '-0.02em' }}>{priceStr}</span>
            </div>
          </div>
        </section>

        {/* Error */}
        {errorMsg && (
          <div role="alert" style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 12, backgroundColor: 'rgba(200,16,46,0.06)', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <span aria-hidden="true" style={{ flexShrink: 0, color: '#c8102e' }}>⚠</span>
            <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#c8102e' }}>{errorMsg}</span>
          </div>
        )}

        {/* CTA */}
        <div style={{ paddingBottom: 40 }}>
          {isOrganiser ? (
            <div
              style={{ padding: '16px 24px', borderRadius: 50, backgroundColor: 'rgba(4,43,43,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <CheckCircle2 size={16} strokeWidth={2} color="#042b2b" aria-hidden="true" />
              <span style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 15, color: '#042b2b' }}>You're organising this game</span>
            </div>
          ) : open > 0 ? (
            <button
              onClick={handleClaim}
              disabled={state === 'paying'}
              className="btn-primary"
              style={{ width: '100%', minHeight: 56, backgroundColor: '#042b2b', color: '#F0EDE6', fontFamily: 'Inter', fontWeight: 600, fontSize: 16, borderRadius: 50, border: 'none', cursor: state === 'paying' ? 'not-allowed' : 'pointer', opacity: state === 'paying' ? 0.6 : 1 }}
              aria-busy={state === 'paying'}
            >
              {state === 'paying' ? 'Processing…' : `Claim Spot · ${priceStr}`}
            </button>
          ) : (
            <div style={{ padding: '16px 24px', borderRadius: 50, backgroundColor: 'rgba(0,0,0,0.05)', textAlign: 'center' }}>
              <span style={{ fontFamily: 'Inter', fontSize: 15, color: '#666', fontWeight: 400 }}>This game is full</span>
            </div>
          )}
        </div>

      </div>

      {/* Cancel confirmation overlay */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="w-full rounded-t-3xl p-6" style={{ backgroundColor: '#F0EDE6', maxWidth: 480 }}>
            <h2 style={{ fontFamily: 'Inter', fontWeight: 700, fontSize: 22, color: '#1a1a1a', marginBottom: 8, letterSpacing: '-0.02em' }}>
              Cancel this game?
            </h2>
            <p style={{ fontFamily: 'Inter', fontSize: 14, color: '#666', marginBottom: 24, lineHeight: 1.6, fontWeight: 400 }}>
              All confirmed players will be automatically refunded. This can't be undone.
            </p>
            <div style={{ marginBottom: 20 }}>
              <label htmlFor="cancel-reason" style={{ fontFamily: 'Inter', fontSize: 14, color: '#2a2a2a', display: 'block', marginBottom: 8, fontWeight: 500 }}>
                Reason (optional)
              </label>
              <input
                id="cancel-reason"
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Pitch unavailable"
                style={{ width: '100%', padding: '13px 16px', borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.05)', border: 'none', fontFamily: 'Inter', fontSize: 15, color: '#1a1a1a', minHeight: 48 }}
              />
            </div>
            <button
              onClick={handleCancel}
              disabled={state === 'cancelling'}
              className="btn-primary"
              style={{ width: '100%', minHeight: 52, backgroundColor: '#c8102e', color: '#fff', fontFamily: 'Inter', fontWeight: 600, fontSize: 16, borderRadius: 50, border: 'none', cursor: state === 'cancelling' ? 'not-allowed' : 'pointer', marginBottom: 12, opacity: state === 'cancelling' ? 0.6 : 1 }}
            >
              {state === 'cancelling' ? 'Cancelling…' : 'Yes, cancel game'}
            </button>
            <button
              onClick={() => setShowCancelConfirm(false)}
              style={{ display: 'block', width: '100%', textAlign: 'center', fontFamily: 'Inter', fontSize: 14, color: '#666', background: 'none', border: 'none', cursor: 'pointer', padding: '10px 0' }}
            >
              Keep game
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const sectionHeading: React.CSSProperties = {
  fontFamily:    'Inter',
  fontWeight:    600,
  fontSize:      22,
  color:         '#1a1a1a',
  letterSpacing: '-0.02em',
  margin:        0,
};
