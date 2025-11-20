import { createAuthenticatedClient } from '@/lib/supabase/client-edge'
import { createAttendanceSchema } from '@/lib/validations/attendance'
import { ZodError } from 'zod'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const supabase = await createAuthenticatedClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return Response.json({ error: '인증이 필요합니다' }, { status: 401 })

    const { data: userProfile } = await supabase.from('users').select('org_id').eq('id', user.id).single()
    if (!userProfile) return Response.json({ error: '사용자 프로필을 찾을 수 없습니다' }, { status: 404 })

    const { searchParams } = new URL(request.url)
    const student_id = searchParams.get('student_id')
    const class_id = searchParams.get('class_id')
    const date = searchParams.get('date')
    const status = searchParams.get('status')

    let query = supabase
      .from('attendance')
      .select('*, student:student_id(id, name), class:class_id(id, name)')
      .eq('org_id', userProfile.org_id)
      .order('date', { ascending: false })

    if (student_id) query = query.eq('student_id', student_id)
    if (class_id) query = query.eq('class_id', class_id)
    if (date) query = query.eq('date', date)
    if (status) query = query.eq('status', status)

    const { data: attendance, error } = await query

    if (error) {
      console.error('[Attendance GET] Error:', error)
      return Response.json({ error: '출결 목록 조회 실패' }, { status: 500 })
    }

    return Response.json({ attendance, count: attendance?.length || 0 })
  } catch (error: any) {
    console.error('[Attendance GET] Unexpected error:', error)
    return Response.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createAuthenticatedClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return Response.json({ error: '인증이 필요합니다' }, { status: 401 })

    const { data: userProfile } = await supabase.from('users').select('org_id').eq('id', user.id).single()
    if (!userProfile) return Response.json({ error: '사용자 프로필을 찾을 수 없습니다' }, { status: 404 })

    const body = await request.json()
    const validated = createAttendanceSchema.parse(body)

    const { data: attendanceData, error: createError } = await supabase
      .from('attendance')
      .insert({ ...validated, org_id: userProfile.org_id })
      .select()
      .single()

    if (createError) {
      console.error('[Attendance POST] Error:', createError)
      if (createError.code === '23505') {
        return Response.json({ error: '이미 해당 날짜에 출결 기록이 존재합니다' }, { status: 409 })
      }
      return Response.json({ error: '출결 생성 실패' }, { status: 500 })
    }

    return Response.json({ attendance: attendanceData, message: '출결이 기록되었습니다' }, { status: 201 })
  } catch (error: any) {
    if (error instanceof ZodError) {
      return Response.json({ error: '입력 데이터가 유효하지 않습니다', details: error.errors }, { status: 400 })
    }
    console.error('[Attendance POST] Unexpected error:', error)
    return Response.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
