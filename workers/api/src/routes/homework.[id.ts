import { Hono } from 'hono'
import type { Env } from '../env'
import { createAuthenticatedClient } from '../lib/supabase'

const app = new Hono<{ Bindings: Env }>()


/**
 * GET /api/homework/:id
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

    const { data: homework, error: homeworkError } = await supabase
      .from('homework')
      .select('*')
      .eq('id', id)
      .eq('org_id', userProfile.org_id)
      .single()

    if (homeworkError || !homework) {
      return c.json({ error: '숙제를 찾을 수 없습니다' }, 404)
    }

    return c.json({ homework })
  } catch (error: any) {
    console.error('[homework.[id] GET error:', error)
    return c.json({ error: error.message }, 500)
  }
})


/**
 * PUT /api/homework/:id
 */
app.put('/', async (c) => {
  try {
    const supabase = await createAuthenticatedClient(c.req.raw, c.env)

    // TODO: 기존 app/api/homework/:id/route.ts 로직 이식
    // 현재는 기본 응답만 반환

    return c.json({
      message: 'PUT /api/homework/:id - Implementation needed',
      // TODO: 실제 데이터 반환
    })
  } catch (error: any) {
    console.error('[homework.[id] PUT error:', error)
    return c.json({ error: error.message }, 500)
  }
})


/**
 * DELETE /api/homework/:id
 */
app.delete('/', async (c) => {
  try {
    const supabase = await createAuthenticatedClient(c.req.raw, c.env)

    // TODO: 기존 app/api/homework/:id/route.ts 로직 이식
    // 현재는 기본 응답만 반환

    return c.json({
      message: 'DELETE /api/homework/:id - Implementation needed',
      // TODO: 실제 데이터 반환
    })
  } catch (error: any) {
    console.error('[homework.[id] DELETE error:', error)
    return c.json({ error: error.message }, 500)
  }
})


export default app
