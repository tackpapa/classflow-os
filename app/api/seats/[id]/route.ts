import { createAuthenticatedClient } from '@/lib/supabase/client-edge'
import { ZodError } from 'zod'
import * as z from 'zod'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

const updateSeatSchema = z.object({
  room_id: z.string().uuid().optional(),
  seat_number: z.number().int().positive().optional(),
  student_id: z.string().uuid().optional().nullable(),
  assigned_date: z.string().optional().nullable(),
  status: z.enum(['available', 'occupied', 'reserved', 'maintenance']).optional(),
  notes: z.string().optional(),
})

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const validated = updateSeatSchema.parse(body)

    const { data: seat, error: updateError } = await supabase
      .from('seats')
      .update(validated)
      .eq('id', params.id)
      .eq('org_id', userProfile.org_id)
      .select()
      .single()

    if (updateError) {
      console.error('[Seats PUT] Error:', updateError)
      return Response.json({ error: '좌석 수정 실패', details: updateError.message }, { status: 500 })
    }

    if (!seat) {
      return Response.json({ error: '좌석을 찾을 수 없습니다' }, { status: 404 })
    }

    return Response.json({ seat, message: '좌석이 수정되었습니다' })
  } catch (error: any) {
    if (error instanceof ZodError) {
      return Response.json({ error: '입력 데이터가 유효하지 않습니다', details: error.errors }, { status: 400 })
    }

    console.error('[Seats PUT] Unexpected error:', error)
    return Response.json({ error: '서버 오류가 발생했습니다', details: error.message }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      return Response.json({ error: '좌석을 삭제할 권한이 없습니다' }, { status: 403 })
    }

    const { error: deleteError } = await supabase
      .from('seats')
      .delete()
      .eq('id', params.id)
      .eq('org_id', userProfile.org_id)

    if (deleteError) {
      console.error('[Seats DELETE] Error:', deleteError)
      return Response.json({ error: '좌석 삭제 실패', details: deleteError.message }, { status: 500 })
    }

    return Response.json({ message: '좌석이 삭제되었습니다' })
  } catch (error: any) {
    console.error('[Seats DELETE] Unexpected error:', error)
    return Response.json({ error: '서버 오류가 발생했습니다', details: error.message }, { status: 500 })
  }
}
