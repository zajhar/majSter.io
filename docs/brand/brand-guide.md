# OdFachowca - Brand Guide v2.0

## Overview

**Name:** OdFachowca
**Domain:** odfachowca.pl
**Tagline:** Profesjonalne wyceny od fachowców
**Version:** 2.0 - "Blue Collar Tech"
**Date:** 2026-01-14

---

## Philosophy

**Archetype:** The Engineer in a Suit

**Inspiration:**
- Housecall Pro (UI structure)
- DeWalt (color accents)
- Blueprint (grid pattern)

**Brand Message:** "Marek walks into a client's home in dirty work clothes, pulls out his phone with a clean, professional interface. The contrast: the work is dirty, but the business is organized."

**Why v2.0?** Target audience is tradespeople 40+. They need a clear UI (readability), but professional, not "soft". The v1.0 rounded, friendly aesthetic felt too childish for the audience.

---

## Color Palette

### Primary Colors (Brand & Action)

| Name | HEX | Tailwind | Usage |
|------|-----|----------|-------|
| Blueprint Blue | #2563EB | blue-600 | Primary buttons, active tabs, links, focus borders |
| Heavy Metal | #0F172A | slate-900 | Main text, header background |
| Laser Amber | #F59E0B | amber-500 | Measurement icons, m² badges, "In Progress" status, tool icons |
| Amber Dark | #B45309 | amber-700 | Text on amber background (WCAG contrast) |

### Canvas & Surface (Backgrounds)

| Name | HEX | Tailwind | Usage |
|------|-----|----------|-------|
| Paper White | #FFFFFF | white | Cards, modals, inputs |
| Concrete Mist | #F1F5F9 | slate-100 | Main app background |
| Engineer Grid | #1E3A8A | blue-900 | PDF headers, premium sections (with grid pattern) |

### Functional Colors

| Name | HEX | Tailwind | Meaning |
|------|-----|----------|---------|
| Profit Green | #059669 | emerald-600 | Money (totals), "Accepted" status, Success |
| Stop Red | #DC2626 | red-600 | Delete, Errors, "Rejected" status |
| Steel Gray | #64748B | slate-500 | Helper text, inactive icons, metadata |

### Gradients (use sparingly)

```css
/* Primary Button */
background: linear-gradient(to bottom, #2563EB, #1D4ED8);

/* Header Shine */
background: linear-gradient(to right, #1E3A8A, #0F172A);
```

---

## Typography

### Font

**Inter** (Google Fonts)

**Why Inter:**
- Geometric, technical character
- Excellent support for numbers (tabular nums)
- Modern UI standard

### Import

```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Typography Scale

| Style | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| Display XL | 32px | Bold (700) | 1.2 | PDF totals, success screens |
| Heading L | 24px | SemiBold (600) | 1.3 | Screen titles |
| Heading M | 20px | SemiBold (600) | 1.4 | Card headers, client names |
| Body Base | 16px | Regular (400) | 1.5 | Main text, inputs |
| Body Bold | 16px | Medium (500) | 1.5 | Labels, table values |
| Caption | 13px | Medium (500) | 1.4 | Helper text, dates |
| Tech Label | 11px | Bold (700) | 1.0 | Status badges, units (m²), UPPERCASE |

### Rules

1. **Tabular nums:** Use `font-variant-numeric: tabular-nums` for prices and dimensions
2. **Tracking:** UPPERCASE headings use `tracking-wide`

---

## UI Geometry

### Border Radius

| Size | Value | Usage |
|------|-------|-------|
| Small | 4px | Checkboxes, dimension tags |
| Medium | 8px (rounded-lg) | Inputs, buttons, inner containers |
| Large | 12px (rounded-xl) | Cards, modals, bottom sheets |

### Borders

| Type | Value | Usage |
|------|-------|-------|
| Default | 1px solid #CBD5E1 (slate-300) | Standard borders |
| Active/Focus | 2px solid #2563EB (blue-600) | Edit mode, focus state |
| Measurement | 1px solid #F59E0B (amber-500) | Dimension fields |

### Shadows

```css
/* Card Shadow */
box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);

/* FAB Shadow */
box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.3);
```

### Spacing

Base spacing: `4px`

| Token | Value |
|-------|-------|
| xs | 4px |
| sm | 8px |
| md | 16px |
| lg | 24px |
| xl | 32px |
| 2xl | 48px |
| 3xl | 64px |

---

## Logo

### Symbol: Precision Square (Carpenter's Square)

**Concept:** A carpenter's square tool forming an abstract letter "F"

**Why a square tool:**
1. Measuring tool = precision in estimates
2. Natural shape of letter "F" = Fachowiec
3. Simple geometric shape = perfect app icon

**Visual:**
- Thick, technical "L" shape (carpenter's square)
- Background: Blueprint Blue (#2563EB)
- Shape: White
- Accent: Small Laser Amber (#F59E0B) dot in the corner

**AI Generation Prompt:**
```
Minimalist app icon logo for a construction estimation app named "OdFachowca".
The symbol is a stylized white carpenter square tool forming an abstract letter "F",
placed on a solid Royal Blue rounded square background. A small vibrant amber orange
dot accent at the corner of the square tool. Flat vector style, UI design, thick lines,
high contrast, dribbble style, no shadows, no gradients. --v 6.0
```

### Wordmark (Text Logo)

**Format:**
```
Od FACHOWCA.
```

**Styling:**
- "Od" - Steel Gray (#64748B), Inter Regular
- "FACHOWCA" - Heavy Metal (#0F172A), Inter ExtraBold, UPPERCASE
- "." - Laser Amber (#F59E0B)

**Alternative (tech startup style):**
```
odFachowca
```
- Lowercase "od" + CamelCase

### Logo Variants

| Variant | Usage |
|---------|-------|
| Full (symbol + wordmark) | Website, documents, email |
| Compact (symbol only) | App icon, favicon, small spaces |
| Monochrome | On photos, patterned backgrounds |

### Minimum Spacing

Maintain spacing equal to the height of the "F" symbol around the logo.

---

## Blueprint Pattern (Brand Element)

Unique grid pattern used in PDF headers and subtly on dashboards.

```css
.bg-blueprint {
  background-color: #0F172A; /* Heavy Metal */
  background-image:
    linear-gradient(rgba(37, 99, 235, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(37, 99, 235, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

**Usage:** Sparingly! Only PDF headers, premium sections, dashboard hero.

---

## UI Components

### Buttons

**Primary:**
```css
background: #2563EB; /* Blueprint Blue */
color: #FFFFFF;
border-radius: 8px;
padding: 12px 24px;
font-weight: 600;
```
- Active state: `scale-95`
- Gradient option: subtle top-bottom darkening

**Construction Action (e.g., "Add Room"):**
```css
background: #FFFFFF;
border: 1px dashed #CBD5E1; /* slate-300 */
color: #334155; /* slate-700 */
border-radius: 8px;
```
- Icon: Laser Amber (#F59E0B)
- Looks like a placeholder on a technical drawing

**Secondary:**
```css
background: transparent;
color: #2563EB;
border: 2px solid #2563EB;
border-radius: 8px;
padding: 10px 22px;
font-weight: 600;
```

**Ghost:**
```css
background: transparent;
color: #64748B;
border-radius: 8px;
padding: 12px 24px;
font-weight: 500;
```

**FAB (Floating Action Button):**
- Size: 56px circle
- Background: Blueprint Blue (#2563EB)
- Icon: White Plus
- Position: bottom-right

### Cards

```css
background: #FFFFFF;
border-radius: 12px;
padding: 16px;
box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
```

**List Cards with Status Stripe:**
- Left stripe: 4px colored bar indicating status
  - Green (#059669): Accepted
  - Amber (#F59E0B): Draft/In Progress
  - Blue (#2563EB): Sent

### Inputs

```css
background: #FFFFFF;
border: 1px solid #CBD5E1; /* slate-300 */
border-radius: 8px;
padding: 12px 16px;
font-size: 16px;
height: 48px; /* touch-friendly */

&:focus {
  border-color: #2563EB;
  border-width: 2px;
  outline: none;
}

&::placeholder {
  color: #94A3B8; /* slate-400 */
}
```

**Labels:** `text-xs font-bold uppercase text-slate-500 mb-1`

**Smart suffix:** For prices - "zl" on gray background on the right side

---

## Icons

### Style

- Line icons (not filled)
- Stroke width: 1.5-2px
- Rounded ends (round cap, round join)

### Recommended Sets

- [Lucide Icons](https://lucide.dev/)
- [Heroicons](https://heroicons.com/) (outline)
- [Tabler Icons](https://tabler-icons.io/)

---

## Brand Voice

### Communication Tone

- **Direct** - clear and to the point
- **Professional** - builds trust
- **Helpful** - focused on solutions
- **Technical** - respects the expertise of tradespeople

### Examples

| Instead of | Write |
|------------|-------|
| "An error occurred while processing your request" | "Something went wrong. Try again." |
| "Quote successfully created" | "Done! Your quote is ready to send." |
| "Form contains errors" | "Fix the highlighted fields and try again." |

---

## Application

### Mobile App (React Native / Expo)

- Colors as constants in `theme.ts`
- Font: Inter via `expo-font`
- Components with 8px border-radius standard
- Touch-friendly 48px input heights

### Web App (TanStack Start + DaisyUI)

- Custom DaisyUI theme with these colors
- Tailwind extend for spacing and border-radius
- CSS variables for easy dark mode

### PDF (Quotes)

- Blueprint pattern header with white logo
- Table with zebra striping (even rows bg-slate-50)
- Quantity column: Amber Dark Bold (highlight)
- Total section: 2px solid slate-900 separator

---

## Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB', // Blueprint Blue
          dark: '#1E3A8A',    // Deep Navy
        },
        tool: {
          DEFAULT: '#F59E0B', // Laser Amber
          dark: '#B45309',    // Amber Dark
        },
        canvas: {
          DEFAULT: '#F1F5F9', // Concrete Mist
          paper: '#FFFFFF',   // Paper White
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '8px',
        'lg': '12px',
      },
      backgroundImage: {
        'blueprint': `
          linear-gradient(rgba(37,99,235,0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(37,99,235,0.1) 1px, transparent 1px)
        `,
      },
      backgroundSize: {
        'blueprint': '20px 20px',
      }
    }
  }
}
```

---

## Source Files

Location: `docs/brand/`

```
docs/brand/
├── brand-guide.md        # This file
├── colors.json           # Colors in JSON format
├── logo/                 # Logo files
│   ├── logo-full.svg
│   ├── logo-symbol.svg
│   └── logo-wordmark.svg
└── fonts/                # Fonts (optional)
```
