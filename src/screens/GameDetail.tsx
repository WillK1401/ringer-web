import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { loadStripe } from '@stripe/stripe-js';
import { gamesApi, usersApi } from '../lib/api';
import { GameDetailSkeleton } from '../components/rx/Skeleton';
import { formatDate, formatTime } from '../lib/utils';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

type State = 'idle' | 'paying' | 'success' | 'error' | 'cancelling';

const eyebrow: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
  color: 'var(--rx-ghost)', marginBottom: 14,
};
const h4: React.CSSProperties = { margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' };

function initials(name?: string): string {
  if (!name) return '?';
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
}

export function GameDetail() {
  const navigate = useNavigate();
  const { id }   = useParams<{ id: string }>();
  const [data,       setData]       = useState<{ game: any; players: any[]; guests?: any[] } | null>(null);
  const [myProfile,  setMyProfile]  = useState<any>(null);
  const [organiser,  setOrganiser]  = useState<any>(null);
  const [loading,    setLoading]    = useState(true);
  const [state,      setState]      = useState<State>('idle');
  const [errorMsg,   setErrorMsg]   = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Guest form
  const [guestOpen,  setGuestOpen]  = useState(false);
  const [guestName,  setGuestName]  = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestBusy,  setGuestBusy]  = useState(false);

  const refresh = () => id && gamesApi.getGame(id).then(setData).catch(() => {});

  useEffect(() => {
    if (!id) return;
    Promise.all([gamesApi.getGame(id), usersApi.getMe().catch(() => null)])
      .then(([gameData, profile]) => {
        setData(gameData);
        setMyProfile(profile);
        if (gameData?.game?.organiserId) usersApi.getUser(gameData.game.organiserId).then(setOrganiser).catch(() => {});
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleClaim = async () => {
    if (!id || !data) return;
    setState('paying'); setErrorMsg('');
    try {
      const res = await gamesApi.joinGame(id);
      const { clientSecret } = res.payment || {};
      if (clientSecret) {
        const stripe = await stripePromise;
        if (!stripe) throw new Error('Stripe not loaded');
        const { error } = await stripe.confirmPayment({ clientSecret, confirmParams: { return_url: `${window.location.origin}/game/${id}?success=1` } });
        if (error) throw new Error(error.message);
      }
      setState('success');
    } catch (e: any) { setState('error'); setErrorMsg(e.message || 'Something went wrong'); }
  };

  const handleCancel = async () => {
    if (!id) return;
    setState('cancelling'); setErrorMsg('');
    try {
      await gamesApi.cancelGame(id, cancelReason || undefined);
      navigate('/', { replace: true });
    } catch (e: any) { setState('idle'); setErrorMsg(e.message || 'Failed to cancel game'); setShowCancel(false); }
  };

  const addGuest = async () => {
    if (!id || !guestName.trim()) return;
    setGuestBusy(true);
    try {
      await gamesApi.addGuest(id, guestName.trim(), guestPhone.trim() || undefined);
      setGuestName(''); setGuestPhone(''); setGuestOpen(false);
      refresh();
    } catch (e: any) { setErrorMsg(e.message || 'Could not add guest'); }
    finally { setGuestBusy(false); }
  };

  const dropGuest = async (guestId: string) => {
    if (!id) return;
    await gamesApi.removeGuest(id, guestId).catch(() => {});
    refresh();
  };

  if (loading) return <GameDetailSkeleton />;

  if (state === 'success') {
    return (
      <div className="scr" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 32px', textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--rx-green-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
          <span style={{ color: 'var(--rx-green)', fontSize: 28 }}>✓</span>
        </div>
        <h1 style={{ margin: '0 0 8px', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>You're in</h1>
        <div className="serif" style={{ fontSize: 16, color: 'var(--rx-muted)', marginBottom: 32 }}>Your spot is secured. See you out there.</div>
        <button onClick={() => navigate('/activity')} style={{ background: 'var(--rx-green)', color: '#fff', border: 'none', fontSize: 16, fontWeight: 600, padding: '15px 32px', borderRadius: 99, cursor: 'pointer' }}>Open in Activity</button>
        <button onClick={() => navigate('/')} style={{ marginTop: 14, background: 'none', border: 'none', fontSize: 14, color: 'var(--rx-faint)', cursor: 'pointer' }}>Back to Discover</button>
      </div>
    );
  }

  const game        = data?.game;
  const players     = (data?.players ?? []).filter((p) => p.status === 'confirmed');
  const guests      = data?.guests ?? [];
  const totalSlots  = game?.playerCount ?? 10;
  const filled      = players.length + guests.length + 1; // + organiser
  const open        = Math.max(0, totalSlots - filled);
  const pricePence  = game?.costPerPlayer ?? 0;
  const priceStr    = (p: number) => `£${(p / 100).toFixed(2)}`;

  const isOrganiser = myProfile?.id && game?.organiserId && String(myProfile.id) === String(game.organiserId);
  const alreadyIn   = players.some((p) => myProfile?.id && String(p.userId) === String(myProfile.id));

  // Guests are covered by the organiser's cost.
  const yourCost = isOrganiser ? pricePence * (1 + guests.length) : pricePence;

  // Build the squad grid: organiser, confirmed players, guests, then open slots
  const squad = [
    { key: 'org', label: isOrganiser ? 'You' : (organiser?.displayName?.split(' ')[0] ?? 'Host'), init: isOrganiser ? 'You' : initials(organiser?.displayName), kind: 'org' as const },
    ...players.map((p: any) => ({ key: p.id, label: p.displayName?.split(' ')[0] ?? '?', init: initials(p.displayName), kind: 'player' as const })),
    ...guests.map((g: any) => ({ key: g.id, label: g.name.split(' ')[0], init: initials(g.name), kind: 'guest' as const, guestId: g.id })),
    ...Array.from({ length: open }, (_, i) => ({ key: `open-${i}`, label: 'Open', init: '', kind: 'open' as const })),
  ].slice(0, totalSlots);

  return (
    <div className="scr" style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '6px 24px 130px' }}>
        {/* Back + actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 18 }}>
          <button onClick={() => navigate(-1)} aria-label="Back" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', fontSize: 12.5, fontWeight: 600, color: '#726D64', cursor: 'pointer', padding: '6px 0' }}>‹ Back</button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => navigate(`/activity`)} style={{ padding: '8px 14px', borderRadius: 99, background: 'var(--rx-green-tint)', border: 'none', fontSize: 13, fontWeight: 600, color: 'var(--rx-green)', cursor: 'pointer' }}>Chat</button>
            {isOrganiser && (
              <button onClick={() => setShowCancel(true)} style={{ padding: '8px 14px', borderRadius: 99, background: 'rgba(194,90,78,0.10)', border: 'none', fontSize: 13, fontWeight: 600, color: 'var(--rx-error)', cursor: 'pointer' }}>Cancel</button>
            )}
          </div>
        </div>

        {/* Hero */}
        <h1 style={{ margin: '0 0 10px', fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 }}>{game?.venue ?? '—'}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--rx-green)', background: 'var(--rx-green-tint)', padding: '4px 12px', borderRadius: 99 }}>{game?.sport ?? game?.format ?? '5-a-side'}</span>
          <span style={{ fontSize: 13, color: 'var(--rx-faint)' }}>{game?.kickoffAt ? `${formatDate(game.kickoffAt)} · ${formatTime(game.kickoffAt)}` : ''}</span>
        </div>

        {/* Info cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 36 }}>
          {([
            ['Date',    game?.kickoffAt ? formatDate(game.kickoffAt) : '—'],
            ['Kickoff', game?.kickoffAt ? formatTime(game.kickoffAt) : '—'],
            ['Cost',    pricePence > 0 ? priceStr(pricePence) : 'Free'],
          ] as [string, string][]).map(([label, val]) => (
            <div key={label} style={{ padding: '14px 16px', borderRadius: 16, background: 'var(--rx-card)' }}>
              <div style={{ fontSize: 12, color: 'var(--rx-faint)', marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{val}</div>
            </div>
          ))}
        </div>

        {/* Organiser trust panel */}
        {!isOrganiser && (
          <div style={{ marginBottom: 36 }}>
            <div style={eyebrow}>Your host</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', borderRadius: 18, background: 'var(--rx-card)' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--rx-clay)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, flexShrink: 0 }}>{initials(organiser?.displayName)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15.5, fontWeight: 600 }}>{organiser?.displayName ?? 'Organiser'}</div>
                <div style={{ fontSize: 12.5, color: 'var(--rx-faint)' }}>{organiser?.handle ? `@${organiser.handle}` : 'Hosting this game'}</div>
              </div>
              {organiser?.stripeOnboarded && <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--rx-green)', background: 'var(--rx-green-tint)', padding: '5px 10px', borderRadius: 7 }}>Trusted host</span>}
            </div>
          </div>
        )}

        {/* Squad */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <h4 style={h4}>Squad</h4>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--rx-green)', background: 'var(--rx-green-tint)', padding: '3px 10px', borderRadius: 99 }}>{filled}/{totalSlots}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))', gap: 16 }}>
            {squad.map((p) => {
              const isOpenSlot = p.kind === 'open';
              const isGuest = p.kind === 'guest';
              return (
                <div key={p.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  {isOpenSlot && isOrganiser ? (
                    <button
                      onClick={() => setGuestOpen(true)}
                      aria-label="Add a guest to fill this slot"
                      style={{ width: 52, height: 52, borderRadius: '50%', border: '1.5px dashed var(--rx-green)', background: 'none', color: 'var(--rx-green)', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >+</button>
                  ) : (
                    <div style={{
                      width: 52, height: 52, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 600, position: 'relative',
                      ...(p.kind === 'org'
                        ? { background: 'var(--rx-green)', color: '#fff' }
                        : isGuest
                        ? { background: 'var(--rx-chip)', color: 'var(--rx-ink-soft)', border: '1.5px dashed #C9C2B4' }
                        : isOpenSlot
                        ? { border: '1.5px dashed #C9C2B4' }
                        : { background: 'rgba(62,82,54,0.12)', color: 'var(--rx-green)' }),
                    }}>
                      {!isOpenSlot && p.init}
                      {isGuest && isOrganiser && (
                        <button onClick={() => dropGuest((p as any).guestId)} aria-label={`Remove ${p.label}`} style={{ position: 'absolute', top: -4, right: -4, width: 18, height: 18, borderRadius: '50%', background: 'var(--rx-error)', color: '#fff', border: '2px solid var(--rx-paper)', fontSize: 10, lineHeight: 1, cursor: 'pointer', padding: 0 }}>×</button>
                      )}
                    </div>
                  )}
                  <span style={{ fontSize: 11, color: isOpenSlot ? '#bbb' : 'var(--rx-body)', textAlign: 'center', lineHeight: 1.3 }}>
                    {p.kind === 'org' && isOrganiser ? 'You' : p.label}
                    {isGuest && <span style={{ display: 'block', fontSize: 9.5, color: 'var(--rx-ghost)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Guest</span>}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Guest inline form */}
          {guestOpen && isOrganiser && (
            <div style={{ marginTop: 20, padding: 16, borderRadius: 18, border: '1px solid #EEEAE3', background: '#fff' }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Add a guest</div>
              <div style={{ fontSize: 12.5, color: 'var(--rx-faint)', marginBottom: 12 }}>Someone not on Ringer. They fill a slot; you cover their share.</div>
              <input autoFocus value={guestName} onChange={e => setGuestName(e.target.value)} placeholder="Name" aria-label="Guest name" maxLength={60}
                style={{ width: '100%', fontSize: 15, fontFamily: 'inherit', padding: '12px 14px', borderRadius: 12, border: '1px solid #E7E2D9', background: '#fff', color: 'var(--rx-ink)', outline: 'none', marginBottom: 10 }} />
              <input value={guestPhone} onChange={e => setGuestPhone(e.target.value)} placeholder="Phone (optional)" aria-label="Guest phone" inputMode="tel" maxLength={30}
                style={{ width: '100%', fontSize: 15, fontFamily: 'inherit', padding: '12px 14px', borderRadius: 12, border: '1px solid #E7E2D9', background: '#fff', color: 'var(--rx-ink)', outline: 'none', marginBottom: 12 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={addGuest} disabled={!guestName.trim() || guestBusy} style={{ flex: 1, background: guestName.trim() ? 'var(--rx-green)' : '#E4DFD5', color: guestName.trim() ? '#fff' : '#7C7669', border: 'none', fontSize: 14, fontWeight: 600, padding: 12, borderRadius: 99, cursor: guestName.trim() ? 'pointer' : 'default' }}>{guestBusy ? 'Adding…' : 'Add guest'}</button>
                <button onClick={() => { setGuestOpen(false); setGuestName(''); setGuestPhone(''); }} style={{ flex: 1, background: 'none', border: '1px solid #E2DED7', color: 'var(--rx-body)', fontSize: 14, fontWeight: 600, padding: 12, borderRadius: 99, cursor: 'pointer' }}>Cancel</button>
              </div>
            </div>
          )}
        </div>

        {/* Cost */}
        {pricePence > 0 && (
          <div style={{ marginBottom: 36 }}>
            <div style={eyebrow}>Cost</div>
            <div style={{ borderRadius: 18, background: 'var(--rx-card)', overflow: 'hidden' }}>
              <div style={{ padding: '15px 18px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                <span style={{ fontSize: 14, color: 'var(--rx-muted)' }}>Per player</span>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{priceStr(pricePence)}</span>
              </div>
              {isOrganiser && guests.length > 0 && (
                <div style={{ padding: '15px 18px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <span style={{ fontSize: 14, color: 'var(--rx-muted)' }}>{guests.length} guest{guests.length === 1 ? '' : 's'} (you cover)</span>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{priceStr(pricePence * guests.length)}</span>
                </div>
              )}
              <div style={{ padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>Your cost</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--rx-green)', letterSpacing: '-0.02em' }}>{priceStr(yourCost)}</span>
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div role="alert" style={{ marginBottom: 16, padding: '12px 16px', borderRadius: 12, background: 'rgba(194,90,78,0.08)', fontSize: 13, color: 'var(--rx-error)' }}>{errorMsg}</div>
        )}

        {/* CTA */}
        {isOrganiser ? (
          <div style={{ padding: '16px 24px', borderRadius: 99, background: 'var(--rx-green-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <span style={{ color: 'var(--rx-green)' }}>✓</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--rx-green)' }}>You're organising this game</span>
          </div>
        ) : alreadyIn ? (
          <div style={{ padding: '16px 24px', borderRadius: 99, background: 'var(--rx-green-tint)', textAlign: 'center', fontSize: 15, fontWeight: 600, color: 'var(--rx-green)' }}>You're in ✓</div>
        ) : open > 0 ? (
          <button onClick={handleClaim} disabled={state === 'paying'} style={{ width: '100%', minHeight: 56, background: 'var(--rx-green)', color: '#fff', border: 'none', fontSize: 16, fontWeight: 600, borderRadius: 99, cursor: state === 'paying' ? 'wait' : 'pointer', opacity: state === 'paying' ? 0.6 : 1 }}>
            {state === 'paying' ? 'Processing…' : pricePence > 0 ? `Claim spot · ${priceStr(pricePence)}` : 'Claim spot'}
          </button>
        ) : (
          <div style={{ padding: '16px 24px', borderRadius: 99, background: 'rgba(0,0,0,0.05)', textAlign: 'center', fontSize: 15, color: 'var(--rx-faint)' }}>This game is full</div>
        )}
      </div>

      {/* Cancel sheet */}
      {showCancel && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 30 }}>
          <div style={{ width: '100%', maxWidth: 430, background: 'var(--rx-paper)', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 'calc(24px + env(safe-area-inset-bottom))' }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Cancel this game?</h2>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--rx-muted)', lineHeight: 1.6 }}>Everyone confirmed is refunded automatically. This can't be undone.</p>
            <input value={cancelReason} onChange={e => setCancelReason(e.target.value)} placeholder="Reason (optional)" style={{ width: '100%', padding: '13px 16px', borderRadius: 12, background: '#fff', border: '1px solid #E7E2D9', fontSize: 15, color: 'var(--rx-ink)', outline: 'none', marginBottom: 16 }} />
            <button onClick={handleCancel} disabled={state === 'cancelling'} style={{ width: '100%', background: 'var(--rx-error)', color: '#fff', border: 'none', fontSize: 16, fontWeight: 600, padding: 15, borderRadius: 99, cursor: 'pointer', marginBottom: 10 }}>{state === 'cancelling' ? 'Cancelling…' : 'Yes, cancel game'}</button>
            <button onClick={() => setShowCancel(false)} style={{ width: '100%', background: 'none', border: 'none', fontSize: 14, fontWeight: 600, color: 'var(--rx-muted)', padding: 10, cursor: 'pointer' }}>Keep game</button>
          </div>
        </div>
      )}
    </div>
  );
}
