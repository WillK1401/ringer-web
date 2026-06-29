---
id: 012
title: Design Principles
version: 1.0
status: Approved
owner: Design
depends_on:
  - 001 Company Philosophy
  - 003 Product Strategy
---

# Design Principles

## Purpose

This document defines how every interaction in Ringer should feel.

Features evolve.

Visual styles evolve.

These principles should remain stable.

Whenever there is uncertainty, choose the option that best aligns with these principles.

---

# Principle 1 — Reduce Coordination

Every interaction should reduce the effort required to organise sport.

Measure success by effort removed, not features added.

---

# Principle 2 — Build Confidence Before Commitment

Before asking a player to join a game, answer:

- Who is organising?
- Who is attending?
- Why was this recommended?
- Can I trust this?

Trust always comes before conversion.

---

# Principle 3 — One Primary Action

Every screen has one dominant action.

Examples:

Discover → Join Game

Game → Confirm Attendance

Profile → Edit Profile

Never compete for attention.

---

# Principle 4 — Progress Over Choice

Present the next logical step.

Avoid exposing every possible option.

Good products guide.

They do not overwhelm.

---

# Principle 5 — Calm Interfaces

The interface should never feel noisy.

Avoid:

- Excessive badges
- Multiple accent colours
- Unnecessary animation
- Competing calls to action

Whitespace is a feature.

---

# Principle 6 — Explain Recommendations

Every recommendation should include a reason.

Examples:

- Four of your connections are attending.
- Matches your usual Tuesday football.
- Hosted by a reliable organiser.

Recommendations should feel earned, not mysterious.

---

# Principle 7 — Show People First

People join people.

Prioritise:

- Faces
- Organisers
- Mutual connections
- Communities

Before maps, statistics or metadata.

---

# Principle 8 — Progressive Disclosure

Start simple.

Reveal complexity only when needed.

The default experience should work for a first-time player.

Power users discover advanced options naturally.

---

# Principle 9 — Accessibility Is Default

Every interaction must support:

- Keyboard navigation
- Screen readers
- WCAG AA colour contrast
- 44×44 px touch targets
- Visible focus states

Accessibility is part of the design, not a QA task.

---

# Principle 10 — Reward Participation

Celebrate:

- Playing
- Hosting
- Reliability
- Community

Never optimise for scrolling, posting or time spent in the app.

---

# Anti Principles

Ringer will not:

- Optimise for engagement over participation.
- Use dark patterns.
- Hide important information.
- Inflate urgency artificially.
- Gamify trust.

---

# Design Review Checklist

Before approving a screen ask:

1. Does it reduce uncertainty?
2. Is there one clear primary action?
3. Is trust visible?
4. Can a first-time player understand it?
5. Does it help someone play more sport?

If any answer is "no", redesign before building.

---

# Acceptance Criteria

- Every future screen references these principles.
- Product and engineering decisions align with them.
- Exceptions require documented rationale.

---

# Commit Message

docs(design): establish core design principles
