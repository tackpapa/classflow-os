import { Hono } from 'hono'
import type { Env } from '../env'
import { createAuthenticatedClient } from '../lib/supabase'

const app = new Hono<{ Bindings: Env }>()


/**
 * GET /api/expenses/:id
 */
app.get('/', async (c) => {
  try {
    const supabase = await createAuthenticatedClient(c.req.raw, c.env)
    const id = c.req.param('id')

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return c.json({ error: '인증이 필요합니다' }, 401)
    }

    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('org_id')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return c.json({ error: '사용자 프로필을 찾을 수 없습니다' }, 404)
    }

    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .eq('org_id', userProfile.org_id)
      .single()

    if (expenseError || !expense) {
      return c.json({ error: '지출 내역을 찾을 수 없습니다' }, 404)
    }

    return c.json({ expense })
  } catch (error: any) {
    console.error('[expenses.[id] GET error:', error)
    return c.json({ error: error.message }, 500)
  }
})


/**
 * PUT /api/expenses/:id
 */
app.put('/', async (c) => {
  try {
    const supabase = await createAuthenticatedClient(c.req.raw, c.env)

    // TODO: 기존 app/api/expenses/:id/route.ts 로직 이식
    // 현재는 기본 응답만 반환

    return c.json({
      message: 'PUT /api/expenses/:id - Implementation needed',
      // TODO: 실제 데이터 반환
    })
  } catch (error: any) {
    console.error('[expenses.[id] PUT error:', error)
    return c.json({ error: error.message }, 500)
  }
})


/**
 * DELETE /api/expenses/:id
 */
app.delete('/', async (c) => {
  try {
    const supabase = await createAuthenticatedClient(c.req.raw, c.env)

    // TODO: 기존 app/api/expenses/:id/route.ts 로직 이식
    // 현재는 기본 응답만 반환

    return c.json({
      message: 'DELETE /api/expenses/:id - Implementation needed',
      // TODO: 실제 데이터 반환
    })
  } catch (error: any) {
    console.error('[expenses.[id] DELETE error:', error)
    return c.json({ error: error.message }, 500)
  }
})


export default app
