import { useNavigate } from 'react-router';
import signInBg from '../../assets/sign-in-bg.webp';

const FOREST = '#3E5236';
const PAPER  = '#FBFAF7';
const DEEP   = '#2E3A24'; // artwork's deep green · where the bottom gradient lands

/**
 * Signed-out landing · full-bleed "RINGER 7" artwork with a legibility
 * gradient at the base, one line, one obvious action. The jersey carries the
 * brand, so no separate wordmark. Routes into Clerk sign-in / sign-up.
 */
export function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', justifyContent: 'center',
      background: DEEP, color: PAPER,
      fontFamily: "'Schibsted Grotesk', system-ui, sans-serif",
      WebkitFontSmoothing: 'antialiased',
    }}>
      <div style={{
        position: 'relative', width: '100%', maxWidth: 430, minHeight: '100dvh',
        display: 'flex', flexDirection: 'column',
        backgroundColor: DEEP, overflow: 'hidden',
      }}>
        {/* Full-width artwork, top-anchored, faded into the deep-green base */}
        <img
          src={signInBg}
          alt=""
          aria-hidden
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: 'auto',
            WebkitMaskImage: 'linear-gradient(180deg, #000 78%, transparent 100%)',
            maskImage: 'linear-gradient(180deg, #000 78%, transparent 100%)',
            pointerEvents: 'none', userSelect: 'none',
          }}
        />

        {/* Content · bottom-anchored over the artwork */}
        <div style={{
          position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: 'calc(env(safe-area-inset-top) + 40px) 32px calc(env(safe-area-inset-bottom) + 32px)',
        }}>
          <h1 style={{ margin: 0, fontSize: 42, lineHeight: 1.02, fontWeight: 700, letterSpacing: '-0.03em' }}>
            Your game.<br />Your people.
          </h1>
          <div style={{ width: 44, height: 4, borderRadius: 99, background: '#8FB56F', marginTop: 22 }} />

          {/* Actions */}
          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              onClick={() => navigate('/sign-up')}
              aria-label="Create your account"
              style={{
                position: 'relative', width: '100%', background: PAPER, color: FOREST, border: 'none',
                fontFamily: 'inherit', fontSize: 16, fontWeight: 700, padding: '18px 22px', borderRadius: 99,
                cursor: 'pointer', letterSpacing: '-0.01em', textAlign: 'center',
              }}
            >
              Get started
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"
                style={{ position: 'absolute', right: 22, top: '50%', transform: 'translateY(-50%)' }}>
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => navigate('/sign-in')}
              aria-label="Sign in to your account"
              style={{
                width: '100%', background: 'transparent', color: PAPER,
                border: '1px solid rgba(251,250,247,0.4)',
                fontFamily: 'inherit', fontSize: 16, fontWeight: 600, padding: 16, borderRadius: 99,
                cursor: 'pointer', letterSpacing: '-0.01em',
              }}
            >
              I already have an account
            </button>
          </div>
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
