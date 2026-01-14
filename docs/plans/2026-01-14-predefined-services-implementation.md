# Predefiniowane usługi - Plan implementacji

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Dodać predefiniowane usługi budowlane z kategoriami i filtrowaniem w UI

**Architecture:** Dane seedowane do `service_templates` z `isSystem: true`. UI z multi-select kategorii i wyszukiwarką. Grupowanie po kategoriach w liście.

**Tech Stack:** TypeScript, React Native, tRPC, Drizzle ORM, Zustand

---

## Task 1: Utworzenie pliku z danymi predefiniowanych usług

**Files:**
- Create: `apps/api/src/data/systemServices.ts`

**Step 1: Utworzyć plik z kategoriami i usługami**

```typescript
// apps/api/src/data/systemServices.ts
import type { QuantitySource } from '@majsterio/shared'

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

export type CategoryKey = keyof typeof CATEGORIES

export interface SystemService {
  name: string
  unit: string
  category: CategoryKey
  quantitySource: QuantitySource
}

export const systemServices: SystemService[] = [
  // MALOWANIE I TYNKI
  { name: 'Malowanie ścian', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls' },
  { name: 'Malowanie sufitu', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'ceiling' },
  { name: 'Gruntowanie ścian', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls' },
  { name: 'Gruntowanie sufitu', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'ceiling' },
  { name: 'Gładzie gipsowe', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls' },
  { name: 'Tynk cementowo-wapienny', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls' },
  { name: 'Tynk gipsowy', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls' },
  { name: 'Szpachlowanie', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls' },
  { name: 'Tapetowanie', unit: 'm2', category: 'malowanie_tynki', quantitySource: 'walls' },

  // PODŁOGI
  { name: 'Układanie paneli', unit: 'm2', category: 'podlogi', quantitySource: 'floor' },
  { name: 'Układanie płytek podłogowych', unit: 'm2', category: 'podlogi', quantitySource: 'floor' },
  { name: 'Układanie płytek ściennych', unit: 'm2', category: 'podlogi', quantitySource: 'walls' },
  { name: 'Wylewka betonowa', unit: 'm2', category: 'podlogi', quantitySource: 'floor' },
  { name: 'Cyklinowanie parkietu', unit: 'm2', category: 'podlogi', quantitySource: 'floor' },
  { name: 'Lakierowanie parkietu', unit: 'm2', category: 'podlogi', quantitySource: 'floor' },
  { name: 'Montaż listew przypodłogowych', unit: 'mb', category: 'podlogi', quantitySource: 'perimeter' },
  { name: 'Demontaż starej podłogi', unit: 'm2', category: 'podlogi', quantitySource: 'floor' },

  // HYDRAULIKA
  { name: 'Montaż umywalki', unit: 'szt', category: 'hydraulika', quantitySource: 'manual' },
  { name: 'Montaż WC', unit: 'szt', category: 'hydraulika', quantitySource: 'manual' },
  { name: 'Montaż bidetu', unit: 'szt', category: 'hydraulika', quantitySource: 'manual' },
  { name: 'Montaż wanny', unit: 'szt', category: 'hydraulika', quantitySource: 'manual' },
  { name: 'Montaż brodzika', unit: 'szt', category: 'hydraulika', quantitySource: 'manual' },
  { name: 'Montaż baterii', unit: 'szt', category: 'hydraulika', quantitySource: 'manual' },
  { name: 'Instalacja rur wod-kan', unit: 'mb', category: 'hydraulika', quantitySource: 'manual' },
  { name: 'Montaż grzejnika', unit: 'szt', category: 'hydraulika', quantitySource: 'manual' },
  { name: 'Podłączenie pralki', unit: 'szt', category: 'hydraulika', quantitySource: 'manual' },
  { name: 'Podłączenie zmywarki', unit: 'szt', category: 'hydraulika', quantitySource: 'manual' },

  // ELEKTRYKA
  { name: 'Punkt elektryczny', unit: 'szt', category: 'elektryka', quantitySource: 'manual' },
  { name: 'Montaż gniazdka', unit: 'szt', category: 'elektryka', quantitySource: 'manual' },
  { name: 'Montaż włącznika', unit: 'szt', category: 'elektryka', quantitySource: 'manual' },
  { name: 'Montaż lampy', unit: 'szt', category: 'elektryka', quantitySource: 'manual' },
  { name: 'Prowadzenie kabli', unit: 'mb', category: 'elektryka', quantitySource: 'manual' },
  { name: 'Montaż rozdzielnicy', unit: 'szt', category: 'elektryka', quantitySource: 'manual' },
  { name: 'Montaż domofonu', unit: 'szt', category: 'elektryka', quantitySource: 'manual' },

  // HVAC
  { name: 'Montaż klimatyzatora split', unit: 'szt', category: 'hvac', quantitySource: 'manual' },
  { name: 'Montaż klimatyzatora multi-split', unit: 'szt', category: 'hvac', quantitySource: 'manual' },
  { name: 'Montaż rekuperatora', unit: 'szt', category: 'hvac', quantitySource: 'manual' },
  { name: 'Montaż wentylacji', unit: 'mb', category: 'hvac', quantitySource: 'manual' },
  { name: 'Serwis klimatyzacji', unit: 'szt', category: 'hvac', quantitySource: 'manual' },

  // OGÓLNOBUDOWLANE
  { name: 'Stawianie ścianki działowej', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'manual' },
  { name: 'Montaż płyt g-k', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'walls' },
  { name: 'Montaż sufitu podwieszanego', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'ceiling' },
  { name: 'Wyburzenie ściany', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'manual' },
  { name: 'Murowanie', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'manual' },
  { name: 'Ocieplenie ścian', unit: 'm2', category: 'ogolnobudowlane', quantitySource: 'walls' },
  { name: 'Montaż drzwi', unit: 'szt', category: 'ogolnobudowlane', quantitySource: 'manual' },
  { name: 'Montaż okna', unit: 'szt', category: 'ogolnobudowlane', quantitySource: 'manual' },

  // ZIEMNE
  { name: 'Wykopy', unit: 'm3', category: 'ziemne', quantitySource: 'manual' },
  { name: 'Niwelacja terenu', unit: 'm2', category: 'ziemne', quantitySource: 'manual' },
  { name: 'Wywóz ziemi', unit: 'm3', category: 'ziemne', quantitySource: 'manual' },
  { name: 'Zasypywanie', unit: 'm3', category: 'ziemne', quantitySource: 'manual' },

  // OGRODOWE
  { name: 'Układanie kostki brukowej', unit: 'm2', category: 'ogrodowe', quantitySource: 'manual' },
  { name: 'Montaż ogrodzenia', unit: 'mb', category: 'ogrodowe', quantitySource: 'manual' },
  { name: 'Sadzenie drzew', unit: 'szt', category: 'ogrodowe', quantitySource: 'manual' },
  { name: 'Zakładanie trawnika', unit: 'm2', category: 'ogrodowe', quantitySource: 'manual' },
  { name: 'Budowa tarasu', unit: 'm2', category: 'ogrodowe', quantitySource: 'manual' },

  // ŚLUSARSKIE
  { name: 'Spawanie', unit: 'mb', category: 'slusarskie', quantitySource: 'manual' },
  { name: 'Montaż balustrady', unit: 'mb', category: 'slusarskie', quantitySource: 'manual' },
  { name: 'Montaż bramy', unit: 'szt', category: 'slusarskie', quantitySource: 'manual' },
  { name: 'Montaż furtki', unit: 'szt', category: 'slusarskie', quantitySource: 'manual' },
  { name: 'Naprawa zamków', unit: 'szt', category: 'slusarskie', quantitySource: 'manual' },
]
```

**Step 2: Zweryfikować że plik się kompiluje**

Run: `pnpm --filter api check-types`
Expected: No errors

**Step 3: Commit**

```bash
git add apps/api/src/data/systemServices.ts
git commit -m "feat(api): add predefined system services data"
```

---

## Task 2: Utworzenie skryptu seed dla systemowych usług

**Files:**
- Create: `apps/api/src/scripts/seedSystemServices.ts`
- Modify: `apps/api/package.json`

**Step 1: Utworzyć skrypt seed**

```typescript
// apps/api/src/scripts/seedSystemServices.ts
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') })

import { getDb, closeDb } from '../db/index.js'
import { serviceTemplates } from '@majsterio/db'
import { systemServices, CATEGORIES } from '../data/systemServices.js'
import { eq } from 'drizzle-orm'

const SYSTEM_USER_ID = 'system'

async function seed() {
  console.log('Seeding system services...')

  const db = getDb()

  // Usuń stare systemowe usługi
  await db.delete(serviceTemplates).where(eq(serviceTemplates.isSystem, true))
  console.log('Deleted old system services')

  // Dodaj nowe
  const values = systemServices.map((service, index) => ({
    userId: SYSTEM_USER_ID,
    name: service.name,
    unit: service.unit,
    category: service.category,
    quantitySource: service.quantitySource,
    isSystem: true,
    sortOrder: index,
  }))

  await db.insert(serviceTemplates).values(values)
  console.log(`Inserted ${values.length} system services`)

  // Podsumowanie
  const categories = Object.keys(CATEGORIES) as Array<keyof typeof CATEGORIES>
  for (const cat of categories) {
    const count = systemServices.filter(s => s.category === cat).length
    console.log(`  ${CATEGORIES[cat]}: ${count}`)
  }

  await closeDb()
  console.log('Done!')
}

seed().catch(console.error)
```

**Step 2: Dodać skrypt do package.json**

W `apps/api/package.json`, w sekcji `scripts` dodać:

```json
"seed:services": "tsx src/scripts/seedSystemServices.ts"
```

**Step 3: Uruchomić seed**

Run: `pnpm --filter api seed:services`
Expected:
```
Seeding system services...
Deleted old system services
Inserted 62 system services
  Malowanie i tynki: 9
  Podłogi: 8
  ...
Done!
```

**Step 4: Commit**

```bash
git add apps/api/src/scripts/seedSystemServices.ts apps/api/package.json
git commit -m "feat(api): add seed script for system services"
```

---

## Task 3: Eksport CATEGORIES do shared package

**Files:**
- Modify: `packages/shared/src/types/index.ts`
- Create: `packages/shared/src/constants/categories.ts`

**Step 1: Utworzyć plik z kategoriami w shared**

```typescript
// packages/shared/src/constants/categories.ts
export const SERVICE_CATEGORIES = {
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

export type ServiceCategoryKey = keyof typeof SERVICE_CATEGORIES
```

**Step 2: Eksportować z index.ts**

Dodać do `packages/shared/src/index.ts`:

```typescript
export * from './constants/categories'
```

**Step 3: Zaktualizować systemServices.ts żeby używał shared**

W `apps/api/src/data/systemServices.ts` zmienić import:

```typescript
import { SERVICE_CATEGORIES, type ServiceCategoryKey } from '@majsterio/shared'

// Usunąć lokalną definicję CATEGORIES, używać SERVICE_CATEGORIES
```

**Step 4: Commit**

```bash
git add packages/shared/src/constants/categories.ts packages/shared/src/index.ts apps/api/src/data/systemServices.ts
git commit -m "refactor: move service categories to shared package"
```

---

## Task 4: Dodanie filtrowania kategorii do StepServices

**Files:**
- Modify: `apps/mobile/components/quote/StepServices.tsx`

**Step 1: Dodać import kategorii i stan filtrów**

Na górze pliku dodać:

```typescript
import { SERVICE_CATEGORIES, type ServiceCategoryKey } from '@majsterio/shared'
```

W komponencie dodać stan:

```typescript
const [selectedCategories, setSelectedCategories] = useState<ServiceCategoryKey[]>([])
const [showCategoryPicker, setShowCategoryPicker] = useState(false)
```

**Step 2: Dodać logikę filtrowania**

Zmodyfikować `filteredTemplates`:

```typescript
const filteredTemplates = useMemo(() => {
  if (!templates) return []

  let result = templates

  // Filtruj po kategoriach
  if (selectedCategories.length > 0) {
    result = result.filter((t) =>
      t.category && selectedCategories.includes(t.category as ServiceCategoryKey)
    )
  }

  // Filtruj po wyszukiwaniu
  if (searchQuery.trim()) {
    result = result.filter((t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }

  return result
}, [templates, searchQuery, selectedCategories])
```

**Step 3: Grupowanie po kategoriach**

```typescript
const groupedTemplates = useMemo(() => {
  const groups: Record<string, typeof filteredTemplates> = {}

  filteredTemplates.forEach((t) => {
    const cat = t.category || 'inne'
    if (!groups[cat]) groups[cat] = []
    groups[cat].push(t)
  })

  return groups
}, [filteredTemplates])
```

**Step 4: UI dla filtrów kategorii**

Po search input dodać:

```typescript
{/* Category filters */}
<View style={styles.categoryFilters}>
  {selectedCategories.length > 0 && (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.categoryChips}>
        {selectedCategories.map((cat) => (
          <Pressable
            key={cat}
            style={styles.categoryChip}
            onPress={() => setSelectedCategories((prev) => prev.filter((c) => c !== cat))}
          >
            <Text style={styles.categoryChipText}>{SERVICE_CATEGORIES[cat]}</Text>
            <Ionicons name="close" size={14} color={colors.primary.DEFAULT} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  )}
  <Pressable
    style={styles.addCategoryButton}
    onPress={() => setShowCategoryPicker(true)}
  >
    <Ionicons name="filter" size={16} color={colors.primary.DEFAULT} />
    <Text style={styles.addCategoryText}>Filtruj</Text>
  </Pressable>
</View>
```

**Step 5: Modal wyboru kategorii**

```typescript
{/* Category Picker Modal */}
<Modal visible={showCategoryPicker} transparent animationType="fade">
  <Pressable style={styles.categoryOverlay} onPress={() => setShowCategoryPicker(false)}>
    <View style={styles.categoryModal}>
      <Text style={styles.categoryModalTitle}>Wybierz kategorie</Text>
      {(Object.keys(SERVICE_CATEGORIES) as ServiceCategoryKey[]).map((key) => {
        const isSelected = selectedCategories.includes(key)
        return (
          <Pressable
            key={key}
            style={styles.categoryOption}
            onPress={() => {
              setSelectedCategories((prev) =>
                isSelected ? prev.filter((c) => c !== key) : [...prev, key]
              )
            }}
          >
            <Ionicons
              name={isSelected ? 'checkbox' : 'square-outline'}
              size={22}
              color={isSelected ? colors.primary.DEFAULT : colors.text.muted}
            />
            <Text style={styles.categoryOptionText}>{SERVICE_CATEGORIES[key]}</Text>
          </Pressable>
        )
      })}
    </View>
  </Pressable>
</Modal>
```

**Step 6: Renderowanie pogrupowanych szablonów**

Zamienić obecne renderowanie na:

```typescript
{Object.entries(groupedTemplates).map(([category, items]) => (
  <View key={category} style={styles.templateSection}>
    <Text style={styles.templateSectionTitle}>
      {SERVICE_CATEGORIES[category as ServiceCategoryKey] || category}
    </Text>
    <View style={styles.templateGrid}>
      {items.map((t) => {
        const isSelected = selectedTemplates.some((s) => s.id === t.id)
        return (
          <Pressable
            key={t.id}
            style={[styles.templateChip, isSelected && styles.templateChipSelected]}
            onPress={() => handleToggleTemplate(t)}
          >
            {isSelected && (
              <Ionicons name="checkmark-circle" size={16} color={colors.primary.DEFAULT} />
            )}
            <Text style={[styles.templateChipText, isSelected && styles.templateChipTextSelected]}>
              {t.name}
            </Text>
          </Pressable>
        )
      })}
    </View>
  </View>
))}
```

**Step 7: Dodać style**

```typescript
categoryFilters: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 16,
  paddingVertical: 8,
  gap: 8,
},
categoryChips: {
  flexDirection: 'row',
  gap: 6,
},
categoryChip: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: colors.primary[50],
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: borderRadius.full,
  gap: 4,
},
categoryChipText: {
  fontSize: 13,
  fontFamily: fontFamily.medium,
  color: colors.primary.DEFAULT,
},
addCategoryButton: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: borderRadius.full,
  borderWidth: 1,
  borderColor: colors.primary.DEFAULT,
  gap: 4,
},
addCategoryText: {
  fontSize: 13,
  fontFamily: fontFamily.medium,
  color: colors.primary.DEFAULT,
},
categoryOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.5)',
  justifyContent: 'center',
  alignItems: 'center',
},
categoryModal: {
  backgroundColor: colors.surface,
  borderRadius: borderRadius.xl,
  padding: 20,
  width: '80%',
  maxHeight: '70%',
},
categoryModalTitle: {
  fontSize: 17,
  fontFamily: fontFamily.semibold,
  color: colors.text.heading,
  marginBottom: 16,
},
categoryOption: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 12,
  gap: 12,
},
categoryOptionText: {
  fontSize: 15,
  fontFamily: fontFamily.regular,
  color: colors.text.heading,
},
```

**Step 8: Commit**

```bash
git add apps/mobile/components/quote/StepServices.tsx
git commit -m "feat(mobile): add category filtering to service selection"
```

---

## Task 5: Weryfikacja end-to-end

**Step 1: Uruchomić seed**

Run: `pnpm --filter api seed:services`

**Step 2: Uruchomić API**

Run: `pnpm --filter api dev`

**Step 3: Uruchomić mobile**

Run: `pnpm --filter mobile start`

**Step 4: Przetestować flow**

1. Zaloguj się do aplikacji
2. Utwórz nową wycenę
3. Dodaj grupę (pokój)
4. Przejdź do kroku "Usługi"
5. Kliknij "Dodaj usługę"
6. Sprawdź czy widać kategorie i usługi
7. Użyj wyszukiwarki - wpisz "malo"
8. Użyj filtra kategorii - wybierz "Hydraulika" + "Elektryka"
9. Zaznacz kilka usług
10. Dodaj do wyceny

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: predefined construction services with category filtering

- Add 62 predefined services across 9 categories
- Add multi-select category filtering in UI
- Add search functionality
- Services grouped by category in selection modal"
```

---

## Podsumowanie plików

| Akcja | Plik |
|-------|------|
| Create | `apps/api/src/data/systemServices.ts` |
| Create | `apps/api/src/scripts/seedSystemServices.ts` |
| Create | `packages/shared/src/constants/categories.ts` |
| Modify | `packages/shared/src/index.ts` |
| Modify | `apps/api/package.json` |
| Modify | `apps/mobile/components/quote/StepServices.tsx` |
