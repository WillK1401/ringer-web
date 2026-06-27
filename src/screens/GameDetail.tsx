import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, MessageCircle, Trash2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { useUser } from '@clerk/clerk-react';
import { Spinner } from '../components/Spinner';
import { gamesApi, usersApi } from '../lib/api';
import { formatDate, formatTime } from '../lib/utils';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

type State = 'idle' | 'paying' | 'success' | 'error' | 'cancelling';

export function GameDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user: clerkUser } = useUser();
  const [data, setData] = useState<{ game: any; players: any[] } | null>(null);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<State>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

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
    </div>
  );

  if (state === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: '#F0EDE6' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
        <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 24, color: '#1a1a1a', marginBottom: 8, textAlign: 'center', letterSpacing: '-0.01em' }}>
          Spot Claimed
        </div>
        <div style={{ fontFamily: 'Inter', fontSize: 14, color: '#999', textAlign: 'center', marginBottom: 32, fontWeight: 400 }}>
          Payment confirmed. Your spot is secured.
        </div>
        <button onClick={() => navigate(`/chat?gameId=${id}&name=${data?.game?.venue}`)}
          className="w-full max-w-[340px] py-4 rounded-full mb-3"
          style={{ backgroundColor: '#042b2b', color: '#F0EDE6', fontFamily: 'Inter', fontWeight: 500, fontSize: 16 }}>
          Open game chat
        </button>
        <button onClick={() => navigate('/')}
          style={{ fontFamily: 'Inter', fontSize: 14, color: '#999', fontWeight: 400 }}>
          Back to games
        </button>
      </div>
    );
  }

  const game = data?.game;
  const players = data?.players?.filter((p) => p.status === 'confirmed') ?? [];
  const totalSlots = game?.playerCount ?? 10;
  const filled = players.length + 1;
  const open = Math.max(0, totalSlots - filled);
  const pricePence = game?.costPerPlayer ?? 0;
  const priceStr = `£${(pricePence / 100).toFixed(2)}`;
  const pitchCostStr = `£${((pricePence * totalSlots) / 100).toFixed(2)}`;

  // Check if current user is the organiser
  const isOrganiser = myProfile?.id && game?.organiserId &&
    String(myProfile.id) === String(game.organiserId);

  const squad = [
    { name: isOrganiser ? 'You (org)' : 'Organiser', isYou: isOrganiser, isOpen: false },
    ...players.map((p: any) => ({ name: p.displayName?.split(' ')[0] ?? '?', isYou: false, isOpen: false })),
    ...Array(open).fill({ name: 'Open', isYou: false, isOpen: true }),
  ];

  return (
    <div className="min-h-screen pb-[80px]" style={{ backgroundColor: '#F0EDE6' }}>

        {/* Back + actions */}
        <div className="px-6 pt-6 pb-6 flex items-center justify-between">
          <button onClick={() => navigate(-1)}>
            <ArrowLeft size={22} strokeWidth={1.5} color="#1a1a1a" />
          </button>
          <div className="flex items-center gap-3">
            {/* Chat button */}
            <button
              onClick={() => navigate(`/chat?gameId=${id}&name=${encodeURIComponent(game?.venue ?? 'Game')}&sub=${encodeURIComponent(game?.kickoffAt ? formatDate(game.kickoffAt) + ' · ' + formatTime(game.kickoffAt) : '')}`)}
              style={{ padding: '6px 12px', borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <MessageCircle size={15} strokeWidth={1.5} color="#1a1a1a" />
              <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#1a1a1a', fontWeight: 400 }}>Chat</span>
            </button>
            {/* Cancel button — organiser only */}
            {isOrganiser && (
              <button
                onClick={() => setShowCancelConfirm(true)}
                style={{ padding: '6px 10px', borderRadius: 20, backgroundColor: 'rgba(212,24,61,0.08)', display: 'flex', alignItems: 'center', gap: 5 }}
              >
                <Trash2 size={14} strokeWidth={1.5} color="#d4183d" />
                <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#d4183d', fontWeight: 400 }}>Cancel</span>
              </button>
            )}
          </div>
        </div>

        {/* Venue name */}
        <div className="px-6 pb-8">
          <h1 style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 32, color: '#1a1a1a', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: 8 }}>
            {game?.venue ?? '—'}
          </h1>
          <div style={{ fontFamily: 'Inter', fontSize: 15, color: '#999', fontWeight: 400 }}>
            {game?.area ?? game?.format ?? ''}
          </div>
        </div>

        {/* Info row */}
        <div className="px-6 pb-8">
          <div className="grid grid-cols-3 gap-6 py-6"
            style={{ borderTop: '1px solid rgba(0,0,0,0.08)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            {[
              ['Date', game?.kickoffAt ? formatDate(game.kickoffAt) : '—'],
              ['Kickoff', game?.kickoffAt ? formatTime(game.kickoffAt) : '—'],
              ['Format', game?.format ?? '5-a-side'],
            ].map(([label, val]) => (
              <div key={label as string}>
                <div style={{ fontFamily: 'Inter', fontSize: 13, color: '#999', marginBottom: 6, fontWeight: 400 }}>{label}</div>
                <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 15, color: '#1a1a1a' }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Squad */}
        <div className="px-6 pb-8">
          <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 15, color: '#1a1a1a', marginBottom: 20 }}>
            Squad ({filled}/{totalSlots})
          </div>
          <div className="grid grid-cols-5 gap-4">
            {squad.slice(0, totalSlots).map((p, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="rounded-full flex items-center justify-center"
                  style={{
                    width: 52, height: 52,
                    backgroundColor: p.isYou ? '#042b2b' : p.isOpen ? 'transparent' : '#E0DDD6',
                    border: p.isOpen ? '1.5px solid rgba(0,0,0,0.1)' : 'none',
                  }}>
                  {!p.isOpen && (
                    <span style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 500, color: p.isYou ? '#F0EDE6' : '#666' }}>
                      {p.name?.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: 'Inter', fontSize: 11, color: p.isOpen ? '#ccc' : '#666', textAlign: 'center', fontWeight: 400 }}>
                  {p.isOpen ? 'Open' : p.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cost */}
        <div className="px-6 pb-8">
          <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 15, color: '#1a1a1a', marginBottom: 20 }}>Cost</div>
          <div className="py-6 px-5 rounded-2xl" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
            <div className="flex justify-between items-center mb-4">
              <div style={{ fontFamily: 'Inter', fontSize: 14, color: '#666', fontWeight: 400 }}>Pitch hire</div>
              <div style={{ fontFamily: 'Inter', fontSize: 14, color: '#1a1a1a', fontWeight: 400 }}>{pitchCostStr}</div>
            </div>
            <div className="flex justify-between items-center mb-4">
              <div style={{ fontFamily: 'Inter', fontSize: 14, color: '#666', fontWeight: 400 }}>Per player</div>
              <div style={{ fontFamily: 'Inter', fontSize: 14, color: '#1a1a1a', fontWeight: 400 }}>{priceStr}</div>
            </div>
            <div className="flex justify-between items-center pt-4" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
              <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 15, color: '#1a1a1a' }}>Your cost</div>
              <div style={{ fontFamily: 'Inter', fontWeight: 500, fontSize: 20, color: '#1a1a1a' }}>{priceStr}</div>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="px-6 mb-4">
            <div className="px-4 py-3 rounded-xl" style={{ backgroundColor: 'rgba(212,24,61,0.08)' }}>
              <span style={{ fontFamily: 'Inter', fontSize: 13, color: '#d4183d' }}>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="px-6 pb-6">
          {isOrganiser ? (
            <div className="py-4 px-5 rounded-2xl text-center" style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}>
              <span style={{ fontFamily: 'Inter', fontSize: 14, color: '#999', fontWeight: 400 }}>You're organising this game</span>
            </div>
          ) : open > 0 ? (
            <button onClick={handleClaim} disabled={state === 'paying'} className="w-full py-4 rounded-full"
              style={{ backgroundColor: '#042b2b', color: '#F0EDE6', fontFamily: 'Inter', fontWeight: 500, fontSize: 16, opacity: state === 'paying' ? 0.6 : 1 }}>
              {state === 'paying' ? 'Processing…' : `Claim Spot · ${priceStr}`}
            </button>
          ) : (
            <div className="px-4 py-3 rounded-full text-center" style={{ backgroundColor: 'rgba(0,0,0,0.05)' }}>
              <span style={{ fontFamily: 'Inter', fontSize: 14, color: '#999', fontWeight: 400 }}>Game is full</span>
            </div>
          )}
        </div>

      {/* Cancel confirmation overlay */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="w-full max-w-[390px] rounded-t-3xl p-6" style={{ backgroundColor: '#F0EDE6' }}>
            <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 20, color: '#1a1a1a', marginBottom: 8, letterSpacing: '-0.01em' }}>
              Cancel this game?
            </div>
            <div style={{ fontFamily: 'Inter', fontSize: 14, color: '#999', marginBottom: 20, lineHeight: 1.5, fontWeight: 400 }}>
              All confirmed players will be automatically refunded. This can't be undone.
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontFamily: 'Inter', fontSize: 13, color: '#999', display: 'block', marginBottom: 8, fontWeight: 400 }}>
                Reason (optional)
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Pitch unavailable"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.05)', border: 'none', fontFamily: 'Inter', fontSize: 14, color: '#1a1a1a' }}
              />
            </div>
            <button
              onClick={handleCancel}
              disabled={state === 'cancelling'}
              className="w-full py-4 rounded-full mb-3"
              style={{ backgroundColor: '#d4183d', color: '#fff', fontFamily: 'Inter', fontWeight: 500, fontSize: 16, opacity: state === 'cancelling' ? 0.6 : 1 }}
            >
              {state === 'cancelling' ? 'Cancelling…' : 'Yes, cancel game'}
            </button>
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="w-full py-3"
              style={{ fontFamily: 'Inter', fontSize: 14, color: '#999', fontWeight: 400 }}
            >
              Keep game
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
