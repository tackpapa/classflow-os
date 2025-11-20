import { Hono } from 'hono'
import type { Env } from '../env'
import { createAuthenticatedClient } from '../lib/supabase'

const app = new Hono<{ Bindings: Env }>()


/**
 * GET /api/consultations/:id
 */
app.get('/', async (c) => {
  try {
    const supabase = await createAuthenticatedClient(c.req.raw, c.env)

    // TODO: 기존 app/api/consultations/:id/route.ts 로직 이식
    // 현재는 기본 응답만 반환

    return c.json({
      message: 'GET /api/consultations/:id - Implementation needed',
      // TODO: 실제 데이터 반환
    })
  } catch (error: any) {
    console.error('[consultations.[id] GET error:', error)
    return c.json({ error: error.message }, 500)
  }
})


/**
 * PATCH /api/consultations/:id
 */
app.patch('/', async (c) => {
  try {
    const supabase = await createAuthenticatedClient(c.req.raw, c.env)

    // TODO: 기존 app/api/consultations/:id/route.ts 로직 이식
    // 현재는 기본 응답만 반환

    return c.json({
      message: 'PATCH /api/consultations/:id - Implementation needed',
      // TODO: 실제 데이터 반환
    })
  } catch (error: any) {
    console.error('[consultations.[id] PATCH error:', error)
    return c.json({ error: error.message }, 500)
  }
})


/**
 * DELETE /api/consultations/:id
 */
app.delete('/', async (c) => {
  try {
    const supabase = await createAuthenticatedClient(c.req.raw, c.env)

    // TODO: 기존 app/api/consultations/:id/route.ts 로직 이식
    // 현재는 기본 응답만 반환

    return c.json({
      message: 'DELETE /api/consultations/:id - Implementation needed',
      // TODO: 실제 데이터 반환
    })
  } catch (error: any) {
    console.error('[consultations.[id] DELETE error:', error)
    return c.json({ error: error.message }, 500)
  }
})


export default app
