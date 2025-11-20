import { createAuthenticatedClient } from '@/lib/supabase/client-edge'
import { ZodError } from 'zod'
import * as z from 'zod'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

const createLessonSchema = z.object({
  class_id: z.string().uuid().optional(),
  teacher_id: z.string().uuid().optional(),
  room_id: z.string().uuid().optional(),
  title: z.string().min(1, '수업 제목은 필수입니다'),
  description: z.string().optional(),
  lesson_date: z.string(), // YYYY-MM-DD
  start_time: z.string(), // HH:MM
  end_time: z.string(),
  materials: z.array(z.any()).optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']).optional(),
})

export async function GET(request: Request) {
  try {
    const supabase = await createAuthenticatedClient(request)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('org_id')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return Response.json({ error: '사용자 프로필을 찾을 수 없습니다' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const class_id = searchParams.get('class_id')
    const lesson_date = searchParams.get('lesson_date')
    const status = searchParams.get('status')

    let query = supabase
      .from('lessons')
      .select('*, classes(name), rooms(name)')
      .eq('org_id', userProfile.org_id)
      .order('lesson_date', { ascending: false })

    if (class_id) query = query.eq('class_id', class_id)
    if (lesson_date) query = query.eq('lesson_date', lesson_date)
    if (status) query = query.eq('status', status)

    const { data: lessons, error: lessonsError } = await query

    if (lessonsError) {
      console.error('[Lessons GET] Error:', lessonsError)
      return Response.json({ error: '수업 목록 조회 실패', details: lessonsError.message }, { status: 500 })
    }

    return Response.json({ lessons, count: lessons?.length || 0 })
  } catch (error: any) {
    console.error('[Lessons GET] Unexpected error:', error)
    return Response.json({ error: '서버 오류가 발생했습니다', details: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createAuthenticatedClient(request)

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json({ error: '인증이 필요합니다' }, { status: 401 })
    }

    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('org_id')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return Response.json({ error: '사용자 프로필을 찾을 수 없습니다' }, { status: 404 })
    }

    const body = await request.json()
    const validated = createLessonSchema.parse(body)

    const { data: lesson, error: createError } = await supabase
      .from('lessons')
      .insert({
        ...validated,
        org_id: userProfile.org_id
      })
      .select()
      .single()

    if (createError) {
      console.error('[Lessons POST] Error:', createError)
      return Response.json({ error: '수업 생성 실패', details: createError.message }, { status: 500 })
    }

    return Response.json({ lesson, message: '수업이 생성되었습니다' }, { status: 201 })
  } catch (error: any) {
    if (error instanceof ZodError) {
      return Response.json({ error: '입력 데이터가 유효하지 않습니다', details: error.errors }, { status: 400 })
    }

    console.error('[Lessons POST] Unexpected error:', error)
    return Response.json({ error: '서버 오류가 발생했습니다', details: error.message }, { status: 500 })
  }
}
