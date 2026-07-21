import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { loadProfile, saveProfile } from '../../lib/sampleWorld';
import { usersApi } from '../../lib/api';

/**
 * Home · the front door.
 *
 * Ringer is a two-sided thing: you either have a game and need to fill it
 * (organise → Gather), or you want a game to drop into (join → Discover).
 * This screen asks that one question and nothing else, so the app opens
 * calm instead of straight into a busy feed. The tab bar underneath still
 * reaches everything else.
 */
export function Home() {
  const navigate = useNavigate();
  const [me, setMe] = useState(loadProfile());

  // Hydrate the greeting name from the real account when signed in
  useEffect(() => {
    usersApi.getMe()
      .then(u => {
        if (!u?.displayName) return;
        saveProfile({ name: u.displayName });
        setMe(loadProfile());
      })
      .catch(() => {});
  }, []);

  const firstName = (me.name || '').trim().split(/\s+/)[0] || 'there';
  const hour = new Date().getHours();
  const partOfDay = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening';
  const timeWord = hour < 12 ? 'today' : hour < 18 ? 'this afternoon' : 'tonight';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100%', padding: '4px 22px 28px' }}>

      {/* Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--rx-green-deep)' }}>
          ringer<span style={{ color: 'var(--rx-green-live)' }}>.</span>
        </div>
        <button
          onClick={() => navigate('/profile')}
          aria-label="You"
          style={{
            width: 32, height: 32, borderRadius: '50%', background: 'var(--rx-card)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: 'var(--rx-green)', cursor: 'pointer',
          }}
        >
          {me.init}
        </button>
      </div>

      {/* Greeting */}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: '0.02em', textTransform: 'uppercase', color: 'var(--rx-faint)' }}>
          {partOfDay}, {firstName}
        </div>
        <h1 style={{ margin: '8px 0 0', fontSize: 27, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.12, color: 'var(--rx-green-deep)' }}>
          What brings you<br />here {timeWord}?
        </h1>
      </div>

      {/* The two intents */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 26 }}>

        {/* Organise · fill a game with ringers */}
        <button
          onClick={() => navigate('/gather')}
          aria-label="Looking for a player · gather your crew"
          style={{
            textAlign: 'left', width: '100%', background: 'var(--rx-green)', color: 'var(--rx-paper)',
            border: 'none', borderRadius: 20, padding: '22px 20px', cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(251,250,247,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="2" />
                <path d="M3.5 19c0-3 2.5-4.8 5.5-4.8s5.5 1.8 5.5 4.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M18 8v6M15 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ opacity: 0.7 }} aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 16 }}>Looking for a player?</div>
          <div style={{ fontSize: 15, lineHeight: 1.45, color: 'rgba(251,250,247,0.82)', marginTop: 6 }}>
            You've got a game. Fill the open spots with people you trust.
          </div>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#B7C9A6', marginTop: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="8.5" cy="10" r="3" stroke="currentColor" strokeWidth="2" /><circle cx="15.5" cy="10" r="3" stroke="currentColor" strokeWidth="2" /></svg>
            Gather your crew
          </div>
        </button>

        {/* Join · find a game near you */}
        <button
          onClick={() => navigate('/discover')}
          aria-label="Looking for a game · discover games nearby"
          style={{
            textAlign: 'left', width: '100%', background: 'var(--rx-paper)', color: 'var(--rx-green-deep)',
            border: '1.5px solid #DED9CE', borderRadius: 20, padding: '22px 20px', cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--rx-green-tint)', color: 'var(--rx-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: '#B0A99B' }} aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 16 }}>Looking for a game?</div>
          <div style={{ fontSize: 15, lineHeight: 1.45, color: 'var(--rx-faint)', marginTop: 6 }}>
            Find a game near you and drop in with your crew.
          </div>
          <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--rx-green)', marginTop: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" /><path d="M15.5 8.5l-2 5-5 2 2-5 5-2Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
            Discover games nearby
          </div>
        </button>

      </div>

      <div style={{ flex: 1 }} />
    </div>
  );
}
