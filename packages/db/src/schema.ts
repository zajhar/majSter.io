import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  decimal,
  integer,
  serial,
  index,
} from 'drizzle-orm/pg-core'

// ========== BETTER AUTH TABLES ==========

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

// ========== CLIENTS ==========

export const clients = pgTable('clients', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  siteAddress: text('site_address'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('clients_user_id_idx').on(table.userId),
])

// ========== QUOTES ==========

export const quotes = pgTable('quotes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  clientId: uuid('client_id').references(() => clients.id, { onDelete: 'set null' }),
  number: serial('number'),
  status: varchar('status', { length: 20 }).default('draft').notNull(),
  notesBefore: text('notes_before'),
  notesAfter: text('notes_after'),
  disclaimer: text('disclaimer'),
  showDisclaimer: boolean('show_disclaimer').default(true).notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).default('0').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  syncedAt: timestamp('synced_at'),
}, (table) => [
  index('quotes_user_id_idx').on(table.userId),
  index('quotes_client_id_idx').on(table.clientId),
])

// ========== QUOTE GROUPS ==========

export const quoteGroups = pgTable('quote_groups', {
  id: uuid('id').primaryKey().defaultRandom(),
  quoteId: uuid('quote_id').notNull().references(() => quotes.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  length: decimal('length', { precision: 6, scale: 2 }),
  width: decimal('width', { precision: 6, scale: 2 }),
  height: decimal('height', { precision: 6, scale: 2 }),
  wallsM2: decimal('walls_m2', { precision: 8, scale: 2 }),
  ceilingM2: decimal('ceiling_m2', { precision: 8, scale: 2 }),
  floorM2: decimal('floor_m2', { precision: 8, scale: 2 }),
  manualM2: decimal('manual_m2', { precision: 8, scale: 2 }),
  manualFloor: decimal('manual_floor', { precision: 8, scale: 2 }),
  manualCeiling: decimal('manual_ceiling', { precision: 8, scale: 2 }),
  manualWalls: decimal('manual_walls', { precision: 8, scale: 2 }),
  manualPerimeter: decimal('manual_perimeter', { precision: 8, scale: 2 }),
  sortOrder: integer('sort_order').default(0).notNull(),
}, (table) => [
  index('quote_groups_quote_id_idx').on(table.quoteId),
])

// ========== QUOTE SERVICES ==========

export const quoteServices = pgTable('quote_services', {
  id: uuid('id').primaryKey().defaultRandom(),
  groupId: uuid('group_id').notNull().references(() => quoteGroups.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 200 }).notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  unit: varchar('unit', { length: 20 }).notNull(),
  pricePerUnit: decimal('price_per_unit', { precision: 10, scale: 2 }).notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  quantitySource: varchar('quantity_source', { length: 20 }).default('manual').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
}, (table) => [
  index('quote_services_group_id_idx').on(table.groupId),
])

// ========== QUOTE MATERIALS ==========

export const quoteMaterials = pgTable('quote_materials', {
  id: uuid('id').primaryKey().defaultRandom(),
  quoteId: uuid('quote_id').notNull().references(() => quotes.id, { onDelete: 'cascade' }),
  groupId: uuid('group_id').references(() => quoteGroups.id, { onDelete: 'set null' }),
  name: varchar('name', { length: 200 }).notNull(),
  quantity: decimal('quantity', { precision: 10, scale: 2 }).notNull(),
  unit: varchar('unit', { length: 20 }).notNull(),
  pricePerUnit: decimal('price_per_unit', { precision: 10, scale: 2 }).notNull(),
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
}, (table) => [
  index('quote_materials_quote_id_idx').on(table.quoteId),
])

// ========== SERVICE TEMPLATES ==========

export const serviceTemplates = pgTable('service_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 200 }).notNull(),
  defaultPrice: decimal('default_price', { precision: 10, scale: 2 }),
  unit: varchar('unit', { length: 20 }).notNull(),
  quantitySource: varchar('quantity_source', { length: 20 }).default('manual').notNull(),
  category: varchar('category', { length: 50 }),
  isSystem: boolean('is_system').default(false).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
}, (table) => [
  index('service_templates_user_id_idx').on(table.userId),
])

// ========== MATERIAL TEMPLATES ==========

export const materialTemplates = pgTable('material_templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 200 }).notNull(),
  defaultPrice: decimal('default_price', { precision: 10, scale: 2 }),
  unit: varchar('unit', { length: 20 }).notNull(),
  consumption: decimal('consumption', { precision: 8, scale: 4 }),
  linkedServiceIds: text('linked_service_ids'), // JSON array
  isSystem: boolean('is_system').default(false).notNull(),
}, (table) => [
  index('material_templates_user_id_idx').on(table.userId),
])

// ========== USER SETTINGS ==========

export const userSettings = pgTable('user_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  businessName: varchar('business_name', { length: 200 }),
  businessLogo: text('business_logo'),
  defaultDisclaimer: text('default_disclaimer'),
  showDisclaimerByDefault: boolean('show_disclaimer_default').default(true).notNull(),
  tradeType: varchar('trade_type', { length: 50 }),
})

// ========== SUBSCRIPTIONS ==========

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  tier: varchar('tier', { length: 20 }).default('free').notNull(),
  status: varchar('status', { length: 20 }).default('active').notNull(),
  quotesThisMonth: integer('quotes_this_month').default(0).notNull(),
  periodStart: timestamp('period_start'),
  periodEnd: timestamp('period_end'),
  externalId: varchar('external_id', { length: 100 }),
  provider: varchar('provider', { length: 20 }),
})
