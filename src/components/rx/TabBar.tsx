import { useNavigate, useLocation } from 'react-router';

const G = '#3E5236';
const GHOST = '#7C7669';

function HomeIcon({ active }: { active: boolean }) {
  const c = active ? G : GHOST;
  const w = active ? 2.4 : 2;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 11l8-6 8 6" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9h12v-9" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InboxIcon({ active }: { active: boolean }) {
  const c = active ? G : GHOST;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="6" width="16" height="12" rx="3" stroke={c} strokeWidth={active ? 2.4 : 2} />
    </svg>
  );
}

/**
 * Bottom nav · lean three-item bar. The app's two jobs now live on Home
 * (find a game / organise one), so the bar carries only the persistent
 * returns: Home, the Gather create button (the crux, one tap from
 * anywhere), and Activity. Profile ("You") is the header avatar; Network
 * lives inside Sporting Life. Discover is reached from Home.
 */
export function TabBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isHome     = pathname === '/' || pathname.startsWith('/discover') || pathname.startsWith('/game/');
  const isGather   = pathname.startsWith('/gather');
  const isActivity = pathname.startsWith('/activity') || pathname.startsWith('/notifications') || pathname.startsWith('/chat');

  const label = (text: string, active: boolean) => (
    <span style={{ fontSize: 10.5, fontWeight: active ? 600 : 500, color: active ? G : GHOST }}>{text}</span>
  );

  const itemStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    background: 'none', border: 'none', cursor: 'pointer', padding: 0, minWidth: 52, minHeight: 44,
  };

  // Background pill behind the active icon — clearer selected state
  const iconWrap = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 46, height: 30, borderRadius: 99,
    background: active ? 'var(--rx-green-tint)' : 'transparent',
    transition: 'background 180ms cubic-bezier(0.22,1,0.36,1)',
  });

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 'calc(82px + env(safe-area-inset-bottom))',
      background: 'rgba(251,250,247,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid #EDEAE3',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-around',
      padding: '12px 40px calc(env(safe-area-inset-bottom))', flexShrink: 0, zIndex: 25,
    }}>
      <button onClick={() => navigate('/')} aria-label="Home" aria-current={isHome ? 'page' : undefined} style={itemStyle}>
        <div style={iconWrap(isHome)}><HomeIcon active={isHome} /></div>
        {label('Home', isHome)}
      </button>
      <button onClick={() => navigate('/gather')} aria-label="Gather a game" aria-current={isGather ? 'page' : undefined} style={{ ...itemStyle, marginTop: -6 }}>
        <div style={{
          width: 46, height: 46, borderRadius: '50%', background: G,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: isGather ? '0 10px 22px -6px rgba(62,82,54,0.6)' : '0 8px 18px -6px rgba(62,82,54,0.5)',
          transform: isGather ? 'scale(1.04)' : 'scale(1)', transition: 'all 180ms cubic-bezier(0.22,1,0.36,1)',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" /></svg>
        </div>
        {isGather && label('Gather', true)}
      </button>
      <button onClick={() => navigate('/activity')} aria-label="Activity" aria-current={isActivity ? 'page' : undefined} style={itemStyle}>
        <div style={iconWrap(isActivity)}><InboxIcon active={isActivity} /></div>
        {label('Activity', isActivity)}
      </button>
    </div>
  );
}
