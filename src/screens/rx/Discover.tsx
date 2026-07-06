import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { gamesApi } from '../../lib/api';
import { PEOPLE } from '../../lib/sampleWorld';
import { Avatar } from '../../components/rx/Avatar';
import { GameDetailUnfold } from './GameDetailUnfold';

const P = PEOPLE;

const WEEK = [
  { dow: 'M', date: '29', play: false, plan: null },
  { dow: 'T', date: '30', play: false, plan: null },
  { dow: 'W', date: '1',  play: true,  plan: null }, // hero carries Wednesday
  { dow: 'T', date: '2',  play: true,  plan: 'Your Thursday tennis hit · 6:00 with Sofia' },
  { dow: 'F', date: '3',  play: false, plan: null },
  { dow: 'S', date: '4',  play: true,  plan: 'Saturday Morning Run Club · 8:00 · The Beaches' },
  { dow: 'S', date: '5',  play: false, plan: null },
];

const DOW_NAMES: Record<string, string> = { M: 'Monday', T: 'Tuesday', W: 'Wednesday', F: 'Friday', S: 'Saturday' };

const ALL_GAMES = [
  { venue: 'Trinity Bellwoods Park', when: 'Tonight · 7:30',    who: 'Marcus hosts · 4 of your circle',  sport: 'Football'   },
  { venue: 'High Park Courts',       when: 'Thursday · 6:00',   who: 'Sofia · your usual four',          sport: 'Tennis'     },
  { venue: 'Padel Haus',             when: 'Saturday · 10:00',  who: "Leon hosts · Priya's group",       sport: 'Padel'      },
  { venue: 'The Beaches',            when: 'Saturday · 8:00',   who: 'Run Club · you + 9 regulars',      sport: 'Running'    },
  { venue: 'Christie Pits',          when: 'Sunday · 11:00',    who: 'Open game · 2 mutual connections', sport: 'Basketball' },
];

function fmtKick(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const tmr = new Date(now); tmr.setDate(now.getDate() + 1);
  const t = d.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' });
  if (d.toDateString() === now.toDateString()) return `Today · ${t}`;
  if (d.toDateString() === tmr.toDateString()) return `Tomorrow · ${t}`;
  return `${d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })} · ${t}`;
}

export function Discover() {
  const navigate = useNavigate();
  const [upcoming, setUpcoming]   = useState<any[]>([]);
  const [nearby, setNearby]       = useState<any[]>([]);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());

  // Real games: yours first, then what the network can see
  useEffect(() => {
    gamesApi.getMyGames()
      .then(({ hosting, playing }) => {
        const now = Date.now();
        const mine = [
          ...hosting.map((g: any) => ({ ...g, role: 'organiser' })),
          ...playing.map((g: any) => ({ ...g, role: 'player' })),
        ].filter(g => new Date(g.kickoffAt).getTime() > now)
         .sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime());
        setUpcoming(mine);
      })
      .catch(() => {});
    gamesApi.getFeed({ day: 'all' })
      .then(rows => setNearby((rows || []).filter((g: any) => g.accessTier !== 'organiser').slice(0, 5)))
      .catch(() => {});
  }, []);

  const joinNearby = async (g: any) => {
    try {
      const res = await gamesApi.joinGame(g.id);
      if (res?.payment?.clientSecret) {
        navigate(`/game/${g.id}`); // paid game — finish payment on the game page
        return;
      }
      setJoinedIds(prev => new Set(prev).add(g.id));
    } catch {
      navigate(`/game/${g.id}`);
    }
  };
  const [joined, setJoined]         = useState(false);
  const [whyOpen, setWhyOpen]       = useState(false);
  const [activeDay, setActiveDay]   = useState(2);
  const [expanded, setExpanded]     = useState(false);
  const [interested, setInterested] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery]           = useState('');

  const dayPlan = WEEK[activeDay].plan;
  const results = ALL_GAMES.filter(g =>
    (g.venue + g.who + g.sport + g.when).toLowerCase().includes(query.toLowerCase())
  );

  if (expanded) {
    return (
      <GameDetailUnfold
        joined={joined}
        onJoin={() => setJoined(j => !j)}
        onBack={() => setExpanded(false)}
      />
    );
  }

  return (
    <div className="scr" style={{ flex: 1, overflowY: 'auto' }}>
      <div style={{ padding: '6px 24px 0' }}>
        <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--rx-ghost)' }}>
          Wednesday · 1 July · Toronto
        </div>
        <h2 style={{ margin: '5px 0 18px', fontSize: 27, fontWeight: 700, letterSpacing: '-0.02em' }}>Evening, Will.</h2>

        {/* WEEK STRIP */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 26 }} role="group" aria-label="Your week">
          {WEEK.map((d, i) => {
            const on = i === activeDay;
            return (
              <button
                key={i}
                onClick={() => setActiveDay(i)}
                aria-label={`${DOW_NAMES[d.dow] ?? 'day'} ${d.date}${d.play ? ', you usually play' : ''}`}
                aria-pressed={on}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                  padding: '10px 0 8px', borderRadius: 14, border: 'none', cursor: 'pointer',
                  transition: 'all .15s ease',
                  background: on ? '#211F1C' : 'transparent',
                  color: on ? '#F7F3EB' : '#211F1C',
                }}
              >
                <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.02em', color: on ? '#B8B2A6' : 'var(--rx-ghost)' }}>{d.dow}</span>
                <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.01em' }}>{d.date}</span>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: d.play ? (on ? '#3FBF77' : 'var(--rx-green)') : 'transparent' }} />
              </button>
            );
          })}
        </div>

        {/* Selected day context — the strip answers, not just decorates */}
        {activeDay !== 2 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--rx-card)', borderRadius: 14, padding: '12px 16px', marginTop: -12, marginBottom: 26 }}>
            {dayPlan ? (
              <>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--rx-green)', flexShrink: 0 }} />
                <span style={{ fontSize: 13.5, color: 'var(--rx-body)' }}>{dayPlan}</span>
              </>
            ) : (
              <>
                <span style={{ fontSize: 13.5, color: 'var(--rx-muted)', flex: 1 }}>Nothing planned yet.</span>
                <button
                  onClick={() => navigate('/gather')}
                  style={{ background: 'none', border: 'none', fontSize: 13, fontWeight: 600, color: 'var(--rx-green)', cursor: 'pointer', flexShrink: 0, padding: 0 }}
                >
                  Gather one ›
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div style={{ padding: '0 24px 120px' }}>
        {upcoming.length > 0 ? (
        <>
        {/* REAL — your next game */}
        <div style={{ background: 'var(--rx-card)', borderRadius: 28, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--rx-green)' }}>Your next game</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--rx-muted)' }}>{fmtKick(upcoming[0].kickoffAt).split(' · ')[1]}</span>
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: 23, lineHeight: 1.14, fontWeight: 700, letterSpacing: '-0.02em' }}>{upcoming[0].venue}</h3>
          <div className="serif" style={{ fontSize: 16.5, lineHeight: 1.4, color: '#5A554D', marginBottom: 18 }}>
            {fmtKick(upcoming[0].kickoffAt)} · {upcoming[0].sport ?? 'Football'}
            {upcoming[0].role === 'organiser' ? " — you're hosting." : " — you're in."}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--rx-green)', background: 'var(--rx-green-tint)', padding: '5px 12px', borderRadius: 99 }}>
              {(upcoming[0].confirmedCount ?? 0) + 1}/{upcoming[0].playerCount} in
            </span>
            {upcoming[0].role === 'organiser' && (
              <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--rx-clay)', background: '#F6ECE5', padding: '5px 12px', borderRadius: 99 }}>Hosting</span>
            )}
          </div>
          <button
            onClick={() => navigate(`/game/${upcoming[0].id}`)}
            aria-label="Open your next game"
            style={{ width: '100%', fontSize: 16, fontWeight: 600, padding: 16, borderRadius: 99, border: 'none', cursor: 'pointer', background: 'var(--rx-green)', color: '#fff', boxShadow: '0 12px 24px -12px rgba(28,124,84,0.5)', letterSpacing: '-0.01em' }}
          >
            Open game
          </button>
        </div>

        {upcoming.length > 1 && (
          <div style={{ marginTop: 36 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--rx-ghost)', marginBottom: 18 }}>The rest of your week</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {upcoming.slice(1, 4).map(g => (
                <button key={g.id} onClick={() => navigate(`/game/${g.id}`)} aria-label={`Open ${g.venue}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: '-0.01em' }}>{g.venue}</div>
                    <div style={{ fontSize: 13, color: 'var(--rx-faint)' }}>{fmtKick(g.kickoffAt)} · {(g.confirmedCount ?? 0) + 1}/{g.playerCount} in</div>
                  </div>
                  <span style={{ fontSize: 16, color: '#C2BBB0' }}>›</span>
                </button>
              ))}
            </div>
          </div>
        )}
        </>
        ) : (
        <>
        {/* HERO — Your Wednesday football */}
        <div style={{ background: 'var(--rx-card)', borderRadius: 28, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--rx-green)' }}>Your Wednesday football</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--rx-muted)' }}>7:30 PM</span>
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: 23, lineHeight: 1.14, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {joined ? "You're in — week 11 with the regulars" : 'Week 11 with the regulars'}
          </h3>
          <div className="serif" style={{ fontSize: 16.5, lineHeight: 1.4, color: '#5A554D', marginBottom: 18 }}>
            The same crew you've played with all season — Marcus hosts, like every week.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
            <Avatar person={P.marcus} ring="#F3EEE4" live liveRing="#F3EEE4" style={{ marginRight: -12, zIndex: 5 }} />
            <Avatar person={P.priya}  ring="#F3EEE4" style={{ marginRight: -12, zIndex: 4 }} />
            <Avatar person={P.dan}    ring="#F3EEE4" style={{ marginRight: -12, zIndex: 3 }} />
            <Avatar person={P.sofia}  ring="#F3EEE4" style={{ marginRight: -12, zIndex: 2 }} />
            <div style={{
              width: 44, height: 44, borderRadius: '50%', marginLeft: 18, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: joined ? 12 : 11, fontWeight: 600,
              ...(joined
                ? { border: '2px solid #F3EEE4', background: 'var(--rx-green)', color: '#fff' }
                : { border: '2px dashed #C2B9A9', color: '#A39A88' }),
            }}>
              {joined ? 'You' : '+ you'}
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--rx-faint)', marginBottom: 16 }}>
            {joined ? 'You + Marcus, Priya, Dan & Sofia' : 'Marcus hosts · Priya, Dan & Sofia are in'}
          </div>
          <button
            onClick={() => setExpanded(true)}
            aria-label="See who's playing and why this game fits you"
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
              padding: '14px 0', background: 'none', border: 'none', borderTop: '1px solid #E7E0D3',
              cursor: 'pointer', textAlign: 'left',
            }}
          >
            <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--rx-green)' }}>See who's playing &amp; why it fits</span>
            <span style={{ fontSize: 16, color: 'var(--rx-green)', lineHeight: 1 }}>›</span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 0', marginBottom: 4, borderTop: '1px solid #E7E0D3', borderBottom: '1px solid #E7E0D3' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, color: 'var(--rx-faint)' }}>Where</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Trinity Bellwoods · 12 min</div>
            </div>
            <div style={{ width: 1, height: 26, background: '#E2DBCD' }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, color: 'var(--rx-faint)' }}>Cost</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>$8 · split</div>
            </div>
          </div>
          <button
            onClick={() => setJoined(j => !j)}
            aria-label={joined ? 'You are confirmed for your Wednesday football. Tap to release your spot.' : 'Join your Wednesday football at 7:30'}
            style={{
              width: '100%', fontSize: 16, fontWeight: 600, padding: 16, borderRadius: 99,
              border: 'none', cursor: 'pointer', transition: 'all .18s ease', letterSpacing: '-0.01em',
              marginTop: 12,
              ...(joined
                ? { background: 'var(--rx-green-tint)', color: 'var(--rx-green)' }
                : { background: 'var(--rx-green)', color: '#fff', boxShadow: '0 12px 24px -12px rgba(28,124,84,0.5)' }),
            }}
          >
            {joined ? "You're in  ✓" : 'Join Game'}
          </button>
          <div style={{ textAlign: 'center', fontSize: 12.5, color: '#9C968C', marginTop: 11 }}>
            {joined ? 'See you Wednesday · Trinity Bellwoods' : 'Same crew, same time · 2 spots left'}
          </div>
          <button
            onClick={() => setWhyOpen(w => !w)}
            aria-expanded={whyOpen}
            style={{ width: '100%', marginTop: 12, background: 'none', border: 'none', fontSize: 12.5, fontWeight: 600, color: '#9C968C', cursor: 'pointer' }}
          >
            {whyOpen ? 'Hide the trust' : 'Why you can trust tonight'}
          </button>
          {whyOpen && (
            <div style={{ marginTop: 12, background: '#FBF8F2', borderRadius: 16, padding: 16, fontSize: 13, lineHeight: 1.65, color: '#5A554D' }}>
              <div style={{ fontWeight: 600, color: 'var(--rx-ink)', marginBottom: 6 }}>Why you can trust tonight</div>
              · You've played this exact game <strong>11 weeks running</strong><br />
              · Marcus has hosted every one — <strong>never cancelled</strong><br />
              · Priya, Dan &amp; Sofia are already in<br />
              · 12 minutes away · you're home by 9
            </div>
          )}
        </div>

        {/* THE REST OF YOUR WEEK */}
        <div style={{ marginTop: 36 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--rx-ghost)', marginBottom: 18 }}>The rest of your week</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 46, flexShrink: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Thu</div>
                <div style={{ fontSize: 12, color: 'var(--rx-ghost)' }}>6:00</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: '-0.01em' }}>Your Thursday tennis hit</div>
                <div style={{ fontSize: 13, color: 'var(--rx-faint)' }}>Sofia — 5 weeks in a row · High Park</div>
              </div>
              <Avatar person={P.sofia} size={34} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ width: 46, flexShrink: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Sat</div>
                <div style={{ fontSize: 12, color: 'var(--rx-ghost)' }}>8:00</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: '-0.01em' }}>Saturday Morning Run Club</div>
                <div style={{ fontSize: 13, color: 'var(--rx-faint)' }}>You + 9 regulars · The Beaches</div>
              </div>
              <div style={{ display: 'flex', flexShrink: 0 }}>
                <Avatar person={P.lena}  size={34} ring="#FBFAF7" style={{ marginRight: -10 }} />
                <Avatar person={P.aiden} size={34} />
              </div>
            </div>
          </div>
        </div>

        </>
        )}

        {/* NEARBY — real games your network can see */}
        {nearby.length > 0 && (
          <div style={{ marginTop: 36 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--rx-green)', marginBottom: 18 }}>Games near you</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {nearby.map(g => {
                const joined = joinedIds.has(g.id);
                const priceGBP = Math.round((g.costPerPlayer ?? 0) / 100);
                return (
                  <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <button onClick={() => navigate(`/game/${g.id}`)} aria-label={`Open ${g.venue}`}
                      style={{ flex: 1, minWidth: 0, textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                      <div style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: '-0.01em' }}>{g.venue}</div>
                      <div style={{ fontSize: 13, color: 'var(--rx-faint)' }}>
                        {fmtKick(g.kickoffAt)}{priceGBP > 0 ? ` · £${priceGBP}` : ' · Free'}
                        {g.accessTier === 'first' ? ' · In your network' : ''}
                      </div>
                    </button>
                    <button
                      onClick={() => joinNearby(g)}
                      disabled={joined}
                      aria-label={joined ? `Joined ${g.venue}` : `Join ${g.venue}`}
                      style={{
                        fontSize: 13, fontWeight: 600, padding: '9px 16px', borderRadius: 99, flexShrink: 0,
                        cursor: joined ? 'default' : 'pointer',
                        ...(joined
                          ? { border: 'none', background: 'var(--rx-green-tint)', color: 'var(--rx-green)' }
                          : { border: '1.5px solid var(--rx-green)', background: 'none', color: 'var(--rx-green)' }),
                      }}
                    >
                      {joined ? "In ✓" : 'Join'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* YOUR COMMUNITIES */}
        <div style={{ marginTop: 36 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--rx-ghost)', marginBottom: 18 }}>Your communities</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <button
              onClick={() => navigate('/activity', { state: { group: 'wed' } })}
              aria-label="Open The Wednesday Regulars"
              style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', flexShrink: 0 }}>
                <Avatar person={P.marcus} size={40} ring="#FBFAF7" style={{ marginRight: -14 }} />
                <Avatar person={P.priya}  size={40} ring="#FBFAF7" style={{ marginRight: -14 }} />
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#6E9A82', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, fontWeight: 600 }}>+22</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: '-0.01em' }}>The Wednesday Regulars</div>
                <div style={{ fontSize: 13, color: 'var(--rx-faint)' }}>You + 24 · meets tonight</div>
              </div>
              <span style={{ fontSize: 16, color: '#C2BBB0' }}>›</span>
            </button>
            <button
              onClick={() => navigate('/activity', { state: { group: 'tennis' } })}
              aria-label="Open High Park Tennis"
              style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', flexShrink: 0 }}>
                <Avatar person={P.sofia} size={40} ring="#FBFAF7" style={{ marginRight: -14 }} />
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#A8635B', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12.5, fontWeight: 600 }}>+11</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: '-0.01em' }}>High Park Tennis</div>
                <div style={{ fontSize: 13, color: 'var(--rx-faint)' }}>12 members · 3 games this week</div>
              </div>
              <span style={{ fontSize: 16, color: '#C2BBB0' }}>›</span>
            </button>
          </div>
        </div>

        {/* TRY SOMETHING NEW */}
        <div style={{ marginTop: 36 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--rx-ghost)', marginBottom: 14 }}>Try something new</div>
          <div style={{ background: '#fff', border: '1px solid #EEEAE3', borderRadius: 22, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <Avatar person={P.leon} size={42} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: '-0.01em' }}>Padel · Saturday mornings</div>
                <div style={{ fontSize: 13, color: 'var(--rx-faint)' }}>Leon hosts · 3 of your circle already play</div>
              </div>
            </div>
            <div style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--rx-muted)', marginBottom: 14 }}>
              You said you wanted to try padel. This one's run by someone Priya's played with fourteen times — a soft landing, not a stranger's game.
            </div>
            <button
              onClick={() => setInterested(true)}
              disabled={interested}
              aria-label={interested ? 'Priya will introduce you' : 'Interested — ask Priya to introduce you'}
              style={{
                width: '100%', fontSize: 13.5, fontWeight: 600, padding: 12, borderRadius: 99,
                cursor: interested ? 'default' : 'pointer',
                ...(interested
                  ? { border: 'none', background: 'var(--rx-green-tint)', color: 'var(--rx-green)' }
                  : { border: '1.5px solid var(--rx-green)', background: 'none', color: 'var(--rx-green)' }),
              }}
            >
              {interested ? "Priya will introduce you ✓" : "I'm interested — ask Priya to intro"}
            </button>
          </div>
        </div>

        {/* SEARCH — secondary, refines rather than replaces */}
        {searchOpen ? (
          <div style={{ marginTop: 30 }}>
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Sport, venue, or person…"
              aria-label="Search all games"
              style={{ width: '100%', fontSize: 15, fontFamily: 'inherit', padding: '13px 18px', borderRadius: 99, border: '1px solid #E7E2D9', background: '#fff', color: 'var(--rx-ink)', outline: 'none', marginBottom: 16 }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {results.map(g => (
                <button
                  key={g.venue}
                  onClick={() => setExpanded(true)}
                  aria-label={`${g.venue}, ${g.when}`}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '14px 0', borderTop: '1px solid var(--rx-hairline)', cursor: 'pointer' }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>{g.venue}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--rx-faint)', marginTop: 2 }}>{g.when} · {g.who}</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--rx-green)', background: 'var(--rx-green-tint)', padding: '4px 10px', borderRadius: 99, flexShrink: 0 }}>{g.sport}</span>
                </button>
              ))}
              {results.length === 0 && (
                <div style={{ padding: '18px 0', fontSize: 13.5, color: 'var(--rx-muted)', borderTop: '1px solid var(--rx-hairline)' }}>
                  Nothing matches — try another sport, or gather your own game.
                </div>
              )}
            </div>
            <button
              onClick={() => { setSearchOpen(false); setQuery(''); }}
              style={{ width: '100%', marginTop: 8, background: 'none', border: 'none', fontSize: 13, fontWeight: 600, color: '#9C968C', padding: 10, cursor: 'pointer' }}
            >
              Close search
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            style={{ width: '100%', marginTop: 30, background: 'none', border: 'none', fontSize: 14, fontWeight: 600, color: '#9C968C', padding: 12, cursor: 'pointer' }}
          >
            Search all games
          </button>
        )}
      </div>
    </div>
  );
}
