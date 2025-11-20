import { Hono } from 'hono'
import type { Env } from '../env'
import { createAuthenticatedClient } from '../lib/supabase'

const app = new Hono<{ Bindings: Env }>()


/**
 * POST /api/auth/logout
 */
app.post('/', async (c) => {
  try {
    const supabase = await createAuthenticatedClient(c.req.raw, c.env)

    // TODO: 기존 app/api/auth/logout/route.ts 로직 이식
    // 현재는 기본 응답만 반환

    return c.json({
      message: 'POST /api/auth/logout - Implementation needed',
      // TODO: 실제 데이터 반환
    })
  } catch (error: any) {
    console.error('[auth.logout] POST error:', error)
    return c.json({ error: error.message }, 500)
  }
})


export default app
