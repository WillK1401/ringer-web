---
id: 015
title: Design Tokens
version: 0.1
status: Draft
owner: Design
depends_on:
  - 012 Design Principles
  - 013 Motion System
---

# Design Tokens

## Purpose

Design tokens are the single source of truth for Ringer's visual language.

No component should define its own colours, spacing, typography or elevation. Every visual decision references a shared token.

Changing a token should update the entire product consistently.

---

# Principles

- Consistency over creativity.
- Semantic names over colour names.
- Accessible by default.
- Themeable from day one.
- Platform agnostic.

---

# Colour Tokens

## Brand

brand.primary
brand.secondary
brand.accent

Avoid naming colours after their appearance (for example `green-600` in product documentation). Components consume semantic tokens instead.

## Surface

surface.canvas
surface.default
surface.elevated
surface.overlay

## Content

content.primary
content.secondary
content.tertiary
content.inverse

## Border

border.default
border.strong
border.focus

## Feedback

feedback.success
feedback.warning
feedback.error
feedback.info

---

# Typography Tokens

Display

display.lg
display.md

Heading

heading.xl
heading.lg
heading.md
heading.sm

Body

body.lg
body.md
body.sm

Label

label.md
label.sm

Caption

caption

Rules:

- Minimum body size: 16px on mobile.
- Line length: 60–80 characters where practical.
- Never rely on font weight alone to create hierarchy.

---

# Spacing Scale

Use a 4px base grid.

space.1 = 4px
space.2 = 8px
space.3 = 12px
space.4 = 16px
space.6 = 24px
space.8 = 32px
space.12 = 48px
space.16 = 64px

No arbitrary spacing values in components.

---

# Radius

radius.sm
radius.md
radius.lg
radius.full

Rounded corners communicate friendliness without becoming playful.

---

# Elevation

elevation.0
elevation.1
elevation.2
elevation.3

Prefer elevation changes over heavy borders.

---

# Motion Tokens

Reference the Motion System.

motion.instant = 0ms
motion.fast = 120ms
motion.standard = 200ms
motion.slow = 320ms

---

# Component Rules

Components never hardcode:

- Hex colours
- Font sizes
- Border radius
- Spacing
- Shadows

Everything references tokens.

---

# Accessibility

- Colour combinations must meet WCAG AA.
- Focus states use dedicated tokens.
- Token changes require accessibility review.

---

# Acceptance Criteria

- Every component references tokens.
- No visual values are duplicated.
- Semantic token naming is used consistently.
- Dark mode can be implemented without component changes.

---

# Future Evolution

Version 1.0 will define:

- Full colour palette
- Light and dark themes
- Figma variables
- Tailwind mappings
- CSS variable implementation
- shadcn/ui token integration

---

# Commit Message

docs(design): establish design token architecture
