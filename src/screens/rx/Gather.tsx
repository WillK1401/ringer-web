import { useEffect, useState } from 'react';
import { GATHER, PEOPLE } from '../../lib/sampleWorld';
import { Avatar } from '../../components/rx/Avatar';
import { useNavigate } from 'react-router';
import { gamesApi, groupsApi, connectionsApi } from '../../lib/api';

const P = PEOPLE;

/** Turn the wizard's day/time picks into a concrete future kickoff. */
function computeKickoff(day: string | null, customDate: string, time: string | null, customTime: string): string | null {
  const now = new Date();
  let d: Date;
  if (customDate) {
    d = new Date(customDate + 'T00:00');
  } else if (day === 'Today') {
    d = new Date(now);
  } else if (day === 'Tomorrow') {
    d = new Date(now); d.setDate(d.getDate() + 1);
  } else if (day) {
    const idx = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(day);
    if (idx < 0) return null;
    d = new Date(now);
    const delta = (idx - d.getDay() + 7) % 7 || 7;
    d.setDate(d.getDate() + delta);
  } else {
    return null;
  }
  let hh: number, mm: number;
  if (customTime) {
    [hh, mm] = customTime.split(':').map(Number);
  } else if (time) {
    [hh, mm] = time.split(':').map(Number); // quick-chips are 24h
  } else {
    return null;
  }
  d.setHours(hh, mm, 0, 0);
  if (d <= now) d.setDate(d.getDate() + 7);
  return d.toISOString();
}

type Phase = 'home' | 'sport' | 'where' | 'when' | 'size' | 'crew' | 'circles';

const WIZARD_STEPS: Phase[] = ['sport', 'where', 'when', 'size', 'crew'];

const SPORTS = ['Football', 'Tennis', 'Padel', 'Basketball', 'Running', 'Volleyball'];

// Next seven days by name · no Today/Tomorrow ambiguity
function nextDays(): { label: string; iso: string }[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      label: d.toLocaleDateString('en-GB', { weekday: 'short' }) + ' ' + d.getDate(),
      iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
    };
  });
}
const DAYS = nextDays();
const TIMES = ['18:00', '18:30', '19:00', '19:30', '20:00', '21:00'];
const PALETTE = ['#B0714F', '#5B7AA8', '#6E9A82', '#8E7BA8', '#A8935B', '#A8635B'];

// Keyless address autocomplete via OpenStreetMap Nominatim (CORS-enabled).
async function geocode(q: string): Promise<any[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) return [];
  return res.json();
}
function venueLabel(r: any): { primary: string; secondary: string } {
  const parts = String(r.display_name || '').split(',').map((x: string) => x.trim()).filter(Boolean);
  const primary = r.name && r.name.length ? r.name : (parts[0] || 'Location');
  const rest = parts[0] === primary ? parts.slice(1) : parts;
  return { primary, secondary: rest.slice(0, 3).join(', ') };
}

const fieldStyle: React.CSSProperties = {
  width: '100%', fontSize: 15, fontFamily: 'inherit', padding: '13px 16px',
  borderRadius: 14, border: '1px solid #E7E2D9', background: '#fff',
  color: 'var(--rx-ink)', outline: 'none',
};

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

const qStyle: React.CSSProperties = { margin: '5px 0 4px', fontSize: 25, fontWeight: 700, letterSpacing: '-0.02em' };
const serifSub: React.CSSProperties = { fontSize: 15.5, color: 'var(--rx-muted)', marginBottom: 26 };

function chip(on: boolean): React.CSSProperties {
  return {
    fontSize: 15, fontWeight: 600, padding: '13px 20px', borderRadius: 99, cursor: 'pointer',
    letterSpacing: '-0.01em',
    ...(on
      ? { border: 'none', background: 'var(--rx-green)', color: '#fff' }
      : { border: '1px solid #E7E2D9', background: '#fff', color: 'var(--rx-ink-soft)' }),
  };
}

export function Gather() {
  const [phase, setPhase]         = useState<Phase>('home');
  const [sport, setSport]         = useState<string | null>(null);
  const [customSport, setCustomSport] = useState('');
  const [addingSport, setAddingSport] = useState(false);
  const [venue, setVenue]         = useState<string | null>(null);
  const [venueQuery, setVenueQuery] = useState('');
  const [venueResults, setVenueResults] = useState<any[]>([]);
  const [venueSearching, setVenueSearching] = useState(false);
  const [venueLatLng, setVenueLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [day, setDay]             = useState<string | null>(null);
  const [customDate, setCustomDate] = useState('');
  const [time, setTime]           = useState<string | null>(null);
  const [customTime, setCustomTime] = useState('');
  const [size, setSize]           = useState<number | null>(null);
  const [activated, setActivated] = useState(false);
  const [realGroups, setRealGroups] = useState<any[]>([]);
  const [activeGroup, setActiveGroup] = useState<any | null>(null);
  const [makeGroup, setMakeGroup] = useState(false);
  const [crewOptions, setCrewOptions] = useState<any[]>(
    GATHER.core.map(pp => ({ id: pp.id, name: pp.first, init: pp.init, color: pp.color, real: false }))
  );
  const [crewSel, setCrewSel] = useState<Set<string>>(new Set(GATHER.core.map(pp => pp.id)));
  const [gameId, setGameId] = useState<string | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    connectionsApi.getMyConnections()
      .then(rows => {
        if (!rows?.length) return;
        const opts = rows.slice(0, 12).map(({ user }: any, i: number) => ({
          id: user.id,
          name: user.displayName,
          init: (user.avatarInitials || user.displayName || '?').slice(0, 2).toUpperCase(),
          color: PALETTE[i % PALETTE.length],
          real: true,
        }));
        setCrewOptions(opts);
        setCrewSel(new Set(opts.slice(0, 5).map((o: any) => o.id)));
      })
      .catch(() => {});
  }, []);

  // Debounced address search · Uber/Maps-style type-ahead
  useEffect(() => {
    const q = venueQuery.trim();
    if (q.length < 3) { setVenueResults([]); setVenueSearching(false); return; }
    setVenueSearching(true);
    const h = setTimeout(() => {
      geocode(q).then(setVenueResults).catch(() => setVenueResults([])).finally(() => setVenueSearching(false));
    }, 350);
    return () => clearTimeout(h);
  }, [venueQuery]);

  const pickVenue = (r: any) => {
    const { primary } = venueLabel(r);
    setVenue(primary);
    setVenueLatLng({ lat: Number(r.lat), lng: Number(r.lon) });
    setPhase('when');
  };

  // Live circle: poll the published game so joins light up as they land
  useEffect(() => {
    if (!gameId) return;
    const tick = () => gamesApi.getGame(gameId).then(({ players: pl }) => setPlayers(pl || [])).catch(() => {});
    tick();
    const h = setInterval(tick, 8000);
    return () => clearInterval(h);
  }, [gameId]);

  const crewSelected = crewOptions.filter(c => crewSel.has(c.id));
  const confirmed = players.filter(pl => pl.status === 'confirmed');
  const crewJoined = (c: any) => confirmed.some(pl => pl.userId === c.id);

  useEffect(() => {
    groupsApi.getMyGroups().then(gs => setRealGroups(gs || [])).catch(() => {});
  }, []);

  const activateGroup = (g: any) => {
    setActiveGroup(g);
    setActivated(false);
    if (g.defaultVenue) { setVenue(g.defaultVenue); setPhase('when'); }
    else setPhase('where');
  };

  // Reach ladder: how wide the published game is open. Starts crew-only.
  type Reach = 'invite' | 'first' | 'second' | 'public';
  const [reach, setReach]         = useState<Reach>('invite');
  const [published, setPublished] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState('');

  const realInvitees = crewSelected.filter(c => c.real).map(c => c.id);

  const widen = (target: Reach) => {
    setReach(target);
    if (gameId) gamesApi.widenVisibility(gameId, target).catch(() => {});
  };

  const publish = async () => {
    setPublishing(true);
    setPublishError('');
    const kickoffAt = activated
      ? computeKickoff('Wed', '', '19:30', '')
      : computeKickoff(day, customDate, time, customTime);
    if (!kickoffAt) {
      setPublishError('Pick a day and kick-off time first · head back to the When step.');
      setPublishing(false);
      return;
    }
    // Every game starts crew-only. Wider circles are always a deliberate
    // choice on the ladder afterwards · never a default.
    const initialVis: Reach = 'invite';
    try {
      let groupId: string | undefined = activeGroup?.id;
      if (!groupId && makeGroup && !activated) {
        const g = await groupsApi.create({
          name: `${sport ?? 'Game'} at ${venue ?? 'TBC'}`,
          defaultVenue: venue ?? undefined,
        });
        groupId = g.id;
      }
      const created = await gamesApi.postGame({
        groupId,
        venue: activated ? 'Trinity Bellwoods Park' : (venue ?? 'TBC'),
        sport: activated ? 'Football' : (sport ?? 'Football'),
        kickoffAt,
        playerCount: activated ? 10 : (size ?? 8),
        pitchCost: 0,
        visibility: initialVis,
        ...(realInvitees.length ? { invitees: realInvitees } : {}),
        ...(venueLatLng ? { venueLatitude: venueLatLng.lat, venueLongitude: venueLatLng.lng } : {}),
      });
      if (created?.id) setGameId(created.id);
      setReach(initialVis);
      setPublished(true);
    } catch (e: any) {
      setPublishError(e.message || 'Could not publish · check your connection and try again.');
    } finally {
      setPublishing(false);
    }
  };

  // Roster maths · organiser is always the +1
  const totalSlots = activated ? 10 : (size ?? 8);
  const inCount    = confirmed.length + 1;
  const toFill     = Math.max(0, totalSlots - inCount);
  const invitedWaiting = players.filter(pl => pl.status === 'invited');

  // Human-readable "when" from either the quick chips or the native pickers
  const dateLabel = customDate
    ? new Date(customDate + 'T00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
    : day;
  const whenLabel = [dateLabel, time || customTime].filter(Boolean).join(' ');

  const sessionTitle = activeGroup
    ? `${activeGroup.name}${whenLabel ? ` · ${whenLabel}` : ' · this week'}`
    : activated
    ? 'Wednesday Football · this week'
    : `${sport ?? 'Your game'}${whenLabel ? ` · ${whenLabel}` : ''}`;

  const back = (to: Phase) => () => setPhase(to);

  const stepIndex = WIZARD_STEPS.indexOf(phase);

  const wizardHeader = (backTo: Phase) => (
    <>
      <button
        onClick={back(backTo)}
        aria-label="Back"
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', fontSize: 12.5, fontWeight: 600, color: '#9C968C', cursor: 'pointer', padding: '6px 0 18px' }}
      >
        ‹ Back
      </button>
      <div style={{ display: 'flex', gap: 6, marginBottom: 22 }} aria-label={`Step ${stepIndex + 1} of ${WIZARD_STEPS.length}`}>
        {WIZARD_STEPS.map((s, i) => (
          <span key={s} style={{ width: i === stepIndex ? 22 : 7, height: 7, borderRadius: 99, background: i <= stepIndex ? 'var(--rx-green)' : '#E7E0D3', transition: 'all .2s ease' }} />
        ))}
      </div>
    </>
  );

  // ── HOME · who do you want to bring together? ─────────────────────────
  if (phase === 'home') {
    return (
      <div className="scr" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '8px 24px 120px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--rx-ghost)' }}>Gather</div>
          <h2 style={qStyle}>Who do you want to bring together?</h2>
          <div className="serif" style={serifSub}>Activate your regulars, or start something new.</div>

          {/* Real groups · activate this week's session */}
          {realGroups.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 14 }}>
              {realGroups.map(g => (
                <div key={g.id} style={{ background: 'var(--rx-card)', borderRadius: 24, padding: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--rx-green)', marginBottom: 10 }}>Your group</div>
                  <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>{g.name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--rx-faint)', marginTop: 2, marginBottom: 12 }}>
                    {g.memberCount} member{g.memberCount === 1 ? '' : 's'}
                    {g.nextGame ? ` · next: ${new Date(g.nextGame.kickoffAt).toLocaleDateString('en-GB', { weekday: 'short' })}` : ' · nothing planned'}
                  </div>
                  <button
                    onClick={() => activateGroup(g)}
                    aria-label={`Ask ${g.name} who's in this week`}
                    style={{ width: '100%', background: 'var(--rx-green)', color: '#fff', border: 'none', fontSize: 15, fontWeight: 600, padding: 14, borderRadius: 99, cursor: 'pointer', letterSpacing: '-0.01em' }}
                  >
                    Ask "who's in this week?"
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Sample group · shown until you have a real one */}
          {realGroups.length === 0 && (
          <div style={{ background: 'var(--rx-card)', borderRadius: 24, padding: 20, marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--rx-green)', marginBottom: 14 }}>This week</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
              <div style={{ display: 'flex', flexShrink: 0 }}>
                <Avatar person={P.marcus} size={40} ring="#F3EEE4" style={{ marginRight: -12 }} />
                <Avatar person={P.priya}  size={40} ring="#F3EEE4" style={{ marginRight: -12 }} />
                <Avatar person={P.dan}    size={40} ring="#F3EEE4" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' }}>Wednesday Football</div>
                <div style={{ fontSize: 12.5, color: 'var(--rx-faint)' }}>Your regulars are waiting · usually 7:30</div>
              </div>
            </div>
            <button
              onClick={() => { setActivated(true); setPhase('crew'); }}
              aria-label="Activate this week's Wednesday Football session"
              style={{ width: '100%', marginTop: 12, background: 'var(--rx-green)', color: '#fff', border: 'none', fontSize: 15, fontWeight: 600, padding: 15, borderRadius: 99, cursor: 'pointer', boxShadow: '0 12px 24px -12px rgba(62, 82, 54,0.5)', letterSpacing: '-0.01em' }}
            >
              Ask "who's in this week?"
            </button>
          </div>
          )}

          {/* Start something new */}
          <button
            onClick={() => { setActivated(false); setPhase('sport'); }}
            aria-label="Start something new"
            style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left', padding: '18px 20px', background: 'none', border: '1px dashed #D8D2C7', borderRadius: 20, cursor: 'pointer' }}
          >
            <span style={{ width: 40, height: 40, borderRadius: '50%', border: '1.5px solid var(--rx-green)', color: 'var(--rx-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>+</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15.5, fontWeight: 600 }}>Start something new</div>
              <div style={{ fontSize: 12.5, color: 'var(--rx-faint)' }}>Four quick questions, then trust does the inviting</div>
            </div>
            <span style={{ fontSize: 16, color: '#C2BBB0' }}>›</span>
          </button>
        </div>
      </div>
    );
  }

  // ── STEP 1 · SPORT ────────────────────────────────────────────────────
  if (phase === 'sport') {
    return (
      <div className="scr" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '8px 24px 120px' }}>
          {wizardHeader('home')}
          <h2 style={qStyle}>What are you playing?</h2>
          <div className="serif" style={serifSub}>One tap · you can always change it.</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {SPORTS.map(s => (
              <button key={s} onClick={() => { setSport(s); setAddingSport(false); setPhase('where'); }} aria-label={s} style={chip(sport === s)}>
                {s}
              </button>
            ))}
            <button
              onClick={() => setAddingSport(v => !v)}
              aria-label="Other sport"
              aria-expanded={addingSport}
              style={chip(!!sport && !SPORTS.includes(sport))}
            >
              {sport && !SPORTS.includes(sport) ? sport : 'Other'}
            </button>
          </div>
          {addingSport && (
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <input
                autoFocus
                value={customSport}
                onChange={e => setCustomSport(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && customSport.trim()) { setSport(customSport.trim()); setAddingSport(false); setPhase('where'); } }}
                placeholder="Name your sport…"
                aria-label="Custom sport name"
                style={fieldStyle}
              />
              <button
                onClick={() => { if (customSport.trim()) { setSport(customSport.trim()); setAddingSport(false); setPhase('where'); } }}
                disabled={!customSport.trim()}
                aria-label="Confirm sport"
                style={{ flexShrink: 0, padding: '0 20px', borderRadius: 14, border: 'none', fontSize: 15, fontWeight: 600, cursor: customSport.trim() ? 'pointer' : 'default', background: customSport.trim() ? 'var(--rx-green)' : '#E4DFD5', color: customSport.trim() ? '#fff' : '#A39A88' }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── STEP 2 · WHERE ────────────────────────────────────────────────────
  if (phase === 'where') {
    return (
      <div className="scr" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '8px 24px 120px' }}>
          {wizardHeader('sport')}
          <h2 style={qStyle}>Where?</h2>
          <div className="serif" style={serifSub}>Start typing a venue or address.</div>

          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--rx-ghost)', pointerEvents: 'none' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" /><path d="M20 20l-3.2-3.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </span>
            <input
              autoFocus
              value={venueQuery}
              onChange={e => setVenueQuery(e.target.value)}
              placeholder="Search a venue or address…"
              aria-label="Search a venue or address"
              style={{ ...fieldStyle, paddingLeft: 44 }}
            />
          </div>

          <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column' }}>
            {venueSearching && venueResults.length === 0 && (
              <div style={{ padding: '14px 4px', fontSize: 13.5, color: 'var(--rx-faint)' }}>Searching…</div>
            )}
            {!venueSearching && venueQuery.trim().length >= 3 && venueResults.length === 0 && (
              <div style={{ padding: '14px 4px', fontSize: 13.5, color: 'var(--rx-muted)' }}>No matches · try a fuller address.</div>
            )}
            {venueQuery.trim().length > 0 && venueQuery.trim().length < 3 && (
              <div style={{ padding: '14px 4px', fontSize: 12.5, color: 'var(--rx-ghost)' }}>Keep typing…</div>
            )}

            {venueResults.map((r, i) => {
              const { primary, secondary } = venueLabel(r);
              return (
                <button
                  key={r.place_id ?? i}
                  onClick={() => pickVenue(r)}
                  aria-label={primary}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%', textAlign: 'left', background: 'none', border: 'none', borderBottom: '1px solid var(--rx-hairline)', padding: '14px 4px', cursor: 'pointer' }}
                >
                  <span style={{ marginTop: 1, color: 'var(--rx-green)', flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 21s-6-5.3-6-10a6 6 0 1112 0c0 4.7-6 10-6 10z" stroke="currentColor" strokeWidth="1.7" /><circle cx="12" cy="11" r="2.2" stroke="currentColor" strokeWidth="1.7" /></svg>
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>{primary}</div>
                    {secondary && (
                      <div style={{ fontSize: 12.5, color: 'var(--rx-faint)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{secondary}</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {venueResults.length > 0 && (
            <div style={{ marginTop: 16, fontSize: 11, color: 'var(--rx-ghost)' }}>Results from OpenStreetMap</div>
          )}
        </div>
      </div>
    );
  }

  // ── STEP 3 · WHEN ─────────────────────────────────────────────────────
  if (phase === 'when') {
    return (
      <div className="scr" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '8px 24px 120px' }}>
          {wizardHeader('where')}
          <h2 style={qStyle}>When?</h2>
          <div className="serif" style={serifSub}>Pick a quick option, or choose any date and time.</div>

          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--rx-ghost)', marginBottom: 12 }}>Day</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {DAYS.map(d => (
              <button key={d.iso} onClick={() => { setDay(d.label); setCustomDate(d.iso); }} aria-label={d.label} aria-pressed={day === d.label} style={chip(day === d.label)}>{d.label}</button>
            ))}
          </div>
          <input
            type="date"
            value={customDate}
            onChange={e => { setCustomDate(e.target.value); setDay(null); }}
            aria-label="Choose a specific date"
            style={{ ...fieldStyle, marginBottom: 26, ...(customDate ? { borderColor: 'var(--rx-green)' } : {}) }}
          />

          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--rx-ghost)', marginBottom: 12 }}>Kick-off</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {TIMES.map(t => (
              <button key={t} onClick={() => { setTime(t); setCustomTime(''); }} aria-label={t} aria-pressed={time === t} style={chip(time === t)}>{t}</button>
            ))}
          </div>
          <input
            type="time"
            value={customTime}
            onChange={e => { setCustomTime(e.target.value); setTime(null); }}
            aria-label="Choose a specific time"
            style={{ ...fieldStyle, ...(customTime ? { borderColor: 'var(--rx-green)' } : {}) }}
          />

          <button
            onClick={() => setPhase('size')}
            disabled={!(day || customDate) || !(time || customTime)}
            aria-label="Continue to players"
            style={{
              width: '100%', marginTop: 26, border: 'none', fontSize: 16, fontWeight: 700, padding: 17, borderRadius: 99,
              letterSpacing: '-0.01em', cursor: (day || customDate) && (time || customTime) ? 'pointer' : 'not-allowed',
              background: (day || customDate) && (time || customTime) ? 'var(--rx-green)' : '#E4DFD5',
              color: (day || customDate) && (time || customTime) ? '#fff' : '#A39A88',
            }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // ── STEP 4 · SIZE ─────────────────────────────────────────────────────
  if (phase === 'size') {
    return (
      <div className="scr" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '8px 24px 120px' }}>
          {wizardHeader('when')}
          <h2 style={qStyle}>How many players?</h2>
          <div className="serif" style={serifSub}>Your side, including you · most league games just need your own team.</div>

          {/* Stepper */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, margin: '10px 0 24px' }}>
            <button
              onClick={() => setSize(s => Math.max(1, (s ?? 8) - 1))}
              aria-label="One fewer player"
              style={{ width: 52, height: 52, borderRadius: '50%', border: '1.5px solid #E7E2D9', background: '#fff', fontSize: 26, fontWeight: 600, color: 'var(--rx-ink-soft)', cursor: 'pointer', lineHeight: 1 }}
            >
              −
            </button>
            <div style={{ minWidth: 90, textAlign: 'center' }}>
              <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em' }}>{size ?? 8}</div>
              <div style={{ fontSize: 12.5, color: 'var(--rx-faint)', marginTop: 4 }}>players</div>
            </div>
            <button
              onClick={() => setSize(s => Math.min(22, (s ?? 8) + 1))}
              aria-label="One more player"
              style={{ width: 52, height: 52, borderRadius: '50%', border: '1.5px solid #E7E2D9', background: '#fff', fontSize: 26, fontWeight: 600, color: 'var(--rx-ink-soft)', cursor: 'pointer', lineHeight: 1 }}
            >
              +
            </button>
          </div>

          {/* Common presets */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 30 }}>
            {[{ n: 5, l: '5-a-side' }, { n: 6, l: '6-a-side' }, { n: 7, l: '7-a-side' }, { n: 11, l: '11-a-side' }].map(p => (
              <button key={p.n} onClick={() => setSize(p.n)} aria-label={p.l} style={{ fontSize: 12.5, fontWeight: 600, padding: '7px 13px', borderRadius: 99, cursor: 'pointer', border: '1px solid #EEEAE3', background: size === p.n ? 'var(--rx-green-tint)' : '#fff', color: size === p.n ? 'var(--rx-green)' : 'var(--rx-faint)' }}>
                {p.l}
              </button>
            ))}
          </div>

          <button
            onClick={() => { if (size == null) setSize(8); setPhase('crew'); }}
            aria-label="Choose your crew"
            style={{
              width: '100%', border: 'none', fontSize: 16, fontWeight: 700, padding: 17, borderRadius: 99,
              letterSpacing: '-0.01em', cursor: 'pointer',
              background: 'var(--rx-green)', color: '#fff',
              boxShadow: '0 14px 30px -12px rgba(62, 82, 54,0.55)',
            }}
          >
            Choose your crew
          </button>
          <div style={{ textAlign: 'center', fontSize: 12.5, color: '#9C968C', marginTop: 12 }}>
            {[sport, venue, whenLabel].filter(Boolean).join(' · ')}
          </div>
        </div>
      </div>
    );
  }

  // ── CREW · pick your regulars first ───────────────────────────────────
  if (phase === 'crew') {
    return (
      <div className="scr" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '8px 24px 120px' }}>
          {wizardHeader(activated ? 'home' : 'size')}
          <h2 style={qStyle}>Who's your usual crew?</h2>
          <div className="serif" style={serifSub}>They're invited the moment you publish. Ringers come later, only if you need them.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {crewOptions.map(c => {
              const on = crewSel.has(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => setCrewSel(prev => { const n = new Set(prev); if (n.has(c.id)) n.delete(c.id); else n.add(c.id); return n; })}
                  aria-pressed={on}
                  aria-label={`${on ? 'Remove' : 'Invite'} ${c.name}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left', padding: 14,
                    borderRadius: 18, cursor: 'pointer',
                    ...(on ? { border: '1.5px solid var(--rx-green)', background: 'var(--rx-green-tint)' } : { border: '1px solid #EEEAE3', background: '#fff' }),
                  }}
                >
                  <span style={{ width: 40, height: 40, borderRadius: '50%', background: c.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, flexShrink: 0 }}>{c.init}</span>
                  <span style={{ flex: 1, fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>{c.name}</span>
                  {on && <span style={{ color: 'var(--rx-green)', fontSize: 15 }}>✓</span>}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setPhase('circles')}
            aria-label="See your circle"
            style={{ width: '100%', marginTop: 26, border: 'none', fontSize: 16, fontWeight: 700, padding: 17, borderRadius: 99, letterSpacing: '-0.01em', cursor: 'pointer', background: 'var(--rx-green)', color: '#fff', boxShadow: '0 14px 30px -12px rgba(62, 82, 54,0.55)' }}
          >
            {crewSel.size > 0 ? `Continue with ${crewSel.size} regular${crewSel.size === 1 ? '' : 's'}` : 'Continue without regulars'}
          </button>
        </div>
      </div>
    );
  }

  // ── LIVE GAME · who's in, and how to fill the gaps ────────────────────
  const backFromLive = () => {
    setPhase(activated || activeGroup ? 'home' : 'size');
    if (activeGroup) setActiveGroup(null);
    setReach('invite');
  };

  // Build the team sheet: You + confirmed (in) + invited (awaiting) + open
  type Slot = { key: string; init: string; name: string; state: 'you' | 'in' | 'invited' | 'open' };
  const rosterInvited: any[] = published ? invitedWaiting : crewSelected;
  const slots: Slot[] = [{ key: 'you', init: 'You', name: 'You', state: 'you' }];
  confirmed.forEach((pl: any) => slots.push({
    key: String(pl.id || pl.userId),
    init: (pl.displayName || '?').slice(0, 2).toUpperCase(),
    name: (pl.displayName || 'Player').split(' ')[0],
    state: 'in',
  }));
  rosterInvited.forEach((c: any) => slots.push({
    key: String(c.id || c.userId),
    init: c.init || (c.displayName || '?').slice(0, 2).toUpperCase(),
    name: c.name || (c.displayName || 'Player').split(' ')[0],
    state: 'invited',
  }));
  for (let i = slots.length; i < totalSlots; i++) slots.push({ key: `open-${i}`, init: '', name: '', state: 'open' });
  const teamSheet = slots.slice(0, Math.max(totalSlots, 1 + confirmed.length));

  const REACH_ORDER: Reach[] = ['invite', 'first', 'second', 'public'];
  const reachIdx = REACH_ORDER.indexOf(reach);
  const LADDER: { key: Reach; title: string; sub: string; verb: string }[] = [
    { key: 'first',  title: '1st connections',            sub: "Everyone you're connected to can join", verb: 'Invite' },
    { key: 'second', title: '2nd connections',            sub: 'Friends of friends · vouched, not strangers', verb: 'Invite' },
    { key: 'public', title: 'Open to the Ringer network', sub: 'Last resort · the widest reach for gaps', verb: 'Open' },
  ];

  const slotStyle = (st: Slot['state']): React.CSSProperties => ({
    width: 52, height: 52, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 600, transition: 'all .2s ease',
    ...(st === 'you' || st === 'in'
      ? { background: 'var(--rx-green)', color: '#fff' }
      : st === 'invited'
      ? { border: '2px dashed #C9C2B4', color: '#A39A88', background: 'rgba(0,0,0,0.02)' }
      : { border: '2px dashed #E2DBCD', background: 'transparent' }),
  });

  return (
    <>
      <div className="scr" style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '8px 24px 210px' }}>
          <button
            onClick={backFromLive}
            aria-label="Back"
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', fontSize: 12.5, fontWeight: 600, color: '#9C968C', cursor: 'pointer', padding: '6px 0 10px' }}
          >
            ‹ {activated ? 'Gather' : 'Set-up'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--rx-faint)' }}>
              {sessionTitle}
            </span>
            {published && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--rx-green)', background: 'var(--rx-green-tint)', padding: '3px 10px', borderRadius: 99 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--rx-green-live)' }} />
                Live
              </span>
            )}
          </div>
          <h2 style={{ margin: '5px 0 4px', fontSize: 25, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {published ? "Who's in" : 'Your team sheet'}
          </h2>
          <div className="serif" style={{ fontSize: 15.5, color: 'var(--rx-muted)', marginBottom: 22 }}>
            {published
              ? (toFill === 0 ? "Full · you're all set." : `${inCount} in · ${toFill} spot${toFill === 1 ? '' : 's'} to fill.`)
              : `${crewSelected.length} regular${crewSelected.length === 1 ? '' : 's'} · asked the moment you publish.`}
          </div>

          {/* TEAM SHEET */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(58px, 1fr))', gap: 16, marginBottom: 8 }}>
            {teamSheet.map(sl => (
              <div key={sl.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={slotStyle(sl.state)}>{sl.init}</div>
                <span style={{ fontSize: 11, textAlign: 'center', lineHeight: 1.2, fontWeight: sl.state === 'in' || sl.state === 'you' ? 600 : 400, color: sl.state === 'open' ? '#C2BBB0' : sl.state === 'invited' ? 'var(--rx-faint)' : 'var(--rx-ink-soft)' }}>
                  {sl.state === 'open' ? 'Open' : sl.state === 'invited' ? (published ? 'Invited' : 'Asked') : sl.name}
                </span>
              </div>
            ))}
          </div>

          {/* WIDEN LADDER · only once live and short of players */}
          {published && toFill > 0 && (
            <div style={{ marginTop: 26 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--rx-green)', marginBottom: 12 }}>
                Need more players?
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* crew · always asked first */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--rx-green-tint)', borderRadius: 16 }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--rx-green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>✓</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Your crew · asked first</div>
                    <div style={{ fontSize: 12, color: 'var(--rx-faint)' }}>{confirmed.length} in · {invitedWaiting.length} still to reply</div>
                  </div>
                </div>

                {LADDER.map(l => {
                  const done = reachIdx >= REACH_ORDER.indexOf(l.key);
                  return done ? (
                    <div key={l.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--rx-card)', borderRadius: 16 }}>
                      <span style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--rx-green)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>✓</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>{l.title} · open</div>
                        <div style={{ fontSize: 12, color: 'var(--rx-faint)' }}>{l.sub}</div>
                      </div>
                    </div>
                  ) : (
                    <button
                      key={l.key}
                      onClick={() => widen(l.key)}
                      aria-label={`${l.verb} ${l.title}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', padding: '14px 16px', background: l.key === 'public' ? 'none' : 'var(--rx-card)', border: l.key === 'public' ? '1px dashed #D8D2C7' : 'none', borderRadius: 16, cursor: 'pointer' }}
                    >
                      <span style={{ width: 26, height: 26, borderRadius: '50%', border: `1.5px ${l.key === 'public' ? 'dashed var(--rx-ghost)' : 'solid var(--rx-green)'}`, color: l.key === 'public' ? 'var(--rx-faint)' : 'var(--rx-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>+</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: l.key === 'public' ? 'var(--rx-body)' : 'var(--rx-ink)' }}>{l.title}</div>
                        <div style={{ fontSize: 12, color: l.key === 'public' ? 'var(--rx-ghost)' : 'var(--rx-faint)' }}>{l.sub}</div>
                      </div>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--rx-green)', background: 'var(--rx-green-tint)', padding: '5px 12px', borderRadius: 99, flexShrink: 0 }}>{l.verb}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {published && toFill === 0 && (
            <div style={{ marginTop: 22, padding: 18, background: 'var(--rx-green-tint)', borderRadius: 18, fontSize: 14, lineHeight: 1.55, color: 'var(--rx-ink-soft)' }}>
              Your side is full. Everyone's got the details · see you out there.
            </div>
          )}
        </div>
      </div>

      {/* Bottom action */}
      <div style={{ position: 'absolute', bottom: 'calc(82px + env(safe-area-inset-bottom))', left: 0, right: 0, padding: '16px 20px 14px', background: 'linear-gradient(to top,#FBFAF7 74%,rgba(251,250,247,0))' }}>
        {!activated && !activeGroup && !published && (
          <button
            onClick={() => setMakeGroup(m => !m)}
            aria-pressed={makeGroup}
            aria-label="Keep this crew together as a group"
            style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', marginBottom: 10, padding: '11px 16px', borderRadius: 14, border: makeGroup ? '1.5px solid var(--rx-green)' : '1px dashed #D8D2C7', background: makeGroup ? 'var(--rx-green-tint)' : 'rgba(251,250,247,0.9)', cursor: 'pointer' }}
          >
            <span style={{ width: 20, height: 20, borderRadius: 6, border: makeGroup ? 'none' : '1.5px solid #C9C2B4', background: makeGroup ? 'var(--rx-green)' : 'transparent', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>{makeGroup ? '✓' : ''}</span>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--rx-ink-soft)' }}>Keep this crew together · make it a group</span>
          </button>
        )}
        {publishError && (
          <div role="alert" style={{ marginBottom: 10, padding: '10px 16px', borderRadius: 12, background: 'rgba(200,16,46,0.07)', fontSize: 13, color: '#B33A3A', textAlign: 'center' }}>
            {publishError}
          </div>
        )}
        <button
          onClick={published ? () => navigate('/activity') : publish}
          disabled={publishing}
          aria-label={published ? 'Open this game in Activity' : 'Publish this session'}
          aria-busy={publishing}
          style={{ width: '100%', background: 'var(--rx-green)', color: '#fff', border: 'none', fontSize: 17, fontWeight: 700, padding: 17, borderRadius: 99, cursor: publishing ? 'wait' : 'pointer', opacity: publishing ? 0.7 : 1, boxShadow: '0 14px 30px -12px rgba(62, 82, 54,0.55)', letterSpacing: '-0.01em' }}
        >
          {publishing ? 'Publishing…' : published ? 'Open in Activity' : `Publish & invite ${crewSelected.length}`}
        </button>
      </div>
    </>
  );
}
