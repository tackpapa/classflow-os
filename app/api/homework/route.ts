import { createAuthenticatedClient } from '@/lib/supabase/client-edge'
import { ZodError } from 'zod'
import * as z from 'zod'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

const createHomeworkSchema = z.object({
  class_id: z.string().uuid().optional(),
  teacher_id: z.string().uuid().optional(),
  title: z.string().min(1, '제목은 필수입니다'),
  description: z.string().optional(),
  due_date: z.string(), // ISO 8601 날짜 형식
  attachments: z.array(z.any()).optional(),
  status: z.enum(['active', 'completed', 'cancelled']).optional(),
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
    const status = searchParams.get('status')

    let query = supabase
      .from('homework')
      .select('*, classes(name)')
      .eq('org_id', userProfile.org_id)
      .order('due_date', { ascending: true })

    if (class_id) query = query.eq('class_id', class_id)
    if (status) query = query.eq('status', status)

    const { data: homework, error: homeworkError } = await query

    if (homeworkError) {
      console.error('[Homework GET] Error:', homeworkError)
      return Response.json({ error: '숙제 목록 조회 실패', details: homeworkError.message }, { status: 500 })
    }

    return Response.json({ homework, count: homework?.length || 0 })
  } catch (error: any) {
    console.error('[Homework GET] Unexpected error:', error)
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
      .select('org_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return Response.json({ error: '사용자 프로필을 찾을 수 없습니다' }, { status: 404 })
    }

    const body = await request.json()
    const validated = createHomeworkSchema.parse(body)

    const { data: homework, error: createError } = await supabase
      .from('homework')
      .insert({
        ...validated,
        org_id: userProfile.org_id
      })
      .select()
      .single()

    if (createError) {
      console.error('[Homework POST] Error:', createError)
      return Response.json({ error: '숙제 생성 실패', details: createError.message }, { status: 500 })
    }

    return Response.json({ homework, message: '숙제가 생성되었습니다' }, { status: 201 })
  } catch (error: any) {
    if (error instanceof ZodError) {
      return Response.json({ error: '입력 데이터가 유효하지 않습니다', details: error.errors }, { status: 400 })
    }

    console.error('[Homework POST] Unexpected error:', error)
    return Response.json({ error: '서버 오류가 발생했습니다', details: error.message }, { status: 500 })
  }
}
