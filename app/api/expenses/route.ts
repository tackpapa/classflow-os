import { createAuthenticatedClient } from '@/lib/supabase/client-edge'
import { ZodError } from 'zod'
import * as z from 'zod'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

const createExpenseSchema = z.object({
  category: z.enum(['salary', 'rent', 'utilities', 'supplies', 'marketing', 'maintenance', 'other']),
  amount: z.number().positive('금액은 양수여야 합니다'),
  description: z.string().min(1, '설명은 필수입니다'),
  expense_date: z.string(), // YYYY-MM-DD
  payment_method: z.enum(['cash', 'card', 'transfer', 'other']).optional(),
  receipt_url: z.string().url().optional(),
  approved_by: z.string().uuid().optional().nullable(),
  notes: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
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
    const category = searchParams.get('category')
    const status = searchParams.get('status')
    const start_date = searchParams.get('start_date')
    const end_date = searchParams.get('end_date')

    let query = supabase
      .from('expenses')
      .select('*')
      .eq('org_id', userProfile.org_id)
      .order('expense_date', { ascending: false })

    if (category) query = query.eq('category', category)
    if (status) query = query.eq('status', status)
    if (start_date) query = query.gte('expense_date', start_date)
    if (end_date) query = query.lte('expense_date', end_date)

    const { data: expenses, error: expensesError } = await query

    if (expensesError) {
      console.error('[Expenses GET] Error:', expensesError)
      return Response.json({ error: '지출 목록 조회 실패', details: expensesError.message }, { status: 500 })
    }

    return Response.json({ expenses, count: expenses?.length || 0 })
  } catch (error: any) {
    console.error('[Expenses GET] Unexpected error:', error)
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
    const validated = createExpenseSchema.parse(body)

    const { data: expense, error: createError } = await supabase
      .from('expenses')
      .insert({
        ...validated,
        org_id: userProfile.org_id
      })
      .select()
      .single()

    if (createError) {
      console.error('[Expenses POST] Error:', createError)
      return Response.json({ error: '지출 생성 실패', details: createError.message }, { status: 500 })
    }

    return Response.json({ expense, message: '지출이 생성되었습니다' }, { status: 201 })
  } catch (error: any) {
    if (error instanceof ZodError) {
      return Response.json({ error: '입력 데이터가 유효하지 않습니다', details: error.errors }, { status: 400 })
    }

    console.error('[Expenses POST] Unexpected error:', error)
    return Response.json({ error: '서버 오류가 발생했습니다', details: error.message }, { status: 500 })
  }
}
