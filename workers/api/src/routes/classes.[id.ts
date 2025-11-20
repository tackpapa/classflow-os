import { Hono } from 'hono'
import type { Env } from '../env'
import { createAuthenticatedClient } from '../lib/supabase'

const app = new Hono<{ Bindings: Env }>()


/**
 * GET /api/classes/:id
 */
app.get('/', async (c) => {
  try {
    const supabase = await createAuthenticatedClient(c.req.raw, c.env)

    // TODO: 기존 app/api/classes/:id/route.ts 로직 이식
    // 현재는 기본 응답만 반환

    return c.json({
      message: 'GET /api/classes/:id - Implementation needed',
      // TODO: 실제 데이터 반환
    })
  } catch (error: any) {
    console.error('[classes.[id] GET error:', error)
    return c.json({ error: error.message }, 500)
  }
})


/**
 * PATCH /api/classes/:id
 */
app.patch('/', async (c) => {
  try {
    const supabase = await createAuthenticatedClient(c.req.raw, c.env)

    // TODO: 기존 app/api/classes/:id/route.ts 로직 이식
    // 현재는 기본 응답만 반환

    return c.json({
      message: 'PATCH /api/classes/:id - Implementation needed',
      // TODO: 실제 데이터 반환
    })
  } catch (error: any) {
    console.error('[classes.[id] PATCH error:', error)
    return c.json({ error: error.message }, 500)
  }
})


/**
 * DELETE /api/classes/:id
 */
app.delete('/', async (c) => {
  try {
    const supabase = await createAuthenticatedClient(c.req.raw, c.env)

    // TODO: 기존 app/api/classes/:id/route.ts 로직 이식
    // 현재는 기본 응답만 반환

    return c.json({
      message: 'DELETE /api/classes/:id - Implementation needed',
      // TODO: 실제 데이터 반환
    })
  } catch (error: any) {
    console.error('[classes.[id] DELETE error:', error)
    return c.json({ error: error.message }, 500)
  }
})


export default app
