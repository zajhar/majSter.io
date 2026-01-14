# Onboarding i Trade Types - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add mandatory onboarding after registration where users select their trade categories, then filter group templates based on selections.

**Architecture:** New `trade_types` and `user_trade_types` tables, onboarding screen, filtered templates.

**Tech Stack:** Drizzle ORM, TRPC, React Native, Expo Router

---

## Task 1: Database Schema - New Tables

**Files:**
- Modify: `packages/db/src/schema.ts`

**Changes:**

```typescript
// ========== TRADE TYPES ==========

export const tradeTypes = pgTable('trade_types', {
  id: varchar('id', { length: 50 }).primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  icon: varchar('icon', { length: 50 }),
  sortOrder: integer('sort_order').default(0).notNull(),
})

export const userTradeTypes = pgTable('user_trade_types', {
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  tradeTypeId: varchar('trade_type_id', { length: 50 }).notNull().references(() => tradeTypes.id, { onDelete: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.userId, table.tradeTypeId] }),
  index('user_trade_types_user_id_idx').on(table.userId),
])
```

**Also modify `userSettings`:**
```typescript
onboardingCompleted: boolean('onboarding_completed').default(false).notNull(),
```

**Also modify `groupTemplates`:**
```typescript
category: varchar('category', { length: 50 }).references(() => tradeTypes.id),
```

**Commit:** `feat(db): add trade_types tables and onboarding fields`

---

## Task 2: Trade Types Seed Data

**Files:**
- Create: `apps/api/src/data/tradeTypes.ts`
- Create: `apps/api/src/scripts/seedTradeTypes.ts`
- Modify: `apps/api/package.json`

**tradeTypes.ts:**
```typescript
export interface TradeTypeData {
  id: string
  name: string
  icon: string
  sortOrder: number
}

export const tradeTypesData: TradeTypeData[] = [
  { id: 'wykonczenia', name: 'Wykończenia wnętrz', icon: 'color-palette-outline', sortOrder: 0 },
  { id: 'budownictwo', name: 'Budownictwo', icon: 'business-outline', sortOrder: 1 },
  { id: 'hydraulika', name: 'Hydraulika', icon: 'water-outline', sortOrder: 2 },
  { id: 'elektryka', name: 'Elektryka', icon: 'flash-outline', sortOrder: 3 },
  { id: 'hvac', name: 'HVAC / Klimatyzacja', icon: 'thermometer-outline', sortOrder: 4 },
  { id: 'elewacje', name: 'Elewacje i dachy', icon: 'home-outline', sortOrder: 5 },
  { id: 'brukarstwo', name: 'Brukarstwo', icon: 'grid-outline', sortOrder: 6 },
  { id: 'ogrod', name: 'Ogród', icon: 'leaf-outline', sortOrder: 7 },
  { id: 'slusarstwo', name: 'Ślusarstwo', icon: 'construct-outline', sortOrder: 8 },
  { id: 'ziemne', name: 'Roboty ziemne', icon: 'layers-outline', sortOrder: 9 },
]
```

**Add to package.json:**
```json
"seed:trade-types": "tsx src/scripts/seedTradeTypes.ts"
```

**Commit:** `feat(api): add trade types seed data`

---

## Task 3: Update Group Templates with Categories

**Files:**
- Modify: `apps/api/src/data/groupTemplates.ts`
- Modify: `apps/api/src/scripts/seedGroupTemplates.ts`

**Add category to existing templates:**
- Łazienka, Kuchnia, Pokój-malowanie, Pokój-remont, Korytarz, Stan deweloperski, Mieszkanie PRL → `wykonczenia`
- Elewacja-styropian, Elewacja-wełna, Zabudowa poddasza → `elewacje`

**Add new templates (~15-20):**

```typescript
// budownictwo
{ name: 'Murowanie ścian', category: 'budownictwo', services: [...] },
{ name: 'Wylewka betonowa', category: 'budownictwo', services: [...] },

// hydraulika
{ name: 'Instalacja wod-kan', category: 'hydraulika', services: [...] },

// elektryka
{ name: 'Instalacja elektryczna', category: 'elektryka', services: [...] },

// hvac
{ name: 'Klimatyzacja split', category: 'hvac', services: [...] },
{ name: 'Rekuperacja', category: 'hvac', services: [...] },

// brukarstwo
{ name: 'Podjazd z kostki', category: 'brukarstwo', services: [...] },
{ name: 'Chodnik', category: 'brukarstwo', services: [...] },

// ogrod
{ name: 'Trawnik z siewu', category: 'ogrod', services: [...] },
{ name: 'System nawadniania', category: 'ogrod', services: [...] },

// slusarstwo
{ name: 'Balustrada schodowa', category: 'slusarstwo', services: [...] },
{ name: 'Ogrodzenie panelowe', category: 'slusarstwo', services: [...] },

// ziemne
{ name: 'Wykopy fundamentowe', category: 'ziemne', services: [...] },
{ name: 'Niwelacja działki', category: 'ziemne', services: [...] },
```

**Commit:** `feat(api): add categories to group templates and new templates`

---

## Task 4: TRPC - Trade Types Router

**Files:**
- Create: `apps/api/src/trpc/procedures/tradeTypes.ts`
- Modify: `apps/api/src/trpc/router.ts`

**tradeTypes.ts:**
```typescript
import { router, publicProcedure, protectedProcedure } from '../trpc.js'
import { tradeTypes } from '@majsterio/db'

export const tradeTypesRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(tradeTypes).orderBy(tradeTypes.sortOrder)
  }),
})
```

**Commit:** `feat(api): add tradeTypes TRPC router`

---

## Task 5: TRPC - User Settings Update

**Files:**
- Modify: `apps/api/src/trpc/procedures/userSettings.ts` (or create if doesn't exist)

**Add endpoints:**
```typescript
setTradeTypes: protectedProcedure
  .input(z.object({ tradeTypeIds: z.array(z.string()).min(1) }))
  .mutation(async ({ ctx, input }) => {
    // Delete existing user trade types
    await ctx.db.delete(userTradeTypes).where(eq(userTradeTypes.userId, ctx.user.id))

    // Insert new selections
    await ctx.db.insert(userTradeTypes).values(
      input.tradeTypeIds.map(id => ({ userId: ctx.user.id, tradeTypeId: id }))
    )

    // Mark onboarding as completed
    await ctx.db.update(userSettings)
      .set({ onboardingCompleted: true })
      .where(eq(userSettings.userId, ctx.user.id))

    return { success: true }
  }),

getProfile: protectedProcedure.query(async ({ ctx }) => {
  // Return user settings + trade types
  const settings = await ctx.db.select().from(userSettings).where(eq(userSettings.userId, ctx.user.id)).limit(1)
  const trades = await ctx.db.select().from(userTradeTypes).where(eq(userTradeTypes.userId, ctx.user.id))

  return {
    ...settings[0],
    tradeTypes: trades.map(t => t.tradeTypeId),
  }
}),
```

**Commit:** `feat(api): add user trade types endpoints`

---

## Task 6: Mobile - Onboarding Screen

**Files:**
- Create: `apps/mobile/app/(auth)/onboarding.tsx`

**Implementation:**
- Grid 3x4 z kategoriami
- useState dla selected categories
- trpc.tradeTypes.list.useQuery()
- trpc.userSettings.setTradeTypes.useMutation()
- Button disabled gdy 0 wybranych
- Po zapisie → router.replace('/(tabs)')

**Commit:** `feat(mobile): add onboarding screen for trade type selection`

---

## Task 7: Mobile - Auth Flow Integration

**Files:**
- Modify: `apps/mobile/app/(auth)/register.tsx`
- Modify: `apps/mobile/app/_layout.tsx`

**register.tsx:**
```typescript
// Change line 72 from:
router.replace('/(tabs)')
// To:
router.replace('/(auth)/onboarding')
```

**_layout.tsx:**
```typescript
// Add check for onboarding
const { data: profile } = trpc.userSettings.getProfile.useQuery(undefined, {
  enabled: !!user,
})

// If logged in but onboarding not completed, redirect to onboarding
useEffect(() => {
  if (user && profile && !profile.onboardingCompleted) {
    router.replace('/(auth)/onboarding')
  }
}, [user, profile])
```

**Commit:** `feat(mobile): integrate onboarding into auth flow`

---

## Task 8: Mobile - Filter Templates by Trade Types

**Files:**
- Modify: `apps/mobile/components/quote/StepGroups.tsx`

**Changes:**
- Fetch user's trade types
- Filter templates: show only templates where `category` matches user's trade types
- Optionally: add toggle "Pokaż wszystkie szablony"

**Commit:** `feat(mobile): filter group templates by user trade types`

---

## Run Commands Summary

```bash
# Push schema
cd apps/api && DATABASE_URL="..." pnpm drizzle-kit push

# Seed trade types (run BEFORE group templates!)
cd apps/api && pnpm seed:trade-types

# Seed group templates (now with categories)
cd apps/api && pnpm seed:group-templates
```

---

## Verification Checklist

- [ ] trade_types table exists with 10 records
- [ ] user_trade_types junction table exists
- [ ] user_settings has onboardingCompleted column
- [ ] group_templates has category column
- [ ] All existing templates have category assigned
- [ ] New templates exist for all 10 categories
- [ ] Onboarding screen shows after registration
- [ ] Cannot skip onboarding (min 1 selection required)
- [ ] After onboarding, user goes to dashboard
- [ ] Templates filtered by user's trade types
- [ ] Existing users see onboarding on next login (onboardingCompleted = false)
