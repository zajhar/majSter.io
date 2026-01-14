# Szablony Grup - Design Document

**Data:** 2026-01-14
**Status:** Zatwierdzony

## Problem

Obecnie użytkownik musi ręcznie dodawać każdą usługę do grupy. Przy typowych pracach (łazienka, remont pokoju) powtarza te same usługi wielokrotnie. Potrzebujemy szablonów grup, które automatycznie wypełniają grupę zestawem usług.

## Rozwiązanie

Szablony grup = predefiniowane zestawy usług z cenami, które użytkownik może wybrać przy tworzeniu grupy.

### Kluczowe decyzje

| Kwestia | Decyzja |
|---------|---------|
| Kto tworzy szablony? | Systemowe + własne użytkownika |
| Jak tworzyć własne? | "Zapisz jako szablon" z wyceny + w ustawieniach |
| Co zawiera szablon? | Usługi + ceny (bez wymiarów) |
| Wymiary | Zawsze wpisywane ręcznie przy tworzeniu grupy |

---

## Model danych

### Nowa tabela: `group_templates`

```sql
CREATE TABLE group_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES "user"(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX group_templates_user_id_idx ON group_templates(user_id);
```

### Nowa tabela: `group_template_services`

```sql
CREATE TABLE group_template_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES group_templates(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  price_per_unit DECIMAL(10,2) NOT NULL,
  quantity_source VARCHAR(20) DEFAULT 'manual',
  sort_order INTEGER DEFAULT 0
);

CREATE INDEX group_template_services_template_id_idx ON group_template_services(template_id);
```

### Relacje

```
group_templates (1) ──── (*) group_template_services
     │
     └── userId = 'system' dla szablonów systemowych
```

---

## UX Flow

### A) Tworzenie grupy z szablonem

W kroku 2 wizarda (Grupy), modal "Dodaj grupę":

```
┌─────────────────────────────────────┐
│  Dodaj grupę                    [X] │
├─────────────────────────────────────┤
│                                     │
│  Nazwa grupy                        │
│  [Łazienka____________________]     │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ ○ Pusta grupa               │    │
│  │ ● Z szablonu                │    │
│  └─────────────────────────────┘    │
│                                     │
│  Wybierz szablon:                   │
│  ┌─────────────────────────────┐    │
│  │ 🏠 SYSTEMOWE                │    │
│  │  🚿 Łazienka (12 usług)     │    │
│  │  🛋️ Pokój - malowanie (4)   │    │
│  │  🛋️ Pokój - remont (8)      │    │
│  │  ...                        │    │
│  │                             │    │
│  │ 👤 MOJE SZABLONY            │    │
│  │  ⭐ Łazienka premium (15)   │    │
│  └─────────────────────────────┘    │
│                                     │
│  Wymiary:                           │
│  [dł___] x [szer__] x [wys___] m    │
│                                     │
│  [        DODAJ GRUPĘ         ]     │
└─────────────────────────────────────┘
```

**Po kliknięciu "Dodaj grupę":**
1. Tworzy się grupa z wymiarami
2. Usługi z szablonu kopiują się do grupy
3. Ilości przeliczają się automatycznie wg wymiarów
4. Użytkownik może edytować w kroku 3

### B) Zapisywanie grupy jako szablon

W menu grupy (⋮) w kroku 3 lub podglądzie:

```
┌─────────────────────┐
│ ✏️ Edytuj grupę     │
│ 📋 Kopiuj grupę     │
│ 💾 Zapisz szablon   │  ← NOWA OPCJA
│ 🗑️ Usuń grupę       │
└─────────────────────┘
```

Modal zapisu:

```
┌─────────────────────────────────────┐
│  Zapisz jako szablon            [X] │
├─────────────────────────────────────┤
│  Nazwa szablonu                     │
│  [Łazienka standard___________]     │
│                                     │
│  Opis (opcjonalnie)                 │
│  [Mały metraż, biały montaż___]     │
│                                     │
│  Usługi do zapisania: 12            │
│  (wymiary nie są zapisywane)        │
│                                     │
│  [        ZAPISZ SZABLON      ]     │
└─────────────────────────────────────┘
```

### C) Zarządzanie w ustawieniach

Nowa sekcja "Szablony grup":

```
┌─────────────────────────────────────┐
│  ← Szablony grup           [+ Nowy] │
├─────────────────────────────────────┤
│                                     │
│  MOJE SZABLONY                      │
│  ┌─────────────────────────────┐    │
│  │ ⭐ Łazienka premium         │    │
│  │    15 usług                 │ ⋮  │
│  └─────────────────────────────┘    │
│                                     │
│  SYSTEMOWE                          │
│  ┌─────────────────────────────┐    │
│  │ 🚿 Łazienka                 │    │
│  │    12 usług                 │ 👁️  │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

**Akcje:**
- Własne (⋮): Edytuj, Duplikuj, Usuń
- Systemowe (👁️): Podgląd, "Skopiuj do moich"

---

## Systemowe szablony (10)

### 1. 🚿 Łazienka
- Demontaż płytek
- Skucie starych płytek
- Hydroizolacja podłogi
- Hydroizolacja ścian
- Wylewka
- Płytki podłogowe
- Płytki ścienne
- Punkt hydrauliczny x3
- Montaż WC
- Montaż umywalki
- Montaż kabiny prysznicowej
- Montaż baterii

### 2. 🛋️ Pokój - malowanie
- Gruntowanie ścian
- Gruntowanie sufitu
- Malowanie ścian
- Malowanie sufitu

### 3. 🛋️ Pokój - remont
- Demontaż starego wykończenia
- Gładzie gipsowe
- Gruntowanie ścian
- Gruntowanie sufitu
- Malowanie ścian
- Malowanie sufitu
- Wylewka samopoziomująca
- Układanie paneli
- Montaż listew przypodłogowych

### 4. 🍳 Kuchnia
- Skucie starych płytek
- Płytki podłogowe
- Płytki ścienne
- Punkt hydrauliczny x2
- Montaż zlewozmywaka
- Montaż baterii
- Podłączenie zmywarki
- Podłączenie pralki

### 5. 🏠 Stan deweloperski
- Gładzie gipsowe
- Gruntowanie ścian
- Gruntowanie sufitu
- Malowanie ścian
- Malowanie sufitu
- Wylewka samopoziomująca
- Układanie paneli
- Montaż listew przypodłogowych
- Montaż gniazdek
- Montaż włączników

### 6. 🏚️ Mieszkanie PRL
- Kucie tynków
- Skrobanie ścian
- Demontaż starej podłogi
- Gładzie gipsowe
- Gruntowanie ścian
- Gruntowanie sufitu
- Malowanie ścian
- Malowanie sufitu
- Wylewka samopoziomująca
- Układanie paneli
- Montaż listew przypodłogowych
- Montaż gniazdek
- Montaż włączników

### 7. 📐 Zabudowa poddasza
- Zabudowa skosów GK
- Sufity GK
- Izolacja wełną
- Paroizolacja
- Gładzie gipsowe
- Gruntowanie ścian
- Malowanie ścian
- Malowanie sufitu

### 8. 🧱 Elewacja - styropian
- Gruntowanie elewacji
- Ocieplenie styropianem
- Klej + siatka
- Tynk elewacyjny
- Malowanie elewacji

### 9. 🧱 Elewacja - wełna
- Gruntowanie elewacji
- Ocieplenie wełną mineralną
- Klej + siatka
- Tynk elewacyjny
- Malowanie elewacji

### 10. 🚪 Korytarz
- Gładzie gipsowe
- Gruntowanie ścian
- Malowanie ścian
- Układanie paneli
- Montaż listew przypodłogowych

---

## Nowe usługi do dodania (~18)

Do `systemServices.ts` należy dodać:

| Kategoria | Usługa | Jednostka | Cena |
|-----------|--------|-----------|------|
| malowanie_tynki | Przygotowanie ścian do malowania | m² | 12 |
| malowanie_tynki | Malowanie dekoracyjne | m² | 60 |
| malowanie_tynki | Kucie tynków | m² | 45 |
| malowanie_tynki | Skrobanie ścian | m² | 20 |
| podlogi | Skucie starych płytek | m² | 50 |
| podlogi | Montaż cokołów z płytek | mb | 45 |
| podlogi | Wylewka samopoziomująca | m² | 40 |
| hydraulika | Punkt hydrauliczny | szt | 1000 |
| hydraulika | Ogrzewanie podłogowe | m² | 330 |
| elektryka | Montaż punktu oświetleniowego | szt | 140 |
| ogolnobudowlane | Demontaż starego wykończenia | m² | 30 |
| ogolnobudowlane | Zabudowa skosów GK | m² | 85 |
| ogolnobudowlane | Sufity GK | m² | 90 |
| ogolnobudowlane | Paroizolacja | m² | 25 |
| ogolnobudowlane | Klej + siatka (elewacja) | m² | 45 |
| ogolnobudowlane | Tynk elewacyjny | m² | 55 |
| ogolnobudowlane | Malowanie elewacji | m² | 25 |
| ogolnobudowlane | Montaż drzwi zewnętrznych | szt | 700 |
| ogolnobudowlane | Demontaż drzwi | szt | 250 |

---

## Zakres implementacji

### Backend (API)
1. Migracja: nowe tabele `group_templates`, `group_template_services`
2. TRPC: CRUD dla szablonów (`groupTemplates.list`, `.create`, `.update`, `.delete`)
3. Seed: 10 systemowych szablonów
4. Seed: ~18 nowych usług w `systemServices.ts`

### Frontend (Mobile)
1. StepGroups: opcja "z szablonu" przy tworzeniu grupy
2. GroupMenu: opcja "Zapisz jako szablon"
3. Settings: nowa sekcja "Szablony grup"
4. TemplateList: lista szablonów (systemowe + własne)
5. TemplateEditor: tworzenie/edycja własnego szablonu

---

## Pytania otwarte

- Czy potrzebujemy kategoryzacji szablonów? (Na razie nie - lista płaska)
- Czy szablony mają być dostępne offline? (Tak - cache jak usługi)
- Limit własnych szablonów per użytkownik? (Do ustalenia - może 20?)
