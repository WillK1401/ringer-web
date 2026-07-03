import { useState } from 'react';
import { useLocation } from 'react-router';
import { ACTIVE_NOW, CIRCLE, WORLDS, PEOPLE } from '../../lib/sampleWorld';
import { Avatar } from '../../components/rx/Avatar';

const SUGGESTIONS = [
  { person: PEOPLE.emma,   reason: 'Played alongside you twice · trusted by Marcus' },
  { person: PEOPLE.sam,    reason: 'Plays with Priya every Thursday · 4 mutuals' },
  { person: PEOPLE.jordan, reason: 'In The Wednesday Regulars · looking for football' },
];

export function Network() {
  const location = useLocation();
  const initialSel = (location.state as { person?: string } | null)?.person ?? null;
  const [sel, setSel] = useState<string | null>(initialSel && WORLDS[initialSel] ? initialSel : null);
  const [connected, setConnected] = useState<Set<string>>(new Set());
  const [inviteSent, setInviteSent] = useState(false);
  const world = sel ? WORLDS[sel] : null;

  const connect = (id: string) => setConnected(prev => new Set(prev).add(id));

  if (world) {
    const p = world.person;
    return (
      <div className="scr" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '6px 24px 120px' }}>
          <button
            onClick={() => setSel(null)}
            aria-label="Back to your circle"
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', fontSize: 12.5, fontWeight: 600, color: '#9C968C', cursor: 'pointer', padding: '6px 0 20px' }}
          >
            ‹ Your circle
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
            <Avatar person={p} size={76} live={p.live} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--rx-ghost)' }}>{world.role}</div>
              <div style={{ fontSize: 25, fontWeight: 700, letterSpacing: '-0.02em' }}>{world.person.name}</div>
            </div>
          </div>

          {world.nowLine && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12.5, fontWeight: 600, color: 'var(--rx-green)', background: 'var(--rx-green-tint)', padding: '7px 13px', borderRadius: 99, marginBottom: 18 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3FBF77' }} />
              {world.nowLine}
            </div>
          )}

          <div className="serif" style={{ fontSize: 18, lineHeight: 1.45, color: 'var(--rx-body)', marginBottom: 22 }}>{world.story}</div>

          {/* History as routine */}
          <div style={{ display: 'flex', marginBottom: 26, borderTop: '1px solid var(--rx-hairline)', borderBottom: '1px solid var(--rx-hairline)' }}>
            <div style={{ flex: 1, padding: '16px 0' }}>
              <div style={{ fontSize: 19, fontWeight: 700 }}>{world.games}</div>
              <div style={{ fontSize: 11.5, color: '#9C968C' }}>played together</div>
            </div>
            <div style={{ flex: 1, padding: '16px 0 16px 16px', borderLeft: '1px solid var(--rx-hairline)' }}>
              <div style={{ fontSize: 19, fontWeight: 700 }}>{world.since}</div>
              <div style={{ fontSize: 11.5, color: '#9C968C' }}>since</div>
            </div>
            <div style={{ flex: 1, padding: '16px 0 16px 16px', borderLeft: '1px solid var(--rx-hairline)' }}>
              <div style={{ fontSize: 19, fontWeight: 700 }}>{world.usual}</div>
              <div style={{ fontSize: 11.5, color: '#9C968C' }}>usually</div>
            </div>
          </div>

          {/* Between you — reciprocity */}
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--rx-ghost)', marginBottom: 14 }}>Between you</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 26 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--rx-panel)', borderRadius: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--rx-green)', flexShrink: 0 }}>You →</span>
              <span style={{ fontSize: 13.5, lineHeight: 1.4, color: 'var(--rx-ink-soft)' }}>{world.youToThem}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--rx-panel)', borderRadius: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--rx-clay)', flexShrink: 0 }}>→ You</span>
              <span style={{ fontSize: 13.5, lineHeight: 1.4, color: 'var(--rx-ink-soft)' }}>{world.themToYou}</span>
            </div>
          </div>

          {/* Plays */}
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--rx-ghost)', marginBottom: 14 }}>Plays</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 26 }}>
            {world.sports.map(s => (
              <span key={s} style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--rx-ink-soft)', background: 'var(--rx-chip)', borderRadius: 99, padding: '7px 13px' }}>{s}</span>
            ))}
          </div>

          {/* People you've both met */}
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--rx-ghost)', marginBottom: 14 }}>People you've both met</div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
            {world.shared.map(m => (
              <Avatar key={m.id} person={m} size={44} ring="#FBFAF7" style={{ marginRight: -12 }} />
            ))}
            <span style={{ fontSize: 13, color: 'var(--rx-faint)', marginLeft: 22 }}>{world.sharedLabel}</span>
          </div>

          {/* Next time */}
          <div style={{ padding: 20, background: 'var(--rx-green-deep)', borderRadius: 22, marginBottom: 24 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#8C857A', marginBottom: 10 }}>
              Next time you'll see {world.person.first}
            </div>
            <div style={{ fontSize: 16.5, fontWeight: 600, color: '#F7F3EB', letterSpacing: '-0.01em' }}>{world.future}</div>
            <div style={{ fontSize: 13, color: '#9C958A', marginTop: 4 }}>{world.futureSub}</div>
          </div>

          {/* How you met */}
          <div style={{ padding: 20, background: 'var(--rx-card)', borderRadius: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--rx-green)', marginBottom: 8 }}>How you met</div>
            <div className="serif" style={{ fontSize: 16.5, lineHeight: 1.5, color: 'var(--rx-ink-soft)' }}>{world.metStory}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scr" style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '6px 24px 120px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--rx-ghost)' }}>Your people</div>
        <h2 style={{ margin: '5px 0 22px', fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>Your sporting circle.</h2>

        {/* RIGHT NOW */}
        <div style={{ background: 'var(--rx-green)', borderRadius: 24, padding: 20, marginBottom: 30 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#CFE9DB', marginBottom: 16 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#F7F3EB' }} />
            Right now
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {ACTIVE_NOW.map((e, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <Avatar person={e.person} size={40} />
                  <span style={{ position: 'absolute', bottom: -1, right: -1, width: 12, height: 12, borderRadius: '50%', background: '#F7F3EB', border: '2.5px solid #1C7C54' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, lineHeight: 1.35, color: '#fff' }}>{e.text}</div>
                  <div style={{ fontSize: 12, color: '#CFE9DB', marginTop: 2 }}>{e.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* THE CIRCLE */}
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--rx-green)', marginBottom: 6 }}>
          The people who show up
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {CIRCLE.map(row => {
            const person = WORLDS[row.id].person;
            return (
              <button
                key={row.id}
                onClick={() => setSel(row.id)}
                aria-label={`Open ${row.name}'s sporting world`}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 15, width: '100%', textAlign: 'left',
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '18px 0', borderTop: '1px solid var(--rx-hairline)',
                }}
              >
                <Avatar person={person} size={54} live={row.live} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 16.5, fontWeight: 600, letterSpacing: '-0.01em' }}>{row.name}</span>
                    <span style={{ fontSize: 12.5, color: 'var(--rx-ghost)' }}>{row.role}</span>
                  </div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.4, color: 'var(--rx-muted)' }}>{row.history}</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 600, color: 'var(--rx-green)', marginTop: 8 }}>
                    ⇄ {row.reciprocity}
                  </div>
                </div>
                {row.nowChip && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--rx-clay)', background: '#F6ECE5', padding: '5px 9px', borderRadius: 7, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {row.nowChip}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* GROW YOUR CIRCLE — trusted introductions, never strangers */}
        <div style={{ marginTop: 34 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--rx-green)', marginBottom: 6 }}>
            Grow your circle
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {SUGGESTIONS.map(({ person, reason }) => {
              const done = connected.has(person.id);
              return (
                <div key={person.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 0', borderTop: '1px solid var(--rx-hairline)' }}>
                  <Avatar person={person} size={48} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: '-0.01em' }}>{person.first}</div>
                    <div style={{ fontSize: 12.5, lineHeight: 1.4, color: 'var(--rx-muted)', marginTop: 2 }}>{reason}</div>
                  </div>
                  <button
                    onClick={() => connect(person.id)}
                    disabled={done}
                    aria-label={done ? `Connection request sent to ${person.first}` : `Connect with ${person.first}`}
                    style={{
                      fontSize: 13, fontWeight: 600, padding: '9px 16px', borderRadius: 99, flexShrink: 0,
                      cursor: done ? 'default' : 'pointer',
                      ...(done
                        ? { border: 'none', background: 'var(--rx-green-tint)', color: 'var(--rx-green)' }
                        : { border: '1.5px solid var(--rx-green)', background: 'none', color: 'var(--rx-green)' }),
                    }}
                  >
                    {done ? 'Sent ✓' : 'Connect'}
                  </button>
                </div>
              );
            })}

            {/* Invite from contacts */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 0', borderTop: '1px solid var(--rx-hairline)' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', border: '2px dashed #C2B9A9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#A39A88', flexShrink: 0 }}>+</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: '-0.01em' }}>Invite from contacts</div>
                <div style={{ fontSize: 12.5, color: 'var(--rx-muted)', marginTop: 2 }}>Bring someone who isn't on Ringer yet</div>
              </div>
              <button
                onClick={() => setInviteSent(true)}
                disabled={inviteSent}
                aria-label="Copy invite link"
                style={{
                  fontSize: 13, fontWeight: 600, padding: '9px 16px', borderRadius: 99, flexShrink: 0,
                  cursor: inviteSent ? 'default' : 'pointer',
                  ...(inviteSent
                    ? { border: 'none', background: 'var(--rx-green-tint)', color: 'var(--rx-green)' }
                    : { border: '1.5px solid #D8D2C7', background: 'none', color: 'var(--rx-body)' }),
                }}
              >
                {inviteSent ? 'Copied ✓' : 'Invite'}
              </button>
            </div>
          </div>
        </div>

        {/* Memory closer */}
        <div style={{ marginTop: 20, padding: 22, background: 'var(--rx-card)', borderRadius: 22 }}>
          <div className="serif" style={{ fontSize: 18, lineHeight: 1.5, color: 'var(--rx-body)' }}>
            You've brought three people into this circle yourself — and six you met through football now play tennis with you too.
          </div>
        </div>
      </div>
    </div>
  );
}
