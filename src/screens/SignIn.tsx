import { SignIn as ClerkSignIn } from '@clerk/clerk-react';

export function SignIn() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: '#F0EDE6' }}>
      <div style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: 28, color: '#042b2b', letterSpacing: '-0.02em', marginBottom: 8 }}>
        ringer.
      </div>
      <div style={{ fontFamily: 'Inter', fontSize: 14, color: '#999', marginBottom: 40 }}>
        Find your game. Fill the gap.
      </div>
      <ClerkSignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/"
        appearance={{
          elements: {
            rootBox: { width: '100%', maxWidth: 340 },
            card: { backgroundColor: 'rgba(0,0,0,0.03)', boxShadow: 'none', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 16 },
            headerTitle: { fontFamily: 'Inter', color: '#1a1a1a' },
            headerSubtitle: { fontFamily: 'Inter', color: '#999' },
            formButtonPrimary: { backgroundColor: '#042b2b', fontFamily: 'Inter', borderRadius: 999 },
            footerActionLink: { color: '#042b2b', fontFamily: 'Inter' },
          }
        }}
      />
    </div>
  );
}
