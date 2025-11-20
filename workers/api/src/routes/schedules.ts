import { Hono } from 'hono'
import type { Env } from '../env'
import { createAuthenticatedClient } from '../lib/supabase'

const app = new Hono<{ Bindings: Env }>()


/**
 * GET /api/schedules
 */
app.get('/', async (c) => {
  try {
    const supabase = await createAuthenticatedClient(c.req.raw, c.env)

    // TODO: 기존 app/api/schedules/route.ts 로직 이식
    // 현재는 기본 응답만 반환

    return c.json({
      message: 'GET /api/schedules - Implementation needed',
      // TODO: 실제 데이터 반환
    })
  } catch (error: any) {
    console.error('[schedules] GET error:', error)
    return c.json({ error: error.message }, 500)
  }
})


/**
 * POST /api/schedules
 */
app.post('/', async (c) => {
  try {
    const supabase = await createAuthenticatedClient(c.req.raw, c.env)

    // TODO: 기존 app/api/schedules/route.ts 로직 이식
    // 현재는 기본 응답만 반환

    return c.json({
      message: 'POST /api/schedules - Implementation needed',
      // TODO: 실제 데이터 반환
    })
  } catch (error: any) {
    console.error('[schedules] POST error:', error)
    return c.json({ error: error.message }, 500)
  }
})


export default app
