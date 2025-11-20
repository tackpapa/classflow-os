import { z } from 'zod'

export const createAttendanceSchema = z.object({
  student_id: z.string().uuid('유효한 학생 ID가 아닙니다'),
  class_id: z.string().uuid('유효한 반 ID가 아닙니다').optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)'),
  status: z.enum(['present', 'absent', 'late', 'excused']),
  notes: z.string().optional(),
})

export const updateAttendanceSchema = z.object({
  status: z.enum(['present', 'absent', 'late', 'excused']).optional(),
  notes: z.string().optional(),
})

export type CreateAttendanceInput = z.infer<typeof createAttendanceSchema>
export type UpdateAttendanceInput = z.infer<typeof updateAttendanceSchema>
