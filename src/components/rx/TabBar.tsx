import { useNavigate, useLocation } from 'react-router';

const G = '#1C7C54';
const GHOST = '#A39E94';

function DiscoverIcon({ active }: { active: boolean }) {
  const c = active ? G : GHOST;
  return (
    <div style={{ width: 22, height: 22, borderRadius: '50%', border: `${active ? 2.4 : 2.2}px solid ${c}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: active ? 7 : 6, height: active ? 7 : 6, borderRadius: '50%', background: c }} />
    </div>
  );
}

function NetworkIcon({ active }: { active: boolean }) {
  const c = active ? G : GHOST;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="8.5" cy="10" r="3.4" stroke={c} strokeWidth={active ? 2.4 : 2} />
      <circle cx="15.5" cy="10" r="3.4" stroke={c} strokeWidth={active ? 2.4 : 2} />
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

function YouIcon({ active }: { active: boolean }) {
  const c = active ? G : GHOST;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.4" stroke={c} strokeWidth={active ? 2.4 : 2} />
    </svg>
  );
}

export function TabBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isDiscover = pathname === '/' || pathname.startsWith('/game/');
  const isNetwork  = pathname.startsWith('/network') || pathname.startsWith('/connections') || pathname.startsWith('/users/');
  const isGather   = pathname.startsWith('/gather');
  const isActivity = pathname.startsWith('/activity') || pathname.startsWith('/notifications') || pathname.startsWith('/chat');
  const isYou      = pathname.startsWith('/profile') || pathname.startsWith('/settings');

  const label = (text: string, active: boolean) => (
    <span style={{ fontSize: 10.5, fontWeight: active ? 600 : 500, color: active ? G : GHOST }}>{text}</span>
  );

  const itemStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
    background: 'none', border: 'none', cursor: 'pointer', padding: 0, minWidth: 52,
  };

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: 'calc(82px + env(safe-area-inset-bottom))',
      background: 'rgba(251,250,247,0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderTop: '1px solid #EDEAE3',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-around',
      padding: '12px 18px calc(env(safe-area-inset-bottom))', flexShrink: 0, zIndex: 25,
    }}>
      <button onClick={() => navigate('/')} aria-label="Discover" aria-current={isDiscover ? 'page' : undefined} style={itemStyle}>
        <DiscoverIcon active={isDiscover} />
        {label('Discover', isDiscover)}
      </button>
      <button onClick={() => navigate('/network')} aria-label="Network" aria-current={isNetwork ? 'page' : undefined} style={itemStyle}>
        <NetworkIcon active={isNetwork} />
        {label('Network', isNetwork)}
      </button>
      <button onClick={() => navigate('/gather')} aria-label="Gather" aria-current={isGather ? 'page' : undefined} style={{ ...itemStyle, marginTop: -6 }}>
        <div style={{
          width: 46, height: 46, borderRadius: '50%', background: G,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 18px -6px rgba(28,124,84,0.5)',
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" /></svg>
        </div>
        {isGather && label('Gather', true)}
      </button>
      <button onClick={() => navigate('/activity')} aria-label="Activity" aria-current={isActivity ? 'page' : undefined} style={itemStyle}>
        <InboxIcon active={isActivity} />
        {label('Activity', isActivity)}
      </button>
      <button onClick={() => navigate('/profile')} aria-label="You" aria-current={isYou ? 'page' : undefined} style={itemStyle}>
        <YouIcon active={isYou} />
        {label('You', isYou)}
      </button>
    </div>
  );
}
