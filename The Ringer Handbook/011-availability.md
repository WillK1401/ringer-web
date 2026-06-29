---
id: 011
title: Availability
version: 1.0
status: Approved
owner: Product
depends_on:
  - 002 Sporting Graph
  - 005 Discover
---

# Availability

## Executive Summary

Availability is the prediction engine behind Ringer.

Players should not have to maintain a detailed calendar to receive relevant opportunities. Instead, Ringer builds a lightweight understanding of when someone typically plays and combines that with explicit preferences to recommend the right games at the right time.

Availability exists to reduce organiser uncertainty without increasing player effort.

---

# Product Philosophy

Traditional calendars answer:

> "What are you doing?"

Availability answers:

> "When would you usually like to play?"

This distinction is fundamental.

Ringer is not a scheduling application. It is a coordination platform.

---

# Design Principles

1. Lightweight by default.
2. Private by default.
3. Learned over time.
4. Editable at any time.
5. Used to improve recommendations, never to pressure players.

---

# User Problems

Organisers don't know who is likely to be available.

Players receive invitations when they are busy.

Repeated unanswered invitations reduce confidence in organising.

Availability should quietly solve these problems.

---

# Availability Model

Availability is made up of three layers.

## Layer 1: Stated Preferences

Examples:

- Weekday evenings
- Saturday mornings
- Sunday afternoons

## Layer 2: Behaviour

The Sporting Graph observes:

- Games joined
- Games declined
- Typical sports
- Preferred venues
- Preferred travel distance

## Layer 3: Context

Future inputs:

- Public holidays
- Weather
- Seasonal sports
- School holidays

Behaviour should always outweigh assumptions.

---

# Privacy Model

Availability is private.

Other players never see:

- Exact free times
- Calendar information
- Daily schedule

Instead they experience its benefits indirectly through smarter invitations and recommendations.

---

# Organiser Experience

When creating a game, organisers should see:

- Suggested invitees
- Likely attendance confidence
- Suggested start time (future)
- Suggested venue (future)

The organiser never sees another player's calendar.

---

# Player Experience

Players receive fewer but higher quality recommendations.

Examples:

"This matches when you usually play."

"Your Tuesday football group is organising again."

The product should feel helpful rather than intrusive.

---

# UX Rules

- Never ask users to maintain a calendar.
- Avoid repetitive availability prompts.
- Remember recent behaviour.
- Allow temporary pauses such as holidays or injuries.

---

# Edge Cases

## New Player

No behavioural data exists.

Use stated preferences only.

## Returning Player

Behaviour progressively outweighs manual settings.

## Injured / Taking a Break

Players can temporarily pause recommendations without deleting their profile.

---

# Accessibility

- Availability controls are keyboard accessible.
- Clear labels replace ambiguous icons.
- Screen readers announce all state changes.

---

# Analytics

Track:

- Recommendation acceptance rate
- Invite acceptance rate
- Time from recommendation to join
- Recommendation relevance
- Organiser fill rate

---

# Success Metrics

- Fewer ignored invitations.
- Faster game fill rate.
- Higher recommendation acceptance.
- Reduced organiser effort.

---

# Future Evolution

V2

Predict ideal game times.

V3

Suggest creating games before organisers think to do so.

V4

Coordinate multiple nearby communities automatically using the Sporting Graph.

---

# Acceptance Criteria

- Availability remains lightweight.
- Privacy is preserved.
- Recommendations improve over time.
- Organisers benefit without seeing personal schedules.
- Players feel understood rather than monitored.

---

# Commit Message

docs(product): define availability model and recommendation inputs
