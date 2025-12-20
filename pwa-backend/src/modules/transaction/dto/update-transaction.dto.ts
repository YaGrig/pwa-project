import { createTransactionSchema } from './create-transaction.dto'
import z from 'zod'

export const updateTransactionSchema = createTransactionSchema.partial()

export type UpdateTransactionDto = z.infer<typeof updateTransactionSchema>
