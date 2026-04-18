# Lifodial Design System — Extracted from Stitch Prototype
# Project: https://stitch.withgoogle.com/projects/11738954248656448318
# Theme: "Clinical Precision" — High-Fidelity Instrument

## SCREENS IN PROTOTYPE
1. Main Dashboard (`46e5bdaa68c64c3ba999c3f93e771717`)
2. Call Log & Transcript (`e9cc6b6fd79b4f8dbe3034e6de208911`)
3. Analytics Dashboard (`92a7d77705f44506849b012a7f71ff06`)
4. Clinic Onboarding Wizard (`faa7dada30864de98f25f809c7ee0762`)
5. Clinic Settings (`ee587250740544dbbabf24473df0a7f6`)
6. Marketing Landing Page (`bea69abd780b466383c84b2b996eadf4`)
7. Mobile View (`ebd03742bcac4c00a09690e6e1bd3eeb`)
8. Empty & Error States (`bc722d2830a94db39a0a6723e2745c70`)

## COLORS (All verified from Stitch namedColors + designMd)

### Surface Hierarchy (use exact hex — NO custom Tailwind names)
- Page base background:       #060E20  (surface / background)
- Sidebar/nav background:     #06122D  (surface_container_low)
- Main content area:          #05183C  (surface_container)
- Card/data surfaces:         #031D4B  (surface_container_high)
- Active/foreground cards:    #00225A  (surface_container_highest)

### Text
- Primary text:               #DEE5FF  (on_surface)
- Secondary/muted text:       #91AAEB  (on_surface_variant)
- On primary button:          #004564  (on_primary)

### Accent
- Primary accent / CTA:       #0EA5E9  (Sky-500, override)
- Primary accent dim:         #89CEFF  (primary)
- Secondary accent:           #6366F1  (Indigo-500, override)
- Tertiary / success:         #9BFFCE  (tertiary) / #10B981 (Emerald-500 override)

### Status
- Success/Confirmed:          #10B981  (Emerald-500)
- Warning/Pending:            #F59E0B  (Amber-500)
- Error/Missed:               #EF4444  (Red-500)
- In-Call/Active:             #6366F1  (Indigo-500)

### Borders (No-Line Rule — use tonal shifts, borders only when needed)
- Ghost border:               #2B4680  (outline_variant) at 20% opacity
- Primary border:             #5B74B1  (outline)
- Input focus:                #0EA5E9  (Sky-500)

## TYPOGRAPHY
- Font family: Inter (Google Fonts)
- Display metric: 2.25rem, tabular-nums, font-variant-numeric
- Headline: 1.5rem (headline-sm), letter-spacing: -0.01em, font-weight: 600
- Title: 1rem (title-sm), font-weight: 600
- Body: 0.8125rem (13px), font-weight: 400
- Label: 0.75rem (12px), font-weight: 500

## SPACING
- Sidebar width: 240px
- Page horizontal padding: 32px (p-8)
- Card padding: 24px (p-6)
- Gap between cards: 24px (gap-6)
- Table row height: ~48px
- Grid rhythm: 8px

## COMPONENTS

### Buttons
- Radius: 4-6px (rounded or rounded-md)
- NO pill shapes, NO gradients, NO glows
- Primary: bg #0EA5E9, text #004564
- Secondary: bg #05183C, text #DEE5FF, border #5B74B1

### Cards
- Radius: 8px (rounded-lg) — max allowed per roundness=ROUND_FOUR
- Background: #031D4B or #05183C
- NO drop shadows — depth via surface tones
- Ghost border only when needed: 1px solid rgba(43,70,128,0.3)

### Inputs
- Background: #00225A (surface_container_highest)
- Bottom border: 2px solid #5B74B1
- Focus: bottom border 2px solid #0EA5E9
- Radius: 4px top only (or uniform 4px)
- NO outer glow/shadow on focus

### Activity Indicator (Live State)
- Solid 6px circle, color: #0EA5E9
- No pulsing glow — sharp timed blink or steady

## STYLE RULES (from designMd)
- NO glassmorphism (no backdrop-blur, no semi-transparent bg)
- NO drop shadows on cards — use tonal stacking instead
- NO pill-shaped buttons
- NO decorative AI icons
- Lists: NO horizontal dividers — use spacing (gap-4) instead
- Numbers/timestamps: font-variant-numeric tabular-nums
- Dashboard: asymmetric 70/30 split (live calls priority)
