import { useNavigate, useLocation } from 'react-router';
import { Compass, Users, Calendar, Inbox, User } from 'lucide-react';

const NAV = [
  { icon: Compass,  path: '/',             label: 'Discover' },
  { icon: Users,    path: '/connections',   label: 'Network'  },
  { icon: Calendar, path: '/games',         label: 'Games'    },
  { icon: Inbox,    path: '/notifications', label: 'Inbox'    },
  { icon: User,     path: '/profile',       label: 'Profile'  },
];

function isActive(path: string, pathname: string): boolean {
  if (path === '/') return pathname === '/' || pathname.startsWith('/game/');
  if (path === '/connections') return pathname.startsWith('/connections') || pathname.startsWith('/groups') || pathname.startsWith('/users/');
  if (path === '/games') return pathname === '/games' || pathname === '/post';
  if (path === '/notifications') return pathname === '/notifications' || pathname.startsWith('/chat');
  return pathname.startsWith(path);
}

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{ backgroundColor: '#F0EDE6', borderTop: '1px solid rgba(0,0,0,0.06)' }}
    >
      <div className="flex justify-around items-center h-[70px]">
        {NAV.map(({ icon: Icon, path, label }) => {
          const active = isActive(path, location.pathname);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className="flex flex-col items-center justify-center flex-1 h-full gap-1"
              style={{ opacity: active ? 1 : 0.3 }}
            >
              <Icon size={21} strokeWidth={active ? 2 : 1.5} color={active ? '#042b2b' : '#1a1a1a'} />
              <span style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: active ? 600 : 400, color: active ? '#042b2b' : '#666', letterSpacing: '-0.01em' }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
