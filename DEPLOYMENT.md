# Cloudflare Pages Deployment Guide

## Current Architecture: Hybrid Pages + Tail Worker

✅ **Best of both worlds**: Pages convenience + Workers observability

### Why This Approach?

- ✅ Pages handles SSG/ISR/API routes automatically
- ✅ Tail Worker captures all logs permanently (free up to 10M lines/month)
- ✅ No rewrite needed - deploy immediately
- ✅ Production-ready error tracking

---

## 1. Deploy to Cloudflare Pages

### One-Time Setup

```bash
# Login to Cloudflare
pnpm wrangler login

# Create Pages project (first time only)
pnpm wrangler pages project create goldpen
```

### Deploy

```bash
# Build and deploy
pnpm run pages:build
pnpm run deploy

# Or in one command:
pnpm run pages:build && pnpm wrangler pages deploy
```

### Set Environment Variables

Go to Cloudflare Dashboard > Pages > goldpen > Settings > Environment Variables

**Production Variables**:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
NEXT_PUBLIC_APP_URL=https://goldpen.pages.dev
NEXT_PUBLIC_OPENWEATHER_API_KEY=your-api-key
```

---

## 2. Deploy Tail Worker (Observability)

### Deploy the Tail Worker

```bash
cd /Users/kiyoungtack/Desktop/goldpen
pnpm wrangler deploy -c workers/tail-logger/wrangler.toml
```

### Attach to Pages Deployment

```bash
# Get your deployment ID
pnpm wrangler pages deployment list --project-name goldpen

# Attach tail worker (replace <DEPLOYMENT_ID>)
pnpm wrangler pages deployment tail <DEPLOYMENT_ID> --project-name goldpen goldpen-tail-logger
```

### View Logs in Real-Time

```bash
# Method 1: Stream logs to terminal
pnpm wrangler tail goldpen-tail-logger --format pretty

# Method 2: View in Dashboard
# Go to Workers & Pages > goldpen-tail-logger > Logs
```

---

## 3. Query Logs (Workers Logs)

### Free Tier Limits
- 10M log lines/month (free)
- Additional: $0.60 per 1M lines
- Retention: 7 days (Query Builder Beta), 3 days (standard)

### Using Query Builder (Beta)

Go to Cloudflare Dashboard > Workers & Pages > goldpen-tail-logger > Logs > Query Builder

**Example Queries**:

```sql
-- All errors in last 24 hours
SELECT * FROM logs
WHERE severity = 'ERROR'
AND timestamp > now() - INTERVAL '24 HOURS'

-- 500 errors grouped by endpoint
SELECT
  json_extract(request, '$.url') as url,
  COUNT(*) as error_count
FROM logs
WHERE response.status >= 500
GROUP BY url
ORDER BY error_count DESC

-- Exceptions with stack traces
SELECT
  timestamp,
  json_extract(exceptions, '$[0].message') as error_message,
  json_extract(exceptions, '$[0].stack') as stack_trace
FROM logs
WHERE outcome = 'exception'
ORDER BY timestamp DESC
LIMIT 100
```

---

## 4. Optional: Forward to External Service

### Option A: Axiom ($25/month - 100GB)

**Why**: SQL-like queries, 30-day retention, best for engineers

```bash
# 1. Sign up at https://axiom.co
# 2. Create dataset "goldpen-logs"
# 3. Get API key
# 4. Set secret
pnpm wrangler secret put AXIOM_API_KEY -c workers/tail-logger/wrangler.toml

# 5. Edit workers/tail-logger/index.ts
# Uncomment line 80-81 (forwardToAxiom)

# 6. Redeploy
pnpm wrangler deploy -c workers/tail-logger/wrangler.toml
```

### Option B: Baselime ($20/month)

**Why**: Auto-generated dashboards, AI-powered insights

```bash
# 1. Sign up at https://baselime.io
# 2. Get API key
# 3. Set secret
pnpm wrangler secret put BASELIME_API_KEY -c workers/tail-logger/wrangler.toml

# 4. Edit workers/tail-logger/index.ts
# Uncomment line 84-85 (forwardToBaselime)

# 5. Redeploy
pnpm wrangler deploy -c workers/tail-logger/wrangler.toml
```

---

## 5. Production Monitoring Checklist

### ✅ Before Launch

- [ ] Deploy Pages: `pnpm run deploy`
- [ ] Set environment variables in Dashboard
- [ ] Deploy Tail Worker: `pnpm wrangler deploy -c workers/tail-logger/wrangler.toml`
- [ ] Attach Tail Worker to Pages deployment
- [ ] Test logs: `pnpm wrangler tail goldpen-tail-logger`
- [ ] Set up alerting (Axiom/Baselime)

### ✅ After Launch

- [ ] Monitor error rates in Dashboard
- [ ] Check Query Builder for slow requests
- [ ] Set up Slack/PagerDuty alerts for 500 errors
- [ ] Review logs weekly for patterns

---

## 6. Cost Estimate

| Service | Usage | Cost |
|---------|-------|------|
| Cloudflare Pages | 500GB bandwidth | $0 (within free tier) |
| Workers Logs | 10M lines/month | $0 (free tier) |
| Tail Worker | 1M invocations/month | $0 (free tier) |
| **Total** | **Typical traffic** | **$0-5/month** |

Optional add-ons:
- Axiom (100GB retention, 30 days): $25/month
- Baselime (AI insights): $20/month

---

## 7. Troubleshooting

### Issue: API routes return 500

**Check logs**:
```bash
pnpm wrangler tail goldpen-tail-logger --format pretty
```

Look for:
- Supabase auth errors
- Environment variable issues
- Stack traces

### Issue: No logs appearing

**Verify Tail Worker is attached**:
```bash
pnpm wrangler pages deployment list --project-name goldpen
```

Should show `goldpen-tail-logger` in the output.

### Issue: Logs disappear after 100 RPS

**This is normal for Pages**. Tail Worker stores logs permanently in Workers Logs.

Query them with:
```bash
# Dashboard > Workers & Pages > goldpen-tail-logger > Logs > Query Builder
```

---

## 8. Future Migration (Optional)

If you later need Durable Objects, KV, or other Workers-specific features, you can migrate API routes to a separate Worker:

1. Create `workers/api/` project
2. Use Hono framework
3. Keep frontend on Pages
4. Point `/api/*` to Workers via `_routes.json`

**Estimated time**: 2-3 weeks
**When to do it**: Only if you need Workers-specific features

For now, **Pages + Tail Worker is the optimal solution**. ✅

---

## Quick Commands

```bash
# Deploy everything
pnpm run pages:build && pnpm run deploy
pnpm wrangler deploy -c workers/tail-logger/wrangler.toml

# View logs
pnpm wrangler tail goldpen-tail-logger --format pretty

# Local development (uses Node.js runtime, not Edge)
pnpm dev

# Local preview (uses Workers runtime)
pnpm preview
```
