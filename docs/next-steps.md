# Ringer — Next Steps & Backlog

Items are ordered by priority. Complete each section before moving to the next.

---

## 🔴 Immediate (unblock the app)

### 1. Fill in ringer-web/.env
```
VITE_API_URL=https://ringer-api-production.up.railway.app/api/v1
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxx   ← Clerk dashboard → API Keys
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx  ← Stripe dashboard → Developers → API Keys
```
Restart dev server after saving. Sign-in screen should appear.

### 2. Test the full sign-up → game → pay flow
- Create account via sign-up screen
- Verify Clerk webhook fired → user exists in Postgres
- Complete Stripe onboarding via Profile tab
- Post a test game
- Open incognito window, create second account, connect with first
- Find the game in the feed, claim a spot, complete test payment
- Verify payment shows in Stripe dashboard (test mode)

---

## 🟡 Backend — missing features

### 3. Fix placeholder email in games.controller.ts
In `src/controllers/games.controller.ts`, find:
```typescript
const ringerEmail = `${req.user!.handle}@ringer.app`; // placeholder
```
Replace with a real Clerk API call:
```typescript
import { clerkClient } from '@clerk/clerk-sdk-node';
const clerkUser = await clerkClient.users.getUser(req.user!.clerkId);
const ringerEmail = clerkUser.emailAddresses[0]?.emailAddress ?? `${req.user!.handle}@ringer.app`;
```

### 4. Build Groups routes
Backend schema exists (`groups`, `group_members` tables). Need to build:
- `src/routes/groups.ts`
- `src/controllers/groups.controller.ts`
- `src/services/groups.service.ts`
Then uncomment the groups router in `src/routes/index.ts`.

CRUD operations needed:
- `GET /groups` — my groups
- `POST /groups` — create group
- `GET /groups/:id` — group detail
- `POST /groups/:id/members` — add member
- `DELETE /groups/:id/members/:userId` — remove member

### 5. Build Chat API
Chat is currently real-time only (Socket.io). Need persistence:
- `GET /games/:id/messages` — message history for a game thread
- `GET /groups/:id/messages` — message history for a group thread
- Socket.io emit should also INSERT into `chat_messages` table

### 6. Wire up auto-escalation cron job
`runVisibilityEscalation()` in `src/services/visibility.service.ts` is written but not scheduled.

Options:
- Add a Railway cron service that calls `POST /api/v1/internal/escalate` every 15 minutes
- Or add node-cron as a dependency and call it from server.ts on startup

### 7. Fix Socket.io auth
In `src/server.ts`, the Socket.io auth middleware has a TODO:
```typescript
// TODO: verify Clerk session token here
```
Replace with:
```typescript
import { clerkClient } from '@clerk/clerk-sdk-node';
const { sessionId, token } = socket.handshake.auth;
await clerkClient.sessions.verifySession(sessionId, token);
```

---

## 🟡 Frontend — missing screens

### 8. Onboarding screen
New users need to set their handle after sign-up. Currently the Clerk webhook auto-generates one. Build a proper onboarding screen that:
- Shows after first sign-in if user has no custom handle
- Lets them pick their handle
- Calls `PATCH /users/me` to save it

### 9. Groups screens
- `src/screens/GroupsList.tsx` — list of groups with unread badges + next game
- `src/screens/GroupDetail.tsx` — members, recurring schedule, group chat button

### 10. Notification centre
- `src/screens/Notifications.tsx`
- Needs a `GET /notifications` endpoint on the backend (schema exists, route not built)

### 11. Other user profile screen
- `src/screens/UserProfile.tsx` — public view of another user's profile
- Show stats, reliability score, games in common
- "Connect" button that calls `POST /connections`
- Accessible from: avatar stacks on game cards, connection lists

### 12. Add lat/lng to PostGame form
Currently venue coordinates are not captured. Add a venue search input with geocoding:
- Use Mapbox Geocoding API (free tier generous) or Google Places API
- When user selects a venue from autocomplete, store lat/lng
- This makes the Near Me map actually useful

---

## 🟢 Deployment

### 13. Deploy ringer-web
Push to a new GitHub repo, then connect to Railway as a static site:
- Build command: `npm run build`
- Output directory: `dist`
- Add the 3 env vars (VITE_API_URL, VITE_CLERK_PUBLISHABLE_KEY, VITE_STRIPE_PUBLISHABLE_KEY)

Or use Vercel (free, faster):
```bash
npm install -g vercel
vercel
```

### 14. Update CORS_ORIGINS in ringer-api Railway variables
Once ringer-web has a real domain, add it to `CORS_ORIGINS`:
```
CORS_ORIGINS=https://your-ringer-web-domain.railway.app,http://localhost:5173
```

### 15. Update APP_URL in ringer-api
```
APP_URL=https://ringer-api-production.up.railway.app
```
(Should already be set but confirm it's not still the placeholder value)

---

## 🔵 Pre-launch checklist

Before any real users:
- [ ] Switch Clerk from test to production keys
- [ ] Switch Stripe from test mode to live mode
- [ ] Complete Stripe business verification (required for live payments)
- [ ] Run a closed beta with 10–20 real users on TestFlight / web link
- [ ] Test cancellation + refund flow end to end
- [ ] Add error tracking (Sentry — free tier)
- [ ] Set up uptime monitoring (Railway has this built in, or use BetterStack)
- [ ] Write privacy policy + terms of service (required by Stripe and Apple)

---

## 🔵 Future features (post-launch)

- Native iOS/Android app via React Native + Expo
- Push notifications via Firebase Cloud Messaging
- Recurring game series (backend schema exists, UI not built)
- Player ratings after games
- Venue search / saved venues
- Deep links (share a game link that opens the app)
- Waitlist for full games
- Group admin controls (mute, remove member)
