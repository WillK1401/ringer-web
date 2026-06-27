import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.ringer.mobile',
  appName: 'Ringer',
  webDir: 'dist',
  server: {
    // Allow Capacitor to use the live Vercel URL in development for faster iteration.
    // Remove this block before submitting to the App Store.
    // url: 'https://ringer-web.vercel.app',
    // allowNavigation: ['ringer-api-production.up.railway.app'],
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#F0EDE6',
  },
};

export default config;
