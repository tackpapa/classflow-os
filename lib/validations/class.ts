import { z } from 'zod'

export const ClassSchema = z.object({
  name: z.string().min(2, '반 이름은 최소 2자 이상이어야 합니다'),
  subject: z.string().min(1, '과목을 선택해주세요'),
  teacher_name: z.string().min(2, '강사 이름을 입력해주세요'),
  capacity: z.number().min(1, '정원은 1명 이상이어야 합니다'),
  room: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  notes: z.string().optional(),
})

export type ClassInput = z.infer<typeof ClassSchema>
