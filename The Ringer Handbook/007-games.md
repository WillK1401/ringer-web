---
id: 007
title: Games
version: 1.0
status: Approved
owner: Product
depends_on:
  - 003 Product Strategy
  - 004 Information Architecture
  - 005 Discover
  - 006 Network
---

# Games

## Executive Summary

Games are the core transaction of Ringer.

Every game should create three outcomes:

1. People play sport.
2. Trust increases.
3. The Sporting Graph becomes smarter.

A game is not simply an event. It is the mechanism through which communities are built.

---

# Product Goal

Creating a game should take less than 60 seconds.

Joining a game should take less than 30 seconds.

Organising a weekly game should become progressively easier over time.

---

# User Problems

Organisers struggle with:

- Finding enough players.
- Chasing responses.
- Collecting payments.
- Filling late cancellations.
- Managing communication.

Players struggle with:

- Finding games.
- Knowing whether they will fit in.
- Trusting organisers.
- Paying quickly.

Games exist to remove these points of friction.

---

# Game Lifecycle

Draft

↓

Published

↓

Players Join

↓

Confirmed

↓

Played

↓

Completed

↓

Archived

Each state unlocks different actions and notifications.

---

# Creating a Game

Required fields:

- Sport
- Venue
- Date
- Start time
- Duration
- Number of spaces
- Cost
- Visibility

Optional:

- Skill level
- Equipment notes
- Match format

The form should progressively disclose advanced options rather than overwhelming first-time organisers.

---

# Joining a Game

The decision to join should feel safe.

Display before payment:

- Organiser
- Mutual connections
- Remaining spaces
- Cost
- Venue
- Trust signals

Primary CTA:

**Join Game**

---

# Game Detail

Every Game Detail page answers:

- What is happening?
- Where?
- When?
- Who is attending?
- Can I trust the organiser?
- How much does it cost?

Nothing else.

---

# Communication

Chat exists only because a game exists.

There should be no standalone global chat.

When the game is complete, the conversation is archived with it.

---

# Payments

Payment is part of joining.

It should never feel like a separate workflow.

Success means:

Join → Pay → Confirm

One continuous experience.

---

# Completion

When a game ends:

- Attendance is recorded.
- Reputation updates.
- New connections are suggested.
- Communities strengthen.
- Recommendations improve.

Completion is where the Sporting Graph learns.

---

# Accessibility

- Every action available via keyboard.
- Clear status indicators.
- Semantic headings.
- Colour is never the only indicator of state.

---

# Success Metrics

- Time to create a game.
- Fill rate.
- Completion rate.
- Repeat organisers.
- Repeat players.
- Connections created after games.

---

# Acceptance Criteria

- A game can be created in under one minute.
- Joining requires minimal steps.
- Every completed game updates the Sporting Graph.
- Communication, payment and attendance are centred on the game lifecycle.

---

# Commit Message

docs(product): define game lifecycle and coordination model
