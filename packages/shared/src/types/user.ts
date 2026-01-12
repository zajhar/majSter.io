export type SubscriptionTier = 'free' | 'pro' | 'pro_ai'
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due'
export type TradeType = 'construction' | 'plumbing' | 'electrical' | 'hvac' | 'other'

export interface User {
  id: string
  email: string
  name: string
  emailVerified: boolean
  image: string | null
  createdAt: Date
  updatedAt: Date
}

export interface UserSettings {
  id: string
  userId: string
  businessName: string | null
  businessLogo: string | null
  defaultDisclaimer: string | null
  showDisclaimerByDefault: boolean
  tradeType: TradeType | null
}

export interface Subscription {
  id: string
  userId: string
  tier: SubscriptionTier
  status: SubscriptionStatus
  quotesThisMonth: number
  periodStart: Date | null
  periodEnd: Date | null
  externalId: string | null
  provider: string | null
}

export const DEFAULT_DISCLAIMER = `Niniejsza wycena ma charakter orientacyjny i jest ważna na dzień wystawienia. Nie uwzględnia ewentualnych zmian cen materiałów oraz prac dodatkowych wykraczających poza opisany zakres. Ostateczna cena może ulec zmianie po szczegółowych oględzinach.`

export const SUBSCRIPTION_LIMITS = {
  free: {
    quotesPerMonth: 10,
    customTemplates: 3,
    historyDays: 30,
  },
  pro: {
    quotesPerMonth: Infinity,
    customTemplates: Infinity,
    historyDays: Infinity,
  },
  pro_ai: {
    quotesPerMonth: Infinity,
    customTemplates: Infinity,
    historyDays: Infinity,
  },
} as const
