---
id: 005
title: Discover
version: 1.0
status: Approved
owner: Product
depends_on:
  - 001 Company Philosophy
  - 002 Sporting Graph
  - 003 Product Strategy
  - 004 Information Architecture
---

# Discover

## Executive Summary

Discover is the heart of Ringer.

It is not a feed of games.

It is a feed of opportunities.

The purpose of Discover is to answer a single question:

> **What should I play next?**

Players should never feel like they are searching through listings. Instead, Discover should proactively surface the most relevant opportunities based on the Sporting Graph.

---

# Problem Statement

Today, organising recreational sport relies on fragmented WhatsApp groups and chance.

Players don't know:
- What games are happening nearby.
- Whether they know anyone attending.
- Whether the organiser is reliable.
- Whether they'll enjoy the game.

Discover removes this uncertainty.

---

# Design Principles

1. Recommendations before search.
2. People before logistics.
3. Trust before proximity.
4. Quality before quantity.
5. One obvious primary action.

---

# Screen Goals

Within 10 seconds a player should be able to:

- Understand what's available.
- Identify a game they trust.
- Join with confidence.

---

# Information Hierarchy

## 1. Recommended For You

The highest confidence recommendations generated from the Sporting Graph.

Reason for recommendation must always be visible.

Examples:

- You played with Alex last week.
- Four of your connections are attending.
- Matches your usual Thursday football.

---

## 2. Nearby Games

Quality local opportunities ordered by recommendation score, not distance alone.

---

## 3. Your Communities

Games created by communities the player already belongs to.

---

## 4. New Communities

Recommended opportunities to expand the player's network.

---

# Game Card

Every card should answer these questions immediately:

- What sport is it?
- When is it?
- Where is it?
- Who is organising it?
- Do I know anyone?
- How many places remain?

Primary CTA:

**Join Game**

---

# Empty State

If there are no suitable games:

Explain why.

Offer alternatives:

- Expand travel radius.
- Try another sport.
- Create a game.

The product should never present an empty list without guidance.

---

# Search

Search is secondary.

Filters should include:

- Sport
- Date
- Distance
- Skill level

Filters refine recommendations rather than replacing them.

---

# Accessibility

- WCAG AA colour contrast.
- Minimum 44x44px touch targets.
- Full keyboard navigation.
- Semantic headings.
- Screen reader labels for every interactive element.

---

# Success Metrics

- Join rate from Discover.
- Time to first join.
- Games viewed before joining.
- Repeat usage.
- Games played.

---

# Acceptance Criteria

- Discover opens by default after sign in.
- Every recommendation includes an explanation.
- Every game card has one clear primary action.
- Empty states always provide a next step.
- Recommendations are powered by the Sporting Graph.

---

# Commit Message

docs(product): define Discover experience and recommendation philosophy
