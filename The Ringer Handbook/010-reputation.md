---
id: 010
title: Reputation
version: 1.0
status: Approved
owner: Product
depends_on:
  - 002 Sporting Graph
  - 007 Games
---

# Reputation

## Executive Summary

Reputation is Ringer's trust system.

It is **not** a public score, leaderboard or popularity contest.

Its purpose is to answer one question:

> Can I confidently play with this person?

A good reputation system reduces uncertainty, rewards participation and encourages positive behaviour without becoming a game in itself.

---

# Product Principles

1. Reputation is earned through actions, not profile completion.
2. Trust is contextual, never absolute.
3. Positive reinforcement is more effective than punishment.
4. Reputation exists to help people say "yes" to a game.

---

# User Problems

Organisers wonder:

- Will this player actually turn up?
- Are they the right standard?
- Are they respectful?

Players wonder:

- Is this organiser reliable?
- Will this game actually happen?
- Will I feel welcome?

Reputation answers these questions with evidence rather than ratings.

---

# Reputation Signals

## Attendance

The strongest signal.

Derived from:
- Joined
- Attended
- Cancelled early
- Late cancellation
- No show

Display examples:

- Regular attendee
- Rarely cancels
- Reliable player

Never expose percentages publicly.

---

## Hosting

Signals:

- Games hosted
- Games completed
- Average fill rate
- Repeat players

Display:

"Hosted 42 games."

"Players regularly return."

---

## Sportsmanship

Collected sparingly after games.

Prompt:

"Would you happily play with this person again?"

Answers:

- Yes
- Neutral
- Prefer not

No written reviews.

No star ratings.

---

## Community

Positive signals:

- Invited back
- Plays with multiple communities
- Long-term participation

Communities become trust references.

---

# Profile Presentation

A profile should tell a story, not display a score.

Example:

Football

• Played 86 games
• Hosted 18 games
• Regular Tuesday organiser
• Played with 27 of your connections

This builds confidence without encouraging comparison.

---

# Behaviour Principles

Reward:

- Reliability
- Hosting
- Consistency
- Inclusivity

Do not reward:

- Number of followers
- Profile views
- Content creation
- Time spent in app

Participation is the only behaviour worth incentivising.

---

# Negative Behaviour

Examples:

- No-shows
- Abuse
- Fraud
- Repeated cancellations

The response should be progressive.

1. Reminder
2. Reduced trust
3. Temporary restrictions
4. Account review

Punishments should be private.

---

# Accessibility

Trust information must be understandable by screen readers.

Never rely on colour alone.

Every trust badge requires descriptive text.

---

# Analytics

Track:

- Join conversion by organiser trust
- Repeat play rate
- Invitation acceptance
- Community retention
- No-show rate

---

# Future Evolution

V2

Contextual trust by sport.

Someone may be a trusted football organiser but a new tennis player.

V3

AI-generated trust explanations.

Example:

"You've both played with five of the same people over the last six months."

---

# Non Goals

Reputation is not:

- A social score
- A ranking
- A badge collection
- Gamification

It is infrastructure for trust.

---

# Acceptance Criteria

- Reputation is evidence-based.
- Public scores are avoided.
- Trust signals are explainable.
- Every reputation feature helps players make better decisions.
- The system encourages participation rather than competition.

---

# Commit Message

docs(product): define reputation and trust framework
