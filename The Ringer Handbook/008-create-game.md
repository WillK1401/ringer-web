---
id: 008
title: Create Game
version: 1.0
status: Approved
owner: Product
depends_on:
  - 007 Games
---

# Create Game

## Executive Summary

Create Game is Ringer's most important organiser workflow.

The experience should feel optimistic, lightweight and fast. Organisers should feel confident that creating a game is worthwhile because Ringer will help fill the remaining spaces.

Target completion time: **under 60 seconds**.

---

# User Problem

Today, organisers recreate the same game every week, manually message dozens of people, collect payments and chase replies.

Creating a game should be the beginning of automation, not administration.

---

# Design Principles

- Ask only for information required to publish.
- Progressive disclosure for advanced settings.
- Pre-fill everything possible.
- Show confidence, not complexity.

---

# Required Fields

- Sport
- Venue
- Date
- Start Time
- Number of Players
- Cost Per Player
- Visibility

---

# Optional Fields

- Skill Level
- Match Format
- Equipment Notes
- Parking / Access Notes

These remain collapsed by default.

---

# Smart Defaults

The form should remember:

- Favourite venue
- Typical player count
- Preferred visibility
- Common start time
- Regular sport

Frequent organisers should rarely complete more than three fields manually.

---

# Publishing

Before publishing, show:

- Estimated player demand
- Suggested invitees
- Suggested communities
- Expected fill confidence (future feature)

Primary CTA:

**Publish Game**

---

# After Publishing

Immediately guide the organiser to:

1. Invite suggested players.
2. Share with communities (if needed).
3. View live attendance.

The organiser should never feel abandoned after publishing.

---

# Accessibility

- Keyboard accessible.
- Clear field labels.
- Inline validation.
- Screen reader support.
- Error messages describe how to fix the issue.

---

# Success Metrics

- Time to publish.
- Form completion rate.
- Games successfully published.
- Average fill rate.
- Repeat organiser rate.

---

# Acceptance Criteria

- New game created in under 60 seconds.
- Returning organisers benefit from remembered defaults.
- Validation occurs inline.
- Publishing transitions directly to the Game Detail page.

---

# Commit Message

docs(product): define Create Game workflow
