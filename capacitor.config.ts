import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.ringer.mobile',
  appName: 'Ringer',
  webDir: 'dist',
  server: {
    // Clerk-hosted auth and Stripe onboarding render inside the WebView.
    // Both Clerk instances are listed so the app keeps working whichever one
    // the keys point at · production is bound to the custom domain, and
    // *.clerk.accounts.dev covers the development instance.
    allowNavigation: [
      'clerk.ringerapp.co.uk',
      'accounts.ringerapp.co.uk',
      '*.clerk.accounts.dev',
      '*.stripe.com',
      'ringerapp.co.uk',
      'www.ringerapp.co.uk',
      'ringer-api-production.up.railway.app',
    ],
  },
  ios: {
    contentInset: 'never',
    backgroundColor: '#FBFAF7',
  },
};

export default config;
