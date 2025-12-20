import { z } from 'zod'

export const createTransactionSchema = z.object({
  amount: z.number(),
  description: z.string().min(3).max(200),
  photo_url: z.string().optional(),
})

export type CreateTransactionDto = z.infer<typeof createTransactionSchema>
