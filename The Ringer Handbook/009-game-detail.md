---
id: 009
title: Game Detail
version: 1.0
status: Approved
owner: Product
depends_on:
  - 007 Games
  - 008 Create Game
---

# Game Detail

## Executive Summary

The Game Detail screen is the decision screen of Ringer.

Discover creates interest.

Game Detail creates confidence.

A player should arrive with one question:

> **Should I join this game?**

When they leave, the answer should be obvious.

The purpose of this screen is not to present information. It is to remove uncertainty.

---

# Product Goals

1. Build confidence before commitment.
2. Minimise cognitive load.
3. Surface trust before logistics.
4. Reduce organiser questions.
5. Maximise successful joins.

---

# User Psychology

Before joining, players silently evaluate risk.

- Will I fit the standard?
- Do I know anyone?
- Is this organiser reliable?
- Is it worth the money?
- Will people actually turn up?

The interface should answer these questions without requiring chat.

---

# Information Hierarchy

## Hero

- Sport
- Date & time
- Venue
- Remaining spaces
- Primary CTA: **Join Game**

---

## Trust Panel

Always above the fold.

Display:

- Organiser profile
- Hosted games
- Reliability
- Mutual connections
- "You've played together before"
- Friends attending

Trust should be explained, never represented by an arbitrary score.

---

## Attendees

Display avatars first.

Then names.

Then sporting context.

Examples:

- Plays football weekly
- Mutual connection with Alex
- Joined 3 days ago

---

## Match Information

- Format
- Skill level
- Duration
- Equipment
- Facilities
- Cost
- Cancellation policy

---

## Venue

Provide:

- Map
- Address
- Parking
- Public transport
- Venue photos (future)
- Previous games held here

---

# Primary Action

The page has one dominant action.

**Join Game**

Everything else supports this decision.

If payment is required, joining flows directly into payment without changing mental context.

---

# States

## Spaces Available

Primary CTA enabled.

## Nearly Full

Create urgency without manipulation.

Example:

"2 places remaining."

## Full

Replace CTA with:

**Join Waitlist**

## Cancelled

Explain why.

Suggest similar nearby games.

## Played

Archive.

Show attendees, photos (future), and connection suggestions.

---

# Empty States

If attendee list is empty:

"Be the first to join."

If organiser has no history:

"New organiser."

Do not invent trust signals.

Transparency builds confidence.

---

# Notifications

Notify attendees when:

- Venue changes
- Time changes
- Player drops out
- Waitlist place becomes available
- Weather may affect play (future)

Never send engagement notifications unrelated to the game.

---

# Accessibility

- WCAG AA contrast.
- 44×44px minimum touch targets.
- Screen reader labels for attendee avatars.
- Semantic headings.
- Focus order follows reading order.
- Join button reachable via keyboard.

---

# Motion

Motion should communicate state.

Join:

Card confirms immediately.

Payment:

Slide transition preserving context.

Attendance update:

Subtle count animation.

Never animate purely for decoration.

---

# Edge Cases

## Organiser Cancels

Refund automatically where possible.

Recommend alternatives.

## Late Drop Out

Notify organiser.

Suggest highest-confidence replacement.

## Venue Closed

Highlight change prominently.

Require attendee acknowledgement.

---

# Success Metrics

- View → Join conversion
- Time spent before joining
- Drop-off before payment
- Waitlist conversion
- Questions asked in game chat
- Attendance rate

A successful Game Detail page reduces questions because it answers them proactively.

---

# Acceptance Criteria

- A first-time player can decide whether to join without opening chat.
- Trust information is always visible above the fold.
- One clear primary action exists.
- Status changes are immediately understandable.
- Every element reduces uncertainty.

---

# Future Evolution

V2:
- Live venue conditions.
- Weather integration.
- AI fill prediction.

V3:
- "Players like you enjoyed this game."
- Predicted compatibility.
- Smart replacement suggestions.

---

# Commit Message

docs(product): define Game Detail decision experience
