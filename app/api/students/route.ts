import { createAuthenticatedClient } from '@/lib/supabase/client-edge'
import { createStudentSchema } from '@/lib/validations/student'
import { ZodError } from 'zod'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/students
 * 학생 목록 조회 (인증된 사용자의 기관에 속한 학생만)
 */
export async function GET(request: Request) {
  try {
    const supabase = await createAuthenticatedClient(request)

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

    // 3. 쿼리 파라미터 파싱
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // active, inactive, graduated
    const grade = searchParams.get('grade')
    const search = searchParams.get('search') // 이름 검색

    // 4. 학생 목록 조회 (RLS로 같은 org_id만 자동 필터링됨)
    let query = supabase
      .from('students')
      .select('*')
      .eq('org_id', userProfile.org_id)
      .order('created_at', { ascending: false })

    // 필터 적용
    if (status) {
      query = query.eq('status', status)
    }
    if (grade) {
      query = query.eq('grade', grade)
    }
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data: students, error: studentsError } = await query

    if (studentsError) {
      console.error('[Students GET] Error:', studentsError)
      return Response.json(
        { error: '학생 목록 조회 실패', details: studentsError.message },
        { status: 500 }
      )
    }

    return Response.json({
      students,
      count: students?.length || 0
    })
  } catch (error: any) {
    console.error('[Students GET] Unexpected error:', error)
    return Response.json(
      { error: '서버 오류가 발생했습니다', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/students
 * 학생 생성
 */
export async function POST(request: Request) {
  try {
    const supabase = await createAuthenticatedClient(request)

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
    const validated = createStudentSchema.parse(body)

    // 4. 학생 생성 (org_id 자동 추가)
    const { data: student, error: createError } = await supabase
      .from('students')
      .insert({
        ...validated,
        org_id: userProfile.org_id
      })
      .select()
      .single()

    if (createError) {
      console.error('[Students POST] Error:', createError)
      return Response.json(
        { error: '학생 생성 실패', details: createError.message },
        { status: 500 }
      )
    }

    return Response.json(
      { student, message: '학생이 생성되었습니다' },
      { status: 201 }
    )
  } catch (error: any) {
    // Zod 검증 오류
    if (error instanceof ZodError) {
      return Response.json(
        { error: '입력 데이터가 유효하지 않습니다', details: error.errors },
        { status: 400 }
      )
    }

    console.error('[Students POST] Unexpected error:', error)
    return Response.json(
      { error: '서버 오류가 발생했습니다', details: error.message },
      { status: 500 }
    )
  }
}
