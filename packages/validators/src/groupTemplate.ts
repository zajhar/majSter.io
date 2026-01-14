import { z } from 'zod'

export const groupTemplateServiceSchema = z.object({
  name: z.string().min(1).max(200),
  unit: z.string().min(1).max(20),
  pricePerUnit: z.number().positive(),
  quantitySource: z.string().default('manual'),
})

export const createGroupTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  services: z.array(groupTemplateServiceSchema).min(1),
})

export type CreateGroupTemplateInput = z.infer<typeof createGroupTemplateSchema>
export type GroupTemplateServiceInput = z.infer<typeof groupTemplateServiceSchema>
