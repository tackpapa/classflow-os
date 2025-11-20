# Option 2: Workers API 분리 배포 가이드

## 🎯 아키텍처

```
사용자 요청
    ↓
Cloudflare Pages (Next.js 프론트엔드)
  - https://goldpen.pages.dev
    ↓
Cloudflare Workers (Hono API - 34개 routes)
  - https://goldpen-api.YOUR_SUBDOMAIN.workers.dev
    ↓
Supabase + External Services
```

## ✅ 완료된 작업

- [x] workers/api/ 프로젝트 구조 생성
- [x] Hono 기본 앱 및 미들웨어 (CORS, Logger, Auth)
- [x] 34개 API routes 자동 변환 완료
- [x] pnpm 워크스페이스 설정
- [x] 빌드/배포 스크립트 추가
- [x] 로컬 테스트 성공 (http://localhost:8787)

## 📦 프로젝트 구조

```
/Users/kiyoungtack/Desktop/goldpen/
├── app/                         # Next.js 프론트엔드 (Pages)
├── workers/
│   └── api/                     # Hono Workers API
│       ├── src/
│       │   ├── index.ts         # 메인 앱 (34 routes 등록됨)
│       │   ├── env.ts           # 환경변수 타입
│       │   ├── lib/
│       │   │   └── supabase.ts  # Supabase client
│       │   ├── middleware/
│       │   │   ├── cors.ts      # CORS 설정
│       │   │   ├── auth.ts      # 인증
│       │   │   └── logger.ts    # 로깅 (Workers Logs)
│       │   └── routes/          # 34개 API routes
│       ├── .dev.vars            # 로컬 환경변수 (gitignore)
│       ├── package.json
│       ├── tsconfig.json
│       └── wrangler.toml
└── pnpm-workspace.yaml          # Monorepo 설정
```

## 🚀 1. Workers API 배포

### 환경변수 설정

```bash
cd /Users/kiyoungtack/Desktop/goldpen/workers/api

# Production 환경변수 설정
pnpm wrangler secret put NEXT_PUBLIC_SUPABASE_URL
# 입력: https://your-project.supabase.co

pnpm wrangler secret put NEXT_PUBLIC_SUPABASE_ANON_KEY
# 입력: your-production-anon-key

pnpm wrangler secret put NEXT_PUBLIC_APP_URL
# 입력: https://goldpen.pages.dev
```

### 배포 실행

```bash
# Workers API 배포
cd /Users/kiyoungtack/Desktop/goldpen
pnpm api:deploy

# 또는 직접
cd workers/api
pnpm deploy
```

배포 후 Workers URL 확인:
```
https://goldpen-api.YOUR_SUBDOMAIN.workers.dev
```

### 배포 확인

```bash
# Health check
curl https://goldpen-api.YOUR_SUBDOMAIN.workers.dev/health

# API 테스트
curl https://goldpen-api.YOUR_SUBDOMAIN.workers.dev/api/students
```

## 🌐 2. Pages 프론트엔드 배포

### API URL 업데이트

프론트엔드에서 API 호출 시 Workers URL 사용:

```typescript
// Before (기존 코드)
const response = await fetch('/api/students')

// After (Workers API 사용)
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://goldpen-api.YOUR_SUBDOMAIN.workers.dev'
const response = await fetch(`${API_BASE}/api/students`)
```

### 환경변수 설정

Cloudflare Dashboard > Pages > goldpen > Settings > Environment Variables

**Production:**
```
NEXT_PUBLIC_API_URL=https://goldpen-api.YOUR_SUBDOMAIN.workers.dev
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
NEXT_PUBLIC_APP_URL=https://goldpen.pages.dev
```

### Pages 배포

```bash
cd /Users/kiyoungtack/Desktop/goldpen
pnpm run pages:build
pnpm run deploy
```

## 📊 3. 로그 모니터링

### Workers Logs 확인

```bash
# 실시간 로그 스트리밍
pnpm api:tail

# 또는
cd workers/api
pnpm tail
```

### Dashboard에서 확인

1. Cloudflare Dashboard 접속
2. Workers & Pages > goldpen-api > Logs
3. Query Builder 사용 (Beta)

**예시 쿼리:**

```sql
-- 모든 에러 (최근 24시간)
SELECT * FROM logs
WHERE severity = 'ERROR'
AND timestamp > now() - INTERVAL '24 HOURS'
ORDER BY timestamp DESC

-- API별 요청 수
SELECT
  json_extract(request, '$.url') as api,
  COUNT(*) as requests,
  AVG(duration) as avg_duration
FROM logs
GROUP BY api
ORDER BY requests DESC
```

## 🧪 4. 로컬 개발

### 동시 실행 (프론트엔드 + API)

**터미널 1: Next.js 프론트엔드**
```bash
cd /Users/kiyoungtack/Desktop/goldpen
pnpm dev
# http://localhost:8000
```

**터미널 2: Workers API**
```bash
cd /Users/kiyoungtack/Desktop/goldpen
pnpm api:dev
# http://localhost:8787
```

### 로컬 환경변수

`workers/api/.dev.vars` (이미 생성됨):
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
NEXT_PUBLIC_APP_URL=http://localhost:8787
```

### API 테스트

```bash
# Health check
curl http://localhost:8787/health

# Students API
curl http://localhost:8787/api/students

# Auth login (POST)
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## ⚙️ 5. 유용한 스크립트

```json
// package.json에 이미 추가됨
{
  "scripts": {
    "api:dev": "pnpm --filter @goldpen/workers-api dev",
    "api:deploy": "pnpm --filter @goldpen/workers-api deploy",
    "api:tail": "pnpm --filter @goldpen/workers-api tail",
    "deploy:all": "pnpm api:deploy && pnpm deploy"
  }
}
```

### 전체 배포 (API + Pages)

```bash
cd /Users/kiyoungtack/Desktop/goldpen
pnpm deploy:all
```

## 🔧 6. 트러블슈팅

### API가 404 반환

**원인**: Workers가 배포되지 않았거나 URL이 잘못됨

**해결**:
```bash
cd /Users/kiyoungtack/Desktop/goldpen/workers/api
pnpm wrangler whoami  # 로그인 확인
pnpm deploy           # 재배포
```

### CORS 에러

**원인**: 프론트엔드 도메인이 CORS 허용 목록에 없음

**해결**: `workers/api/src/middleware/cors.ts` 수정
```typescript
const allowedOrigins = [
  'http://localhost:8000',
  'https://goldpen.pages.dev',
  'https://YOUR_CUSTOM_DOMAIN',  // 추가
  c.env.NEXT_PUBLIC_APP_URL
]
```

### Supabase 연결 실패

**원인**: 환경변수 미설정

**해결**:
```bash
cd workers/api
pnpm wrangler secret list  # 확인
pnpm wrangler secret put NEXT_PUBLIC_SUPABASE_URL  # 재설정
```

### 로그가 안 보임

**원인**: Workers Logs는 배포된 환경에서만 동작

**해결**: 로컬에서는 `wrangler dev` 출력 확인, Production에서는 Dashboard 사용

## 📈 7. 성능 최적화

### 1. API 응답 캐싱

`workers/api/src/middleware/cache.ts` 추가 (선택사항):
```typescript
export function cache(ttl: number) {
  return async (c: Context, next: () => Promise<void>) => {
    const cacheKey = c.req.url
    const cached = await caches.default.match(cacheKey)

    if (cached) return cached

    await next()

    if (c.res.status === 200) {
      const response = c.res.clone()
      response.headers.set('Cache-Control', `public, max-age=${ttl}`)
      await caches.default.put(cacheKey, response)
    }
  }
}
```

### 2. Supabase Connection Pooling

이미 `lib/supabase.ts`에서 최적화됨:
```typescript
auth: {
  persistSession: false,  // Workers에서 세션 미저장
  autoRefreshToken: false,
  detectSessionInUrl: false
}
```

## 💰 8. 비용 분석

| 항목 | 사용량 | 비용 |
|------|--------|------|
| **Pages (프론트엔드)** | 500GB bandwidth | $0 |
| **Workers (API)** | 100k requests/day | $0 (10M req/month free) |
| **Workers Logs** | 10M lines/month | $0 (free tier) |
| **초과 시** | 추가 1M requests | $0.15 |
| **총계** | **일반적 사용** | **$0-5/month** |

## 🎓 9. 다음 단계

### 실제 API 로직 구현

현재 34개 routes는 기본 골격만 있습니다. 실제 구현:

```typescript
// workers/api/src/routes/students.ts
app.get('/', async (c) => {
  try {
    const supabase = await createAuthenticatedClient(c.req.raw, c.env)

    // 실제 Supabase 쿼리
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return c.json({ data })
  } catch (error: any) {
    console.error('[students] GET error:', error)
    return c.json({ error: error.message }, 500)
  }
})
```

### Workers 고급 기능 활용

- **KV**: 세션 저장, 캐싱
- **Durable Objects**: 실시간 기능 (채팅, 알림)
- **R2**: 파일 업로드/저장
- **D1**: SQLite 데이터베이스

### 테스트 추가

```bash
cd workers/api
pnpm add -D vitest @cloudflare/vitest-pool-workers

# src/__tests__/students.test.ts 작성
# pnpm test
```

## 📚 10. 참고 자료

- [Hono Documentation](https://hono.dev)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Workers Logs](https://developers.cloudflare.com/workers/observability/logs/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

## ✅ 배포 체크리스트

- [ ] Workers API 환경변수 설정 (`wrangler secret put`)
- [ ] Workers API 배포 (`pnpm api:deploy`)
- [ ] Workers URL 확인 및 테스트
- [ ] Pages 환경변수 업데이트 (NEXT_PUBLIC_API_URL 추가)
- [ ] 프론트엔드 코드에서 API_BASE URL 수정
- [ ] Pages 재배포 (`pnpm deploy`)
- [ ] 전체 기능 테스트 (로그인, CRUD 등)
- [ ] Workers Logs 확인
- [ ] 에러 모니터링 설정

---

**작성일**: 2025-11-20
**Option 2 구현 완료** ✅
**34개 API routes → Hono Workers 변환 완료**
