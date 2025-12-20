import z from 'zod'
import { CreateUserSchema } from './create-auth.dto'

export const UpdateAuthSchema = CreateUserSchema.partial()

export type UpdateAuthDto = z.infer<typeof UpdateAuthSchema>
