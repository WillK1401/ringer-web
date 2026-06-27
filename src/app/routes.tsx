import { createBrowserRouter, Outlet } from 'react-router';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { GamesList } from '../screens/GamesList';
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
import { SideNav } from '../components/SideNav';
import { BottomNav } from '../components/BottomNav';

function ProtectedLayout() {
  return (
    <>
      <SignedIn>
        <div className="flex min-h-screen" style={{ backgroundColor: '#F0EDE6' }}>
          <SideNav />
          <div className="flex-1 min-w-0">
            <Outlet />
          </div>
        </div>
        <BottomNav />
      </SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  );
}

export const router = createBrowserRouter([
  {
    element: <ProtectedLayout />,
    children: [
      { path: '/',             Component: GamesList },
      { path: '/onboarding',   Component: Onboarding },
      { path: '/game/:id',     Component: GameDetail },
      { path: '/map',          Component: NearMeMap },
      { path: '/post',         Component: PostGame },
      { path: '/chat',         Component: ChatList },
      { path: '/chat/thread',  Component: ChatThread },
      { path: '/profile',      Component: Profile },
      { path: '/connections',    Component: Connections },
      { path: '/users/:id',      Component: UserProfile },
      { path: '/notifications',  Component: Notifications },
      { path: '/groups',         Component: Groups },
      { path: '/groups/:id',     Component: GroupDetail },
    ],
  },
  { path: '/sign-in/*', Component: SignIn },
  { path: '/sign-up/*', Component: SignUp },
]);
