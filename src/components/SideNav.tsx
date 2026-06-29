import { useNavigate, useLocation } from 'react-router';
import { Compass, Users, Calendar, Inbox, User } from 'lucide-react';

const NAV = [
  { icon: Compass,  label: 'Discover', path: '/'             },
  { icon: Users,    label: 'Network',  path: '/connections'  },
  { icon: Calendar, label: 'Games',    path: '/games'        },
  { icon: Inbox,    label: 'Inbox',    path: '/notifications'},
  { icon: User,     label: 'Profile',  path: '/profile'      },
];

function isActive(path: string, pathname: string): boolean {
  if (path === '/') return pathname === '/' || pathname.startsWith('/game/');
  if (path === '/connections') return pathname.startsWith('/connections') || pathname.startsWith('/groups') || pathname.startsWith('/users/');
  if (path === '/games') return pathname === '/games' || pathname === '/post';
  if (path === '/notifications') return pathname === '/notifications' || pathname.startsWith('/chat');
  return pathname.startsWith(path);
}

export function SideNav() {
  const navigate = useNavigate();
  const location = useLocation();

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
      <nav style={{ flex: 1, padding: '0 12px' }} aria-label="Main navigation">
        {NAV.map(({ icon: Icon, label, path }) => {
          const active = isActive(path, location.pathname);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              aria-current={active ? 'page' : undefined}
              className={`nav-item w-full flex items-center gap-3${active ? ' active' : ''}`}
              style={{
                padding: '11px 16px',
                background: active ? 'rgba(4,43,43,0.07)' : 'transparent',
                color: active ? '#042b2b' : '#888',
                fontFamily: 'Inter',
                fontWeight: active ? 600 : 400,
                fontSize: 15,
                letterSpacing: '-0.01em',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'left',
                marginBottom: 2,
              }}
            >
              <Icon size={18} strokeWidth={active ? 2 : 1.5} aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
