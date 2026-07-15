import { useNavigate } from 'react-router';

const FOREST = '#3E5236';
const PAPER  = '#FBFAF7';

/**
 * Signed-out landing · a full-bleed forest-green splash in the Seed idiom:
 * one wordmark, one line, one obvious action. Routes into Clerk's hosted
 * sign-in / sign-up.
 */
export function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', justifyContent: 'center',
      background: FOREST, color: PAPER,
      fontFamily: "'Schibsted Grotesk', system-ui, sans-serif",
      WebkitFontSmoothing: 'antialiased',
    }}>
      <div style={{
        position: 'relative', width: '100%', maxWidth: 430,
        display: 'flex', flexDirection: 'column',
        padding: 'calc(env(safe-area-inset-top) + 40px) 32px calc(env(safe-area-inset-bottom) + 32px)',
        overflow: 'hidden',
      }}>
        {/* Faint concentric-circle motif · the trust circles, at rest */}
        <div aria-hidden style={{
          position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 520, height: 520, borderRadius: '50%',
          border: '1px solid rgba(251,250,247,0.06)',
        }}>
          <div style={{ position: 'absolute', inset: 90, borderRadius: '50%', border: '1px solid rgba(251,250,247,0.08)' }} />
          <div style={{ position: 'absolute', inset: 180, borderRadius: '50%', border: '1px solid rgba(251,250,247,0.10)' }} />
        </div>

        {/* Wordmark */}
        <div style={{ position: 'relative', fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em' }}>
          ringer<span style={{ color: '#8FB56F' }}>.</span>
        </div>

        {/* Value proposition · centred */}
        <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ margin: 0, fontSize: 40, lineHeight: 1.08, fontWeight: 700, letterSpacing: '-0.03em', maxWidth: 320 }}>
            Keep playing with the people who matter.
          </h1>
          <p className="serif" style={{
            marginTop: 18, fontFamily: "'Newsreader', Georgia, serif", fontStyle: 'italic',
            fontSize: 18, lineHeight: 1.5, color: 'rgba(251,250,247,0.75)', maxWidth: 300,
          }}>
            Find your game, gather your crew, and grow a sporting life through the people you trust.
          </p>
        </div>

        {/* Actions */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={() => navigate('/sign-up')}
            aria-label="Create your account"
            style={{
              width: '100%', background: PAPER, color: FOREST, border: 'none',
              fontFamily: 'inherit', fontSize: 16, fontWeight: 700, padding: 17, borderRadius: 99,
              cursor: 'pointer', letterSpacing: '-0.01em',
            }}
          >
            Get started
          </button>
          <button
            onClick={() => navigate('/sign-in')}
            aria-label="Sign in to your account"
            style={{
              width: '100%', background: 'transparent', color: PAPER,
              border: '1px solid rgba(251,250,247,0.35)',
              fontFamily: 'inherit', fontSize: 16, fontWeight: 600, padding: 16, borderRadius: 99,
              cursor: 'pointer', letterSpacing: '-0.01em',
            }}
          >
            I already have an account
          </button>
        </div>
      </div>
    </div>
  );
}

/** Branded splash shown while Clerk boots · avoids a white flash on cold load. */
export function Splash() {
  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: FOREST, color: PAPER,
      fontFamily: "'Schibsted Grotesk', system-ui, sans-serif",
    }}>
      <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>
        ringer<span style={{ color: '#8FB56F', animation: 'rxPulse 1.2s ease-in-out infinite' }}>.</span>
      </div>
      <style>{`@keyframes rxPulse { 0%,100% { opacity: 1 } 50% { opacity: 0.35 } }`}</style>
    </div>
  );
}
