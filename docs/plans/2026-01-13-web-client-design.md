# Web Client Design - Majsterio

## Overview

Strona internetowa i web client dla aplikacji Majsterio:
- **Landing page** - SSR, konwersja z paid ads
- **Blog** - SSR, SEO (opcjonalny na start)
- **Web app dla fachowca** - CSR, pełna funkcjonalność + rozszerzone narzędzia
- **Quote view dla klienta** - SSR, link z tokenem, akceptacja + komentarze

## Tech Stack

| Technologia | Cel |
|-------------|-----|
| TanStack Start | Meta-framework (SSR + CSR mixed) |
| React Query + tRPC | Data fetching, type-safe API |
| DaisyUI + Tailwind | Styling |
| Better Auth | Autentykacja (cookies dla web) |

## Architektura

Jeden projekt TanStack Start z mieszanym SSR/CSR per-route:

```
apps/web/
├── app/
│   ├── routes/
│   │   ├── __root.tsx              # Root layout
│   │   ├── index.tsx               # Landing (SSR)
│   │   ├── pricing.tsx             # Cennik (SSR)
│   │   ├── blog/                   # Blog (SSR)
│   │   │   ├── index.tsx
│   │   │   └── $slug.tsx
│   │   ├── q/
│   │   │   └── $token.tsx          # Quote view - klient (SSR)
│   │   ├── auth/
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   └── app/                    # Dashboard - CSR only
│   │       ├── _layout.tsx
│   │       ├── index.tsx           # Dashboard home
│   │       ├── quotes/
│   │       ├── clients/
│   │       ├── templates/
│   │       ├── reports/            # Desktop-only
│   │       └── settings/
│   ├── components/
│   │   ├── marketing/
│   │   ├── app/
│   │   └── shared/
│   └── lib/
│       ├── trpc.ts
│       └── auth.ts
```

## Kluczowe funkcje

### 1. Quote Sharing (klient fachowca)

- Fachowiec generuje link: `majsterio.pl/q/{token}`
- Token: nanoid(12), opcjonalnie z datą wygaśnięcia
- Klient bez logowania może:
  - Przeglądać wycenę
  - Pobierać PDF
  - Zaakceptować (wymaga podania imienia/email)
  - Dodać komentarz/pytanie
- Fachowiec otrzymuje push notification (expo-notifications)

### 2. Autentykacja

- Better Auth z cookies (HttpOnly, secure)
- Ten sam backend co mobile
- Google OAuth + email/password
- Protected routes przez `beforeLoad` w TanStack Router

### 3. Funkcje desktop-only

- **Raporty**: Konwersja, wartość wycen, top usługi, wykresy
- **Bulk edit**: Zmiana cen szablonów procentowo, import/export CSV
- **Kreator wycen**: Drag & drop, split-view z live PDF preview
- **Keyboard shortcuts**: Ctrl+S, Tab navigation

### 4. Synchronizacja

- Web: React Query cache (brak offline-first)
- Mobile: SQLite + sync queue (offline-first)
- Oba klienty → to samo API → PostgreSQL

## Zmiany w API

Nowe endpointy/rozszerzenia:

```typescript
// tRPC router additions
quotes: {
  // Existing
  create, update, delete, list, getById,

  // New for web
  generateShareToken: (quoteId) => { token, expiresAt },
  getByShareToken: (token) => Quote | null,

  // Client actions (unauthenticated, token-based)
  acceptByToken: (token, { name, email }) => void,
  addCommentByToken: (token, { name, text }) => void,
}

// New table: quote_comments
// New fields in quotes: shareToken, shareTokenExpiresAt, acceptedAt, acceptedBy

// Push notifications
notifications: {
  registerPushToken: (token, platform) => void,
  // Internal: sendPush(userId, { title, body })
}
```

## DaisyUI Theme

```javascript
// tailwind.config.js
daisyui: {
  themes: [{
    majsterio: {
      "primary": "#2563eb",
      "secondary": "#64748b",
      "accent": "#f59e0b",
      "neutral": "#1f2937",
      "base-100": "#ffffff",
      "success": "#22c55e",
      "warning": "#f59e0b",
      "error": "#ef4444",
    },
  }],
}
```

## Fazy implementacji

### Faza 1: Fundament
- Setup TanStack Start + tRPC + DaisyUI
- Integracja z istniejącym API
- Auth flow (login/register)
- Basic protected route `/app`

### Faza 2: Landing + Auth
- Landing page (hero, features, pricing, CTA)
- Login/Register forms
- Google OAuth web flow

### Faza 3: Core App
- Dashboard home
- Lista wycen + CRUD
- Lista klientów + CRUD
- Szablony usług

### Faza 4: Quote Sharing
- API: shareToken generation
- `/q/$token` route
- Accept + comment UI
- Push notifications (mobile integration)

### Faza 5: Desktop Features
- Reports page
- Bulk edit szablonów
- Enhanced quote creator

### Faza 6: Polish
- Blog setup (MDX lub CMS)
- SEO optimization
- Performance tuning

## Struktura plików do stworzenia

```
apps/web/
├── app/
│   ├── routes/
│   │   ├── __root.tsx
│   │   ├── index.tsx
│   │   ├── pricing.tsx
│   │   ├── q/
│   │   │   └── $token.tsx
│   │   ├── auth/
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   └── app/
│   │       ├── _layout.tsx
│   │       ├── index.tsx
│   │       ├── quotes/
│   │       │   ├── index.tsx
│   │       │   ├── $id.tsx
│   │       │   └── create.tsx
│   │       ├── clients/
│   │       │   ├── index.tsx
│   │       │   ├── $id.tsx
│   │       │   └── create.tsx
│   │       ├── templates/
│   │       │   └── index.tsx
│   │       ├── reports/
│   │       │   └── index.tsx
│   │       └── settings/
│   │           └── index.tsx
│   ├── components/
│   │   ├── marketing/
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── Pricing.tsx
│   │   │   └── Footer.tsx
│   │   ├── app/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Topbar.tsx
│   │   │   ├── QuoteCard.tsx
│   │   │   ├── ClientCard.tsx
│   │   │   └── StatsCard.tsx
│   │   └── shared/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       └── Table.tsx
│   ├── lib/
│   │   ├── trpc.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   └── styles/
│       └── globals.css
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── app.config.ts
```

## Weryfikacja

Po implementacji zweryfikować:
1. Landing ładuje się < 1s (Lighthouse)
2. `/q/$token` działa bez logowania
3. Auth flow działa (login → dashboard)
4. tRPC queries działają jak w mobile
5. Responsywność (mobile web → desktop)
6. Push notifications docierają przy akceptacji wyceny
