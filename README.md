# ringer-web

The Ringer web app — built with React, Vite, Clerk and Stripe.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create your .env file
```bash
cp .env.example .env
```

Fill in the three values:

| Variable | Where to find it |
|---|---|
| `VITE_API_URL` | Your Railway URL + `/api/v1` e.g. `https://ringer-api.railway.app/api/v1` |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk dashboard → API Keys → Publishable key |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe dashboard → Developers → API Keys → Publishable key |

### 3. Run locally
```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### 4. Deploy

Push to GitHub, connect to Railway (or Vercel/Netlify), and add the three env vars.
Build command: `npm run build`
Output directory: `dist`

## Screens

| Route | Screen |
|---|---|
| `/` | Games feed |
| `/game/:id` | Game detail + claim spot |
| `/map` | Near me map |
| `/post` | Post a game |
| `/chat` | Chat list |
| `/chat/thread?gameId=X` | Game chat thread |
| `/chat/thread?groupId=X` | Group chat thread |
| `/profile` | Your profile + Stripe onboarding |
| `/connections` | Connections + pending requests |
| `/sign-in` | Sign in (Clerk) |
| `/sign-up` | Sign up (Clerk) |
