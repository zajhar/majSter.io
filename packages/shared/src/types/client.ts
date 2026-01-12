export interface Client {
  id: string
  userId: string
  firstName: string
  lastName: string
  phone: string | null
  siteAddress: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateClientInput {
  firstName: string
  lastName: string
  phone?: string
  siteAddress?: string
  notes?: string
}

export interface UpdateClientInput {
  firstName?: string
  lastName?: string
  phone?: string
  siteAddress?: string
  notes?: string
}
