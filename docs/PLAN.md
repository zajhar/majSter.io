# Majsterio - Design Document

## Wizja
Aplikacja mobilna dla polskich fachowców (remonty, hydraulika, HVAC) do tworzenia profesjonalnych wycen w < 60 sekund.

## Target Persona
Marek, 35 lat, firma remontowa 2-3 osoby. Robi wykończeniówkę. Chce wyglądać profesjonalnie. Często pracuje offline (piwnice, klatki).

## Luka rynkowa
Istniejące rozwiązania (Rodos, Winbud, Norma) to narzędzia desktopowe dla kosztorysantów z uprawnieniami. Brak prostej, mobile-first apki dla "zwykłego fachowca".

---

## Tech Stack

```
📱 Mobile:     Expo (React Native) + expo-router
🔌 Backend:    Fastify + tRPC + Better Auth
🗄️ Database:   PostgreSQL + Drizzle ORM
☁️ Hosting:    Railway
📦 Monorepo:   Turborepo + pnpm
💳 Payments:   RevenueCat
🔐 Auth:       Better Auth (email + Google)
```

### Przyszłość (v2+):
- Web app: TanStack Start + tRPC (ten sam backend)
- Apple Sign In (wymagane przed App Store)

---

## Struktura Monorepo

```
majsterio/
├── apps/
│   ├── mobile/                 # Expo app
│   │   ├── app/                # expo-router
│   │   ├── components/
│   │   ├── stores/             # Zustand
│   │   ├── services/           # API, PDF, payments
│   │   └── db/                 # SQLite (offline)
│   │
│   └── api/                    # Fastify backend
│       └── src/
│           ├── trpc/           # tRPC router + procedures
│           ├── lib/            # Better Auth, etc.
│           └── db/             # Drizzle
│
└── packages/
    ├── shared/                 # Typy współdzielone
    ├── validators/             # Zod schemas
    └── db/                     # Drizzle schema
```

---

## Core Flow - Tworzenie Wyceny

```
1. Wybierz/dodaj klienta
2. Dodaj grupy (pokoje/prace ogólne)
   └── Wymiary: pełne | tylko m² | pomiń
3. Wybierz usługi z szablonu
   └── Auto-fill m² z quantitySource (walls/ceiling/floor/manual)
4. Dodaj materiały (opcjonalne)
5. Notatki przed/po + disclaimer
6. Podgląd PDF → Wyślij
```

---

## Model Danych - Kluczowe Encje

### Klient
```typescript
interface Client {
  id: string
  userId: string
  firstName: string
  lastName: string
  phone?: string
  siteAddress?: string
  notes?: string
}
```

### Wycena
```typescript
interface Quote {
  id: string
  userId: string
  clientId: string
  number: number              // auto: #1, #2, #3
  status: 'draft' | 'sent' | 'accepted'
  groups: QuoteGroup[]
  materials: QuoteMaterial[]
  notesBefore?: string
  notesAfter?: string
  disclaimer?: string         // null = domyślny
  showDisclaimer: boolean
  total: number
}
```

### Grupa (pokój lub prace ogólne)
```typescript
interface QuoteGroup {
  id: string
  name: string                // "Salon", "Hydraulika"
  // Wymiary (opcjonalne)
  length?: number
  width?: number
  height?: number
  // Obliczone (cache)
  wallsM2?: number
  ceilingM2?: number
  floorM2?: number
  // Lub ręczne
  manualM2?: number
  services: QuoteService[]
}
```

### Usługa
```typescript
interface QuoteService {
  id: string
  name: string
  quantity: number
  unit: string                // m², szt, mb, kpl, ryczałt
  pricePerUnit: number
  total: number
  quantitySource: 'walls' | 'ceiling' | 'floor' | 'manual'
}
```

### Materiał
```typescript
interface QuoteMaterial {
  id: string
  name: string
  quantity: number
  unit: string
  pricePerUnit: number
  total: number
}
```

### Szablon usługi
```typescript
interface ServiceTemplate {
  id: string
  userId: string
  name: string
  defaultPrice: number
  unit: string
  quantitySource: 'walls' | 'ceiling' | 'floor' | 'manual'
  category: string
}
```

---

## Smart Wymiary

Dla budowlańców - wymiary pokoju → auto m²:

| Usługa | quantitySource | Auto-fill |
|--------|----------------|-----------|
| Malowanie ścian | `walls` | 2*(dł+szer)*wys |
| Malowanie sufit | `ceiling` | dł*szer |
| Panele podłogowe | `floor` | dł*szer |
| Gładź całość | `walls+ceiling` | ściany + sufit |
| Hydraulika | `manual` | user wpisuje |

Dla hydraulików/elektryków - pomiń wymiary, ręczne ilości.

---

## PDF Output

```
┌─────────────────────────────────────────┐
│ [LOGO - premium]        WYCENA #127     │
│ Klient: Jan Kowalski                    │
│ Adres: ul. Lipowa 5, Warszawa           │
│ Data: 12.01.2026                        │
├─────────────────────────────────────────┤
│ NOTATKI (przed): ...                    │
├─────────────────────────────────────────┤
│ SALON (45m²)                            │
│ Robocizna:                              │
│ • Gładź ścian      40m² × 45zł = 1,800  │
│ • Malowanie        40m² × 35zł = 1,400  │
│ Materiały:                              │
│ • Farba biała      5L × 45zł = 225      │
│                         Razem: 3,425 zł │
├─────────────────────────────────────────┤
│ SUMA: 12,450 zł                         │
├─────────────────────────────────────────┤
│ NOTATKI (po): ...                       │
├─────────────────────────────────────────┤
│ WARUNKI:                                │
│ Niniejsza wycena ma charakter           │
│ orientacyjny i jest ważna na dzień      │
│ 12.01.2026. Nie uwzględnia zmian cen    │
│ materiałów oraz prac dodatkowych.       │
├─────────────────────────────────────────┤
│ ✨ Wygenerowano w Majsterio (free)      │
└─────────────────────────────────────────┘
```

---

## Offline Mode

- **Offline-first**: App działa 100% bez internetu
- **Local DB**: SQLite (expo-sqlite)
- **Sync**: Auto-sync gdy wraca połączenie
- **Queue**: Wyceny do wysłania czekają w kolejce

---

## Monetyzacja

| Feature | Free | Pro (34.99 zł/msc) |
|---------|------|---------------------|
| Wyceny/miesiąc | 10 | ∞ |
| Klienci | ∞ | ∞ |
| Szablony własne | 3 | ∞ |
| Branding PDF | "Majsterio" | Brak / własne logo |
| Historia | 30 dni | ∞ |

### Przyszłość:
- **Pro AI (69.99 zł)**: głos→wycena, opis→pozycje, AI sugestie

---

## Auth

- Better Auth (TypeScript-first)
- Email + hasło
- Google Sign In
- (v1.1) Apple Sign In

---

## Architektura - Future-proof

Przygotowane na multi-user/teams (v3+):
- Każdy rekord ma `userId`
- Nullable `organizationId`
- Zero refaktoru przy dodaniu pracowników

---

## MVP Scope

### Included:
- Auth (email + Google)
- Klienci CRUD
- Wyceny (grupy, usługi, materiały)
- Smart wymiary (walls/ceiling/floor)
- PDF generation + disclaimer
- Share/SMS/WhatsApp
- Offline mode + sync
- Szablony usług/materiałów
- Freemium (10 wycen/msc)
- RevenueCat integration

### Excluded (later):
- AI features (v2)
- Web app (v2)
- Apple Sign In (v1.1)
- Multi-user/teams (v3)
- Eksport CSV (v1.1)

---

## Praca Równoległa - 2 Streamy

### Stream A: Backend (API)
Branch: `feat/api-foundation`

### Stream B: Frontend (Mobile)
Branch: `feat/mobile-foundation`

### Zależności:
```
1. [WSPÓLNE] packages/shared - typy (robione PRZED podziałem)
2. [WSPÓLNE] packages/validators - Zod schemas
3. [WSPÓLNE] packages/db - Drizzle schema
   ↓
4. [RÓWNOLEGLE] Stream A + Stream B
```

---

## Progress Log

### Faza 0: Setup Wspólny (PRZED podziałem)
- [x] Utworzenie packages/shared/types/*.ts
- [x] Utworzenie packages/validators/*.ts
- [x] Utworzenie packages/db/schema.ts
- [x] Git branches: feat/api-foundation, feat/mobile-foundation

---

### Stream A: Backend (API) 🔌 ✅ DONE

#### A1: Fundament API ✅
- [x] Fastify setup z TypeScript
- [x] tRPC integration z Fastify
- [x] Drizzle ORM + PostgreSQL connection
- [x] Health endpoint działa
- [x] Dockerfile + db scripts gotowe
- [ ] Deploy na Railway (staging) - MANUAL

#### A2: Auth ✅
- [x] Better Auth setup
- [x] Email/password registration
- [x] Email/password login
- [x] Google OAuth config
- [x] Protected procedures w tRPC

#### A3: Core Procedures ✅
- [x] clients.list / create / update / delete
- [x] quotes.list / byId / create / delete (z m² calculations)
- [x] templates.services.list / upsert / delete
- [x] templates.materials.list / upsert / delete
- [x] subscriptions.status / incrementQuoteCount

#### A4: PDF Generation 🚧 IN PROGRESS
- [x] @react-pdf/renderer setup + styles
- [ ] QuotePdfTemplate component
- [ ] PDF generation service
- [ ] quotes.generatePdf procedure

#### A5: Subscription Logic 📝 PLANNED
- [ ] RevenueCat webhook endpoint
- [ ] paidProcedure middleware
- [ ] Quotes limit enforcement
- [ ] Monthly quota reset job

---

### Stream B: Frontend (Mobile) 📱

#### B1: Fundament Mobile
- [ ] Expo projekt cleanup (usunięcie boilerplate)
- [ ] expo-router struktura (auth, tabs)
- [ ] tRPC client setup
- [ ] Zustand stores scaffold
- [ ] Basic navigation działa

#### B2: Auth Screens
- [ ] Login screen (email + Google button)
- [ ] Register screen
- [ ] Auth flow z Better Auth client
- [ ] Protected routes

#### B3: Clients Module
- [ ] Lista klientów (FlatList)
- [ ] Dodaj klienta (formularz)
- [ ] Edytuj klienta
- [ ] Szukaj klienta

#### B4: Quotes Module - Lista
- [ ] Lista wycen (FlatList)
- [ ] Szczegóły wyceny (read-only)
- [ ] Status badge (draft/sent/accepted)

#### B5: Quotes Module - Kreator
- [ ] Step 1: Wybór klienta
- [ ] Step 2: Grupy + wymiary (3 tryby)
- [ ] Step 3: Usługi z szablonu
- [ ] Step 4: Materiały (opcjonalne)
- [ ] Step 5: Notatki + podgląd
- [ ] Kalkulacje m² (walls/ceiling/floor)

#### B6: Settings Module
- [ ] Profil użytkownika
- [ ] Szablony usług
- [ ] Szablony materiałów
- [ ] Disclaimer editor
- [ ] Subscription status + upgrade

#### B7: PDF & Share
- [ ] Podgląd PDF w app
- [ ] Share native (expo-sharing)
- [ ] SMS/WhatsApp deep link

#### B8: Offline Mode
- [ ] SQLite local DB (expo-sqlite)
- [ ] Offline queue dla wycen
- [ ] Sync przy połączeniu
- [ ] Status indicator (online/offline)

---

### Faza Końcowa: Integration & Polish
- [ ] Merge feat/api-foundation → main
- [ ] Merge feat/mobile-foundation → main
- [ ] E2E testing całego flow
- [ ] Onboarding screens
- [ ] Domyślne szablony (budowlaniec, hydraulik, elektryk)
- [ ] Error handling & edge cases
- [ ] App Store / Play Store submission

---

## Kluczowe Pliki do Utworzenia

```
apps/api/src/
├── index.ts
├── lib/auth.ts                 # Better Auth config
├── trpc/
│   ├── router.ts
│   ├── context.ts
│   └── procedures/
│       ├── auth.ts
│       ├── clients.ts
│       ├── quotes.ts
│       ├── templates.ts
│       └── subscriptions.ts
└── db/
    └── index.ts                # Drizzle client

apps/mobile/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── index.tsx           # Dashboard
│   │   ├── quotes/
│   │   ├── clients/
│   │   └── settings/
│   └── quote/
│       └── create.tsx          # Kreator wyceny
├── stores/
│   ├── authStore.ts
│   ├── quoteStore.ts
│   ├── clientStore.ts
│   └── syncStore.ts
├── db/
│   └── schema.ts               # SQLite
└── lib/
    ├── trpc.ts                 # tRPC client
    └── auth.ts                 # Better Auth client

packages/db/
└── schema.ts                   # Drizzle schema (PostgreSQL)

packages/shared/
└── types/
    ├── quote.ts
    ├── client.ts
    └── index.ts

packages/validators/
└── quote.ts                    # Zod schemas
```

---

## Weryfikacja MVP

```bash
# 1. API działa
curl https://api.majsterio.pl/health

# 2. Auth działa
# - Rejestracja email
# - Login email
# - Login Google

# 3. Core flow
# - Dodaj klienta
# - Stwórz wycenę z grupą + usługami
# - Wygeneruj PDF
# - Wyślij przez Share

# 4. Offline
# - Wyłącz internet
# - Stwórz wycenę
# - Włącz internet
# - Sprawdź sync

# 5. Freemium
# - Stwórz 10 wycen
# - 11. wycena → paywall
```

---

## Decyzje Architektoniczne

| Decyzja | Wybór | Uzasadnienie |
|---------|-------|--------------|
| State management | Zustand | Lekki, persist, prosty |
| API communication | tRPC | Full type-safety |
| Auth | Better Auth | TypeScript-first, OAuth easy |
| Offline DB | SQLite | Szybkie, sprawdzone na mobile |
| PDF | react-native-pdf | Offline generation |
| Payments | RevenueCat | iOS + Android unified |
| Hosting | Railway | Prosty, PostgreSQL included |

---

## Notatki

- **Apple Sign In**: Wymagane przez Apple jeśli masz inne social login. Dodać przed App Store submission (v1.1).
- **AI Features**: Architektura gotowa, implementacja w v2 (Pro AI tier 69.99 zł).
- **Multi-user**: userId na każdym rekordzie, organizationId nullable. Zero refaktoru w v3.
- **Web app**: TanStack Start + ten sam tRPC backend (v2).
