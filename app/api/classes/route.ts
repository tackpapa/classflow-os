import { createAuthenticatedClient } from '@/lib/supabase/client-edge'
import { createClassSchema } from '@/lib/validations/class'
import { ZodError } from 'zod'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/classes
 * 반 목록 조회
 */
export async function GET(request: Request) {
  try {
    const supabase = await createAuthenticatedClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('org_id')
      .eq('id', user.id)
      .single()

    if (!userProfile) {
      return Response.json({ error: '사용자 프로필을 찾을 수 없습니다' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const subject = searchParams.get('subject')

    let query = supabase
      .from('classes')
      .select('*, teacher:teacher_id(id, name, email)')
      .eq('org_id', userProfile.org_id)
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (subject) query = query.eq('subject', subject)

    const { data: classes, error } = await query

    if (error) {
      console.error('[Classes GET] Error:', error)
      return Response.json({ error: '반 목록 조회 실패' }, { status: 500 })
    }

    return Response.json({ classes, count: classes?.length || 0 })
  } catch (error: any) {
    console.error('[Classes GET] Unexpected error:', error)
    return Response.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

/**
 * POST /api/classes
 * 반 생성
 */
export async function POST(request: Request) {
  try {
    const supabase = await createAuthenticatedClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('org_id')
      .eq('id', user.id)
      .single()

    if (!userProfile) {
      return Response.json({ error: '사용자 프로필을 찾을 수 없습니다' }, { status: 404 })
    }

    const body = await request.json()
    const validated = createClassSchema.parse(body)

    const { data: classData, error: createError } = await supabase
      .from('classes')
      .insert({ ...validated, org_id: userProfile.org_id })
      .select()
      .single()

    if (createError) {
      console.error('[Classes POST] Error:', createError)
      return Response.json({ error: '반 생성 실패' }, { status: 500 })
    }

    return Response.json({ class: classData, message: '반이 생성되었습니다' }, { status: 201 })
  } catch (error: any) {
    if (error instanceof ZodError) {
      return Response.json({ error: '입력 데이터가 유효하지 않습니다', details: error.errors }, { status: 400 })
    }
    console.error('[Classes POST] Unexpected error:', error)
    return Response.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
