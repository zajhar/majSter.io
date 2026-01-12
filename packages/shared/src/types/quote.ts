export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected'

export type QuantitySource = 'walls' | 'ceiling' | 'floor' | 'walls_ceiling' | 'manual'

export interface QuoteService {
  id: string
  groupId: string
  name: string
  quantity: number
  unit: string
  pricePerUnit: number
  total: number
  quantitySource: QuantitySource
  sortOrder: number
}

export interface QuoteGroup {
  id: string
  quoteId: string
  name: string
  // Wymiary (opcjonalne)
  length: number | null
  width: number | null
  height: number | null
  // Obliczone m² (cache)
  wallsM2: number | null
  ceilingM2: number | null
  floorM2: number | null
  // Lub ręczne m²
  manualM2: number | null
  sortOrder: number
  services: QuoteService[]
}

export interface QuoteMaterial {
  id: string
  quoteId: string
  groupId: string | null
  name: string
  quantity: number
  unit: string
  pricePerUnit: number
  total: number
  sortOrder: number
}

export interface Quote {
  id: string
  userId: string
  clientId: string
  number: number
  status: QuoteStatus
  notesBefore: string | null
  notesAfter: string | null
  disclaimer: string | null
  showDisclaimer: boolean
  total: number
  createdAt: Date
  updatedAt: Date
  syncedAt: Date | null
  // Relations
  groups: QuoteGroup[]
  materials: QuoteMaterial[]
}

export interface CreateQuoteInput {
  clientId: string
  notesBefore?: string
  notesAfter?: string
  disclaimer?: string
  showDisclaimer?: boolean
  groups: CreateQuoteGroupInput[]
  materials?: CreateQuoteMaterialInput[]
}

export interface CreateQuoteGroupInput {
  name: string
  length?: number
  width?: number
  height?: number
  manualM2?: number
  services: CreateQuoteServiceInput[]
}

export interface CreateQuoteServiceInput {
  name: string
  quantity: number
  unit: string
  pricePerUnit: number
  quantitySource: QuantitySource
}

export interface CreateQuoteMaterialInput {
  groupId?: string
  name: string
  quantity: number
  unit: string
  pricePerUnit: number
}
