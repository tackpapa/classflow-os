/**
 * Tail Worker for Cloudflare Pages Observability
 *
 * This worker captures logs from your Pages deployment and:
 * - Persists logs to Cloudflare Workers Logs (permanent storage)
 * - Forwards to external observability platforms (optional)
 * - Provides error tracking and alerting
 *
 * Deploy: wrangler deploy -c workers/tail-logger/wrangler.toml
 * Attach: wrangler tail <YOUR_PAGES_WORKER_NAME> --format pretty
 */

interface TailEvent {
  events: TailItem[]
  outcome: string
  exceptions: any[]
  logs: any[]
  scriptName: string
}

interface TailItem {
  timestamp?: number
  event?: {
    request?: {
      url: string
      method: string
      headers: Record<string, string>
    }
    response?: {
      status: number
    }
  }
  logs?: Array<{
    level: string
    message: any[]
    timestamp: number
  }>
  exceptions?: Array<{
    name: string
    message: string
    stack?: string
    timestamp: number
  }>
}

export default {
  async tail(events: TailEvent[], env: any, ctx: any) {
    for (const event of events) {
      // Extract structured data from each event
      for (const item of event.events) {
        const logData = {
          timestamp: item.timestamp || Date.now(),
          outcome: event.outcome,
          scriptName: event.scriptName,

          // Request/Response info
          request: item.event?.request ? {
            url: item.event.request.url,
            method: item.event.request.method,
          } : undefined,
          response: item.event?.response ? {
            status: item.event.response.status,
          } : undefined,

          // Console logs
          logs: item.logs?.map(log => ({
            level: log.level,
            message: log.message,
            timestamp: log.timestamp,
          })),

          // Exceptions (CRITICAL for debugging)
          exceptions: item.exceptions?.map(ex => ({
            name: ex.name,
            message: ex.message,
            stack: ex.stack,
            timestamp: ex.timestamp,
          })),
        }

        // 1. Log to Workers Logs (persistent storage, free up to 10M lines/month)
        console.log(JSON.stringify({
          source: 'tail-worker',
          severity: event.outcome === 'exception' ? 'ERROR' : 'INFO',
          ...logData,
        }))

        // 2. Forward errors to external service (optional - uncomment when needed)
        if (event.outcome === 'exception' || (item.event?.response?.status ?? 0) >= 500) {
          // Option A: Axiom (recommended - $25/month 100GB)
          // await forwardToAxiom(logData, env.AXIOM_API_KEY, env.AXIOM_DATASET)

          // Option B: Baselime (recommended - $20/month)
          // await forwardToBaselime(logData, env.BASELIME_API_KEY)

          // Option C: Sentry (if you prefer)
          // await forwardToSentry(logData, env.SENTRY_DSN)
        }
      }
    }
  },
}

// Example: Forward to Axiom
async function forwardToAxiom(logData: any, apiKey: string, dataset: string) {
  if (!apiKey || !dataset) return

  await fetch(`https://api.axiom.co/v1/datasets/${dataset}/ingest`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([{
      _time: new Date(logData.timestamp).toISOString(),
      ...logData,
    }]),
  })
}

// Example: Forward to Baselime
async function forwardToBaselime(logData: any, apiKey: string) {
  if (!apiKey) return

  await fetch('https://events.baselime.io/v1/logs', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      service: 'goldpen-pages',
      timestamp: logData.timestamp,
      level: logData.outcome === 'exception' ? 'error' : 'info',
      message: JSON.stringify(logData),
      ...logData,
    }),
  })
}
