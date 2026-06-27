import { useNavigate, useLocation } from 'react-router';
import { Home, Users, Plus, Bell, User } from 'lucide-react';

const NAV = [
  { icon: Home, path: '/' },
  { icon: Users, path: '/groups' },
  { icon: Plus, path: '/post' },
  { icon: Bell, path: '/notifications' },
  { icon: User, path: '/profile' },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{ backgroundColor: '#F0EDE6', borderTop: '1px solid rgba(0,0,0,0.06)' }}
    >
      <div className="flex justify-around items-center h-[70px]">
        {NAV.map(({ icon: Icon, path }) => {
          const isActive =
            path === '/'
              ? location.pathname === '/' || location.pathname.startsWith('/game/')
              : location.pathname.startsWith(path);
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="flex items-center justify-center flex-1 h-full"
              style={{ opacity: isActive ? 1 : 0.25 }}
            >
              <Icon size={22} strokeWidth={1.5} color={isActive ? '#042b2b' : '#1a1a1a'} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
