import type { QuantitySource } from './quote'

export interface ServiceTemplate {
  id: string
  userId: string
  name: string
  defaultPrice: number | null
  unit: string
  quantitySource: QuantitySource
  category: string | null
  isSystem: boolean
  sortOrder: number
}

export interface CreateServiceTemplateInput {
  name: string
  defaultPrice?: number
  unit: string
  quantitySource: QuantitySource
  category?: string
}

export interface MaterialTemplate {
  id: string
  userId: string
  name: string
  defaultPrice: number | null
  unit: string
  consumption: number | null  // zużycie per m²
  linkedServiceIds: string[]
  isSystem: boolean
}

export interface CreateMaterialTemplateInput {
  name: string
  defaultPrice?: number
  unit: string
  consumption?: number
  linkedServiceIds?: string[]
}
