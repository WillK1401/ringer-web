# Ringer — Claude Code Context

This file captures the full context of the Ringer project so Claude Code can pick up exactly where the previous session left off. Read this file before doing anything else.

---

## What is Ringer?

Ringer is a mobile-optimised web app for five-a-side football players to find last-minute ringers (substitute players) for their games. It works like LinkedIn for football — games are only visible to people within your connection network (1st or 2nd degree), keeping games safe and trusted. It handles payment collection automatically via Stripe, replacing the WhatsApp group + bank transfer workflow most five-a-side organisers currently use.

**Core concept:** Post a game → set visibility (1st connections / 2nd connections / public) → ringers claim spots → Stripe charges them automatically → everyone's sorted.

---

## Project Structure

There are two completely separate codebases. Both live in:
```
/Users/willkreibich/Documents/Ringer App/
├── ringer-api/     ← Node.js backend, deployed on Railway
└── ringer-web/     ← React web app, running locally / to be deployed
```

---

## Backend: `ringer-api`

### Status
✅ **Live on Railway** at `https://ringer-api-production.up.railway.app`
✅ Health check passing at `/api/v1/health`
✅ Database migrations run — all tables exist in Postgres

### Tech stack
- **Runtime:** Node.js 20 + TypeScript (strict: false)
- **Framework:** Express + Socket.io
- **Primary DB:** PostgreSQL (Railway managed)
- **Graph DB:** Neo4j Aura (connection graph — 1st/2nd degree lookups)
- **Cache:** Redis (Railway managed)
- **Auth:** Clerk
- **Payments:** Stripe Connect Standard
- **Hosting:** Railway

### Key architectural decisions
- **Neo4j for connections** — SQL "friends of friends" queries get slow at scale. Neo4j handles 1-2 hop graph traversals in milliseconds regardless of user count. Every accepted connection creates a `CONNECTED_TO` edge in Neo4j.
- **Stripe Connect Standard** — money goes directly from ringer to organiser's Stripe account. Ringer takes a platform fee via `application_fee_amount`. We never hold funds.
- **All money stored in pence** — integer arithmetic, no floating point bugs.
- **Visibility filtering in application code** — Postgres fetches candidate games, Neo4j returns the viewer's network, app code filters. This keeps the query logic clean and the graph DB doing what it's good at.
- **SELECT FOR UPDATE on slot claiming** — prevents race conditions when two people claim the last spot simultaneously.
- **strict: false + noEmitOnError: false in tsconfig** — pragmatic decision to unblock Railway builds. Can be tightened once a developer is on board.

### API routes
```
GET    /api/v1/health
GET    /api/v1/games              # Feed filtered by connection graph
POST   /api/v1/games              # Post a game (requires Stripe onboarding)
GET    /api/v1/games/:id          # Game detail + players
POST   /api/v1/games/:id/join     # Claim spot + create Stripe PaymentIntent
DELETE /api/v1/games/:id          # Cancel game + refund all players
DELETE /api/v1/games/:id/players/:playerId  # Leave game + refund

GET    /api/v1/users/me
PATCH  /api/v1/users/me
GET    /api/v1/users/me/connections
GET    /api/v1/users/me/connections/pending
GET    /api/v1/users/:id

POST   /api/v1/connections        # Send connection request
PATCH  /api/v1/connections/:id    # Accept
DELETE /api/v1/connections/:id    # Remove/decline

POST   /api/v1/payments/stripe/onboard   # Start Stripe Connect onboarding
GET    /api/v1/payments/stripe/status    # Check onboarding status

POST   /api/v1/webhooks/clerk     # user.created, user.updated, user.deleted
POST   /api/v1/webhooks/stripe    # payment_intent.succeeded, payment_intent.payment_failed, account.updated
```

### Environment variables (all set in Railway)
```
NODE_ENV=production
PORT=3000
API_VERSION=v1
APP_URL=https://ringer-api-production.up.railway.app

DATABASE_URL=           # Auto-set by Railway Postgres service
REDIS_URL=              # Auto-set by Railway Redis service

NEO4J_URI=              # neo4j+s://xxx.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=

CLERK_SECRET_KEY=       # sk_test_xxx
CLERK_PUBLISHABLE_KEY=  # pk_test_xxx
CLERK_WEBHOOK_SECRET=   # whsec_xxx

STRIPE_SECRET_KEY=      # sk_test_xxx
STRIPE_PUBLISHABLE_KEY= # pk_test_xxx
STRIPE_WEBHOOK_SECRET=  # whsec_xxx
STRIPE_PLATFORM_FEE_PERCENT=0.05

JWT_SECRET=             # 64-char random hex
CORS_ORIGINS=           # comma-separated allowed origins
LOG_LEVEL=info
```

### File structure
```
src/
├── config.ts                      # Zod env validation — fails fast if any var missing
├── server.ts                      # Express + Socket.io entry point
├── types/index.ts                 # Shared TypeScript types
├── middleware/
│   ├── auth.ts                    # Clerk JWT verification + user resolution
│   └── errorHandler.ts            # Centralised error handling + AppError class
├── db/
│   ├── postgres/
│   │   ├── client.ts              # Pool, query(), withTransaction()
│   │   ├── schema.sql             # Full DB schema
│   │   └── migrate.ts             # Run with: npm run db:migrate
│   ├── neo4j/
│   │   └── client.ts              # Driver + graphQueries object
│   └── redis/
│       └── client.ts              # Cache helpers + cacheKeys namespace
├── services/
│   ├── users.service.ts
│   ├── connections.service.ts
│   ├── games.service.ts
│   ├── visibility.service.ts      # THE KEY FILE — connection graph filtering
│   └── payments.service.ts        # Stripe Connect integration
├── controllers/
│   ├── users.controller.ts
│   └── games.controller.ts
└── routes/
    ├── index.ts                   # Central route registry
    ├── health.ts
    ├── users.ts
    ├── games.ts
    ├── connections.ts
    ├── payments.ts
    └── webhooks.ts                # Clerk + Stripe webhook handlers
```

### Known issues / TODOs
- **Placeholder email:** `games.controller.ts` uses `${user.handle}@ringer.app` as email for Stripe. Replace with real Clerk email lookup: `await clerkClient.users.getUser(req.user.clerkId)` then use `emailAddresses[0].emailAddress`.
- **Auto-escalation cron job:** `runVisibilityEscalation()` in `visibility.service.ts` is written but not wired to a scheduler. Add a Railway cron service that calls an internal endpoint every 15 minutes.
- **Groups and chat routes:** Not yet built. `routes/index.ts` has commented placeholders. Schema tables exist (`groups`, `group_members`, `chat_messages`).
- **Socket.io auth:** The Socket.io middleware in `server.ts` has a TODO comment — Clerk session token verification is not yet implemented. Add `@clerk/backend` and verify the token properly.

---

## Frontend: `ringer-web`

### Status
✅ Running locally at `http://localhost:5173`
⚠️ `.env` needs filling in — Clerk key not yet set, so auth is bypassed and API calls fail
🚧 Not yet deployed

### Tech stack
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS v4 + inline styles (matching Figma output)
- **Routing:** React Router v7
- **Auth:** Clerk React SDK
- **Payments:** Stripe.js + @stripe/react-stripe-js
- **Real-time:** Socket.io client
- **Design:** Swiss editorial aesthetic — cream `#F0EDE6` background, Inter font, dark green `#042b2b` primary

### Environment variables (in `ringer-web/.env`)
```
VITE_API_URL=https://ringer-api-production.up.railway.app/api/v1
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx   # From Clerk dashboard → API Keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx  # From Stripe dashboard → Developers → API Keys
```

### File structure
```
src/
├── main.tsx
├── styles/index.css
├── app/
│   ├── App.tsx        # ClerkProvider wrapper + RouterProvider
│   └── routes.tsx     # All route definitions
├── lib/
│   ├── api.ts         # All API calls to Railway backend
│   ├── utils.ts       # formatDate, formatTime, formatPrice helpers
│   └── socket.ts      # Socket.io connection singleton
├── components/
│   ├── BottomNav.tsx
│   ├── AvatarStack.tsx
│   ├── SlotBar.tsx
│   ├── VisibilityBadge.tsx
│   └── Spinner.tsx
└── screens/
    ├── GamesList.tsx      # Home feed — wired to API
    ├── GameDetail.tsx     # Game detail + Stripe payment
    ├── NearMeMap.tsx      # SVG map + game list
    ├── PostGame.tsx       # Post form — wired to API + Stripe onboarding
    ├── ChatList.tsx       # Empty state (threads accessible from game/group detail)
    ├── ChatThread.tsx     # Real Socket.io chat
    ├── Profile.tsx        # User profile + Stripe Connect onboarding
    ├── Connections.tsx    # Connections list + accept/decline pending
    ├── SignIn.tsx         # Clerk SignIn component
    └── SignUp.tsx         # Clerk SignUp component
```

### Screens not yet built
- Groups list
- Group detail
- Onboarding flow (handle setup after first sign-up)
- Notification centre
- Other user profile (view another user's public profile)

### Known issues / TODOs
- **Auth currently bypassed** — Clerk key not in `.env`. Once added, sign-in screen will appear correctly and API calls will work.
- **Chat threads** — `ChatList.tsx` shows an empty state. Real thread list needs an API endpoint that returns all game/group threads for the current user. Not yet built in the backend.
- **Map pins** — `NearMeMap.tsx` plots pins using lat/lng from the API. Games without coordinates won't appear on the map. The `postGame` form doesn't yet capture lat/lng — consider adding a venue search with geocoding (Google Places API or Mapbox Geocoding).
- **Stripe payment flow** — `GameDetail.tsx` calls `gamesApi.joinGame()` which returns a Stripe `clientSecret`, then calls `stripe.confirmPayment()`. This redirects to Stripe's hosted payment page. For a smoother UX, consider using Stripe Elements inline instead.

---

## Design system

Derived from the Figma Make export. Key tokens:

| Token | Value | Use |
|---|---|---|
| `--bg` | `#F0EDE6` | App background |
| `--fg` | `#1a1a1a` | Primary text |
| `--green` | `#042b2b` | Primary action colour |
| `--green-light` | `rgba(4,43,43,0.08)` | Hover / selected states |
| `--muted` | `#999` | Secondary text, labels |
| `--border` | `rgba(0,0,0,0.08)` | Dividers, card borders |
| `--card` | `rgba(0,0,0,0.03)` | Card backgrounds |

Font: **Inter** 400/500/600. Loaded from Google Fonts.

---

## Third-party services

| Service | Purpose | Dashboard |
|---|---|---|
| **Railway** | Hosts API + Postgres + Redis | railway.app |
| **Neo4j Aura** | Connection graph database | console.neo4j.io |
| **Clerk** | Authentication | dashboard.clerk.com |
| **Stripe** | Payments (Connect Standard) | dashboard.stripe.com |

### Webhook endpoints (must be configured in each dashboard)
- **Clerk webhook:** `https://ringer-api-production.up.railway.app/api/v1/webhooks/clerk`
  - Events: `user.created`, `user.updated`, `user.deleted`
- **Stripe webhook:** `https://ringer-api-production.up.railway.app/api/v1/webhooks/stripe`
  - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `account.updated`

---

## Immediate next steps (in priority order)

1. **Fill in `ringer-web/.env`** — add Clerk and Stripe publishable keys, restart dev server
2. **Test sign-in flow** — create an account, verify Clerk webhook fires and creates a user in Postgres
3. **Complete Stripe onboarding** — go to Profile tab, click "Connect Stripe", complete onboarding so you can post games
4. **Post a test game** — use the Post tab, verify it appears in the feed
5. **Test claiming a spot** — use a second browser/account to claim the spot, verify Stripe payment processes in test mode
6. **Deploy ringer-web** — push to GitHub, connect to Railway or Vercel as a static site

## Medium-term next steps

7. Fix the placeholder email in `games.controller.ts`
8. Build the groups screens (backend schema exists, routes not built)
9. Build the onboarding screen for new users (set handle after first sign-up)
10. Wire up the auto-escalation cron job on Railway
11. Add lat/lng capture to the PostGame form (venue geocoding)
12. Build the notification centre screen

---

## Running locally

### Backend (already deployed — you shouldn't need to run this locally)
```bash
cd /Users/willkreibich/Documents/Ringer\ App/ringer-api
npm install
npm run dev        # Dev server on port 3000
npm run db:migrate # Run if schema changes
```

### Frontend
```bash
cd /Users/willkreibich/Documents/Ringer\ App/ringer-web
npm install
npm run dev        # Dev server on http://localhost:5173
```

### Deploying frontend
```bash
npm run build      # Outputs to dist/
# Then push dist/ to Railway / Vercel / Netlify
```
