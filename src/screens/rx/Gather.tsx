import { useState } from 'react';
import { GATHER, PEOPLE } from '../../lib/sampleWorld';
import { Avatar } from '../../components/rx/Avatar';

const P = PEOPLE;

// Fixed positions matching the design's ring layout (340×340 canvas)
const CORE_POS = [
  { left: 148, top: 74 }, { left: 216, top: 126 }, { left: 191, top: 208 },
  { left: 105, top: 208 }, { left: 80, top: 126 },
];
const TRUSTED_POS = [
  { left: 254, top: 210 }, { left: 46, top: 210 }, { left: 150, top: 30 },
];
const DISCOVERY_POS = [
  { left: 152, top: 302 }, { left: 22, top: 77 }, { left: 282, top: 77 },
];

export function Gather() {
  const [trusted, setTrusted]     = useState(false);
  const [discovery, setDiscovery] = useState(false);
  const [published, setPublished] = useState(false);

  const count = 5 + (trusted ? 3 : 0) + (discovery ? 2 : 0);
  const subtitle = discovery
    ? 'Your circles are open — trust is doing the inviting.'
    : trusted
    ? 'Your trusted network is in reach.'
    : 'Your core five are in. Reach further if you need to.';

  return (
    <>
      <div className="scr" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '8px 24px 130px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--rx-faint)' }}>
            {GATHER.session}
          </div>
          <h2 style={{ margin: '5px 0 4px', fontSize: 25, fontWeight: 700, letterSpacing: '-0.02em' }}>Who's coming, who's close</h2>
          <div className="serif" style={{ fontSize: 15.5, color: 'var(--rx-muted)', marginBottom: 18 }}>{subtitle}</div>

          {/* CONCENTRIC RINGS */}
          <div style={{ position: 'relative', width: 340, height: 340, margin: '0 auto 8px' }} aria-label={`${count} coming. Core group in. ${trusted ? 'Trusted network invited.' : ''} ${discovery ? 'Open discovery on.' : ''}`}>
            {/* ring borders */}
            <div style={{ position: 'absolute', width: 300, height: 300, left: 20, top: 20, borderRadius: '50%', border: `1px dashed ${discovery ? '#8FB8A4' : '#E2DBCD'}` }} />
            <div style={{ position: 'absolute', width: 240, height: 240, left: 50, top: 50, borderRadius: '50%', border: `1px solid ${trusted ? '#9FCDB6' : '#E7E1D6'}` }} />
            <div style={{ position: 'absolute', width: 148, height: 148, left: 96, top: 96, borderRadius: '50%', border: '1px solid #BFD6C9', background: 'rgba(28,124,84,0.08)' }} />

            {/* ring labels */}
            <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: discovery ? 'var(--rx-green)' : '#B7AE9F' }}>Open discovery</div>
            <div style={{ position: 'absolute', left: 0, right: 0, top: 32, textAlign: 'center', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: trusted ? 'var(--rx-green)' : '#A39A88' }}>Trusted network</div>

            {/* centre count */}
            <div style={{ position: 'absolute', left: 120, top: 120, width: 100, height: 100, borderRadius: '50%', background: 'var(--rx-green)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 30px -8px rgba(28,124,84,0.6)' }}>
              <span style={{ fontSize: 30, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{count}</span>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#C7E6D5', letterSpacing: '0.04em', marginTop: 2 }}>coming</span>
            </div>

            {/* Core avatars */}
            {GATHER.core.map((p, i) => (
              <div key={p.id} style={{ position: 'absolute', ...CORE_POS[i] }}>
                <Avatar person={p} size={44} ring="#FBFAF7" />
              </div>
            ))}

            {/* Trusted avatars */}
            {GATHER.trusted.map(({ person }, i) => (
              <div
                key={person.id}
                style={{
                  position: 'absolute', ...TRUSTED_POS[i],
                  width: 40, height: 40, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 600, transition: 'all .25s ease',
                  ...(trusted
                    ? { border: '2px solid #FBFAF7', background: person.color, color: '#fff' }
                    : { border: '2px dashed #D8D2C7', background: 'rgba(0,0,0,0.03)', color: '#A39A88' }),
                }}
              >
                {person.init}
              </div>
            ))}

            {/* Discovery avatars */}
            {GATHER.discovery.map((p, i) => (
              <div
                key={p.id}
                style={{
                  position: 'absolute', ...DISCOVERY_POS[i],
                  width: 36, height: 36, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 600, transition: 'all .25s ease',
                  ...(discovery
                    ? { border: '2px solid #FBFAF7', background: '#5B7A6E', color: '#fff' }
                    : { border: '2px dashed #E2DBCD', background: 'rgba(0,0,0,0.02)', color: '#B7AE9F' }),
                }}
              >
                {p.init}
              </div>
            ))}
          </div>

          {/* CIRCLE STATUS + REASONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
            {/* Core */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--rx-green-tint)', borderRadius: 16 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--rx-green)', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Core group · 5 in</div>
                <div style={{ fontSize: 12, color: 'var(--rx-faint)' }}>Your regulars, invited every week</div>
              </div>
            </div>

            {/* Trusted */}
            {trusted ? (
              <div style={{ padding: '14px 16px', background: 'var(--rx-card)', borderRadius: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--rx-green)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Trusted network · 3 invited</div>
                    <div style={{ fontSize: 12, color: 'var(--rx-faint)' }}>Not strangers — vouched by your circle</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, paddingLeft: 22 }}>
                  {GATHER.trusted.map(({ person, reason }) => (
                    <div key={person.id} style={{ fontSize: 12.5, color: 'var(--rx-muted)' }}>{reason}</div>
                  ))}
                </div>
              </div>
            ) : (
              <button
                onClick={() => setTrusted(true)}
                aria-label="Expand to your trusted network"
                style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', padding: '14px 16px', background: 'var(--rx-card)', border: 'none', borderRadius: 16, cursor: 'pointer' }}
              >
                <span style={{ width: 26, height: 26, borderRadius: '50%', border: '1.5px solid var(--rx-green)', color: 'var(--rx-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>+</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Reach your trusted network</div>
                  <div style={{ fontSize: 12, color: 'var(--rx-faint)' }}>3 vouched players could complete it</div>
                </div>
              </button>
            )}

            {/* Discovery */}
            {discovery ? (
              <div style={{ padding: '14px 16px', background: 'var(--rx-card)', borderRadius: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', border: '1.5px dashed var(--rx-faint)', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Open discovery · 2 nearby</div>
                    <div style={{ fontSize: 12, color: 'var(--rx-faint)' }}>Widest reach · players near you looking for a game</div>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setDiscovery(true)}
                aria-label="Open to discovery, optional"
                style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', padding: '14px 16px', background: 'none', border: '1px dashed #D8D2C7', borderRadius: 16, cursor: 'pointer' }}
              >
                <span style={{ width: 26, height: 26, borderRadius: '50%', border: '1.5px dashed var(--rx-ghost)', color: 'var(--rx-faint)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>+</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--rx-body)' }}>Open to discovery</div>
                  <div style={{ fontSize: 12, color: 'var(--rx-ghost)' }}>Optional — only if you want the widest reach</div>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Publish CTA */}
      <div style={{ position: 'absolute', bottom: 82, left: 0, right: 0, padding: '16px 20px 14px', background: 'linear-gradient(to top,#FBFAF7 74%,rgba(251,250,247,0))' }}>
        <button
          onClick={() => setPublished(true)}
          aria-label="Publish this week's session"
          style={{ width: '100%', background: 'var(--rx-green)', color: '#fff', border: 'none', fontSize: 17, fontWeight: 700, padding: 17, borderRadius: 99, cursor: 'pointer', boxShadow: '0 14px 30px -12px rgba(28,124,84,0.55)', letterSpacing: '-0.01em' }}
        >
          Publish · {count} coming
        </button>
      </div>

      {/* Publish takeover */}
      {published && (
        <div className="scr" style={{ position: 'absolute', inset: 0, background: 'var(--rx-paper)', zIndex: 20, display: 'flex', flexDirection: 'column', padding: '70px 24px 100px', overflowY: 'auto' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--rx-green-tint)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
            <span style={{ color: 'var(--rx-green)', fontSize: 26 }}>✓</span>
          </div>
          <h3 style={{ margin: '0 0 6px', fontSize: 25, fontWeight: 700, letterSpacing: '-0.02em' }}>Your world's in motion.</h3>
          <div className="serif" style={{ fontSize: 16.5, color: 'var(--rx-muted)', marginBottom: 24 }}>
            Invites rippled outward through trust. Here's what's already back.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
              <Avatar person={P.marcus} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>Marcus accepted</div>
                <div style={{ fontSize: 12.5, color: 'var(--rx-faint)' }}>Core · moments ago</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--rx-green)' }}>In</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
              <Avatar person={P.emma} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>Emma joined</div>
                <div style={{ fontSize: 12.5, color: 'var(--rx-faint)' }}>Trusted · via Marcus</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--rx-green)' }}>In</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
              <Avatar person={P.priya} size={40} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>Priya is checking</div>
                <div style={{ fontSize: 12.5, color: 'var(--rx-faint)' }}>Core · usually replies fast</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--rx-faint)' }}>…</span>
            </div>
          </div>
          <div style={{ marginTop: 24, padding: 18, background: 'var(--rx-card)', borderRadius: 18, fontSize: 14, lineHeight: 1.55, color: 'var(--rx-muted)' }}>
            Every player who joins through trust makes next week's circle stronger — for you and for them.
          </div>
          <button
            onClick={() => setPublished(false)}
            style={{ width: '100%', marginTop: 'auto', background: 'none', border: '1px solid #E4E1DB', fontSize: 14, fontWeight: 600, color: 'var(--rx-body)', cursor: 'pointer', padding: 14, borderRadius: 99 }}
          >
            Adjust the circles
          </button>
        </div>
      )}
    </>
  );
}
