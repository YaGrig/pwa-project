import { z } from 'zod'

export const CreateUserSchema = z.object({
  name: z.string().min(3).max(30),
  email: z
    .string()
    .max(100)
    .regex(
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
      'incorrect email format',
    ),
  password: z.string().max(255),
  refresh_token: z.string().optional(),
  role: z.enum(['Admin', 'User']).default('User').optional(),
})

export type CreateUserDto = z.infer<typeof CreateUserSchema>
