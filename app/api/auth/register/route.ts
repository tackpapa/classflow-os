import { createAuthenticatedClient } from '@/lib/supabase/client-edge'
import { registerSchema } from '@/lib/validations/auth'
import { ZodError } from 'zod'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * POST /api/auth/register
 * 회원가입 API
 *
 * @body email - 이메일 (필수)
 * @body password - 비밀번호 (필수, 최소 8자)
 * @body name - 사용자 이름 (필수)
 * @body org_name - 기관명 (필수)
 *
 * @returns 201 - 회원가입 성공 { user, session }
 * @returns 400 - 입력 검증 실패
 * @returns 409 - 이미 존재하는 이메일
 * @returns 500 - 서버 에러
 */
export async function POST(request: Request) {
  try {
    // 1. 요청 body 파싱
    const body = await request.json()

    // 2. Zod 검증
    const validated = registerSchema.parse(body)

    // 3. Supabase 클라이언트 생성
    const supabase = await createAuthenticatedClient(request)

    // 4. Supabase Auth로 회원가입
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validated.email,
      password: validated.password,
      options: {
        data: {
          name: validated.name,
        },
      },
    })

    if (authError) {
      // 이미 존재하는 이메일
      if (authError.message.includes('already registered')) {
        return Response.json(
          { error: '이미 가입된 이메일입니다' },
          { status: 409 }
        )
      }

      console.error('[Auth Register] Supabase auth error:', authError)
      return Response.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return Response.json(
        { error: '회원가입에 실패했습니다' },
        { status: 500 }
      )
    }

    // 5. organizations 테이블에 기관 생성
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: validated.org_name,
        type: 'academy', // 기본값
        owner_id: authData.user.id,
      })
      .select()
      .single()

    if (orgError) {
      console.error('[Auth Register] Organization creation error:', orgError)
      return Response.json(
        {
          error: '기관 생성에 실패했습니다',
          details: orgError.message,
          cleanup_required: true,
          user_id: authData.user.id
        },
        { status: 500 }
      )
    }

    // 6. users 테이블에 사용자 프로필 생성
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        org_id: org.id,
        email: validated.email,
        name: validated.name,
        role: 'owner', // 기관 소유자
      })

    if (userError) {
      console.error('[Auth Register] User profile creation error:', userError)
      // 프로필 생성 실패 시 organizations 삭제 (CASCADE로 인해 관련 데이터 자동 삭제)
      await supabase.from('organizations').delete().eq('id', org.id)
      return Response.json(
        {
          error: '사용자 프로필 생성에 실패했습니다',
          details: userError.message,
          cleanup_required: true,
          user_id: authData.user.id
        },
        { status: 500 }
      )
    }

    // 7. 성공 응답
    return Response.json(
      {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: validated.name,
        },
        session: authData.session,
        org: {
          id: org.id,
          name: org.name,
        },
      },
      {
        status: 201,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (error) {
    // Zod 검증 에러
    if (error instanceof ZodError) {
      return Response.json(
        {
          error: '입력값이 올바르지 않습니다',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message,
          })),
        },
        { status: 400 }
      )
    }

    // 기타 에러
    console.error('[Auth Register] Unexpected error:', error)
    return Response.json(
      { error: '회원가입 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// CORS 및 OPTIONS 요청 처리
export async function OPTIONS() {
  return Response.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  )
}
