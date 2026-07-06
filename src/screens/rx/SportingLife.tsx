import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { loadProfile, saveProfile, TRAITS, ROUTINE, MY_COMMUNITIES, TRUSTED_BY, JOURNEY, MEMORIES } from '../../lib/sampleWorld';
import { usersApi } from '../../lib/api';

const eyebrow = (color: string): React.CSSProperties => ({
  fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
  color, marginBottom: 16,
});

export function SportingLife() {
  const navigate = useNavigate();
  const [openTrait, setOpenTrait] = useState<string | null>(null);
  const [me, setMe] = useState(loadProfile());

  // Hydrate identity from the real account when signed in
  useEffect(() => {
    usersApi.getMe()
      .then(u => {
        if (!u?.displayName) return;
        const since = u.createdAt ? `on Ringer since ${new Date(u.createdAt).getFullYear()}` : me.since;
        saveProfile({ name: u.displayName, city: u.city || me.city, since });
        setMe(loadProfile());
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const open = TRAITS.find(t => t.id === openTrait) ?? null;

  return (
    <div className="scr" style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '6px 24px 120px' }}>

        {/* Edit profile */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => navigate('/profile/edit')}
            aria-label="Edit profile"
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #E7E2D9', fontSize: 13, fontWeight: 600, color: 'var(--rx-ink-soft)', cursor: 'pointer', padding: '8px 14px', borderRadius: 99 }}
          >
            Edit profile
          </button>
        </div>

        {/* HERO — identity, one line, no bio */}
        <div style={{ textAlign: 'center', padding: '6px 0 26px' }}>
          <div style={{
            width: 92, height: 92, borderRadius: '50%', background: me.color, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 600, margin: '0 auto 16px',
          }}>
            {me.init}
          </div>
          <h2 style={{ margin: '0 0 4px', fontSize: 25, fontWeight: 700, letterSpacing: '-0.02em' }}>{me.name}</h2>
          <div style={{ fontSize: 14, color: 'var(--rx-faint)', marginBottom: 10 }}>{me.city} · {me.since}</div>
          <div className="serif" style={{ fontSize: 17, color: 'var(--rx-body)' }}>{me.oneLiner}</div>
        </div>

        {/* IDENTITY CHIPS — tap to verify, never self-written */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
          {TRAITS.map(t => {
            const on = openTrait === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setOpenTrait(o => (o === t.id ? null : t.id))}
                aria-expanded={on}
                style={{
                  fontSize: 13, fontWeight: 600, padding: '9px 15px', borderRadius: 99, cursor: 'pointer',
                  ...(on
                    ? { border: 'none', background: 'var(--rx-green)', color: '#fff' }
                    : { border: '1px solid #EEEAE3', background: '#fff', color: 'var(--rx-ink-soft)' }),
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        {open && (
          <div style={{ background: 'var(--rx-card)', borderRadius: 18, padding: 18, margin: '-16px 0 32px', fontSize: 14, lineHeight: 1.55, color: 'var(--rx-body)' }}>
            {open.detail}
          </div>
        )}

        {/* WEEKLY ROUTINE — routine is identity */}
        <div style={eyebrow('var(--rx-green)')}>Weekly routine</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 32 }}>
          {ROUTINE.map(r => (
            <div key={r.title} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 44, flexShrink: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{r.day}</div>
                <div style={{ fontSize: 11.5, color: 'var(--rx-ghost)' }}>{r.time}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>{r.title}</div>
                <div style={{ fontSize: 12.5, color: 'var(--rx-faint)' }}>{r.sub}</div>
              </div>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
            </div>
          ))}
        </div>

        {/* COMMUNITIES — each opens its group hub */}
        <div style={eyebrow('var(--rx-ghost)')}>Communities</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 32 }}>
          {MY_COMMUNITIES.map(c => (
            <button
              key={c.name}
              onClick={() => navigate('/activity', { state: { group: c.groupId } })}
              aria-label={`Open ${c.name}`}
              style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#fff', border: '1px solid #EEEAE3', borderRadius: 99, padding: '9px 15px 9px 9px', cursor: 'pointer' }}
            >
              <span style={{ width: 26, height: 26, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
            </button>
          ))}
        </div>

        {/* TRUSTED BY — relationships, never ratings */}
        <div style={eyebrow('var(--rx-ghost)')}>Trusted by</div>
        <div style={{ display: 'flex', marginBottom: 40 }}>
          {TRUSTED_BY.map((s, i) => (
            <div key={s.label} style={{ flex: 1, ...(i > 0 ? { borderLeft: '1px solid var(--rx-hairline)', paddingLeft: 16 } : {}) }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: 11.5, color: '#9C968C' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* SPORTING JOURNEY — the story, told by other people */}
        <div style={{ paddingTop: 26, borderTop: '1px solid var(--rx-hairline)' }}>
          <div style={{ ...eyebrow('var(--rx-green)'), marginBottom: 6 }}>Your sporting journey</div>
          <div className="serif" style={{ fontSize: 16, color: 'var(--rx-muted)', marginBottom: 24 }}>{me.journeyLine}</div>

          <div style={{ position: 'relative', paddingLeft: 44 }}>
            <div style={{ position: 'absolute', left: 19, top: 8, bottom: 20, width: 2, background: '#E7E0D3' }} />
            {JOURNEY.map(j => (
              <div key={j.title} style={{ position: 'relative', marginBottom: 28 }}>
                <div style={{
                  position: 'absolute', left: -44, top: 0, width: 40, height: 40, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 600, color: '#fff', border: '3px solid #FBFAF7', background: j.color,
                }}>
                  {j.init}
                </div>
                <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--rx-ghost)', marginBottom: 4 }}>{j.date}</div>
                <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.25 }}>{j.title}</div>
                <div style={{ fontSize: 13.5, color: 'var(--rx-faint)', marginTop: 4, lineHeight: 1.45 }}>{j.body}</div>
              </div>
            ))}
            {/* Now */}
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', left: -44, top: 0, width: 40, height: 40, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#0E1A12', border: '3px solid #FBFAF7', background: '#3FBF77',
              }}>
                Now
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--rx-green)', marginBottom: 4 }}>Today</div>
              <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.25 }}>Plays 3 sports with 27 people.</div>
              <div style={{ fontSize: 13.5, color: 'var(--rx-faint)', marginTop: 4 }}>Now organises Wednesday Football most weeks.</div>
            </div>
          </div>

          {/* MEMORIES — proof, not decoration */}
          <div style={{ marginTop: 32 }}>
            <div style={{ ...eyebrow('var(--rx-ghost)'), marginBottom: 14 }}>Memories</div>
            <div className="scr" style={{ display: 'flex', gap: 10, overflowX: 'auto' }}>
              {MEMORIES.map(m => (
                <div key={m.label} style={{ flexShrink: 0, width: 120, height: 120, borderRadius: 16, background: m.color, display: 'flex', alignItems: 'flex-end', padding: 12 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
