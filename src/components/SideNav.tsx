import { useNavigate, useLocation } from 'react-router';
import { Home, Users, Plus, Bell, User } from 'lucide-react';

const NAV = [
  { icon: Home,  label: 'Games',         path: '/' },
  { icon: Users, label: 'Groups',        path: '/groups' },
  { icon: Plus,  label: 'Post a game',   path: '/post' },
  { icon: Bell,  label: 'Notifications', path: '/notifications' },
  { icon: User,  label: 'Profile',       path: '/profile' },
];

export function SideNav() {
  const navigate   = useNavigate();
  const location   = useLocation();

  return (
    <aside
      className="hidden md:flex flex-col flex-shrink-0"
      style={{
        width: 220,
        height: '100vh',
        position: 'sticky',
        top: 0,
        borderRight: '1px solid rgba(0,0,0,0.06)',
        paddingTop: 36,
      }}
    >
      {/* Wordmark */}
      <div style={{ padding: '0 28px 44px' }}>
        <span style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 22, color: '#042b2b', letterSpacing: '-0.02em' }}>
          ringer.
        </span>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1 }}>
        {NAV.map(({ icon: Icon, label, path }) => {
          const isActive = path === '/'
            ? location.pathname === '/' || location.pathname.startsWith('/game/')
            : location.pathname.startsWith(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="w-full flex items-center gap-3"
              style={{
                padding: '11px 28px',
                background: isActive ? 'rgba(4,43,43,0.07)' : 'transparent',
                color: isActive ? '#042b2b' : '#888',
                fontFamily: 'Inter',
                fontWeight: isActive ? 500 : 400,
                fontSize: 15,
                letterSpacing: '-0.01em',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.1s',
              }}
            >
              <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
              {label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
