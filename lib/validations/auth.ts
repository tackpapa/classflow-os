import { z } from 'zod'

/**
 * 회원가입 검증 스키마
 */
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('올바른 이메일 형식이 아닙니다'),
  password: z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .max(100, '비밀번호는 최대 100자까지 입력 가능합니다'),
  name: z
    .string()
    .min(1, '이름을 입력해주세요')
    .max(50, '이름은 최대 50자까지 입력 가능합니다'),
  org_name: z
    .string()
    .min(1, '기관명을 입력해주세요')
    .max(100, '기관명은 최대 100자까지 입력 가능합니다'),
})

export type RegisterInput = z.infer<typeof registerSchema>

/**
 * 로그인 검증 스키마
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('올바른 이메일 형식이 아닙니다'),
  password: z
    .string()
    .min(1, '비밀번호를 입력해주세요'),
})

export type LoginInput = z.infer<typeof loginSchema>
