import z from 'zod'

export const LoginAuthSchema = z.object({
  email: z
    .string()
    .max(100)
    .regex(
      /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
      'incorrect email format',
    ),
  password: z.string().max(255),
})

export type LoginAuthDto = z.infer<typeof LoginAuthSchema>
