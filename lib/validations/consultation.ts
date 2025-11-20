import { z } from 'zod'

export const createConsultationSchema = z.object({
  student_id: z.string().uuid().optional(),
  teacher_id: z.string().uuid().optional(),
  date: z.string().datetime(),
  type: z.enum(['parent', 'student', 'academic', 'behavioral', 'other']).optional(),
  summary: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).default('scheduled'),
})

export const updateConsultationSchema = z.object({
  student_id: z.string().uuid().nullable().optional(),
  teacher_id: z.string().uuid().nullable().optional(),
  date: z.string().datetime().optional(),
  type: z.enum(['parent', 'student', 'academic', 'behavioral', 'other']).optional(),
  summary: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
})

export type CreateConsultationInput = z.infer<typeof createConsultationSchema>
export type UpdateConsultationInput = z.infer<typeof updateConsultationSchema>
