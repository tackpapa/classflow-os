import { createAuthenticatedClient } from '@/lib/supabase/client-edge'
import { updateConsultationSchema } from '@/lib/validations/consultation'
import { ZodError } from 'zod'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createAuthenticatedClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return Response.json({ error: '인증이 필요합니다' }, { status: 401 })

    const { data: userProfile } = await supabase.from('users').select('org_id').eq('id', user.id).single()
    if (!userProfile) return Response.json({ error: '사용자 프로필을 찾을 수 없습니다' }, { status: 404 })

    const { data: consultationData, error } = await supabase
      .from('consultations')
      .select('*, student:student_id(id, name), teacher:teacher_id(id, name)')
      .eq('id', params.id)
      .eq('org_id', userProfile.org_id)
      .single()

    if (error || !consultationData) return Response.json({ error: '상담 기록을 찾을 수 없습니다' }, { status: 404 })
    return Response.json({ consultation: consultationData })
  } catch (error: any) {
    return Response.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createAuthenticatedClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return Response.json({ error: '인증이 필요합니다' }, { status: 401 })

    const { data: userProfile } = await supabase.from('users').select('org_id').eq('id', user.id).single()
    if (!userProfile) return Response.json({ error: '사용자 프로필을 찾을 수 없습니다' }, { status: 404 })

    const body = await request.json()
    const validated = updateConsultationSchema.parse(body)

    if (Object.keys(validated).length === 0) {
      return Response.json({ error: '수정할 데이터가 없습니다' }, { status: 400 })
    }

    const { data: consultationData, error } = await supabase
      .from('consultations')
      .update(validated)
      .eq('id', params.id)
      .eq('org_id', userProfile.org_id)
      .select()
      .single()

    if (error) return Response.json({ error: '상담 정보 수정 실패' }, { status: 500 })
    return Response.json({ consultation: consultationData, message: '상담 정보가 수정되었습니다' })
  } catch (error: any) {
    if (error instanceof ZodError) {
      return Response.json({ error: '입력 데이터가 유효하지 않습니다', details: error.errors }, { status: 400 })
    }
    return Response.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createAuthenticatedClient(request)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return Response.json({ error: '인증이 필요합니다' }, { status: 401 })

    const { data: userProfile } = await supabase.from('users').select('org_id, role').eq('id', user.id).single()
    if (!userProfile) return Response.json({ error: '사용자 프로필을 찾을 수 없습니다' }, { status: 404 })
    if (!['owner', 'manager'].includes(userProfile.role)) {
      return Response.json({ error: '상담 삭제 권한이 없습니다' }, { status: 403 })
    }

    const { error } = await supabase.from('consultations').delete().eq('id', params.id).eq('org_id', userProfile.org_id)
    if (error) return Response.json({ error: '상담 삭제 실패' }, { status: 500 })
    return Response.json({ message: '상담 기록이 삭제되었습니다' })
  } catch (error: any) {
    return Response.json({ error: '서버 오류가 발생했습니다' }, { status: 500 })
  }
}
