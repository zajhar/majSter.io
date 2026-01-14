# Opcjonalny klient i edycja wycen - Design

**Data:** 2026-01-14
**Status:** Zatwierdzony

---

## Przegląd

**Cel:** Umożliwić tworzenie wycen bez obowiązkowego wyboru klienta oraz pełną edycję istniejących wycen.

**Przypadki użycia:**
1. Marek tworzy "wycenę wzorcową" na standardowy remont łazienki - pokazuje klientom jako przykład cennika
2. Klient nie chce podawać danych osobowych - Marek tworzy wycenę bez klienta i wysyła przez WhatsApp
3. Marek stworzył wycenę bez klienta, klient się zdecydował - Marek przypisuje klienta do istniejącej wyceny
4. Marek pomylił się w cenie - edytuje istniejącą wycenę zamiast tworzyć nową

**Zmiany w zachowaniu:**
- `clientId` w wycenie staje się opcjonalne (nullable)
- Kreator wyceny pozwala pominąć krok wyboru klienta
- Szczegóły wyceny zawierają przycisk "Edytuj"
- Edycja używa tych samych ekranów co tworzenie (wypełnionych danymi)
- PDF wyświetla placeholder "---" gdy brak klienta

**Poza zakresem:**
- Kopiowanie wycen (duplikacja)
- Historia zmian / wersjonowanie
- Współdzielenie wycen-szablonów między użytkownikami

---

## Zmiany w modelu danych

### Baza danych (Drizzle schema)

Jedyna zmiana - `clientId` staje się nullable:

```typescript
// packages/db/schema.ts
export const quotes = pgTable('quotes', {
  // ...existing fields
  clientId: text('client_id').references(() => clients.id, { onDelete: 'set null' }),
  // było: .notNull() - usuwamy

  // Nowe pole
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
```

### Walidacja (Zod)

```typescript
// packages/validators/quote.ts
export const createQuoteSchema = z.object({
  clientId: z.string().uuid().nullable().optional(), // było: z.string().uuid()
  // ...reszta bez zmian
});

export const updateQuoteSchema = createQuoteSchema.extend({
  id: z.string().uuid(),
});
```

### Typy współdzielone

```typescript
// packages/shared/types/quote.ts
export interface Quote {
  // ...existing fields
  clientId: string | null; // było: string
  client?: Client | null;  // relacja - może być null
}
```

### Migracja

```sql
ALTER TABLE quotes ALTER COLUMN client_id DROP NOT NULL;
ALTER TABLE quotes ADD COLUMN updated_at TIMESTAMP DEFAULT NOW() NOT NULL;
```

---

## Zmiany w UI/UX

### Kreator wyceny - krok 1 (wybór klienta)

- Przycisk "Dalej" zawsze aktywny (nie wymaga zaznaczenia)
- Opcjonalnie: subtelny tekst pod listą "Możesz pominąć i dodać klienta później"
- Gdy brak wyboru → `clientId: null` w stanie kreatora

### Szczegóły wyceny - przycisk "Edytuj"

```
┌─────────────────────────────────────┐
│ Wycena #127                    [⋮]  │
│ Klient: Jan Kowalski               │
│ Status: Draft          [Edytuj]    │
│ ...                                │
└─────────────────────────────────────┘
```

- Przycisk "Edytuj" obok statusu lub w menu (⋮)
- Kliknięcie → otwiera kreator z wypełnionymi danymi

### Edycja - reużycie ekranów kreatora

Kreator przyjmuje opcjonalny parametr `quoteId`:
- Brak `quoteId` → tryb tworzenia (puste pola)
- Jest `quoteId` → tryb edycji (pola wypełnione z API)

Zmiany w UI kreatora przy edycji:
- Tytuł: "Edytuj wycenę #127" zamiast "Nowa wycena"
- Przycisk końcowy: "Zapisz zmiany" zamiast "Utwórz wycenę"
- Nawigacja wstecz → potwierdź porzucenie zmian

### Wyświetlanie braku klienta

Na liście wycen i w szczegółach:
- Zamiast nazwy klienta: "Bez klienta" (kolor `slate-400`, kursywa)

---

## Zmiany w API (tRPC)

### Nowa procedura: `quotes.update`

```typescript
// apps/api/src/trpc/procedures/quotes.ts
update: protectedProcedure
  .input(updateQuoteSchema)
  .mutation(async ({ ctx, input }) => {
    const { id, ...data } = input;

    // Sprawdź czy wycena należy do użytkownika
    const existing = await ctx.db.query.quotes.findFirst({
      where: and(eq(quotes.id, id), eq(quotes.userId, ctx.user.id)),
    });

    if (!existing) throw new TRPCError({ code: 'NOT_FOUND' });

    // Aktualizuj wycenę
    const [updated] = await ctx.db
      .update(quotes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(quotes.id, id))
      .returning();

    return updated;
  }),
```

### Modyfikacje istniejących procedur

- `quotes.create` - akceptuje `clientId: null`
- `quotes.byId` - zwraca `client: null` gdy brak klienta

---

## PDF

### Obsługa braku klienta

```typescript
// W komponencie QuotePdfTemplate
const clientDisplay = quote.client
  ? `${quote.client.firstName} ${quote.client.lastName}`
  : '---';

const addressDisplay = quote.client?.siteAddress || '---';
```

Sekcja klienta na PDF zawsze widoczna, z placeholderami:

```
┌─────────────────────────────────────┐
│ Klient: ---                         │
│ Adres:  ---                         │
└─────────────────────────────────────┘
```

---

## Implementacja

### Stan kreatora (Zustand)

```typescript
// apps/mobile/stores/quoteCreatorStore.ts
interface QuoteCreatorState {
  mode: 'create' | 'edit';
  quoteId: string | null;      // null = nowa wycena
  clientId: string | null;     // null = bez klienta
  // ...reszta pól

  // Akcje
  initForCreate: () => void;
  initForEdit: (quote: Quote) => void;
  reset: () => void;
}
```

### Routing (expo-router)

```
/quote/create          → nowa wycena
/quote/edit/[id]       → edycja istniejącej
```

Oba kierują do tego samego komponentu kreatora, różnica w inicjalizacji store'a.
