import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { chatsApi, gamesApi, groupsApi } from '../../lib/api';
import {
  PENDING_ACTIONS, ACTIVITY_GROUPS, GROUP_MESSAGES, QUICK_ACTIONS,
  GROUP_PHOTOS, GROUP_HISTORY, GROUP_PAYMENTS,
} from '../../lib/sampleWorld';

type Tab = 'messages' | 'photos' | 'history' | 'payments';

const TABS: { id: Tab; label: string }[] = [
  { id: 'messages', label: 'Messages' },
  { id: 'photos',   label: 'Photos' },
  { id: 'history',  label: 'History' },
  { id: 'payments', label: 'Payments' },
];

const eyebrow = (color: string): React.CSSProperties => ({
  fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
  color, marginBottom: 12,
});

export function Activity() {
  const location = useLocation();
  const initialGroup = (location.state as { group?: string } | null)?.group ?? null;
  const [sel, setSel]           = useState<string | null>(
    initialGroup && ACTIVITY_GROUPS.some(g => g.id === initialGroup) ? initialGroup : null
  );
  const [tab, setTab]           = useState<Tab>('messages');
  const [resolved, setResolved] = useState<Set<string>>(new Set());
  const [quickSent, setQuickSent] = useState<string | null>(null);
  const [draft, setDraft]       = useState('');
  const [sent, setSent]         = useState<{ text: string; time: string }[]>([]);

  // Real game threads from the backend
  const PALETTE = ['#B0714F', '#5B7AA8', '#6E9A82', '#8E7BA8', '#A8935B', '#A8635B'];
  const [realRows, setRealRows]   = useState<any[]>([]);
  const [realSel, setRealSel]     = useState<any | null>(null);
  const [realTab, setRealTab]     = useState<'messages' | 'players'>('messages');
  const [realMsgs, setRealMsgs]   = useState<any[]>([]);
  const [realPlayers, setRealPlayers] = useState<any[]>([]);
  const [realDraft, setRealDraft] = useState('');
  const [realGroups, setRealGroups] = useState<any[]>([]);
  const [groupDetail, setGroupDetail] = useState<any | null>(null);

  useEffect(() => {
    groupsApi.getMyGroups().then(gs => setRealGroups(gs || [])).catch(() => {});
    chatsApi.getMyChats()
      .then(rows => {
        const now = Date.now();
        const mapped = (rows || []).map((r: any, i: number) => ({
          id: r.id,
          name: r.venue,
          init: r.venue.split(' ').filter(Boolean).slice(0, 2).map((w: string) => w[0]).join('').toUpperCase(),
          color: PALETTE[i % PALETTE.length],
          kickoffAt: r.kickoff_at,
          role: r.role,
          upcoming: new Date(r.kickoff_at).getTime() > now,
        }));
        mapped.sort((a: any, b: any) => Number(b.upcoming) - Number(a.upcoming));
        setRealRows(mapped.slice(0, 8));
      })
      .catch(() => {});
  }, []);

  const openReal = (row: any) => {
    setRealSel({ ...row, kind: 'game' });
    setRealTab('messages');
    setRealMsgs([]);
    setRealPlayers([]);
    setRealDraft('');
    chatsApi.getMessages(row.id).then(setRealMsgs).catch(() => {});
    gamesApi.getGame(row.id).then(({ players }) => setRealPlayers(players || [])).catch(() => {});
  };

  const openRealGroup = (g: any) => {
    setRealSel({
      kind: 'group',
      id: g.id,
      name: g.name,
      init: g.name.split(' ').filter(Boolean).slice(0, 2).map((w: string) => w[0]).join('').toUpperCase(),
      color: '#B0714F',
      memberCount: g.memberCount,
    });
    setRealTab('messages');
    setRealMsgs([]);
    setGroupDetail(null);
    setRealDraft('');
    groupsApi.getMessages(g.id).then(setRealMsgs).catch(() => {});
    groupsApi.getGroup(g.id).then(setGroupDetail).catch(() => {});
  };

  const sendReal = async () => {
    const text = realDraft.trim();
    if (!text || !realSel) return;
    setRealDraft('');
    setRealMsgs(prev => [...prev, { id: `tmp-${Date.now()}`, body: text, mine: true, senderName: 'You', sentAt: new Date().toISOString() }]);
    try {
      if (realSel.kind === 'group') await groupsApi.sendMessage(realSel.id, text);
      else await chatsApi.sendMessage(realSel.id, text);
    } catch { /* optimistic row stays; refetch on reopen */ }
  };

  const fmtWhen = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) +
      ' · ' + d.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' });
  };

  const sendDraft = () => {
    const text = draft.trim();
    if (!text) return;
    setSent(prev => [...prev, { text, time: 'now' }]);
    setDraft('');
  };

  const pending = PENDING_ACTIONS.filter(p => !resolved.has(p.id));
  const group = sel ? ACTIVITY_GROUPS.find(g => g.id === sel) : null;

  const resolve = (id: string) => setResolved(prev => new Set(prev).add(id));

  // ── Real game hub ─────────────────────────────────────────────────────
  if (realSel) {
    return (
      <div className="scr" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '6px 0 130px' }}>
          <div style={{ padding: '0 24px' }}>
            <button
              onClick={() => setRealSel(null)}
              aria-label="Back to activity"
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', fontSize: 12.5, fontWeight: 600, color: '#726D64', cursor: 'pointer', padding: '6px 0 14px' }}
            >
              ‹ Activity
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <span style={{ width: 38, height: 38, borderRadius: '50%', background: realSel.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{realSel.init}</span>
              <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>{realSel.name}</span>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--rx-faint)', marginBottom: 16 }}>
              {realSel.kind === 'group'
                ? `${realSel.memberCount} member${realSel.memberCount === 1 ? '' : 's'} · lives beyond any one game`
                : `${fmtWhen(realSel.kickoffAt)} · ${realSel.role === 'organiser' ? "you're hosting" : "you're in"}`}
            </div>

            <div className="scr" role="tablist" style={{ display: 'flex', gap: 18, paddingBottom: 2, borderBottom: '1px solid var(--rx-hairline)', marginBottom: 18 }}>
              {(realSel.kind === 'group' ? (['messages', 'sessions', 'members'] as const) : (['messages', 'players'] as const)).map(t => (
                <button key={t} role="tab" aria-selected={realTab === t} onClick={() => setRealTab(t)}
                  style={{ fontSize: 13.5, fontWeight: 700, color: realTab === t ? 'var(--rx-ink)' : 'var(--rx-ghost)', paddingBottom: 11, background: 'none', border: 'none', borderBottom: realTab === t ? '2px solid var(--rx-green)' : '2px solid transparent', cursor: 'pointer', textTransform: 'capitalize' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {realTab === 'messages' && (
            <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {realMsgs.length === 0 && (
                <div style={{ fontSize: 13.5, color: 'var(--rx-muted)', textAlign: 'center', padding: '18px 0' }}>
                  No messages yet · say hello.
                </div>
              )}
              {realMsgs.map((m: any) => m.isSystem ? (
                <div key={m.id} style={{ textAlign: 'center', fontSize: 12, color: 'var(--rx-ghost)', padding: '2px 0' }}>{m.body}</div>
              ) : m.mine ? (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ fontSize: 14.5, lineHeight: 1.4, background: 'var(--rx-green)', color: '#fff', borderRadius: 14, borderTopRightRadius: 4, padding: '10px 14px', maxWidth: '80%' }}>{m.body}</div>
                </div>
              ) : (
                <div key={m.id} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#8A7B5B', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{m.senderInitials || (m.senderName || '?').slice(0, 2).toUpperCase()}</div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--rx-faint)', marginBottom: 3 }}>{m.senderName}</div>
                    <div style={{ fontSize: 14.5, lineHeight: 1.4, background: '#fff', border: '1px solid #EEEAE3', borderRadius: 14, borderTopLeftRadius: 4, padding: '10px 14px', display: 'inline-block' }}>{m.body}</div>
                  </div>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <input
                  value={realDraft}
                  onChange={e => setRealDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') sendReal(); }}
                  placeholder="Message the game…"
                  aria-label="Message the game"
                  style={{ flex: 1, fontSize: 14.5, fontFamily: 'inherit', padding: '12px 16px', borderRadius: 99, border: '1px solid #E7E2D9', background: '#fff', color: 'var(--rx-ink)', outline: 'none' }}
                />
                <button onClick={sendReal} disabled={!realDraft.trim()} aria-label="Send message"
                  style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: realDraft.trim() ? 'pointer' : 'default', background: realDraft.trim() ? 'var(--rx-green)' : '#E4DFD5' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h13M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>
            </div>
          )}

          {realTab === ('sessions' as any) && realSel.kind === 'group' && (
            <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {!groupDetail?.games?.length && (
                <div style={{ fontSize: 13.5, color: 'var(--rx-muted)', textAlign: 'center', padding: '18px 0' }}>
                  No sessions planned · gather one from the + tab.
                </div>
              )}
              {(groupDetail?.games || []).map((g: any) => (
                <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid #EEEAE3', borderRadius: 16, padding: 14 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 600 }}>{g.venue}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--rx-faint)', marginTop: 2 }}>{fmtWhen(g.kickoffAt)}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--rx-green)', background: 'var(--rx-green-tint)', padding: '4px 10px', borderRadius: 99 }}>
                    {g.filledCount}/{g.playerCount}
                  </span>
                </div>
              ))}
            </div>
          )}

          {realTab === ('members' as any) && realSel.kind === 'group' && (
            <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {(groupDetail?.members || []).map((m: any) => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 30, height: 30, borderRadius: '50%', background: '#6E9A82', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                    {(m.displayName || '?').slice(0, 2).toUpperCase()}
                  </span>
                  <span style={{ flex: 1, fontSize: 13.5, color: 'var(--rx-ink-soft)' }}>{m.displayName}</span>
                </div>
              ))}
              <div style={{ marginTop: 8, padding: 16, background: 'var(--rx-card)', borderRadius: 16, fontSize: 13, lineHeight: 1.5, color: 'var(--rx-muted)' }}>
                Anyone who joins one of this group's games becomes a member · communities grow through play.
              </div>
            </div>
          )}

          {realTab === 'players' && realSel.kind !== 'group' && (
            <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {realPlayers.length === 0 && (
                <div style={{ fontSize: 13.5, color: 'var(--rx-muted)', textAlign: 'center', padding: '18px 0' }}>
                  No one else yet · invites are out.
                </div>
              )}
              {realPlayers.map((pl: any) => (
                <div key={pl.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 30, height: 30, borderRadius: '50%', background: '#6E9A82', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                    {(pl.displayName || '?').slice(0, 2).toUpperCase()}
                  </span>
                  <span style={{ flex: 1, fontSize: 13.5, color: 'var(--rx-ink-soft)' }}>{pl.displayName}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: pl.paymentStatus === 'paid' ? 'var(--rx-green)' : 'var(--rx-clay)' }}>
                    {pl.paymentStatus === 'paid' ? 'In' : pl.status === 'confirmed' ? 'In' : 'Pending'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Group hub ─────────────────────────────────────────────────────────
  if (group) {
    return (
      <div className="scr" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '6px 0 130px' }}>
          <div style={{ padding: '0 24px' }}>
            <button
              onClick={() => setSel(null)}
              aria-label="Back to your groups"
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', fontSize: 12.5, fontWeight: 600, color: '#726D64', cursor: 'pointer', padding: '6px 0 14px' }}
            >
              ‹ Your groups
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <span style={{ width: 38, height: 38, borderRadius: '50%', background: group.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{group.init}</span>
              <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>{group.name}</span>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--rx-faint)', marginBottom: 16 }}>24 regulars · organised by Marcus</div>

            {/* Tabs */}
            <div className="scr" role="tablist" style={{ display: 'flex', gap: 18, paddingBottom: 2, borderBottom: '1px solid var(--rx-hairline)', marginBottom: 18, overflowX: 'auto' }}>
              {TABS.map(t => {
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(t.id)}
                    style={{
                      fontSize: 13.5, fontWeight: 700, color: active ? 'var(--rx-ink)' : 'var(--rx-ghost)',
                      paddingBottom: 11, background: 'none', border: 'none',
                      borderBottom: active ? '2px solid var(--rx-green)' : '2px solid transparent',
                      cursor: 'pointer', whiteSpace: 'nowrap',
                    }}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* MESSAGES */}
          {tab === 'messages' && (
            <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'var(--rx-card)', borderRadius: 18, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--rx-green)', marginBottom: 6 }}>Tonight's session</div>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>7:30 · Trinity Bellwoods · 9 in</div>
              </div>
              {GROUP_MESSAGES.map(m => (
                <div key={m.name} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: m.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{m.init}</div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--rx-faint)', marginBottom: 3 }}>{m.name} · {m.time}</div>
                    <div style={{ fontSize: 14.5, lineHeight: 1.4, background: '#fff', border: '1px solid #EEEAE3', borderRadius: 14, borderTopLeftRadius: 4, padding: '10px 14px', display: 'inline-block' }}>{m.text}</div>
                  </div>
                </div>
              ))}
              <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--rx-ghost)', padding: '6px 0' }}>Emma joined · payment received</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                {QUICK_ACTIONS.map(label => (
                  <button
                    key={label}
                    onClick={() => setQuickSent(label)}
                    aria-label={label}
                    style={{ fontSize: 13, fontWeight: 600, padding: '9px 14px', borderRadius: 99, border: '1px solid #EEEAE3', background: '#fff', color: 'var(--rx-ink-soft)', cursor: 'pointer' }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {quickSent && (
                <div style={{ textAlign: 'center', fontSize: 12.5, fontWeight: 600, color: 'var(--rx-green)', background: 'var(--rx-green-tint)', padding: 9, borderRadius: 10 }}>
                  Sent: "{quickSent}"
                </div>
              )}

              {/* Your sent messages */}
              {sent.map((m, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--rx-faint)', marginBottom: 3, textAlign: 'right' }}>You · {m.time}</div>
                    <div style={{ fontSize: 14.5, lineHeight: 1.4, background: 'var(--rx-green)', color: '#fff', borderRadius: 14, borderTopRightRadius: 4, padding: '10px 14px', display: 'inline-block' }}>{m.text}</div>
                  </div>
                </div>
              ))}

              {/* Composer */}
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <input
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') sendDraft(); }}
                  placeholder="Message the group…"
                  aria-label="Message the group"
                  style={{ flex: 1, fontSize: 14.5, fontFamily: 'inherit', padding: '12px 16px', borderRadius: 99, border: '1px solid #E7E2D9', background: '#fff', color: 'var(--rx-ink)', outline: 'none' }}
                />
                <button
                  onClick={sendDraft}
                  disabled={!draft.trim()}
                  aria-label="Send message"
                  style={{
                    width: 44, height: 44, borderRadius: '50%', border: 'none', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: draft.trim() ? 'pointer' : 'default',
                    background: draft.trim() ? 'var(--rx-green)' : '#E4DFD5',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h13M13 6l6 6-6 6" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>
            </div>
          )}

          {/* PHOTOS */}
          {tab === 'photos' && (
            <div style={{ padding: '0 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {GROUP_PHOTOS.map((color, i) => (
                  <div key={i} style={{ aspectRatio: '1', borderRadius: 12, background: color }} />
                ))}
              </div>
            </div>
          )}

          {/* HISTORY */}
          {tab === 'history' && (
            <div style={{ padding: '0 24px' }}>
              <div style={{ position: 'relative', paddingLeft: 26 }}>
                <div style={{ position: 'absolute', left: 5, top: 6, bottom: 6, width: 2, background: '#E7E0D3' }} />
                {GROUP_HISTORY.map(h => (
                  <div key={h.when} style={{ position: 'relative', marginBottom: 20 }}>
                    <span style={{ position: 'absolute', left: -26, top: 3, width: 11, height: 11, borderRadius: '50%', background: '#C9BFA9', border: '2px solid #FBFAF7' }} />
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--rx-ghost)', marginBottom: 4 }}>{h.when}</div>
                    <div style={{ fontSize: 14, color: 'var(--rx-body)', lineHeight: 1.4 }}>{h.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PAYMENTS */}
          {tab === 'payments' && (
            <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', borderTop: '1px solid var(--rx-hairline)', borderBottom: '1px solid var(--rx-hairline)' }}>
                {GROUP_PAYMENTS.stats.map((s, i) => (
                  <div key={s.label} style={{ flex: 1, padding: '14px 0', ...(i > 0 ? { borderLeft: '1px solid var(--rx-hairline)', paddingLeft: 14 } : {}) }}>
                    <div style={{ fontSize: 19, fontWeight: 700 }}>{s.value}</div>
                    <div style={{ fontSize: 11, color: '#726D64' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {GROUP_PAYMENTS.rows.map(pm => (
                <div key={pm.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 30, height: 30, borderRadius: '50%', background: pm.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>{pm.init}</span>
                  <span style={{ flex: 1, fontSize: 13.5, color: 'var(--rx-ink-soft)' }}>{pm.name}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: pm.statusColor }}>{pm.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── List view · your sporting home ────────────────────────────────────
  return (
    <div className="scr" style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '6px 24px 120px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--rx-ghost)' }}>Activity</div>
        <h2 style={{ margin: '5px 0 24px', fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>Your sporting home.</h2>

        {/* NEEDS YOU · pinned action queue */}
        {pending.length > 0 ? (
          <div style={{ marginBottom: 30 }}>
            <div style={eyebrow('var(--rx-green)')}>Needs you</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pending.map(p => (
                <div key={p.id} style={{ background: '#fff', border: '1px solid #EEEAE3', borderRadius: 18, padding: 15 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 11 }}>
                    <span style={{ width: 36, height: 36, borderRadius: '50%', background: p.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, fontWeight: 600, flexShrink: 0 }}>{p.init}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.3 }}>{p.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--rx-faint)', marginTop: 2 }}>{p.sub}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => resolve(p.id)}
                      aria-label={`${p.primaryLabel} · ${p.title}`}
                      style={{ flex: 1, background: 'var(--rx-green)', color: '#fff', border: 'none', borderRadius: 11, padding: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}
                    >
                      {p.primaryLabel}
                    </button>
                    <button
                      onClick={() => resolve(p.id)}
                      aria-label={`${p.secondaryLabel} · ${p.title}`}
                      style={{ flex: 1, background: 'none', color: 'var(--rx-faint)', border: '1px solid #E2DED7', borderRadius: 11, padding: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}
                    >
                      {p.secondaryLabel}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--rx-card)', borderRadius: 16, padding: '14px 16px', marginBottom: 30 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--rx-green)', flexShrink: 0 }} />
            <span style={{ fontSize: 13.5, color: 'var(--rx-body)' }}>You're all set · nothing needs your attention.</span>
          </div>
        )}

        {/* YOUR GAMES · real threads from the backend */}
        {realRows.length > 0 && (
          <>
            <div style={{ ...eyebrow('var(--rx-green)'), marginBottom: 14 }}>Your games</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 30 }}>
              {realRows.map(r => (
                <button key={r.id} onClick={() => openReal(r)} aria-label={`Open ${r.name}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left', background: '#fff', border: '1px solid #EEEAE3', borderRadius: 20, padding: 16, cursor: 'pointer', opacity: r.upcoming ? 1 : 0.55 }}>
                  <span style={{ width: 44, height: 44, borderRadius: '50%', background: r.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, flexShrink: 0 }}>{r.init}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: '-0.01em' }}>{r.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--rx-faint)', marginTop: 2 }}>
                      {fmtWhen(r.kickoffAt)} · {r.role === 'organiser' ? 'hosting' : 'playing'}{r.upcoming ? '' : ' · past'}
                    </div>
                  </div>
                  <span style={{ fontSize: 16, color: '#C2BBB0' }}>›</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* YOUR GROUPS · the calm, permanent list */}
        <div style={{ ...eyebrow('var(--rx-ghost)'), marginBottom: 14 }}>Your groups</div>
        {realGroups.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
            {realGroups.map(g => (
              <button key={g.id} onClick={() => openRealGroup(g)} aria-label={`Open ${g.name}`}
                style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left', background: '#fff', border: '1px solid #EEEAE3', borderRadius: 20, padding: 16, cursor: 'pointer' }}>
                <span style={{ width: 44, height: 44, borderRadius: '50%', background: '#B0714F', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, flexShrink: 0 }}>
                  {g.name.split(' ').filter(Boolean).slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: '-0.01em' }}>{g.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--rx-faint)', marginTop: 2 }}>
                    {g.memberCount} member{g.memberCount === 1 ? '' : 's'}
                    {g.nextGame ? ` · next ${new Date(g.nextGame.kickoffAt).toLocaleDateString('en-GB', { weekday: 'short' })}` : ''}
                  </div>
                </div>
                <span style={{ fontSize: 16, color: '#C2BBB0' }}>›</span>
              </button>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {realGroups.length === 0 && ACTIVITY_GROUPS.map(g => (
            <button
              key={g.id}
              onClick={() => { setSel(g.id); setTab('messages'); setQuickSent(null); setSent([]); setDraft(''); }}
              aria-label={`Open ${g.name}`}
              style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left', background: '#fff', border: '1px solid #EEEAE3', borderRadius: 20, padding: 16, cursor: 'pointer' }}
            >
              <span style={{ width: 44, height: 44, borderRadius: '50%', background: g.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, flexShrink: 0 }}>{g.init}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: '-0.01em' }}>{g.name}</span>
                  {g.unread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--rx-green)', flexShrink: 0 }} />}
                </div>
                <div style={{ fontSize: 13, color: 'var(--rx-faint)', marginTop: 2 }}>{g.last}</div>
              </div>
              <span style={{ fontSize: 11.5, color: 'var(--rx-ghost)', flexShrink: 0 }}>{g.time}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
