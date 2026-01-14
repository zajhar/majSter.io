import { z } from 'zod'

export const quantitySourceSchema = z.enum(['walls', 'ceiling', 'floor', 'walls_ceiling', 'perimeter', 'manual'])

export const createQuoteServiceSchema = z.object({
  name: z.string().min(1, 'Nazwa usługi jest wymagana').max(200),
  quantity: z.number().positive('Ilość musi być większa od 0'),
  unit: z.string().min(1).max(20),
  pricePerUnit: z.number().min(0, 'Cena nie może być ujemna'),
  quantitySource: quantitySourceSchema,
})

export const createQuoteGroupSchema = z.object({
  name: z.string().min(1, 'Nazwa grupy jest wymagana').max(100),
  length: z.number().positive().optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  manualM2: z.number().positive().optional(),
  services: z.array(createQuoteServiceSchema).min(1, 'Dodaj co najmniej jedną usługę'),
})

export const createQuoteMaterialSchema = z.object({
  groupId: z.string().uuid().optional(),
  name: z.string().min(1, 'Nazwa materiału jest wymagana').max(200),
  quantity: z.number().positive('Ilość musi być większa od 0'),
  unit: z.string().min(1).max(20),
  pricePerUnit: z.number().min(0, 'Cena nie może być ujemna'),
})

export const createQuoteSchema = z.object({
  clientId: z.string().uuid('Nieprawidłowy ID klienta'),
  notesBefore: z.string().optional(),
  notesAfter: z.string().optional(),
  disclaimer: z.string().optional(),
  showDisclaimer: z.boolean().optional().default(true),
  groups: z.array(createQuoteGroupSchema).min(1, 'Dodaj co najmniej jedną grupę'),
  materials: z.array(createQuoteMaterialSchema).optional(),
})

export type CreateQuoteSchema = z.infer<typeof createQuoteSchema>
export type CreateQuoteGroupSchema = z.infer<typeof createQuoteGroupSchema>
export type CreateQuoteServiceSchema = z.infer<typeof createQuoteServiceSchema>
export type CreateQuoteMaterialSchema = z.infer<typeof createQuoteMaterialSchema>
