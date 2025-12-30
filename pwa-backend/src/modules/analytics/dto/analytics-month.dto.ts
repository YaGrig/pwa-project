import z from 'zod'

export const AnalyticsMonthSchema = z.object({
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Дата должна быть в формате YYYY-MM-DD')
    .transform((str) => new Date(str)),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Дата должна быть в формате YYYY-MM-DD')
    .transform((str) => new Date(str)),
})

export type AnalyticsMonthDTO = z.infer<typeof AnalyticsMonthSchema>
