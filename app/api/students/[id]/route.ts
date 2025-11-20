import { createAuthenticatedClient } from '@/lib/supabase/client-edge'
import { updateStudentSchema } from '@/lib/validations/student'
import { ZodError } from 'zod'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/students/[id]
 * 학생 상세 조회
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createAuthenticatedClient(request)
    const { id } = params

    // 1. 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    // 2. 사용자 프로필 조회 (org_id 확인)
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('org_id')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return Response.json(
        { error: '사용자 프로필을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 3. 학생 조회 (RLS로 같은 org_id만 자동 필터링됨)
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .eq('org_id', userProfile.org_id)
      .single()

    if (studentError || !student) {
      return Response.json(
        { error: '학생을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    return Response.json({ student })
  } catch (error: any) {
    console.error('[Student GET] Unexpected error:', error)
    return Response.json(
      { error: '서버 오류가 발생했습니다', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/students/[id]
 * 학생 정보 수정
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createAuthenticatedClient(request)
    const { id } = params

    // 1. 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    // 2. 사용자 프로필 조회 (org_id 확인)
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('org_id')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return Response.json(
        { error: '사용자 프로필을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 3. 요청 데이터 파싱 및 검증
    const body = await request.json()
    const validated = updateStudentSchema.parse(body)

    // 빈 객체 체크
    if (Object.keys(validated).length === 0) {
      return Response.json(
        { error: '수정할 데이터가 없습니다' },
        { status: 400 }
      )
    }

    // 4. 학생 정보 수정 (RLS로 같은 org_id만 자동 필터링됨)
    const { data: student, error: updateError } = await supabase
      .from('students')
      .update(validated)
      .eq('id', id)
      .eq('org_id', userProfile.org_id)
      .select()
      .single()

    if (updateError) {
      console.error('[Student PATCH] Error:', updateError)

      // 학생을 찾을 수 없는 경우
      if (updateError.code === 'PGRST116') {
        return Response.json(
          { error: '학생을 찾을 수 없거나 수정 권한이 없습니다' },
          { status: 404 }
        )
      }

      return Response.json(
        { error: '학생 정보 수정 실패', details: updateError.message },
        { status: 500 }
      )
    }

    return Response.json({
      student,
      message: '학생 정보가 수정되었습니다'
    })
  } catch (error: any) {
    // Zod 검증 오류
    if (error instanceof ZodError) {
      return Response.json(
        { error: '입력 데이터가 유효하지 않습니다', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[Student PATCH] Unexpected error:', error)
    return Response.json(
      { error: '서버 오류가 발생했습니다', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/students/[id]
 * 학생 삭제 (owner/manager만 가능)
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createAuthenticatedClient(request)
    const { id } = params

    // 1. 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    // 2. 사용자 프로필 조회 (org_id 및 role 확인)
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('org_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return Response.json(
        { error: '사용자 프로필을 찾을 수 없습니다' },
        { status: 404 }
      )
    }

    // 3. 권한 확인 (owner 또는 manager만 삭제 가능)
    if (!['owner', 'manager'].includes(userProfile.role)) {
      return Response.json(
        { error: '학생 삭제 권한이 없습니다' },
        { status: 403 }
      )
    }

    // 4. 학생 삭제 (RLS 정책으로도 보호됨)
    const { error: deleteError } = await supabase
      .from('students')
      .delete()
      .eq('id', id)
      .eq('org_id', userProfile.org_id)

    if (deleteError) {
      console.error('[Student DELETE] Error:', deleteError)
      return Response.json(
        { error: '학생 삭제 실패', details: deleteError.message },
        { status: 500 }
      )
    }

    return Response.json({
      message: '학생이 삭제되었습니다'
    })
  } catch (error: any) {
    console.error('[Student DELETE] Unexpected error:', error)
    return Response.json(
      { error: '서버 오류가 발생했습니다', details: error.message },
      { status: 500 }
    )
  }
}
