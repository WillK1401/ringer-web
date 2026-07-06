import { useState } from 'react';
import { useNavigate } from 'react-router';
import { PEOPLE } from '../../lib/sampleWorld';
import { Avatar } from '../../components/rx/Avatar';

const P = PEOPLE;

interface Props {
  joined: boolean;
  onJoin: () => void;
  onBack: () => void;
}

const sub = (text: string): React.CSSProperties => ({
  fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
  color: text === 'green' ? 'var(--rx-green)' : 'var(--rx-ghost)', marginBottom: 12,
});

export function GameDetailUnfold({ joined, onJoin, onBack }: Props) {
  const navigate = useNavigate();
  const [attOpen, setAttOpen] = useState(false);
  const [orgOpen, setOrgOpen] = useState(false);

  return (
    <>
      <div className="scr" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '6px 20px 130px' }}>

          <button
            onClick={onBack}
            aria-label="Collapse back to recommendation"
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', fontSize: 12.5, fontWeight: 600, color: '#9C968C', cursor: 'pointer', padding: '6px 0 14px' }}
          >
            ‹ Back to your Wednesday
          </button>

          {/* THE CARD — same card, still open */}
          <div style={{ background: 'var(--rx-card)', borderRadius: 28, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--rx-green)' }}>Your Wednesday football</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--rx-muted)' }}>7:30 PM</span>
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 23, lineHeight: 1.14, fontWeight: 700, letterSpacing: '-0.02em' }}>Week 11 with the regulars</h3>
            <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0 12px' }}>
              <Avatar person={P.marcus} ring="#F3EEE4" style={{ marginRight: -12, zIndex: 5 }} />
              <Avatar person={P.priya}  ring="#F3EEE4" style={{ marginRight: -12, zIndex: 4 }} />
              <Avatar person={P.dan}    ring="#F3EEE4" style={{ marginRight: -12, zIndex: 3 }} />
              <Avatar person={P.sofia}  ring="#F3EEE4" style={{ zIndex: 2 }} />
              {joined && (
                <div style={{ width: 44, height: 44, borderRadius: '50%', border: '2.5px solid #F3EEE4', marginLeft: -12, background: 'var(--rx-green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, zIndex: 1 }}>You</div>
              )}
            </div>
            <div style={{ fontSize: 13, color: 'var(--rx-faint)' }}>
              {joined ? 'You + Marcus, Priya, Dan & Sofia' : 'Marcus hosts · Priya, Dan & Sofia are in'}
            </div>
          </div>

          {/* 1 · PEOPLE */}
          <div style={{ marginTop: 32 }}>
            <h4 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em' }}>Who you'll play with</h4>
            <div className="serif" style={{ fontSize: 16, color: 'var(--rx-muted)', marginBottom: 20 }}>Nine players. You already know four of them.</div>

            <div style={sub('green')}>People you know · 4</div>
            <div style={{ display: 'flex', gap: 14, marginBottom: 22 }}>
              {[P.marcus, P.priya, P.dan, P.sofia].map(p => (
                <div key={p.id} style={{ textAlign: 'center', width: 56 }}>
                  <Avatar person={p} size={52} style={{ margin: '0 auto 6px' }} />
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{p.first}</div>
                </div>
              ))}
            </div>

            <div style={sub('ghost')}>Through your network · 2</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar person={P.emma} size={40} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Emma</div>
                  <div style={{ fontSize: 12.5, color: 'var(--rx-faint)' }}>You're meeting Emma through Priya</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar person={P.raj} size={40} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Raj</div>
                  <div style={{ fontSize: 12.5, color: 'var(--rx-faint)' }}>Dan introduced Raj last month</div>
                </div>
              </div>
            </div>

            {attOpen && (
              <>
                <div style={sub('ghost')}>New to you · 3</div>
                <div style={{ display: 'flex', gap: 14, marginBottom: 8 }}>
                  {[P.mia, P.jonah, P.tyler].map(p => (
                    <div key={p.id} style={{ textAlign: 'center', width: 56 }}>
                      <Avatar person={p} size={48} style={{ margin: '0 auto 6px' }} />
                      <div style={{ fontSize: 12, color: 'var(--rx-muted)' }}>{p.first}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
            <button
              onClick={() => setAttOpen(a => !a)}
              aria-expanded={attOpen}
              style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 600, color: 'var(--rx-green)', cursor: 'pointer', padding: '6px 0' }}
            >
              {attOpen ? 'Hide new players' : 'See all 9 players'}
            </button>
          </div>

          {/* 2 · TRUST */}
          <div style={{ marginTop: 30, paddingTop: 26, borderTop: '1px solid var(--rx-hairline)' }}>
            <h4 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>Why you can trust this game</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                <>This game has run <strong>11 weeks straight</strong> — never once cancelled.</>,
                <>You've played with <strong>Marcus 11 times</strong> this season.</>,
                <><strong>Four of your regulars</strong> are already in.</>,
              ].map((line, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--rx-green)', fontSize: 15, lineHeight: 1.3 }}>✓</span>
                  <span style={{ fontSize: 14.5, lineHeight: 1.4, color: 'var(--rx-ink-soft)' }}>{line}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 3 · BELONGING */}
          <div style={{ marginTop: 30, padding: 22, background: 'var(--rx-card)', borderRadius: 22 }}>
            <h4 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>Why you'll fit in</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                'Matches your usual Wednesday football',
                'Most players are intermediate — your level',
                'Friendly-competitive, never cliquey',
                'Regular post-game pint at the Foxes',
              ].map(line => (
                <div key={line} style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--rx-green)', flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: 'var(--rx-ink-soft)' }}>{line}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4 · HOST */}
          <div style={{ marginTop: 30 }}>
            <div style={sub('ghost')}>Your host</div>
            <button
              onClick={() => navigate('/network', { state: { person: 'marcus' } })}
              aria-label="Open Marcus Bell's sporting world"
              style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <Avatar person={P.marcus} size={52} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>Marcus Bell</div>
                <div style={{ fontSize: 12.5, color: 'var(--rx-faint)' }}>Hosts The Wednesday Regulars</div>
              </div>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--rx-green)', background: 'var(--rx-green-tint)', padding: '5px 9px', borderRadius: 7 }}>Trusted host</span>
            </button>
            <div style={{ display: 'flex', gap: 20, marginTop: 16, padding: '16px 0', borderTop: '1px solid var(--rx-hairline)', borderBottom: '1px solid var(--rx-hairline)' }}>
              <div><div style={{ fontSize: 17, fontWeight: 700 }}>120+</div><div style={{ fontSize: 11.5, color: '#9C968C' }}>games hosted</div></div>
              <div><div style={{ fontSize: 17, fontWeight: 700 }}>100%</div><div style={{ fontSize: 11.5, color: '#9C968C' }}>turned up</div></div>
              <div><div style={{ fontSize: 17, fontWeight: 700 }}>2 yrs</div><div style={{ fontSize: 11.5, color: '#9C968C' }}>every week</div></div>
            </div>
            {orgOpen && (
              <div style={{ marginTop: 14, fontSize: 14, lineHeight: 1.6, color: 'var(--rx-body)' }}>
                Marcus has run Wednesday football at Trinity Bellwoods for two years. He also organises the Saturday Run Club. You and Marcus share <strong>4 regulars</strong>, and Priya has played with him <strong>18 times</strong>.
              </div>
            )}
            <button
              onClick={() => setOrgOpen(o => !o)}
              aria-expanded={orgOpen}
              style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 600, color: 'var(--rx-green)', cursor: 'pointer', padding: '12px 0 0' }}
            >
              {orgOpen ? 'Less about Marcus' : 'More about Marcus'}
            </button>
          </div>

          {/* 5 · ATMOSPHERE */}
          <div style={{ marginTop: 30, paddingTop: 26, borderTop: '1px solid var(--rx-hairline)' }}>
            <h4 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>What it feels like</h4>
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--rx-faint)', marginBottom: 8 }}>
                <span>Social</span><span>Competitive</span>
              </div>
              <div style={{ position: 'relative', height: 6, background: '#EFEAE1', borderRadius: 99 }}>
                <div style={{ position: 'absolute', left: '62%', top: '50%', transform: 'translate(-50%,-50%)', width: 16, height: 16, borderRadius: '50%', background: 'var(--rx-green)', border: '3px solid #FBFAF7', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
              </div>
              <div style={{ fontSize: 12, color: '#9C968C', marginTop: 8 }}>Competitive, but nobody's keeping a league table.</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {['Intermediate level', 'Reliable weekly', 'Post-game drinks', 'Returning players', 'Welcomes newcomers'].map(tag => (
                <span key={tag} style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--rx-ink-soft)', background: 'var(--rx-chip)', borderRadius: 99, padding: '7px 13px' }}>{tag}</span>
              ))}
            </div>
          </div>

          {/* 6 · LOGISTICS */}
          <div style={{ marginTop: 30, paddingTop: 26, borderTop: '1px solid var(--rx-hairline)' }}>
            <div style={{ ...sub('ghost'), marginBottom: 16 }}>The practical bits</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {([
                ['Where', 'Trinity Bellwoods Park'],
                ['Travel', '12 min walk from you'],
                ['When', 'Tonight 7:30–9:00'],
                ['Cost', '$8 · split on arrival'],
                ['Facilities', 'Floodlit · changing rooms'],
              ] as [string, string][]).map(([label, val], i, arr) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid #F1EEE8' : 'none' }}>
                  <span style={{ fontSize: 14, color: 'var(--rx-faint)' }}>{label}</span>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Join — confidence earned first */}
      <div style={{ position: 'absolute', bottom: 'calc(82px + env(safe-area-inset-bottom))', left: 0, right: 0, padding: '16px 20px 14px', background: 'linear-gradient(to top,#FBFAF7 72%,rgba(251,250,247,0))' }}>
        <button
          onClick={onJoin}
          aria-label={joined ? 'You are confirmed. Tap to release your spot.' : 'Join your Wednesday football at 7:30'}
          style={{
            width: '100%', fontSize: 16, fontWeight: 600, padding: 16, borderRadius: 99,
            border: 'none', cursor: 'pointer', transition: 'all .18s ease', letterSpacing: '-0.01em',
            ...(joined
              ? { background: 'var(--rx-green-tint)', color: 'var(--rx-green)' }
              : { background: 'var(--rx-green)', color: '#fff', boxShadow: '0 12px 26px -12px rgba(28,124,84,0.55)' }),
          }}
        >
          {joined ? "You're in  ✓" : 'Join Game'}
        </button>
        <div style={{ textAlign: 'center', fontSize: 12, color: '#9C968C', marginTop: 9 }}>
          {joined ? "See you at 7:30 · we'll add it to your week" : 'You + 4 regulars · 2 spots left'}
        </div>
      </div>
    </>
  );
}
