import { z } from 'zod'

export const CreateIncomeSchema = z.object({
  desription: z.string().min(5).max(255),
  amount: z.number(),
})

export type CreateIncomeDto = z.infer<typeof CreateIncomeSchema>
