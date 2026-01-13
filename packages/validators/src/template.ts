import { z } from 'zod'
import { quantitySourceSchema } from './quote.js'

export const createServiceTemplateSchema = z.object({
  name: z.string().min(1, 'Nazwa jest wymagana').max(200),
  defaultPrice: z.number().min(0).optional(),
  unit: z.string().min(1).max(20),
  quantitySource: quantitySourceSchema,
  category: z.string().max(50).optional(),
})

export const createMaterialTemplateSchema = z.object({
  name: z.string().min(1, 'Nazwa jest wymagana').max(200),
  defaultPrice: z.number().min(0).optional(),
  unit: z.string().min(1).max(20),
  consumption: z.number().positive().optional(),
  linkedServiceIds: z.array(z.string().uuid()).optional(),
})

export type CreateServiceTemplateSchema = z.infer<typeof createServiceTemplateSchema>
export type CreateMaterialTemplateSchema = z.infer<typeof createMaterialTemplateSchema>
