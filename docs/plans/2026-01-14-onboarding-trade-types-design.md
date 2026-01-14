# Onboarding i Kategorie Branż - Design Document

**Data:** 2026-01-14
**Status:** Zatwierdzony

## Problem

Aplikacja celuje w różne branże budowlane (wykończenia, hydraulika, ślusarstwo, etc.), ale obecnie pokazuje wszystkie szablony wszystkim użytkownikom. Potrzebujemy personalizacji - user wybiera swoje branże i widzi relevantne szablony.

## Rozwiązanie

Wymuszony onboarding po rejestracji gdzie user wybiera min. 1 branżę. Szablony grup filtrowane po wybranych branżach.

---

## Flow

```
Rejestracja → Onboarding (wymuszony) → Dashboard
                  │
            min. 1 branża
                  │
      user_trade_types + onboardingCompleted = true
```

---

## Model danych

### Nowa tabela: `trade_types`

```sql
CREATE TABLE trade_types (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0
);
```

### Nowa tabela: `user_trade_types`

```sql
CREATE TABLE user_trade_types (
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  trade_type_id VARCHAR(50) NOT NULL REFERENCES trade_types(id),
  PRIMARY KEY (user_id, trade_type_id)
);
```

### Modyfikacja: `user_settings`

```sql
ALTER TABLE user_settings ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
```

### Modyfikacja: `group_templates`

```sql
ALTER TABLE group_templates ADD COLUMN category VARCHAR(50) REFERENCES trade_types(id);
```

---

## Trade Types (10)

| id | name | icon |
|----|------|------|
| `wykonczenia` | Wykończenia wnętrz | `color-palette-outline` |
| `budownictwo` | Budownictwo | `business-outline` |
| `hydraulika` | Hydraulika | `water-outline` |
| `elektryka` | Elektryka | `flash-outline` |
| `hvac` | HVAC / Klimatyzacja | `thermometer-outline` |
| `elewacje` | Elewacje i dachy | `home-outline` |
| `brukarstwo` | Brukarstwo | `grid-outline` |
| `ogrod` | Ogród | `leaf-outline` |
| `slusarstwo` | Ślusarstwo | `construct-outline` |
| `ziemne` | Roboty ziemne | `layers-outline` |

---

## Szablony grup per branża

### wykonczenia
- Łazienka, Kuchnia, Pokój-malowanie, Pokój-remont, Korytarz, Stan deweloperski, Mieszkanie PRL

### elewacje
- Elewacja-styropian, Elewacja-wełna, Zabudowa poddasza

### budownictwo (nowe)
- Murowanie ścian, Wylewka, Strop, Fundamenty

### hydraulika (nowe)
- Instalacja wod-kan, Punkt hydrauliczny x5

### elektryka (nowe)
- Instalacja elektryczna mieszkania, Oświetlenie

### hvac (nowe)
- Klimatyzacja split, Rekuperacja

### brukarstwo (nowe)
- Podjazd z kostki, Chodnik, Taras

### ogrod (nowe)
- Trawnik, System nawadniania

### slusarstwo (nowe)
- Balustrada schodowa, Ogrodzenie panelowe, Brama

### ziemne (nowe)
- Wykopy fundamentowe, Niwelacja działki

---

## UI Onboarding

Ekran: `/app/(auth)/onboarding.tsx`

- Grid 3 kolumny z 10 kategoriami
- Każda kategoria = ikona + nazwa + checkbox
- Tap = toggle selection
- Przycisk "Rozpocznij" aktywny gdy ≥1 wybrana
- Po zapisie → redirect do `/(tabs)`

---

## API Endpoints

### tradeTypes.list
```typescript
// Returns all trade types
{ id, name, icon, sortOrder }[]
```

### userSettings.setTradeTypes
```typescript
// Input: { tradeTypeIds: string[] }
// Saves user's selected trade types + sets onboardingCompleted = true
```

### userSettings.get
```typescript
// Returns user settings including onboardingCompleted and tradeTypes
```

---

## Filtrowanie szablonów

W `StepGroups.tsx`:
1. Pobierz user's trade types
2. Filtruj szablony: `template.category IN user_trade_types`
3. Opcjonalnie: toggle "Pokaż wszystkie"
