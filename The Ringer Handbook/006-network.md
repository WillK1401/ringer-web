---
id: 006
title: Network
version: 1.0
status: Approved
owner: Product
depends_on:
  - 002 Sporting Graph
  - 003 Product Strategy
  - 004 Information Architecture
---

# Network

## Executive Summary

The Network is Ringer's defining feature.

It is not a friends list.

It is a living representation of a player's sporting community. Every connection increases trust, improves recommendations and makes organising games easier.

The purpose of the Network is to answer one question:

> Who would I enjoy playing with?

---

# Problem Statement

Adults lose sporting communities over time.

People move cities.
Jobs change.
Teams dissolve.

Most products solve communication.

Ringer solves continuity.

The Network should help players build and maintain a sporting community throughout their lives.

---

# Product Principles

- Trust is earned through playing together.
- Quality of connections matters more than quantity.
- Mutual connections reduce uncertainty.
- The Network should grow naturally through participation.

---

# Primary Sections

## My Connections

People the player knows and has accepted.

Display:

- Name
- Avatar
- Sports
- Mutual connections
- Last played together
- Trust indicators

Primary action:

View Profile

---

## Pending Requests

Incoming and outgoing connection requests.

Primary actions:

- Accept
- Decline
- Cancel

---

## Suggested Connections

Generated from the Sporting Graph using:

- Played together
- Mutual connections
- Same community
- Same venue
- Similar playing times

Every suggestion should explain why it appears.

Example:

"You've played together twice."

---

## Communities

Collections of players who regularly participate together.

Communities are an outcome of repeated play, not the starting point.

---

# Player Profile Preview

Every profile should answer:

- Who is this player?
- What sports do they play?
- Have we played together?
- Can I trust them?
- Do we know the same people?

---

# Trust Signals

Display trust through context, never through arbitrary scores.

Examples:

- Played together 8 times
- Hosted 22 games
- 5 mutual connections
- Reliable organiser

---

# Privacy

Players control:

- Profile visibility
- Connection requests
- Community visibility
- Availability visibility

Privacy should default to safe settings.

---

# Accessibility

- Keyboard accessible.
- Screen reader friendly.
- Profile cards use semantic headings.
- All actions reachable without gestures.

---

# Success Metrics

- Connections accepted
- Repeat games with connections
- Community growth
- Invitations accepted
- Games created through existing networks

---

# Acceptance Criteria

- Every suggested connection includes a reason.
- Every connection strengthens the Sporting Graph.
- The Network prioritises trust over popularity.
- Profiles focus on sporting identity rather than social activity.

---

# Commit Message

docs(product): define Network experience and connection model
