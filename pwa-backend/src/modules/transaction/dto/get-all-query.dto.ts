import z from 'zod'

export const FindTransactionsQuerySchema = z.object({
  limit: z.coerce.number().int().min(5).default(5),
  offset: z.coerce.number().int().default(0),
  //   category: z.enum(['food', 'transport', 'entertainment', 'other']).optional(),
  sortBy: z.enum(['created_at', 'amount', 'description']).default('created_at'),
})

export type FindTransactionsQueryDTO = z.infer<
  typeof FindTransactionsQuerySchema
>
