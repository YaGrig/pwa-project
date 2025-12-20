import z from 'zod'
import { CreateIncomeSchema } from './create-income.dto'

export const UpdateIncomeSchema = CreateIncomeSchema.partial()

export type UpdateIncomeDTO = z.infer<typeof UpdateIncomeSchema>
