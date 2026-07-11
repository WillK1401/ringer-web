import { SignIn as ClerkSignIn } from '@clerk/clerk-react';

const FOREST = '#3E5236';
const PAPER = '#FBFAF7';

export function SignIn() {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 'calc(env(safe-area-inset-top) + 40px) 24px calc(env(safe-area-inset-bottom) + 40px)', background: PAPER, fontFamily: "'Schibsted Grotesk', system-ui, sans-serif" }}>
      <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', color: FOREST, marginBottom: 6 }}>
        ringer<span style={{ color: '#6FA84E' }}>.</span>
      </div>
      <div className="serif" style={{ fontFamily: "'Newsreader', Georgia, serif", fontStyle: 'italic', fontSize: 15, color: '#6B665E', marginBottom: 34 }}>
        Welcome back.
      </div>
      <ClerkSignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/"
        appearance={{
          variables: { colorPrimary: FOREST, borderRadius: '14px', fontFamily: "'Schibsted Grotesk', system-ui, sans-serif" },
          elements: {
            rootBox: { width: '100%', maxWidth: 360 },
            card: { backgroundColor: '#fff', boxShadow: 'none', border: '1px solid #EEEAE3', borderRadius: 20 },
            formButtonPrimary: { backgroundColor: FOREST, borderRadius: 99, textTransform: 'none', fontWeight: 600 },
            footerActionLink: { color: FOREST },
          },
        }}
      />
    </div>
  );
}
