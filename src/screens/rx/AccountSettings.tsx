import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth, useUser } from '@clerk/clerk-react';
import { paymentsApi } from '../../lib/api';

const eyebrow: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
  color: 'var(--rx-ghost)', marginBottom: 12,
};

const row: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left',
  background: '#fff', border: '1px solid #EEEAE3', borderRadius: 16, padding: 16,
};

export function AccountSettings() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { user } = useUser();
  const [stripe, setStripe]   = useState<{ onboarded: boolean; chargesEnabled: boolean } | null>(null);
  const [busy, setBusy]       = useState(false);

  useEffect(() => {
    paymentsApi.getStatus().then(setStripe).catch(() => setStripe(null));
  }, []);

  const connectStripe = async () => {
    setBusy(true);
    try {
      const { onboardingUrl } = await paymentsApi.startOnboarding();
      window.location.href = onboardingUrl;
    } catch {
      setBusy(false);
    }
  };

  const email = user?.primaryEmailAddress?.emailAddress ?? '';

  return (
    <div className="scr" style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '6px 24px 120px' }}>
        <button
          onClick={() => navigate('/profile/edit')}
          aria-label="Back to edit profile"
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', fontSize: 12.5, fontWeight: 600, color: '#9C968C', cursor: 'pointer', padding: '6px 0 14px' }}
        >
          ‹ Edit profile
        </button>

        <h2 style={{ margin: '0 0 4px', fontSize: 25, fontWeight: 700, letterSpacing: '-0.02em' }}>Payments &amp; account</h2>
        <div className="serif" style={{ fontSize: 15.5, color: 'var(--rx-muted)', marginBottom: 30 }}>
          The practical bits — how you get paid, and how you sign out.
        </div>

        {/* PAYMENTS */}
        <div style={eyebrow}>Getting paid</div>
        <div style={{ ...row, flexDirection: 'column', alignItems: 'stretch', gap: 14, marginBottom: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
              background: stripe?.chargesEnabled ? 'var(--rx-green-live)' : stripe?.onboarded ? '#D9A441' : '#C2BBB0',
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>
                {stripe === null ? 'Stripe' : stripe.chargesEnabled ? 'Stripe connected' : stripe.onboarded ? 'Stripe — finishing setup' : 'Stripe not connected'}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--rx-faint)', marginTop: 2 }}>
                {stripe?.chargesEnabled
                  ? 'You can host paid games and receive payouts.'
                  : 'Connect Stripe to charge for games. Free games need nothing.'}
              </div>
            </div>
          </div>
          {!stripe?.chargesEnabled && (
            <button
              onClick={connectStripe}
              disabled={busy}
              aria-label="Connect or manage Stripe"
              style={{ width: '100%', background: 'var(--rx-green)', color: '#fff', border: 'none', fontSize: 15, fontWeight: 600, padding: 14, borderRadius: 99, cursor: busy ? 'wait' : 'pointer', opacity: busy ? 0.7 : 1, letterSpacing: '-0.01em' }}
            >
              {busy ? 'Opening Stripe…' : stripe?.onboarded ? 'Finish Stripe setup' : 'Connect Stripe'}
            </button>
          )}
        </div>

        {/* ACCOUNT */}
        <div style={eyebrow}>Account</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 30 }}>
          {email && (
            <div style={row}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>Signed in as</div>
                <div style={{ fontSize: 12.5, color: 'var(--rx-faint)', marginTop: 2 }}>{email}</div>
              </div>
            </div>
          )}
          <button
            onClick={() => signOut().then(() => navigate('/'))}
            aria-label="Sign out"
            style={{ ...row, cursor: 'pointer', justifyContent: 'center', color: 'var(--rx-error)', fontWeight: 600, fontSize: 15 }}
          >
            Sign out
          </button>
        </div>

        <div style={{ fontSize: 12, color: 'var(--rx-ghost)', textAlign: 'center' }}>
          Ringer · your sporting life, in good company
        </div>
      </div>
    </div>
  );
}
