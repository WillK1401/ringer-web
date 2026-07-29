import { useEffect, useState } from 'react';
import { invitesApi } from '../../lib/api';

const PENDING_CODE_KEY = 'rx-pending-invite';

/** Stash a code from a /join/:code link so it survives the sign-up round trip. */
export function savePendingInvite(code: string) {
  try { localStorage.setItem(PENDING_CODE_KEY, code); } catch { /* private mode */ }
}
export function loadPendingInvite(): string {
  try { return localStorage.getItem(PENDING_CODE_KEY) || ''; } catch { return ''; }
}
export function clearPendingInvite() {
  try { localStorage.removeItem(PENDING_CODE_KEY); } catch { /* no-op */ }
}

/**
 * Shown to a signed-in account that has not redeemed an invite yet.
 *
 * Ringer is invite only: arriving without a connection means an empty app, so
 * the code is what attaches you to the person who brought you in.
 */
export function InviteGate({ onAdmitted }: { onAdmitted: () => void }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // A /join/:code link fills this in automatically
  useEffect(() => {
    const pending = loadPendingInvite();
    if (pending) setCode(pending);
  }, []);

  const submit = async () => {
    const value = code.trim();
    if (value.length < 4) { setError('Enter the code you were sent.'); return; }
    setBusy(true);
    setError('');
    try {
      await invitesApi.redeem(value);
      clearPendingInvite();
      onAdmitted();
    } catch (e: any) {
      setError(/not recognised|INVALID_CODE/i.test(e?.message ?? '')
        ? "That code wasn't recognised · check it and try again."
        : /own invite/i.test(e?.message ?? '')
          ? 'That is your own code · ask the person who invited you for theirs.'
          : 'Could not check that code · try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    // `rx` scopes the design tokens · this screen renders outside the app shell
    <div className="rx" style={{
      minHeight: '100dvh', display: 'flex', justifyContent: 'center',
      background: 'var(--rx-paper)', fontFamily: "'Schibsted Grotesk', system-ui, sans-serif",
    }}>
      <div style={{
        width: '100%', maxWidth: 430, display: 'flex', flexDirection: 'column',
        padding: 'calc(env(safe-area-inset-top) + 40px) 32px calc(env(safe-area-inset-bottom) + 32px)',
      }}>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--rx-green-deep)' }}>
          ringer<span style={{ color: 'var(--rx-green-live)' }}>.</span>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1, color: 'var(--rx-green-deep)' }}>
            Ringer is invite only.
          </h1>
          <p style={{ marginTop: 14, fontSize: 15.5, lineHeight: 1.5, color: 'var(--rx-faint)' }}>
            Games are only visible to people you are connected to, so you need a
            code from someone already playing. It connects you to them straight away.
          </p>

          <label htmlFor="invite-code" style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--rx-ghost)', marginTop: 32, marginBottom: 8, display: 'block' }}>
            Invite code
          </label>
          <input
            id="invite-code"
            value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setError(''); }}
            onKeyDown={e => { if (e.key === 'Enter') submit(); }}
            placeholder="ABC1234"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            style={{
              width: '100%', fontSize: 20, fontWeight: 600, letterSpacing: '0.12em',
              fontFamily: 'inherit', padding: '15px 18px', borderRadius: 14,
              border: '1px solid #E7E2D9', background: '#fff', color: 'var(--rx-ink)', outline: 'none',
            }}
          />

          {error && (
            <div role="alert" style={{ fontSize: 13, color: 'var(--rx-error)', marginTop: 10 }}>{error}</div>
          )}

          <button
            onClick={submit}
            disabled={busy}
            aria-label="Join with this invite code"
            style={{
              width: '100%', marginTop: 18, background: 'var(--rx-green)', color: '#fff', border: 'none',
              fontFamily: 'inherit', fontSize: 16, fontWeight: 700, padding: 17, borderRadius: 99,
              cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1, letterSpacing: '-0.01em',
            }}
          >
            {busy ? 'Checking…' : 'Join Ringer'}
          </button>
        </div>

        <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--rx-ghost)', textAlign: 'center' }}>
          No code? Ask whoever you play with · every member has one to share.
        </div>
      </div>
    </div>
  );
}
