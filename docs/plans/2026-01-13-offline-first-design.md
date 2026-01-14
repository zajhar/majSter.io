# Offline-First Design dla Majsterio Mobile

## Wymagania

- **Pełne offline-first** dla klientów i wycen
- **Mobile-first sync** - mobile zawsze wygrywa konflikty
- **Jedno urządzenie** (z timestamps dla przyszłości multi-device)
- **Auto-sync** przy powrocie online
- **UI**: tylko globalny OfflineIndicator dla pending, wykrzyknik + retry w details dla błędów

## Architektura

```
┌─────────────────────────────────────────────────────────┐
│                      UI Layer                           │
│   (clients/create.tsx, quotes/create.tsx, etc.)        │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│              Offline-Aware Hooks                        │
│   useOfflineClients()     useOfflineQuotes()           │
│   - create/update/delete  - create/update/delete       │
│   - list z cache          - list z cache               │
└────────────────────────┬────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
┌────────▼────────┐           ┌──────────▼──────────┐
│   Online?       │           │   SQLite Layer      │
│   ↓ YES         │           │   - sync_queue      │
│   tRPC API      │           │   - clients_cache   │
│                 │           │   - quotes_cache    │
└─────────────────┘           └─────────────────────┘
```

## Cache Strategy

**Online - pobieranie danych:**
```
API → dane → wyświetl UI
         ↓
     zapisz do SQLite cache
```

**Offline - otwieranie appki:**
```
SQLite cache → dane → wyświetl UI
```

**Offline - tworzenie danych:**
```
dane → SQLite cache (lokalna kopia)
     → sync_queue (do wysłania później)
     → wyświetl w UI
```

## Flow mutacji

1. Generuj `tempId` dla elementów offline
2. Zapisz do lokalnego cache (natychmiastowy UI)
3. Online: wyślij do API, podmień `tempId` → `serverId`
4. Offline: dodaj do `sync_queue`, aktualizuj `pendingCount`

## Proces synchronizacji

1. NetInfo wykrywa powrót online
2. `processQueue()` uruchamia się automatycznie
3. Dla każdego elementu w kolejce:
   - Wyślij do API
   - Sukces: usuń z kolejki, podmień `tempId` → `serverId`
   - Błąd: zapisz `error` do elementu, zostaw w kolejce
4. Odśwież cache z serwera

## Obsługa błędów

- Element z błędem zostaje w cache (widoczny)
- Element z błędem zostaje w queue (z polem `error`)
- W szczegółach: banner z błędem + przycisk retry

## Pliki

### Nowe
- `hooks/useOfflineClients.ts`
- `hooks/useOfflineQuotes.ts`
- `hooks/useSyncError.ts`

### Modyfikacje
- `db/schema.ts` - dodać `error`, `failed_at`
- `db/index.ts` - dodać `markSyncError()`, `updateCacheId()`
- `stores/syncStore.ts` - rozszerzyć `processQueue()`
- `app/_layout.tsx` - trigger auto-sync
- `app/(tabs)/clients/*` - użyć hooków
- `app/(tabs)/quotes/*` - użyć hooków
- `app/quote/create.tsx` - użyć hooków
