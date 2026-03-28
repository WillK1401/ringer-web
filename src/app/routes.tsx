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

function ProtectedLayout() {
  return (
    <>
      <SignedIn><Outlet /></SignedIn>
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
      { path: '/connections',  Component: Connections },
    ],
  },
  { path: '/sign-in/*', Component: SignIn },
  { path: '/sign-up/*', Component: SignUp },
]);
