# Ringer API Reference

Base URL: `https://ringer-api-production.up.railway.app/api/v1`

All authenticated endpoints require a Clerk session token in the `Authorization: Bearer <token>` header.

---

## Health

### GET /health
No auth required. Used by Railway for health checks.

**Response 200**
```json
{
  "status": "ok",
  "timestamp": "2026-03-21T12:00:00.000Z",
  "services": {
    "postgres": true,
    "neo4j": true,
    "redis": true
  }
}
```

---

## Games

### GET /games
Returns the game feed filtered by the viewer's connection network.

**Query params**
| Param | Type | Default | Description |
|---|---|---|---|
| `day` | `today\|week\|all` | `today` | Time filter |
| `lat` | number | — | Viewer latitude for distance filtering |
| `lng` | number | — | Viewer longitude |
| `radiusKm` | number | 10 | Search radius |
| `page` | number | 1 | Pagination |
| `pageSize` | number | 20 | Results per page |

**Response 200** — Array of `GameFeedItem`
```json
[
  {
    "id": "uuid",
    "venue": "Goals Finsbury Park",
    "venueLatitude": 51.564,
    "venueLongitude": -0.106,
    "area": null,
    "kickoffAt": "2026-03-21T19:30:00.000Z",
    "format": "5-a-side",
    "playerCount": 10,
    "costPerPlayer": 800,
    "slotsOpen": 3,
    "status": "open",
    "visibility": "second",
    "accessTier": "second",
    "viaUser": { "id": "uuid", "displayName": "Jamie K.", ... },
    "organiser": { "id": "uuid", "displayName": "Tom R.", ... },
    "confirmedPlayers": [...],
    "group": { "id": "uuid", "name": "Tuesday Boys", "emoji": "⚽" },
    "isRecurring": true
  }
]
```

### POST /games
Post a new game. Organiser must have completed Stripe onboarding.

**Body**
```json
{
  "venue": "Goals Finsbury Park",
  "venueLatitude": 51.564,
  "venueLongitude": -0.106,
  "kickoffAt": "2026-03-21T19:30:00.000Z",
  "format": "5-a-side",
  "playerCount": 10,
  "pitchCost": 8000,
  "visibility": "second",
  "autoEscalate": true,
  "groupId": "uuid (optional)"
}
```

**Error 403** if Stripe not onboarded: `{ "code": "STRIPE_NOT_ONBOARDED" }`

### GET /games/:id
Returns game detail and player list.

**Response 200**
```json
{
  "game": { ...Game object... },
  "players": [ ...GamePlayer objects... ]
}
```

### POST /games/:id/join
Claim a spot. Returns a Stripe `clientSecret` for the client to confirm payment.

**Response 201**
```json
{
  "gamePlayer": { ...GamePlayer object... },
  "payment": {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx",
    "amountPence": 800,
    "currency": "gbp"
  }
}
```

**Error 403** `ACCESS_DENIED` — viewer not in connection network
**Error 409** `GAME_FULL` — no slots remaining
**Error 409** `ALREADY_JOINED` — viewer already in game

### DELETE /games/:id
Cancel game (organiser only). Triggers refunds for all paid players.

### DELETE /games/:id/players/:playerId
Leave a game. Only allowed more than 2 hours before kickoff. Triggers refund.

---

## Users

### GET /users/me
Returns full user object including Stripe status.

### PATCH /users/me
Update profile fields.

**Body** (all optional)
```json
{
  "displayName": "string",
  "handle": "string (lowercase, alphanumeric + underscore)",
  "city": "string",
  "latitude": 51.523,
  "longitude": -0.075
}
```

### GET /users/me/connections
Returns accepted connections with public user profiles.

### GET /users/me/connections/pending
Returns pending connection requests received by the current user.

### GET /users/:id
Returns public user profile (no Stripe/private fields).

---

## Connections

### POST /connections
Send a connection request.

**Body**
```json
{ "addresseeId": "uuid" }
```

### PATCH /connections/:id
Accept a pending request.

**Body**
```json
{ "action": "accept" }
```

### DELETE /connections/:id
Remove an accepted connection or decline a pending request.

---

## Payments

### POST /payments/stripe/onboard
Start Stripe Connect onboarding for an organiser.

**Response 200**
```json
{
  "accountId": "acct_xxx",
  "onboardingUrl": "https://connect.stripe.com/setup/..."
}
```

Redirect the user to `onboardingUrl`. Stripe will redirect back to `APP_URL/payments/complete`.

### GET /payments/stripe/status
Check if the current user has completed Stripe onboarding.

**Response 200**
```json
{
  "onboarded": true,
  "chargesEnabled": true
}
```

---

## Webhooks

### POST /webhooks/clerk
Receives Clerk lifecycle events. Verifies signature using `CLERK_WEBHOOK_SECRET`.

Events handled:
- `user.created` → creates Postgres user + Neo4j node
- `user.updated` → syncs display name
- `user.deleted` → soft-deletes user (anonymises data)

### POST /webhooks/stripe
Receives Stripe events. Verifies signature using `STRIPE_WEBHOOK_SECRET`. Requires raw body (not JSON parsed).

Events handled:
- `payment_intent.succeeded` → confirms player slot, inserts chat system message
- `payment_intent.payment_failed` → releases slot, reopens game
- `account.updated` → marks organiser as fully onboarded when `charges_enabled: true`

---

## Error format

All errors return JSON:
```json
{
  "error": "Human readable message",
  "code": "MACHINE_READABLE_CODE"
}
```

Validation errors (400) include an `issues` array:
```json
{
  "error": "Validation error",
  "issues": [
    { "path": "venue", "message": "Required" }
  ]
}
```
