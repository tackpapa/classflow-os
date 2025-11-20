import { createAuthenticatedClient } from '@/lib/supabase/client-edge'
import { ZodError } from 'zod'
import * as z from 'zod'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

const updateSettingsSchema = z.object({
  settings: z.record(z.any()).optional(),
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

    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, settings')
      .eq('id', userProfile.org_id)
      .single()

    if (orgError) {
      console.error('[Settings GET] Error:', orgError)
      return Response.json({ error: '설정 조회 실패', details: orgError.message }, { status: 500 })
    }

    if (!organization) {
      return Response.json({ error: '조직을 찾을 수 없습니다' }, { status: 404 })
    }

    return Response.json({
      organization: {
        id: organization.id,
        name: organization.name,
        settings: organization.settings || {}
      }
    })
  } catch (error: any) {
    console.error('[Settings GET] Unexpected error:', error)
    return Response.json({ error: '서버 오류가 발생했습니다', details: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
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

    // Only owner and manager can update settings
    if (!['owner', 'manager'].includes(userProfile.role)) {
      return Response.json({ error: '설정을 수정할 권한이 없습니다' }, { status: 403 })
    }

    const body = await request.json()
    const validated = updateSettingsSchema.parse(body)

    const { data: organization, error: updateError } = await supabase
      .from('organizations')
      .update({ settings: validated.settings })
      .eq('id', userProfile.org_id)
      .select('id, name, settings')
      .single()

    if (updateError) {
      console.error('[Settings PUT] Error:', updateError)
      return Response.json({ error: '설정 수정 실패', details: updateError.message }, { status: 500 })
    }

    if (!organization) {
      return Response.json({ error: '조직을 찾을 수 없습니다' }, { status: 404 })
    }

    return Response.json({
      organization: {
        id: organization.id,
        name: organization.name,
        settings: organization.settings || {}
      },
      message: '설정이 수정되었습니다'
    })
  } catch (error: any) {
    if (error instanceof ZodError) {
      return Response.json({ error: '입력 데이터가 유효하지 않습니다', details: error.errors }, { status: 400 })
    }

    console.error('[Settings PUT] Unexpected error:', error)
    return Response.json({ error: '서버 오류가 발생했습니다', details: error.message }, { status: 500 })
  }
}
