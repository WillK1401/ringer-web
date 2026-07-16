import { ClerkProvider, ClerkLoading, ClerkLoaded, useAuth } from '@clerk/clerk-react';
import { RouterProvider } from 'react-router';
import { useEffect } from 'react';
import { router } from './routes';
import { setTokenGetter } from '../lib/api';
import { Splash } from '../screens/rx/Landing';

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!CLERK_KEY) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env');
}

// Wires the real Clerk getToken into the API client so every request is authenticated
function AuthTokenSync() {
  const { getToken } = useAuth();
  useEffect(() => {
    setTokenGetter(getToken);
  }, [getToken]);
  return null;
}

export default function App() {
  return (
    <ClerkProvider
      publishableKey={CLERK_KEY}
      afterSignOutUrl="/"
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
    >
      <ClerkLoading><Splash /></ClerkLoading>
      <ClerkLoaded>
        <AuthTokenSync />
        <RouterProvider router={router} />
      </ClerkLoaded>
    </ClerkProvider>
  );
}
