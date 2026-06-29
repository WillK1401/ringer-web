---
id: 013
title: Motion System
version: 1.0
status: Approved
owner: Design
depends_on:
  - 012 Design Principles
---

# Motion System

## Executive Summary

Motion is functional communication.

It should explain relationships, preserve context and provide confidence.

If an animation does not improve understanding, it should not exist.

The best motion in Ringer is often the motion the player barely notices.

---

# Design Philosophy

Players open Ringer because they want to organise sport, not admire animations.

Motion should therefore be:

- Fast
- Calm
- Purposeful
- Consistent
- Accessible

Never playful for its own sake.

---

# Motion Principles

## 1. Preserve Context

Elements should move from where they were to where they are going.

Avoid hard cuts when the relationship between screens matters.

Example:

Tap a Game Card.

The card expands naturally into the Game Detail screen.

---

## 2. Confirm Actions

Every important action deserves immediate feedback.

Examples:

- Join Game
- Payment complete
- Connection accepted
- Game published

Feedback should occur within 100ms.

---

## 3. Reduce Cognitive Load

Use animation to direct attention.

Do not animate multiple unrelated elements simultaneously.

One focal animation per interaction.

---

## 4. Respect Player Time

Animations must never delay interaction.

Users should always be able to interrupt transitions.

---

# Timing Tokens

| Token | Duration | Usage |
|-------|---------:|------|
| instant | 0ms | State changes |
| fast | 120ms | Hover, button press |
| standard | 200ms | Cards, dialogs |
| slow | 320ms | Full page transitions |
| emphasis | 450ms | Rare celebratory moments |

Do not exceed 450ms for standard UI.

---

# Easing

Default:
ease-out

Entering:
ease-out

Exiting:
ease-in

Avoid bounce, elastic or novelty easing.

---

# Motion by Component

## Buttons

- Press scale: 0.98
- Duration: 120ms

## Cards

- Hover elevation only on desktop.
- Tap transitions into detail view.

## Bottom Navigation

Maintain position.

Only active indicator animates.

## Modals

Fade + slight upward movement.

Never full-screen slide unless task requires it.

## Toasts

Fade + translate from bottom.

Disappear automatically.

---

# Page Transitions

Discover → Game Detail

Expand selected card.

Game Detail → Payment

Slide preserving navigation context.

Payment → Confirmation

Crossfade.

Confirmation → Game Chat

Immediate transition.

---

# Loading States

Prefer skeletons over spinners.

Skeletons should resemble final layout.

Only use indefinite spinners when duration cannot be predicted.

---

# Empty States

Animate illustration once.

Never loop continuously.

The interface should feel calm.

---

# Accessibility

Support prefers-reduced-motion.

When enabled:

- Remove scaling.
- Remove parallax.
- Replace movement with fades.
- Maintain identical information hierarchy.

Animation must never be required to understand the interface.

---

# Anti Patterns

Do not use:

- Bounce
- Infinite animations
- Autoplay decorative motion
- Long splash animations
- Motion that blocks interaction

---

# Framer Motion Guidance

Default transition:

duration: 0.2

ease: "easeOut"

Shared layout transitions should be used between:

- Game Card → Game Detail
- Profile Card → Player Profile
- Community Card → Community

---

# Motion Review Checklist

Before approving animation ask:

- Does it communicate meaning?
- Does it reduce uncertainty?
- Can it be skipped?
- Does it respect reduced motion?
- Is it consistent with existing motion?

If any answer is no, redesign it.

---

# Acceptance Criteria

- Every animation has a purpose.
- Motion tokens are used consistently.
- Reduced motion is fully supported.
- Motion never delays core tasks.

---

# Commit Message

docs(design): establish motion system and animation guidelines
