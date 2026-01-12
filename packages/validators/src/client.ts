import { z } from 'zod'

export const createClientSchema = z.object({
  firstName: z.string().min(1, 'Imię jest wymagane').max(100),
  lastName: z.string().min(1, 'Nazwisko jest wymagane').max(100),
  phone: z.string().max(20).optional(),
  siteAddress: z.string().optional(),
  notes: z.string().optional(),
})

export const updateClientSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
  siteAddress: z.string().optional(),
  notes: z.string().optional(),
})

export type CreateClientSchema = z.infer<typeof createClientSchema>
export type UpdateClientSchema = z.infer<typeof updateClientSchema>
