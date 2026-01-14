# Predefiniowane usługi dla budowlańców

Data: 2026-01-14

## Cel

Dodanie predefiniowanej listy prac budowlanych z kategoriami, aby użytkownicy mogli szybko wybierać prace do wyceny zamiast wpisywać je ręcznie.

## Struktura danych

Wykorzystujemy istniejącą tabelę `service_templates` z polami:
- `name` - nazwa pracy (np. "Malowanie ścian")
- `unit` - jednostka (m², mb, szt, m3, kg)
- `defaultPrice` - cena (na start null, później możemy uzupełnić)
- `category` - kategoria
- `isSystem: true` - oznaczenie że to systemowy szablon
- `quantitySource` - źródło ilości (manual/walls/ceiling/floor/perimeter)

## Kategorie (9)

| Klucz | Nazwa wyświetlana |
|-------|-------------------|
| `malowanie_tynki` | Malowanie i tynki |
| `podlogi` | Podłogi |
| `hydraulika` | Hydraulika |
| `elektryka` | Elektryka |
| `hvac` | HVAC/Klimatyzacja |
| `ogolnobudowlane` | Prace ogólnobudowlane |
| `ziemne` | Prace ziemne |
| `ogrodowe` | Prace ogrodowe |
| `slusarskie` | Prace ślusarskie |

## UI - Ekran dodawania prac

```
┌─────────────────────────────────────────┐
│  ← Dodaj prace                          │
├─────────────────────────────────────────┤
│  🔍 Szukaj prac...                      │
├─────────────────────────────────────────┤
│  Kategorie:                             │
│  [Malowanie ✕] [Podłogi ✕]  [+ Filtruj] │
├─────────────────────────────────────────┤
│                                         │
│  MALOWANIE I TYNKI                      │
│  ┌─────────────────────────────────┐    │
│  │ ☑ Malowanie ścian        m²    │    │
│  │ ☐ Gruntowanie            m²    │    │
│  │ ☐ Gładzie gipsowe        m²    │    │
│  │ ☐ Tynk cem-wap           m²    │    │
│  └─────────────────────────────────┘    │
│                                         │
│  PODŁOGI                                │
│  ┌─────────────────────────────────┐    │
│  │ ☐ Układanie paneli       m²    │    │
│  │ ☐ Układanie płytek       m²    │    │
│  └─────────────────────────────────┘    │
│                                         │
│  + Dodaj własną pracę                   │
│                                         │
├─────────────────────────────────────────┤
│  [ Dodaj wybrane (2) ]                  │
└─────────────────────────────────────────┘
```

### Zachowanie UI

1. **Wyszukiwarka** - filtruje po nazwie pracy (wszystkie kategorie)
2. **Multi-select kategorii** - chipy z wybranymi kategoriami, kliknięcie "✕" usuwa filtr
3. **Domyślnie** - brak filtrów = wszystkie kategorie widoczne, pogrupowane
4. **Multi-select prac** - zaznaczasz wiele prac, potem "Dodaj wybrane"
5. **Grupowanie** - nagłówki kategorii nawet przy braku filtrów
6. **Własna praca** - link na dole do formularza custom pracy

### Po kliknięciu "Dodaj wybrane"

Przechodzi do ekranu edycji zbiorczej (już istniejący) gdzie użytkownik uzupełnia ceny i ilości.

## Predefiniowane prace

### Malowanie i tynki
| Nazwa | Jednostka | Źródło ilości |
|-------|-----------|---------------|
| Malowanie ścian | m² | walls |
| Malowanie sufitu | m² | ceiling |
| Gruntowanie ścian | m² | walls |
| Gruntowanie sufitu | m² | ceiling |
| Gładzie gipsowe | m² | walls |
| Tynk cementowo-wapienny | m² | walls |
| Tynk gipsowy | m² | walls |
| Szpachlowanie | m² | walls |
| Tapetowanie | m² | walls |

### Podłogi
| Nazwa | Jednostka | Źródło ilości |
|-------|-----------|---------------|
| Układanie paneli | m² | floor |
| Układanie płytek podłogowych | m² | floor |
| Układanie płytek ściennych | m² | walls |
| Wylewka betonowa | m² | floor |
| Cyklinowanie parkietu | m² | floor |
| Lakierowanie parkietu | m² | floor |
| Montaż listew przypodłogowych | mb | perimeter |
| Demontaż starej podłogi | m² | floor |

### Hydraulika
| Nazwa | Jednostka | Źródło ilości |
|-------|-----------|---------------|
| Montaż umywalki | szt | manual |
| Montaż WC | szt | manual |
| Montaż bidetu | szt | manual |
| Montaż wanny | szt | manual |
| Montaż brodzika | szt | manual |
| Montaż baterii | szt | manual |
| Instalacja rur wod-kan | mb | manual |
| Montaż grzejnika | szt | manual |
| Podłączenie pralki | szt | manual |
| Podłączenie zmywarki | szt | manual |

### Elektryka
| Nazwa | Jednostka | Źródło ilości |
|-------|-----------|---------------|
| Punkt elektryczny | szt | manual |
| Montaż gniazdka | szt | manual |
| Montaż włącznika | szt | manual |
| Montaż lampy | szt | manual |
| Prowadzenie kabli | mb | manual |
| Montaż rozdzielnicy | szt | manual |
| Montaż domofonu | szt | manual |

### HVAC/Klimatyzacja
| Nazwa | Jednostka | Źródło ilości |
|-------|-----------|---------------|
| Montaż klimatyzatora split | szt | manual |
| Montaż klimatyzatora multi-split | szt | manual |
| Montaż rekuperatora | szt | manual |
| Montaż wentylacji | mb | manual |
| Serwis klimatyzacji | szt | manual |

### Prace ogólnobudowlane
| Nazwa | Jednostka | Źródło ilości |
|-------|-----------|---------------|
| Stawianie ścianki działowej | m² | manual |
| Montaż płyt g-k | m² | walls |
| Montaż sufitu podwieszanego | m² | ceiling |
| Wyburzenie ściany | m² | manual |
| Murowanie | m² | manual |
| Ocieplenie ścian | m² | walls |
| Montaż drzwi | szt | manual |
| Montaż okna | szt | manual |

### Prace ziemne
| Nazwa | Jednostka | Źródło ilości |
|-------|-----------|---------------|
| Wykopy | m³ | manual |
| Niwelacja terenu | m² | manual |
| Wywóz ziemi | m³ | manual |
| Zasypywanie | m³ | manual |

### Prace ogrodowe
| Nazwa | Jednostka | Źródło ilości |
|-------|-----------|---------------|
| Układanie kostki brukowej | m² | manual |
| Montaż ogrodzenia | mb | manual |
| Sadzenie drzew | szt | manual |
| Zakładanie trawnika | m² | manual |
| Budowa tarasu | m² | manual |

### Prace ślusarskie
| Nazwa | Jednostka | Źródło ilości |
|-------|-----------|---------------|
| Spawanie | mb | manual |
| Montaż balustrady | mb | manual |
| Montaż bramy | szt | manual |
| Montaż furtki | szt | manual |
| Naprawa zamków | szt | manual |

## Implementacja

### Pliki do modyfikacji

1. `apps/mobile/components/quote/StepServices.tsx` - nowy UI listy z wyszukiwarką i filtrami kategorii
2. `apps/api/src/data/systemServices.ts` - nowy plik z listą predefiniowanych prac
3. `apps/api/src/trpc/procedures/templates.ts` - endpoint do seedowania/pobierania systemowych szablonów

### Seed danych

```typescript
// apps/api/src/data/systemServices.ts
export const CATEGORIES = {
  malowanie_tynki: 'Malowanie i tynki',
  podlogi: 'Podłogi',
  hydraulika: 'Hydraulika',
  elektryka: 'Elektryka',
  hvac: 'HVAC/Klimatyzacja',
  ogolnobudowlane: 'Prace ogólnobudowlane',
  ziemne: 'Prace ziemne',
  ogrodowe: 'Prace ogrodowe',
  slusarskie: 'Prace ślusarskie',
} as const

export const systemServices = [
  // MALOWANIE I TYNKI
  { name: 'Malowanie ścian', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls' },
  { name: 'Malowanie sufitu', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'ceiling' },
  { name: 'Gruntowanie ścian', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls' },
  // ... reszta z tabel powyżej
]
```

## Weryfikacja

1. Uruchomić seed → sprawdzić czy prace są w bazie z `isSystem: true`
2. Otworzyć StepServices → zobaczyć listę z wyszukiwarką
3. Wpisać "malo" → powinny pokazać się prace malarskie
4. Wybrać kategorie "Hydraulika" + "Elektryka" → tylko te widoczne
5. Zaznaczyć kilka prac → "Dodaj wybrane" → przejście do edycji zbiorczej
6. Sprawdzić czy quantitySource poprawnie oblicza ilości z wymiarów pokoju
