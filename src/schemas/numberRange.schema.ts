import { z } from 'zod'

export const numberRange = (min: number, max: number) => {
  return z.object({
    from: z
      .number()
      .min(min, `Value must be at least ${min}`)
      .max(max, `Value must be at most ${max}`),
    to: z
      .number()
      .min(min, `Value must be at least ${min}`)
      .max(max, `Value must be at most ${max}`)
  })
}
