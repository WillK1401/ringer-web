import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.ringer.mobile',
  appName: 'Ringer',
  webDir: 'dist',
  server: {
    // Clerk-hosted auth and Stripe onboarding render inside the WebView
    allowNavigation: ['*.clerk.accounts.dev', '*.stripe.com', 'ringer-api-production.up.railway.app'],
  },
  ios: {
    contentInset: 'never',
    backgroundColor: '#FBFAF7',
  },
};

export default config;
