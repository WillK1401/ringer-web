# Ringer — Database Schema

## PostgreSQL (primary data store)

### Enums
```sql
visibility_tier:  first | second | public
connection_status: pending | accepted | blocked
game_status:      open | full | cancelled | completed
player_status:    confirmed | pending_payment | cancelled | no_show
payment_status:   pending | paid | refunded | failed
recurrence_type:  none | weekly | fortnightly
```

### users
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| clerk_id | TEXT UNIQUE | Clerk user ID |
| handle | CITEXT UNIQUE | Case-insensitive, e.g. @danH |
| display_name | TEXT | |
| avatar_initials | CHAR(2) | Derived from name |
| city | TEXT | Default: London |
| latitude / longitude | DECIMAL(9,6) | |
| reliability_score | DECIMAL(3,1) | 0.0–5.0 |
| games_played | INT | |
| games_as_ringer | INT | |
| no_shows | INT | |
| stripe_customer_id | TEXT | Created on first payment |
| stripe_account_id | TEXT | Created when user becomes organiser |
| stripe_onboarded | BOOLEAN | True once Stripe Connect complete |

### connections
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| requester_id | UUID FK → users | |
| addressee_id | UUID FK → users | |
| status | connection_status | |
| CONSTRAINT | no_self_connect | requester != addressee |
| CONSTRAINT | unique_connection | (requester, addressee) unique |

### games
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| organiser_id | UUID FK → users | |
| group_id | UUID FK → groups | Nullable |
| series_id | UUID FK → recurring_series | Nullable |
| venue | TEXT | |
| venue_latitude / venue_longitude | DECIMAL(9,6) | Used for map |
| kickoff_at | TIMESTAMPTZ | |
| format | TEXT | e.g. 5-a-side |
| player_count | SMALLINT | Total players both teams |
| pitch_cost | INTEGER | **In pence** |
| cost_per_player | INTEGER | Generated: pitch_cost / player_count |
| status | game_status | |
| visibility | visibility_tier | |
| auto_escalate | BOOLEAN | |
| escalated_at | TIMESTAMPTZ | When visibility was widened |

### game_players
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| game_id | UUID FK → games | |
| user_id | UUID FK → users | |
| status | player_status | |
| access_tier | TEXT | first / second / public |
| via_user_id | UUID FK → users | Shared connection for 2nd-degree |
| payment_status | payment_status | |
| amount_paid | INTEGER | In pence |
| stripe_payment_intent_id | TEXT | |
| stripe_charge_id | TEXT | |

### groups
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| name | TEXT | |
| emoji | TEXT | |
| owner_id | UUID FK → users | |
| default_visibility | visibility_tier | |
| recurrence_type | recurrence_type | |
| auto_escalate | BOOLEAN | |

### chat_messages
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| game_id | UUID FK → games | Exactly one of game_id or group_id set |
| group_id | UUID FK → groups | |
| sender_id | UUID FK → users | |
| body | TEXT | |
| is_system | BOOLEAN | True for automated messages |
| system_type | TEXT | e.g. payment_confirmed, slot_taken |
| system_data | JSONB | Arbitrary payload |

---

## Neo4j (connection graph)

### Nodes
```
(:User { id: "postgres-uuid" })
```

### Relationships
```
(:User)-[:CONNECTED_TO]->(:User)
```
Bidirectional — when a connection is accepted, two edges are created (A→B and B→A).

### Key queries

**Get 1st-degree connections (direct friends):**
```cypher
MATCH (origin:User {id: $userId})-[:CONNECTED_TO]->(connected:User)
RETURN connected.id
```

**Get up to 2nd-degree connections (friends + friends of friends):**
```cypher
MATCH (origin:User {id: $userId})-[:CONNECTED_TO*1..2]-(connected:User)
WHERE connected.id <> $userId
WITH connected, min(length(shortestPath((origin)-[:CONNECTED_TO*]-(connected)))) as depth
RETURN connected.id as connectedId, depth
```

**Find mutual connection between two users:**
```cypher
MATCH (a:User {id: $userAId})-[:CONNECTED_TO]->(mutual:User)-[:CONNECTED_TO]->(b:User {id: $userBId})
RETURN mutual.id as mutualId LIMIT 1
```

---

## Redis (cache + real-time)

### Cache keys
| Key pattern | Value | TTL |
|---|---|---|
| `feed:{userId}:{filters}` | Array of GameFeedItems | 60s |
| `connections:{userId}` | Array of connections with profiles | 300s |
| `game:{gameId}` | Game object | 30s |
| `sockets:{userId}` | Socket IDs | Ephemeral |

Cache is busted on relevant writes — e.g. game cache busted when a slot is taken, connection cache busted when a connection is accepted.
