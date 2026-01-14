# OdFachowca Branding v2.0 - "Blue Collar Tech"

Data: 2026-01-14

## Zmiana względem v1.0

| Element | v1.0 (odrzucone) | v2.0 (aktualne) |
|---------|------------------|-----------------|
| Filozofia | "Przyjazny rzemieślnik" | "Blue Collar Tech" |
| Tło | Kremowy papier #F8F6F3 | Concrete Mist #F1F5F9 |
| Primary | Żywy niebieski #3B5EDB | Blueprint Blue #2563EB |
| Akcent | Terracotta #DA7756 | Laser Amber #F59E0B |
| Font | Nunito (zaokrąglony) | Inter (geometryczny) |
| Radius | 12-16px (soft) | 8px standard (precise) |
| Vibe | Przedszkolny, artystyczny | Techniczny, narzędziowy |

**Powód zmiany:** Target to fachowcy 40+. Potrzebują jasnego UI (czytelność), ale profesjonalnego, nie "miękkiego".

---

## I. Filozofia marki

**Archetyp:** Inżynier w Garniturze

**Inspiracje:**
- Housecall Pro (struktura UI)
- DeWalt (akcenty kolorystyczne)
- Blueprint (wzór siatki)

**Komunikat:** "Marek wchodzi do klienta w brudnych ciuchach roboczych, wyciąga telefon z czystym, profesjonalnym interfejsem. Kontrast: praca jest brudna, ale firma jest uporządkowana."

---

## II. Paleta kolorystyczna

### Primary Colors (Marka i Akcja)

| Nazwa | HEX | Tailwind | Zastosowanie |
|-------|-----|----------|--------------|
| Blueprint Blue | #2563EB | blue-600 | Primary buttons, active tabs, links, focus borders |
| Heavy Metal | #0F172A | slate-900 | Main text, header background |
| Laser Amber | #F59E0B | amber-500 | Measurement icons, m² badges, "W toku" status, tool icons |
| Amber Dark | #B45309 | amber-700 | Text on amber background (WCAG contrast) |

### Canvas & Surface (Tła)

| Nazwa | HEX | Tailwind | Zastosowanie |
|-------|-----|----------|--------------|
| Paper White | #FFFFFF | white | Cards, modals, inputs |
| Concrete Mist | #F1F5F9 | slate-100 | Main app background |
| Engineer Grid | #1E3A8A | blue-900 | PDF headers, premium sections (with grid pattern) |

### Functional Colors

| Nazwa | HEX | Tailwind | Znaczenie |
|-------|-----|----------|-----------|
| Profit Green | #059669 | emerald-600 | Money (totals), "Zaakceptowane" status, Success |
| Stop Red | #DC2626 | red-600 | Delete, Errors, "Odrzucona" status |
| Steel Gray | #64748B | slate-500 | Helper text, inactive icons, metadata |

### Gradients (oszczędnie)

```css
/* Primary Button */
background: linear-gradient(to bottom, #2563EB, #1D4ED8);

/* Header Shine */
background: linear-gradient(to right, #1E3A8A, #0F172A);
```

---

## III. Typografia

**Font:** Inter (Google Fonts)

**Dlaczego Inter:**
- Geometryczny, techniczny charakter
- Doskonałe wsparcie dla cyfr (tabular nums)
- Standard nowoczesnego UI

### Skala typograficzna

| Styl | Rozmiar | Waga | Line Height | Zastosowanie |
|------|---------|------|-------------|--------------|
| Display XL | 32px | Bold (700) | 1.2 | Suma na PDF, ekrany sukcesu |
| Heading L | 24px | SemiBold (600) | 1.3 | Tytuły ekranów |
| Heading M | 20px | SemiBold (600) | 1.4 | Nagłówki kart, nazwa klienta |
| Body Base | 16px | Regular (400) | 1.5 | Główny tekst, inputy |
| Body Bold | 16px | Medium (500) | 1.5 | Etykiety, wartości w tabelach |
| Caption | 13px | Medium (500) | 1.4 | Opisy pomocnicze, daty |
| Tech Label | 11px | Bold (700) | 1.0 | Badge statusu, jednostki (m²), UPPERCASE |

### Zasady

1. **Tabular nums:** `font-variant-numeric: tabular-nums` dla cen i wymiarów
2. **Tracking:** Nagłówki UPPERCASE mają `tracking-wide`

---

## IV. Geometria UI

### Border Radius

| Rozmiar | Wartość | Zastosowanie |
|---------|---------|--------------|
| Small | 4px | Checkboxy, tagi wymiarów |
| Medium | 8px (rounded-lg) | Inputy, przyciski, wewnętrzne kontenery |
| Large | 12px (rounded-xl) | Cards, modals, bottom sheets |

### Borders

| Typ | Wartość | Zastosowanie |
|-----|---------|--------------|
| Default | 1px solid #CBD5E1 (slate-300) | Standard borders |
| Active/Focus | 2px solid #2563EB (blue-600) | Edycja, focus state |
| Measurement | 1px solid #F59E0B (amber-500) | Pola wymiarowe |

### Shadows

```css
/* Card Shadow */
box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);

/* FAB Shadow */
box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.3);
```

---

## V. Logo

### Symbol: Precision Square (Kątownik)

**Koncept:** Kątownik stolarski tworzący abstrakcyjną literę "F"

**Dlaczego kątownik:**
1. Narzędzie pomiarowe → precyzja wyceny
2. Naturalny kształt litery "F" → Fachowiec
3. Prosty geometryczny kształt → idealna ikona appki

**Wygląd:**
- Gruby, techniczny kształt "L" (kątownik)
- Tło: Blueprint Blue (#2563EB)
- Kształt: Biały
- Akcent: Mała kropka Laser Amber (#F59E0B) w rogu

**Prompt do generacji AI:**
```
Minimalist app icon logo for a construction estimation app named "OdFachowca".
The symbol is a stylized white carpenter square tool forming an abstract letter "F",
placed on a solid Royal Blue rounded square background. A small vibrant amber orange
dot accent at the corner of the square tool. Flat vector style, UI design, thick lines,
high contrast, dribbble style, no shadows, no gradients. --v 6.0
```

### Wordmark (Logotyp tekstowy)

**Format:**
```
Od FACHOWCA.
```

**Stylowanie:**
- "Od" - Steel Gray (#64748B), Inter Regular
- "FACHOWCA" - Heavy Metal (#0F172A), Inter ExtraBold, UPPERCASE
- "." - Laser Amber (#F59E0B)

**Alternatywnie (tech startup):**
```
odFachowca
```
- Małe "od" + CamelCase

---

## VI. Blueprint Pattern (Brand Element)

Unikalny wzór siatki używany w nagłówkach PDF i subtelnie na dashboardzie.

```css
.bg-blueprint {
  background-color: #0F172A; /* Heavy Metal */
  background-image:
    linear-gradient(rgba(37, 99, 235, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(37, 99, 235, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

**Użycie:** Oszczędnie! Tylko header PDF, sekcje premium, hero dashboard.

---

## VII. Komponenty UI

### Buttons

**Primary:**
- Tło: blue-600, Tekst: white
- Active: `scale-95`
- Gradient: subtle top-bottom darkening

**Construction Action (np. "Dodaj pokój"):**
- Tło: white
- Border: 1px dashed slate-300
- Tekst: slate-700
- Ikona: amber-500
- Wygląd: jak miejsce na rysunek techniczny

**FAB (Floating Action Button):**
- Rozmiar: 56px circle
- Tło: blue-600
- Ikona: white Plus
- Pozycja: bottom-right

### Input Fields

- Wysokość: 48px (touch-friendly)
- Label: `text-xs font-bold uppercase text-slate-500 mb-1`
- Placeholder: `text-slate-400`
- Smart suffix: Dla cen - "zł" na szarym tle po prawej

### List Cards

- Padding: 16px
- Left Stripe: 4px kolorowy pasek oznaczający status
  - Zielony: Zaakceptowana
  - Żółty/Amber: Draft/W toku
  - Niebieski: Wysłana

---

## VIII. PDF Design

### Struktura:

1. **Header:** Pełna szerokość, `bg-blueprint`, białe logo
2. **Klient/Wykonawca:** Dwie kolumny, 10pt, nagłówki UPPERCASE slate-400
3. **Tabela pozycji:**
   - Nagłówek: bg-slate-100, text-slate--900 Bold
   - Wiersze: Zebra striping (parzyste bg-slate-50)
   - Kolumna ilość: amber-700 Bold (wyróżnienie)
4. **Total:**
   - Separator: 2px solid slate-900
   - Tło sekcji: slate-50

---

## IX. Tailwind Config

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

## X. Następne kroki

1. [ ] Wygenerować logo (Precision Square) używając promptu AI
2. [ ] Zaktualizować Tailwind config w mobile app
3. [ ] Zaktualizować theme/colors w komponenach
4. [ ] Zmienić font z Nunito na Inter
5. [ ] Zaktualizować border-radius (8px standard)
6. [ ] Zaimplementować blueprint pattern dla PDF
7. [ ] Przetestować kontrast WCAG dla amber na białym

---

## XI. Pliki do aktualizacji

### Mobile App
- `apps/mobile/tailwind.config.js` (lub odpowiednik dla NativeWind)
- `apps/mobile/app/_layout.tsx` - font loading
- `apps/mobile/components/ui/*` - button, card, input styles
- `apps/mobile/constants/colors.ts`

### Brand Assets
- `docs/brand/colors.json` - zaktualizować kolory
- `docs/brand/brand-guide.md` - zastąpić tym dokumentem

### PDF Generation (gdy będzie)
- Template z blueprint header
- Zebra striping dla tabel
