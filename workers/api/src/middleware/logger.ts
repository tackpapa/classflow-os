import { Context } from 'hono'
import type { Env } from '../env'

/**
 * 로깅 미들웨어
 * Workers Logs에 자동 저장 (Query Builder 사용 가능)
 */
export function logger() {
  return async (c: Context<{ Bindings: Env }>, next: () => Promise<void>) => {
    const start = Date.now()
    const { method, url } = c.req

    try {
      await next()

      const duration = Date.now() - start
      const status = c.res.status

      // Structured logging (Workers Logs Query Builder 호환)
      console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        method,
        url,
        status,
        duration: `${duration}ms`,
        severity: status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'INFO'
      }))
    } catch (error: any) {
      const duration = Date.now() - start

      // Error logging
      console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        method,
        url,
        status: 500,
        duration: `${duration}ms`,
        severity: 'ERROR',
        error: error.message,
        stack: error.stack
      }))

      throw error
    }
  }
}
