import { createBrowserRouter, Outlet, useLocation } from 'react-router';
import { AnimatePresence } from 'framer-motion';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { PageTransition } from '../components/PageTransition';
import { Discover } from '../screens/rx/Discover';
import { Network } from '../screens/rx/Network';
import { Gather } from '../screens/rx/Gather';
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

/**
 * iOS-first shell: a single phone-width column with the Core Experiences
 * tab bar pinned to the base. On desktop the column is centred so the app
 * still previews sensibly in a browser.
 */
function ProtectedLayout() {
  const location = useLocation();
  return (
    <>
      <SignedIn>
        <div className="rx" style={{ minHeight: '100dvh', display: 'flex', justifyContent: 'center', background: '#EEEBE5' }}>
          <div style={{
            position: 'relative', width: '100%', maxWidth: 430, height: '100dvh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            background: 'var(--rx-paper)',
          }}>
            <div className="scr" style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflowY: 'auto', paddingTop: 12 }}>
              <AnimatePresence mode="wait" initial={false}>
                <PageTransition key={location.pathname}>
                  <Outlet />
                </PageTransition>
              </AnimatePresence>
            </div>
            <TabBar />
          </div>
        </div>
      </SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  );
}

export const router = createBrowserRouter([
  {
    element: <ProtectedLayout />,
    children: [
      // Core experiences
      { path: '/',        Component: Discover },
      { path: '/network', Component: Network },
      { path: '/gather',  Component: Gather },

      // Existing screens (Inbox, You, and legacy flows)
      { path: '/onboarding',     Component: Onboarding },
      { path: '/game/:id',       Component: GameDetail },
      { path: '/map',            Component: NearMeMap },
      { path: '/post',           Component: PostGame },
      { path: '/chat',           Component: ChatList },
      { path: '/chat/thread',    Component: ChatThread },
      { path: '/profile',        Component: Profile },
      { path: '/connections',    Component: Connections },
      { path: '/users/:id',      Component: UserProfile },
      { path: '/notifications',  Component: Notifications },
      { path: '/games',          Component: MyGames },
      { path: '/groups',         Component: Groups },
      { path: '/groups/:id',     Component: GroupDetail },
    ],
  },
  { path: '/sign-in/*', Component: SignIn },
  { path: '/sign-up/*', Component: SignUp },
]);
