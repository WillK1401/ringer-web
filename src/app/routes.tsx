import { useEffect, useState } from 'react';
import { createBrowserRouter, Outlet, useLocation, useParams, Navigate } from 'react-router';
import { AnimatePresence } from 'framer-motion';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { PageTransition } from '../components/PageTransition';
import { Home } from '../screens/rx/Home';
import { Discover } from '../screens/rx/Discover';
import { Network } from '../screens/rx/Network';
import { Gather } from '../screens/rx/Gather';
import { Activity } from '../screens/rx/Activity';
import { SportingLife } from '../screens/rx/SportingLife';
import { EditProfile } from '../screens/rx/EditProfile';
import { GameDetail } from '../screens/GameDetail';
import { NearMeMap } from '../screens/NearMeMap';
import { PostGame } from '../screens/PostGame';
import { ChatList } from '../screens/ChatList';
import { ChatThread } from '../screens/ChatThread';
import { Profile } from '../screens/Profile';
import { Connections } from '../screens/Connections';
import { SignIn } from '../screens/SignIn';
import { SignUp } from '../screens/SignUp';
import { Onboarding } from '../screens/Onboarding';
import { UserProfile } from '../screens/UserProfile';
import { Notifications } from '../screens/Notifications';
import { Groups } from '../screens/Groups';
import { GroupDetail } from '../screens/GroupDetail';
import { MyGames } from '../screens/MyGames';
import { TabBar } from '../components/rx/TabBar';
import { Landing, Splash } from '../screens/rx/Landing';
import { InviteGate, savePendingInvite } from '../screens/rx/InviteGate';
import { usersApi } from '../lib/api';
import { AccountSettings } from '../screens/rx/AccountSettings';

/**
 * iOS-first shell: a single phone-width column with the Core Experiences
 * tab bar pinned to the base. On desktop the column is centred so the app
 * still previews sensibly in a browser.
 */
/** Invite gate · a signed-in account only reaches the app once admitted. */
function AdmittedOnly({ children }: { children: React.ReactNode }) {
  const [admitted, setAdmitted] = useState<boolean | null>(null);

  const check = () => {
    usersApi.getMe()
      .then(u => setAdmitted(Boolean(u?.admitted)))
      // If we cannot tell (offline, API down), don't lock a real member out
      .catch(() => setAdmitted(true));
  };
  useEffect(check, []);

  if (admitted === null) return <Splash />;
  if (!admitted) return <InviteGate onAdmitted={() => setAdmitted(true)} />;
  return <>{children}</>;
}

/** /join/:code · keep the code, then let the normal auth flow run. */
function JoinWithCode() {
  const { code } = useParams();
  useEffect(() => { if (code) savePendingInvite(code.toUpperCase()); }, [code]);
  return <Navigate to="/" replace />;
}

function ProtectedLayout() {
  const location = useLocation();
  return (
    <>
      <SignedIn>
        <AdmittedOnly>
          <div className="rx" style={{ minHeight: '100dvh', display: 'flex', justifyContent: 'center', background: '#EEEBE5' }}>
            <div style={{
              position: 'relative', width: '100%', maxWidth: 430, height: '100dvh',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              background: 'var(--rx-paper)',
            }}>
              <div className="scr" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingTop: 'calc(12px + env(safe-area-inset-top))' }}>
                <AnimatePresence mode="wait" initial={false}>
                  <PageTransition key={location.pathname}>
                    <Outlet />
                  </PageTransition>
                </AnimatePresence>
              </div>
              <TabBar />
            </div>
          </div>
        </AdmittedOnly>
      </SignedIn>
      <SignedOut><Landing /></SignedOut>
    </>
  );
}

export const router = createBrowserRouter([
  {
    element: <ProtectedLayout />,
    children: [
      // Core experiences
      { path: '/',         Component: Home },
      { path: '/discover', Component: Discover },
      { path: '/network',  Component: Network },
      { path: '/gather',   Component: Gather },
      { path: '/activity', Component: Activity },
      { path: '/profile',      Component: SportingLife },
      { path: '/profile/edit', Component: EditProfile },

      // Existing screens (settings and legacy flows)
      { path: '/onboarding',     Component: Onboarding },
      { path: '/game/:id',       Component: GameDetail },
      { path: '/map',            Component: NearMeMap },
      { path: '/post',           Component: PostGame },
      { path: '/chat',           Component: ChatList },
      { path: '/chat/thread',    Component: ChatThread },
      { path: '/settings',       Component: AccountSettings },
      { path: '/connections',    Component: Connections },
      { path: '/users/:id',      Component: UserProfile },
      { path: '/notifications',  Component: Notifications },
      { path: '/games',          Component: MyGames },
      { path: '/groups',         Component: Groups },
      { path: '/groups/:id',     Component: GroupDetail },
    ],
  },
  { path: '/join/:code', Component: JoinWithCode },
  { path: '/sign-in/*', Component: SignIn },
  { path: '/sign-up/*', Component: SignUp },
]);
