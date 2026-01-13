import { renderToBuffer } from '@react-pdf/renderer'
import { QuotePdfTemplate } from './QuotePdfTemplate.js'
import React from 'react'

interface Client {
  firstName: string
  lastName: string
  siteAddress?: string | null
}

interface Service {
  name: string
  quantity: string
  unit: string
  pricePerUnit: string
  total: string
}

interface Group {
  name: string
  wallsM2?: string | null
  ceilingM2?: string | null
  floorM2?: string | null
  services: Service[]
}

interface Material {
  name: string
  quantity: string
  unit: string
  pricePerUnit: string
  total: string
}

interface QuoteData {
  number: number
  total: string
  notesBefore?: string | null
  notesAfter?: string | null
  disclaimer?: string | null
  showDisclaimer: boolean
  createdAt: Date
  client: Client
  groups: Group[]
  materials: Material[]
}

export async function generateQuotePdf(quote: QuoteData, isPro: boolean = false): Promise<Buffer> {
  const element = React.createElement(QuotePdfTemplate, { quote, isPro }) as React.ReactElement
  const buffer = await renderToBuffer(element as any)
  return Buffer.from(buffer)
}

export { QuotePdfTemplate }
