import { createAuthenticatedClient } from '@/lib/supabase/client-edge'
import { ZodError } from 'zod'
import * as z from 'zod'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

const createRoomSchema = z.object({
  name: z.string().min(1, '강의실 이름은 필수입니다'),
  capacity: z.number().int().positive().optional(),
  location: z.string().optional(),
  equipment: z.array(z.string()).optional(),
  status: z.enum(['available', 'in_use', 'maintenance']).optional(),
})

/**
 * GET /api/rooms
 * 강의실 목록 조회
 */
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
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let query = supabase
      .from('rooms')
      .select('*')
      .eq('org_id', userProfile.org_id)
      .order('created_at', { ascending: false })

    if (status) query = query.eq('status', status)
    if (search) query = query.ilike('name', `%${search}%`)

    const { data: rooms, error: roomsError } = await query

    if (roomsError) {
      console.error('[Rooms GET] Error:', roomsError)
      return Response.json({ error: '강의실 목록 조회 실패', details: roomsError.message }, { status: 500 })
    }

    return Response.json({ rooms, count: rooms?.length || 0 })
  } catch (error: any) {
    console.error('[Rooms GET] Unexpected error:', error)
    return Response.json({ error: '서버 오류가 발생했습니다', details: error.message }, { status: 500 })
  }
}

/**
 * POST /api/rooms
 * 강의실 생성
 */
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

    if (!['owner', 'manager'].includes(userProfile.role)) {
      return Response.json({ error: '강의실을 생성할 권한이 없습니다' }, { status: 403 })
    }

    const body = await request.json()
    const validated = createRoomSchema.parse(body)

    const { data: room, error: createError } = await supabase
      .from('rooms')
      .insert({
        ...validated,
        org_id: userProfile.org_id
      })
      .select()
      .single()

    if (createError) {
      console.error('[Rooms POST] Error:', createError)
      return Response.json({ error: '강의실 생성 실패', details: createError.message }, { status: 500 })
    }

    return Response.json({ room, message: '강의실이 생성되었습니다' }, { status: 201 })
  } catch (error: any) {
    if (error instanceof ZodError) {
      return Response.json({ error: '입력 데이터가 유효하지 않습니다', details: error.errors }, { status: 400 })
    }

    console.error('[Rooms POST] Unexpected error:', error)
    return Response.json({ error: '서버 오류가 발생했습니다', details: error.message }, { status: 500 })
  }
}
