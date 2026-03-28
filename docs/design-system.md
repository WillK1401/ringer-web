# Ringer — Design System

Derived from the Figma Make export and the hand-built prototype (ringer_v3.html).
Swiss editorial aesthetic — cream ground, Inter typeface, dark green primary, thin rule dividers.

---

## Colour tokens

| Name | Value | Usage |
|---|---|---|
| Background | `#F0EDE6` | App background — all screens |
| Primary text | `#1a1a1a` | Headings, labels, body |
| Primary green | `#042b2b` | CTAs, active states, nav active, chat bubbles (own) |
| Green light | `rgba(4,43,43,0.08)` | Selected card backgrounds, hover states |
| Muted text | `#999` | Secondary labels, timestamps, placeholders |
| Border | `rgba(0,0,0,0.08)` | Dividers, card borders |
| Card background | `rgba(0,0,0,0.03)` | Stat cards, form inputs, game rows |
| Stripe purple | `#635bff` | Stripe branding only |

### Visibility tier colours
| Tier | Background | Text |
|---|---|---|
| 1st connections | `#111` | `#F0EDE6` |
| 2nd connections | `#555` | `#F0EDE6` |
| Public | `#888` | `#F0EDE6` |

---

## Typography

Single font family: **Inter** (Google Fonts, weights 400/500/600).

| Style | Size | Weight | Usage |
|---|---|---|---|
| Wordmark | 22px | 600 | "ringer." logo |
| Screen title | 30px | 600 | Page headings |
| Card title | 18–20px | 500 | Game venue names |
| Body | 14–15px | 400 | Descriptions, meta info |
| Label | 12–13px | 400–500 | Form labels, captions |
| Caption | 11–12px | 400 | Timestamps, secondary info |
| Price | 18–28px | 500–600 | Cost figures |

Letter spacing: `-0.01em` to `-0.02em` on headings.

---

## Spacing

Base unit: 4px. All spacing is multiples of 4.

| Token | Value | Use |
|---|---|---|
| xs | 4px | Icon gaps |
| sm | 8px | Between badge and text |
| md | 12–16px | Row padding, card internal |
| lg | 20px | Screen horizontal margin |
| xl | 24px | Section spacing |

Screen horizontal padding: always **24px** (`px-6`).

---

## Components

### BottomNav
5 tabs: Games / Map / Post / Chat / Profile.
Active tab: opacity 1, green icon colour.
Inactive: opacity 0.25.
Height: 70px. Background: `#F0EDE6`. Top border: `1px solid rgba(0,0,0,0.06)`.

### Game card row
Full-width tap target. Venue name (500, 18–20px), meta row (13px muted), avatar stack + slot bar + price.
Bottom divider: `1px solid rgba(0,0,0,0.08)`.

### Avatar stack
Overlapping circles, margin-left -8px. Circle: `#E0DDD6` bg, `#F0EDE6` border 1.5px. Initials: Inter 500.

### Slot bar
Row of small squares (6×6px). Filled: `#111`. Empty: `#E0DDD6`.

### Visibility badge
Inline tag. Font: Inter 500 10px, uppercase, letter-spacing 0.05em.
Border: `1px solid #C8C4BC`. No border-radius.
Colours per tier (see table above).

### CTA button (primary)
Full-width, `border-radius: 999px` (pill). Background: `#042b2b`. Text: `#F0EDE6`, 16px, weight 500.
Padding: 14–16px vertical.

### CTA button (ghost)
Same shape. Background: transparent. Border: `1px solid #042b2b`. Text: `#042b2b`.

### Filter strip
Segmented control. No gap, shared border `1px solid rgba(0,0,0,0.08)`, border-radius 10px.
Selected: `#042b2b` bg, `#F0EDE6` text. Unselected: transparent, `#666` text.

### Form inputs
`background: rgba(0,0,0,0.04)`, `border: none`, `border-radius: 10px`, padding 12px 14px.
Font: Inter 400 14px, `#1a1a1a`.

### Chat bubble (own)
`background: #042b2b`, `color: #F0EDE6`. `border-radius: 16px 16px 4px 16px`.

### Chat bubble (other)
`background: rgba(0,0,0,0.05)`, `color: #1a1a1a`. `border-radius: 16px 16px 16px 4px`.

### System message (chat)
Centred pill. `background: rgba(0,0,0,0.04)`. Font: 12px, `#999`. Used for "payment confirmed", "slot taken" events.

---

## Screen max-width

All screens are constrained to **430px max-width**, centred on desktop.
Set on `body` in `index.css`:
```css
body {
  max-width: 430px;
  margin: 0 auto;
}
```

Bottom nav is `position: fixed` with the same max-width constraint.
