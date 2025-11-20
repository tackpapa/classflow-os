# GoldPen → Cloudflare Workers 이전 계획서

**작성일**: 2025-11-20 (KNOWHOW.md 검증 완료 ✅)
**현재 진행률**: 70% (백엔드 100% 완료, Edge 호환 30%)
**예상 작업 기간**: 4-5일 (32-40시간)
**⚠️ KNOWHOW.md 검증 결과**: OpenNext Worker Patch, 환경변수 빌드타임 주입 등 추가 작업 필수

---

## 📊 Executive Summary

### 현재 상태
- ✅ **백엔드 API**: 100% 완료 (34개 엔드포인트)
- ✅ **프론트엔드**: 90% 완료 (23페이지 + 27개 컴포넌트)
- ✅ **데이터베이스**: 100% 완료 (Supabase + 17개 마이그레이션)
- ⚠️ **Cloudflare 호환성**: 30% (Edge 호환 + OpenNext 패치 필요)

### 핵심 문제
현재 백엔드는 **Next.js API Routes + Supabase SSR**로 구현되어 있으나, Cloudflare Workers (Edge Runtime)와 호환되지 않는 부분이 있습니다:

1. ❌ `next/headers`의 `cookies()` 사용 → Edge Runtime 미지원
2. ❌ 환경 변수 하드코딩 → 빌드 시점 인라인 문제
3. ❌ `export const runtime = 'edge'` 미선언
4. ❌ **OpenNext Full Route Cache 우회 패치 미적용** (KNOWHOW.md 섹션 1)
5. ❌ **환경변수 빌드타임 주입 스크립트 없음** (KNOWHOW.md 섹션 5)

### KNOWHOW.md 검증 결과

| 섹션 | 제목 | 적용 여부 | 이유 |
|------|------|----------|------|
| **1** | Next.js Full Route Cache 우회 | ✅ **필수** | OpenNext는 API도 캐시함! Supabase 사용 여부 무관 |
| **2** | Worker 1101 에러 (DB Lazy Init) | ❌ 불필요 | Supabase가 연결 풀 관리 |
| **3** | Prisma + Hyperdrive 최적화 | ❌ 불필요 | Prisma 미사용 |
| **4** | Admin 4-Layer Cache 디버깅 | ⚠️ 참고 | Cache 문제 발생 시 참고 |
| **5** | 환경변수 빌드타임 인라인 | ✅ **필수** | `process.env` 하드코딩 방지 |
| **6** | 배포 전 체크리스트 | ✅ **필수** | 빌드 전 검증 항목 |
| **8** | Landing 빌드 캐시 문제 | ✅ **필수** | `.next` 캐시 제거 필수 |
| **9** | 환경변수 우선순위 | ✅ **필수** | `.env.local` 금지, 환경별 분리 |
| **10** | rewrites 제거 (Runtime-only) | ✅ **이미 적용** | `next.config.js`에 rewrites 없음 |

**결론**: 섹션 1, 5, 6, 8, 9를 반드시 적용해야 함!

---

## 🎯 이전 목표

### 1차 목표 (필수)
- [x] 백엔드 API 34개 완전 구현
- [ ] **OpenNext Worker.js 패치 스크립트 작성** (KNOWHOW.md 섹션 1)
- [ ] **환경변수 빌드타임 주입 스크립트 작성** (KNOWHOW.md 섹션 5)
- [ ] Supabase Client Edge Runtime 호환
- [ ] 모든 API Route에 Edge Runtime 선언
- [ ] Cloudflare Pages 배포 성공

### 2차 목표 (최적화)
- [ ] API 응답 속도 < 200ms
- [ ] Cloudflare Analytics 연동
- [ ] Rate Limiting 적용
- [ ] Sentry 에러 모니터링

---

## 📋 현재 백엔드 아키텍처

### API 구현 현황 (34개 엔드포인트)

| 카테고리 | 엔드포인트 | 구현 상태 | Edge 호환 |
|---------|-----------|----------|----------|
| **인증** | `/api/auth/*` (4개) | ✅ 완료 | ⚠️ 수정 필요 |
| **학생** | `/api/students/*` (2개) | ✅ 완료 | ⚠️ 수정 필요 |
| **반/클래스** | `/api/classes/*` (2개) | ✅ 완료 | ⚠️ 수정 필요 |
| **출결** | `/api/attendance/*` (2개) | ✅ 완료 | ⚠️ 수정 필요 |
| **상담** | `/api/consultations/*` (2개) | ✅ 완료 | ⚠️ 수정 필요 |
| **강사** | `/api/teachers/*` (2개) | ✅ 완료 | ⚠️ 수정 필요 |
| **수업** | `/api/lessons/*` (2개) | ✅ 완료 | ⚠️ 수정 필요 |
| **시험** | `/api/exams/*` (2개) | ✅ 완료 | ⚠️ 수정 필요 |
| **과제** | `/api/homework/*` (2개) | ✅ 완료 | ⚠️ 수정 필요 |
| **일정** | `/api/schedules/*` (2개) | ✅ 완료 | ⚠️ 수정 필요 |
| **강의실** | `/api/rooms/*` (2개) | ✅ 완료 | ⚠️ 수정 필요 |
| **좌석** | `/api/seats/*` (2개) | ✅ 완료 | ⚠️ 수정 필요 |
| **지출** | `/api/expenses/*` (2개) | ✅ 완료 | ⚠️ 수정 필요 |
| **정산** | `/api/billing` (1개) | ✅ 완료 | ⚠️ 수정 필요 |
| **설정** | `/api/settings` (1개) | ✅ 완료 | ⚠️ 수정 필요 |
| **기타** | `/api/migrate`, `/api/test-env`, `/api/overview` (3개) | ✅ 완료 | ⚠️ 수정 필요 |

### 기술 스택

**Backend**:
```yaml
Framework: Next.js 14.2 API Routes
Auth: Supabase Auth (Cookie-based Session)
Database: Supabase PostgreSQL
Validation: Zod
Error Handling: 표준화된 에러 응답
```

**Current Dependencies**:
```json
{
  "@supabase/ssr": "^0.5.0",
  "@supabase/supabase-js": "^2.45.0",
  "hono": "^4.6.0",
  "zod": "^3.25.76"
}
```

---

## 🚨 Edge Runtime 호환성 문제 분석

### 문제 1: `next/headers` 의존성

**현재 코드** (`lib/supabase/server.ts:9`):
```typescript
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()  // ❌ Edge Runtime 미지원

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value  // Node.js 전용
      }
    }
  })
}
```

**에러**:
```
Error: cookies() is not available in Edge Runtime
  at createClient (lib/supabase/server.ts:9)
```

**영향 범위**: 34개 API Route 전체

---

### 문제 2: 환경 변수 하드코딩

**현재 코드** (`lib/supabase/server.ts:20-28`):
```typescript
if (!supabaseUrl || supabaseUrl === 'your-supabase-url') {
  // ❌ 하드코딩된 로컬 URL
  supabaseUrl = 'http://127.0.0.1:54321'
}

if (!supabaseKey || supabaseKey === 'your-supabase-anon-key') {
  // ❌ 하드코딩된 JWT 키
  supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}
```

**문제**:
- KNOWHOW.md 섹션 5, 9의 "환경변수 빌드 시점 인라인" 문제와 동일
- Cloudflare Pages 빌드 시 로컬 URL이 코드에 하드코딩됨
- Production 배포 시 `http://127.0.0.1:54321` 접속 시도 → 500 에러

---

### 문제 3: Edge Runtime 미선언

**현재 상태**: 34개 API Route 모두 `runtime` 미선언 → Node.js Runtime 사용

**필요한 수정**:
```typescript
// ✅ 모든 API Route 상단에 추가 필요
export const runtime = 'edge'
```

---

### 문제 4: OpenNext Full Route Cache (새로 발견!)

**KNOWHOW.md 섹션 1 요약**:
- OpenNext는 **API Route도 Full Route Cache 적용**
- `/api/students` 호출 → 첫 요청 결과가 캐시됨 → 이후 같은 응답 반환
- **Prisma 사용 여부 무관** (Supabase도 동일한 문제 발생)

**예상 증상**:
```bash
# 학생 추가
curl -X POST /api/students -d '{"name":"김철수"}'
# ✅ {"id":1,"name":"김철수"}

# 학생 목록 조회
curl /api/students
# ✅ [{"id":1,"name":"김철수"}]

# 학생 추가 (한 명 더)
curl -X POST /api/students -d '{"name":"이영희"}'
# ✅ {"id":2,"name":"이영희"}

# 학생 목록 조회 (다시)
curl /api/students
# ❌ [{"id":1,"name":"김철수"}]  ← 캐시된 이전 응답!
```

**해결책**: KNOWHOW.md 섹션 1의 OpenNext Worker Patch 적용 필요

---

### 문제 5: 환경변수 빌드타임 인라인

**KNOWHOW.md 섹션 5 요약**:
- Next.js는 빌드 시점에 `process.env.*`를 코드에 하드코딩
- `.env` 파일이 없으면 `undefined`가 코드에 박힘

**예시**:
```typescript
// 소스 코드
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

// Next.js 빌드 후 (.env 없으면)
const SUPABASE_URL = undefined  // ← 하드코딩됨!
```

**해결책**: KNOWHOW.md 섹션 5의 빌드타임 환경변수 주입 스크립트 필요

---

## 🔧 해결 방안

### Phase 0: OpenNext Worker Patch Script 작성 (새로 추가!) ⭐

**목표**: KNOWHOW.md 섹션 1의 API Cache 우회 패치 적용

#### 스크립트 작성: `scripts/patch-open-next-worker.mjs`

```javascript
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

/**
 * OpenNext Worker.js 패치 스크립트
 *
 * 목적: Next.js Full Route Cache를 API 요청에서 우회
 * 참고: KNOWHOW.md 섹션 1
 */

const workerPath = join(process.cwd(), '.open-next/worker.js')

try {
  let content = readFileSync(workerPath, 'utf-8')

  // 1. API Cache Bypass 패치 (섹션 1)
  const apiCacheBypassCode = `
// 🔥 PATCH: API Cache Bypass (KNOWHOW.md Section 1)
const isApiRequest = pathname.startsWith('/api/') || pathname.startsWith('/api');

if (isApiRequest) {
  console.log('[OpenNext Patch] 🔥 API request detected, bypassing all cache layers');

  const { handler } = await import("./server-functions/default/handler.mjs");
  const res = await handler(reqOrResp, env, ctx, request.signal);

  // 캐시 방지 헤더 추가
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.headers.set('x-worker-cache', 'bypass');
  res.headers.set('x-worker-timestamp', Date.now().toString());

  return res;
}
`

  // 2. 삽입 위치 찾기: "const pathname = url.pathname" 다음 줄
  const insertMarker = 'const pathname = url.pathname'
  const insertPosition = content.indexOf(insertMarker)

  if (insertPosition === -1) {
    console.error('❌ [Patch] Could not find insertion point in worker.js')
    process.exit(1)
  }

  // 다음 줄로 이동
  const nextLinePosition = content.indexOf('\n', insertPosition) + 1

  // 패치 코드 삽입
  content =
    content.slice(0, nextLinePosition) +
    apiCacheBypassCode +
    content.slice(nextLinePosition)

  // 파일 저장
  writeFileSync(workerPath, content, 'utf-8')

  console.log('✅ [Patch] OpenNext worker.js patched successfully')
  console.log('   - API Cache Bypass: Enabled')
  console.log('   - Cache-Control headers: Added')
  console.log('')
} catch (error) {
  console.error('❌ [Patch] Failed to patch worker.js:', error.message)
  process.exit(1)
}
```

#### 환경변수 주입 추가 (섹션 5)

`scripts/patch-open-next-worker.mjs`에 추가:

```javascript
// 3. 환경변수 빌드타임 주입 (섹션 5)
const envVars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
}

// Worker 코드 시작 부분에 주입
const envInjection = `
// 🔥 INJECTED AT BUILD TIME (KNOWHOW.md Section 5)
const INJECTED_ENV = ${JSON.stringify(envVars, null, 2)};

if (typeof globalThis !== 'undefined') {
  if (!globalThis.process) globalThis.process = { env: {} };
  if (!globalThis.process.env) globalThis.process.env = {};

  Object.keys(INJECTED_ENV).forEach(key => {
    globalThis.process.env[key] = INJECTED_ENV[key];
  });

  console.log('[OpenNext Patch] ✅ Environment variables injected:', Object.keys(INJECTED_ENV));
}
`

// 파일 시작 부분에 주입
content = envInjection + content

writeFileSync(workerPath, content, 'utf-8')
console.log('✅ [Patch] Environment variables injected')
```

---

### Phase 1: Supabase Client Edge 호환 (필수)

**목표**: `cookies()` 의존성 제거 → Request 기반 쿠키 처리

#### 방법: Request 기반 Edge Client

**새 파일 생성**: `lib/supabase/client-edge.ts`

```typescript
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Edge Runtime 호환 Supabase 클라이언트
 *
 * - cookies() 사용 안 함 (Edge Runtime 미지원)
 * - Bearer Token 방식 인증 사용
 * - 환경변수 Runtime 주입 지원 (wrangler.jsonc vars)
 */
export function createClient() {
  // 환경변수 Fallback (빌드타임 주입 + Runtime 주입)
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL

  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY

  // 환경변수 검증 (하드코딩 제거)
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      '[Supabase Edge] NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set'
    )
  }

  // 잘못된 placeholder 값 체크
  if (
    supabaseUrl.includes('your-') ||
    supabaseUrl === 'http://127.0.0.1:54321' ||
    supabaseKey.includes('your-')
  ) {
    throw new Error(
      '[Supabase Edge] Invalid environment variables detected. Please set proper values in .env files.'
    )
  }

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,  // Edge에서는 세션 미저장
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  })
}

/**
 * Request에서 인증 토큰 추출
 */
export function getAuthToken(request: Request): string | null {
  // Authorization 헤더 확인
  const authHeader = request.headers.get('Authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Cookie에서 세션 토큰 추출 (Supabase SSR 호환)
  const cookieHeader = request.headers.get('Cookie')
  if (cookieHeader) {
    const cookies = parseCookies(cookieHeader)
    // Supabase 세션 쿠키명 (예: sb-<project-ref>-auth-token)
    const sessionToken = cookies['sb-access-token'] || cookies['sb-auth-token']
    return sessionToken || null
  }

  return null
}

/**
 * Cookie 헤더 파싱 유틸리티
 */
function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {}

  cookieHeader.split(';').forEach(cookie => {
    const [name, ...rest] = cookie.trim().split('=')
    if (name) {
      cookies[name] = rest.join('=')
    }
  })

  return cookies
}

/**
 * 인증된 Supabase 클라이언트 생성
 */
export async function createAuthenticatedClient(request: Request) {
  const supabase = createClient()
  const token = getAuthToken(request)

  if (token) {
    // 세션 설정
    const { error } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: ''
    })

    if (error) {
      throw new Error(`[Supabase Edge] Auth error: ${error.message}`)
    }
  }

  return supabase
}
```

**API Route 사용 예시**:
```typescript
// app/api/students/route.ts
import { createAuthenticatedClient } from '@/lib/supabase/client-edge'

export const runtime = 'edge'  // ✅ Edge Runtime 선언

export async function GET(request: Request) {
  try {
    // Edge 호환 Supabase 클라이언트 생성 (인증 포함)
    const supabase = await createAuthenticatedClient(request)

    // 인증 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return Response.json(
        { error: '인증이 필요합니다' },
        { status: 401 }
      )
    }

    // 기존 로직 그대로
    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return Response.json(
        { error: '학생 목록 조회 실패', details: error.message },
        { status: 500 }
      )
    }

    return Response.json({
      students,
      count: students?.length || 0
    })
  } catch (error: any) {
    return Response.json(
      { error: '서버 오류', details: error.message },
      { status: 500 }
    )
  }
}
```

---

### Phase 2: 환경 변수 정리 (필수)

#### 2.1 환경 파일 분리 (KNOWHOW.md 섹션 9)

**생성할 파일**:
```
.env.development   # 로컬 개발 (Supabase Local)
.env.staging       # Staging 배포
.env.production    # Production 배포
```

**`.env.development`**:
```bash
# Local Supabase (Docker)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzYzNTMyNTk1LCJleHAiOjIwNzg4OTI1OTV9.SIBJC5Z-rlGxcsZXDScorXHN8iF8utn4Ie4x2q6_iXA
```

**`.env.staging`**:
```bash
# Staging Supabase
NEXT_PUBLIC_SUPABASE_URL=https://staging-goldpen.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<staging-anon-key>
```

**`.env.production`**:
```bash
# Production Supabase
NEXT_PUBLIC_SUPABASE_URL=https://goldpen.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<production-anon-key>
```

#### 2.2 `.env.local` 삭제 (KNOWHOW.md 섹션 9 필수!)

**⚠️ 중요**: `.env.local`은 모든 환경에서 최우선 적용되어 문제 발생

```bash
# .env.local 삭제 또는 이름 변경
rm .env.local
# 또는
mv .env.local .env.development
```

#### 2.3 `.gitignore` 업데이트

```gitignore
# 환경 파일 (실제 값 포함)
.env.local
.env.*.local
.env.development
.env.staging
.env.production
```

#### 2.4 `.env.example` 업데이트

```bash
# Supabase (필수)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# ⚠️ 주의: 실제 값은 .env.development, .env.staging, .env.production에 설정
```

---

### Phase 3: API Route Edge Runtime 선언 (필수)

**목표**: 34개 API Route에 `export const runtime = 'edge'` 추가

#### 수정 패턴

**Before**:
```typescript
// app/api/students/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = createClient()
  // ...
}
```

**After**:
```typescript
// app/api/students/route.ts
import { createAuthenticatedClient } from '@/lib/supabase/client-edge'

export const runtime = 'edge'  // ✅ 추가
export const dynamic = 'force-dynamic'  // ✅ 캐시 방지 (추가)
export const revalidate = 0  // ✅ 재검증 비활성화 (추가)

export async function GET(request: Request) {  // NextRequest → Request
  const supabase = await createAuthenticatedClient(request)

  // 기존 로직 그대로
  const { data, error } = await supabase.from('students').select('*')

  return Response.json({ data })  // NextResponse → Response
}
```

#### 일괄 수정 스크립트

**`scripts/add-edge-runtime.sh`**:
```bash
#!/bin/bash

# 34개 API Route에 Edge Runtime 선언 추가

API_ROUTES=$(find app/api -name "route.ts")

for file in $API_ROUTES; do
  # 이미 runtime 선언이 있는지 체크
  if ! grep -q "export const runtime" "$file"; then
    # import 문 바로 다음에 runtime 선언 추가
    sed -i '' '/^import.*from/a\
\
export const runtime = '\''edge'\''\
export const dynamic = '\''force-dynamic'\''\
export const revalidate = 0
' "$file"

    echo "✅ $file: Edge Runtime 추가됨"
  else
    echo "⏭️  $file: 이미 선언됨"
  fi
done

echo "완료: 모든 API Route에 Edge Runtime 선언 추가"
```

**실행**:
```bash
chmod +x scripts/add-edge-runtime.sh
./scripts/add-edge-runtime.sh
```

---

### Phase 4: OpenNext 빌드 & Cloudflare Pages 배포

#### 4.1 빌드 스크립트 설정 (KNOWHOW.md 섹션 6, 8 적용)

**`package.json` 수정**:
```json
{
  "scripts": {
    "dev": "next dev -p 8000",
    "build": "next build",

    "pages:clean": "rm -rf .next .vercel",

    "pages:build:staging": "cp -f .env.staging .env.production && next build && npx @cloudflare/next-on-pages && node scripts/patch-open-next-worker.mjs",

    "pages:build:prod": "next build && npx @cloudflare/next-on-pages && node scripts/patch-open-next-worker.mjs",

    "pages:preview": "npm run pages:build:staging && wrangler pages dev",

    "pages:deploy:staging": "npm run pages:clean && npm run pages:build:staging && wrangler pages deploy .vercel/output/static --project-name goldpen-staging",

    "pages:deploy:prod": "npm run pages:clean && npm run pages:build:prod && wrangler pages deploy .vercel/output/static --project-name goldpen --branch production"
  }
}
```

**핵심 변경사항**:
1. ✅ `pages:clean`: 빌드 캐시 완전 제거 (KNOWHOW.md 섹션 8)
2. ✅ `cp -f .env.staging .env.production`: 환경별 빌드 (KNOWHOW.md 섹션 9)
3. ✅ `node scripts/patch-open-next-worker.mjs`: OpenNext Worker 패치 (KNOWHOW.md 섹션 1, 5)

#### 4.2 Wrangler 설정

**`wrangler.toml` 생성**:
```toml
name = "goldpen"
compatibility_flags = ["nodejs_compat"]
compatibility_date = "2025-01-20"

# Cloudflare Pages 설정
pages_build_output_dir = ".vercel/output/static"

# Staging 환경
[env.staging]
name = "goldpen-staging"
vars = {
  ENVIRONMENT = "staging",
  # Runtime 환경변수 (Fallback용)
  SUPABASE_URL = "https://staging-goldpen.supabase.co",
  SUPABASE_ANON_KEY = "<staging-anon-key>"
}

# Production 환경
[env.production]
name = "goldpen"
vars = {
  ENVIRONMENT = "production",
  # Runtime 환경변수 (Fallback용)
  SUPABASE_URL = "https://goldpen.supabase.co",
  SUPABASE_ANON_KEY = "<production-anon-key>"
}
```

#### 4.3 배포 절차 (KNOWHOW.md 섹션 6 완전 준수)

**Staging 배포**:
```bash
# 1. 빌드 캐시 제거 (필수!)
rm -rf .next .vercel

# 2. 환경변수 복사 (Staging)
cp -f .env.staging .env.production

# 3. Next.js 빌드
NODE_ENV=production pnpm build

# 4. OpenNext 변환
npx @cloudflare/next-on-pages

# 5. OpenNext Worker 패치 (KNOWHOW.md 섹션 1, 5)
node scripts/patch-open-next-worker.mjs

# 6. 패치 확인
grep -A 10 "🔥" .open-next/worker.js
# ✅ API Cache Bypass 코드 확인
# ✅ 환경변수 주입 코드 확인

# 7. Cloudflare Pages 배포
wrangler pages deploy .vercel/output/static --project-name goldpen-staging

# 또는 한 번에:
pnpm pages:deploy:staging
```

**Production 배포**:
```bash
# 1. 빌드 캐시 제거 (필수!)
rm -rf .next .vercel

# 2. Next.js 빌드 (.env.production 사용)
NODE_ENV=production pnpm build

# 3. OpenNext 변환
npx @cloudflare/next-on-pages

# 4. OpenNext Worker 패치
node scripts/patch-open-next-worker.mjs

# 5. 패치 확인
grep -A 10 "🔥" .open-next/worker.js

# 6. Cloudflare Pages 배포
wrangler pages deploy .vercel/output/static --project-name goldpen --branch production

# 또는 한 번에:
pnpm pages:deploy:prod
```

#### 4.4 배포 후 검증 (KNOWHOW.md 섹션 6)

```bash
# 1. Health Check
curl https://goldpen-staging.pages.dev/api/test-env
# ✅ {"success":true,"runtime":"edge"}

# 2. 캐시 우회 확인 (KNOWHOW.md 섹션 1)
curl -i https://goldpen-staging.pages.dev/api/students | grep -E "(x-worker|cache)"
# ✅ x-worker-cache: bypass
# ✅ x-worker-timestamp: [현재 시간]
# ✅ cache-control: no-store, no-cache, must-revalidate

# 3. API 기능 테스트
curl -X POST https://goldpen-staging.pages.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password"}'
# ✅ {"user":{...},"session":{...}}

# 4. CRUD 테스트
curl https://goldpen-staging.pages.dev/api/students
# ✅ {"students":[...],"count":N}

# 5. 환경변수 주입 확인
curl https://goldpen-staging.pages.dev/api/test-env | jq '.supabase_url'
# ✅ "https://staging-goldpen.supabase.co" (하드코딩 아님!)
```

---

## 📋 작업 체크리스트

### Phase 0: OpenNext Worker Patch (6시간) ⭐ 새로 추가!

- [ ] **패치 스크립트 작성**: `scripts/patch-open-next-worker.mjs`
  - [ ] API Cache Bypass 코드 작성 (KNOWHOW.md 섹션 1)
  - [ ] 환경변수 빌드타임 주입 코드 작성 (KNOWHOW.md 섹션 5)
  - [ ] 삽입 위치 자동 탐지 로직 구현
  - [ ] 에러 핸들링 추가

- [ ] **로컬 테스트**:
  ```bash
  # 빌드 실행
  pnpm pages:build:staging

  # 패치 확인
  grep -A 10 "🔥" .open-next/worker.js

  # 환경변수 주입 확인
  grep "INJECTED_ENV" .open-next/worker.js
  ```

- [ ] **검증**:
  - [ ] API Cache Bypass 코드가 올바른 위치에 삽입되었는가?
  - [ ] 환경변수 값이 코드에 포함되었는가?
  - [ ] 빌드 에러 없이 완료되는가?

### Phase 1: Supabase Client Edge 호환 (4시간)

- [ ] **새 파일 생성**: `lib/supabase/client-edge.ts`
  - [ ] `createClient()` 함수 구현
  - [ ] `getAuthToken()` 헬퍼 함수 작성
  - [ ] `createAuthenticatedClient()` 함수 작성
  - [ ] 환경 변수 검증 로직 추가 (하드코딩 제거)
  - [ ] Cookie 파싱 유틸리티 구현

- [ ] **기존 파일 백업**:
  ```bash
  mv lib/supabase/server.ts lib/supabase/server.ts.backup
  ```

- [ ] **로컬 테스트**:
  ```bash
  # Edge Runtime 로컬 테스트
  pnpm dev
  curl http://localhost:8000/api/test-env
  ```

### Phase 2: API Route 일괄 수정 (10시간)

- [ ] **34개 API Route 수정**:
  - [ ] `app/api/auth/*` (4개)
  - [ ] `app/api/students/*` (2개)
  - [ ] `app/api/classes/*` (2개)
  - [ ] `app/api/attendance/*` (2개)
  - [ ] `app/api/consultations/*` (2개)
  - [ ] `app/api/teachers/*` (2개)
  - [ ] `app/api/lessons/*` (2개)
  - [ ] `app/api/exams/*` (2개)
  - [ ] `app/api/homework/*` (2개)
  - [ ] `app/api/schedules/*` (2개)
  - [ ] `app/api/rooms/*` (2개)
  - [ ] `app/api/seats/*` (2개)
  - [ ] `app/api/expenses/*` (2개)
  - [ ] `app/api/billing` (1개)
  - [ ] `app/api/settings` (1개)
  - [ ] `app/api/migrate`, `test-env`, `overview` (3개)

- [ ] **수정 내용** (모든 파일):
  - [ ] `import { createAuthenticatedClient } from '@/lib/supabase/client-edge'`
  - [ ] `export const runtime = 'edge'` 추가
  - [ ] `export const dynamic = 'force-dynamic'` 추가
  - [ ] `export const revalidate = 0` 추가
  - [ ] `NextRequest` → `Request`
  - [ ] `NextResponse.json()` → `Response.json()`

### Phase 3: 환경 변수 정리 (2시간)

- [ ] **환경 파일 생성**:
  - [ ] `.env.development` (로컬 Supabase)
  - [ ] `.env.staging` (Staging Supabase)
  - [ ] `.env.production` (Production Supabase)

- [ ] **`.env.local` 삭제** (KNOWHOW.md 섹션 9 필수!):
  ```bash
  rm .env.local
  # 또는
  mv .env.local .env.development
  ```

- [ ] **`.gitignore` 업데이트**:
  ```gitignore
  .env.local
  .env.*.local
  .env.development
  .env.staging
  .env.production
  ```

- [ ] **`.env.example` 업데이트**

### Phase 4: 빌드 & 배포 (6시간)

- [ ] **로컬 빌드 테스트**:
  ```bash
  rm -rf .next .vercel
  pnpm pages:build:staging
  ```

- [ ] **빌드 에러 해결**:
  - [ ] Edge Runtime 호환성 체크
  - [ ] 환경 변수 누락 확인
  - [ ] OpenNext Worker 패치 확인
  - [ ] 타입 에러 수정

- [ ] **Cloudflare Pages 프로젝트 생성**:
  ```bash
  wrangler pages project create goldpen-staging
  wrangler pages project create goldpen
  ```

- [ ] **Staging 배포**:
  ```bash
  pnpm pages:deploy:staging
  ```

- [ ] **Staging 검증** (KNOWHOW.md 섹션 6):
  ```bash
  # Health Check
  curl https://goldpen-staging.pages.dev/api/test-env

  # 캐시 우회 확인
  curl -i https://goldpen-staging.pages.dev/api/students | grep "x-worker-cache"
  # ✅ x-worker-cache: bypass

  # 인증 테스트
  curl -X POST https://goldpen-staging.pages.dev/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"password"}'

  # CRUD 테스트
  curl https://goldpen-staging.pages.dev/api/students
  ```

- [ ] **Production 배포**:
  ```bash
  pnpm pages:deploy:prod
  ```

- [ ] **Production 검증**:
  - [ ] 모든 API 엔드포인트 테스트
  - [ ] 프론트엔드 동작 확인
  - [ ] 성능 측정 (응답 속도 < 200ms)

---

## ⚠️ KNOWHOW.md 적용 체크리스트 (개정)

### 섹션 1: Next.js Full Route Cache 우회 ⭐
- [ ] ✅ **필수 적용**: `scripts/patch-open-next-worker.mjs` 작성
- [ ] ✅ API Cache Bypass 코드 삽입
- [ ] ✅ `Cache-Control: no-store` 헤더 추가
- [ ] ✅ 빌드 스크립트에 패치 단계 추가 (`package.json`)
- [ ] ✅ 배포 후 `x-worker-cache: bypass` 헤더 확인

### 섹션 2: Worker 1101 에러 방지
- [ ] ❌ **불필요** (DB 연결 Lazy 초기화 없음, Supabase가 처리)

### 섹션 3: Prisma + Hyperdrive 최적화
- [ ] ❌ **불필요** (Drizzle/Prisma 미사용, Supabase 사용)

### 섹션 4: Admin 4-Layer Cache 디버깅
- [ ] ⚠️ **참고용** (Cache 문제 발생 시 참고)

### 섹션 5: 환경변수 빌드 시점 인라인 ⭐
- [ ] ✅ **필수 적용**: `scripts/patch-open-next-worker.mjs`에 환경변수 주입 코드 추가
- [ ] ✅ 빌드 전 `.env` 파일 로드
- [ ] ✅ `INJECTED_ENV` 객체로 `globalThis.process.env`에 주입
- [ ] ✅ 빌드 로그에서 주입된 환경변수 목록 확인

### 섹션 6: 배포 전 체크리스트 ⭐
- [ ] ✅ **필수 준수**: 배포 전 모든 항목 확인
- [ ] ✅ 빌드 캐시 제거 (`rm -rf .next .vercel`)
- [ ] ✅ 패치 스크립트 존재 확인
- [ ] ✅ 환경변수 파일 확인
- [ ] ✅ 빌드 후 worker.js에서 패치 코드 확인

### 섹션 8: Landing 빌드 캐시 문제 ⭐
- [ ] ✅ **필수 적용**: 모든 배포 전 `pages:clean` 실행
- [ ] ✅ `.next`, `.vercel` 디렉토리 삭제
- [ ] ✅ `package.json`에 `pages:clean` 스크립트 추가

### 섹션 9: 환경변수 우선순위 ⭐
- [ ] ✅ **필수 적용**: `.env.local` 삭제 또는 `.env.development`로 변경
- [ ] ✅ `.env.development`, `.env.staging`, `.env.production` 생성
- [ ] ✅ 빌드 스크립트에서 `cp -f .env.staging .env.production` 사용
- [ ] ✅ 셸 환경변수 unset (또는 subshell 사용)

### 섹션 10: rewrites 제거 (Runtime-only)
- [ ] ✅ **이미 적용됨**: `next.config.js`에 rewrites 없음

---

## 🔍 검증 시나리오

### 1. Edge Runtime 동작 확인

**테스트 API**: `/api/test-env`

```bash
# Request
curl https://goldpen-staging.pages.dev/api/test-env

# Expected Response
{
  "runtime": "edge",
  "environment": "staging",
  "supabase_url": "https://staging-goldpen.supabase.co",
  "buildtime_injected": true
}
```

### 2. API Cache Bypass 확인 (KNOWHOW.md 섹션 1) ⭐

```bash
# 1. 학생 목록 조회 (첫 요청)
curl -i https://goldpen-staging.pages.dev/api/students

# Expected Headers:
# x-worker-cache: bypass
# cache-control: no-store, no-cache, must-revalidate
# x-worker-timestamp: 1700000000000

# 2. 학생 추가
curl -X POST https://goldpen-staging.pages.dev/api/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"name":"김철수","grade":10,"status":"active"}'

# 3. 학생 목록 조회 (두 번째 요청)
curl https://goldpen-staging.pages.dev/api/students

# Expected: 새로 추가된 김철수가 목록에 포함됨 (캐시 우회 성공!)
```

### 3. 환경변수 주입 확인 (KNOWHOW.md 섹션 5) ⭐

```bash
# 1. 빌드 로그 확인
pnpm pages:build:staging 2>&1 | grep "INJECTED"
# ✅ [OpenNext Patch] ✅ Environment variables injected: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY']

# 2. Worker.js 파일 확인
grep -A 10 "INJECTED_ENV" .open-next/worker.js
# ✅ const INJECTED_ENV = {
# ✅   "NEXT_PUBLIC_SUPABASE_URL": "https://staging-goldpen.supabase.co",
# ✅   "NEXT_PUBLIC_SUPABASE_ANON_KEY": "..."
# ✅ };

# 3. Runtime 테스트
curl https://goldpen-staging.pages.dev/api/test-env | jq '.supabase_url'
# ✅ "https://staging-goldpen.supabase.co" (하드코딩 아님!)
```

### 4. 인증 플로우 테스트

```bash
# 1. 회원가입
curl -X POST https://goldpen-staging.pages.dev/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@goldpen.kr",
    "password": "Test1234!",
    "name": "테스트 사용자"
  }'

# 2. 로그인
curl -X POST https://goldpen-staging.pages.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@goldpen.kr",
    "password": "Test1234!"
  }'

# 3. 인증된 요청
curl https://goldpen-staging.pages.dev/api/auth/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

### 5. CRUD API 테스트

```bash
# 학생 목록 조회
curl https://goldpen-staging.pages.dev/api/students \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

# 학생 생성
curl -X POST https://goldpen-staging.pages.dev/api/students \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "김철수",
    "grade": 10,
    "status": "active"
  }'
```

### 6. 성능 측정

```bash
# API 응답 속도 측정
for i in {1..10}; do
  curl -w "Time: %{time_total}s\n" -o /dev/null -s \
    https://goldpen-staging.pages.dev/api/students
done

# 목표: 평균 < 200ms
```

---

## 🚨 예상 문제 및 해결책

### 문제 1: Edge Runtime에서 Node.js API 사용

**증상**:
```
Error: process is not defined
Error: Buffer is not defined
```

**해결책**:
```typescript
// ❌ Node.js 전용
const buffer = Buffer.from(data)

// ✅ Edge 호환
const buffer = new TextEncoder().encode(data)
```

### 문제 2: OpenNext Worker 패치 실패

**증상**:
```
❌ [Patch] Could not find insertion point in worker.js
```

**해결책**:
```bash
# 1. .open-next/worker.js 확인
cat .open-next/worker.js | grep "const pathname"

# 2. 패치 스크립트 디버깅
node scripts/patch-open-next-worker.mjs

# 3. 수동 패치 (최후의 수단)
# .open-next/worker.js 직접 수정
```

### 문제 3: 환경변수 하드코딩 (빌드 시점 인라인)

**증상**:
```bash
# API 응답에서 로컬 URL 반환
curl https://goldpen-staging.pages.dev/api/test-env
# ❌ {"supabase_url":"http://127.0.0.1:54321"}
```

**해결책** (KNOWHOW.md 섹션 5, 9):
```bash
# 1. .env.local 삭제
rm .env.local

# 2. 빌드 캐시 제거
rm -rf .next .vercel

# 3. 환경변수 복사 후 재빌드
cp -f .env.staging .env.production
pnpm pages:build:staging

# 4. 환경변수 주입 확인
grep "INJECTED_ENV" .open-next/worker.js
```

### 문제 4: API 응답이 캐시됨

**증상**:
```bash
# 학생 추가 후 목록 조회 시 반영 안 됨
curl -X POST /api/students -d '{"name":"김철수"}'
curl /api/students
# ❌ 김철수가 목록에 없음 (캐시된 이전 응답)
```

**해결책** (KNOWHOW.md 섹션 1):
```bash
# 1. OpenNext Worker 패치 확인
grep "🔥 API request detected" .open-next/worker.js

# 2. 패치가 없으면 재실행
node scripts/patch-open-next-worker.mjs

# 3. 재배포
pnpm pages:deploy:staging

# 4. 캐시 헤더 확인
curl -i https://goldpen-staging.pages.dev/api/students | grep "x-worker-cache"
# ✅ x-worker-cache: bypass
```

### 문제 5: Supabase 세션 관리

**증상**:
```
Error: Session not found
```

**해결책**:
```typescript
// Edge에서는 Bearer Token 방식 사용
const token = request.headers.get('Authorization')?.replace('Bearer ', '')
await supabase.auth.setSession({ access_token: token, refresh_token: '' })
```

---

## 📈 예상 성과

### Before (현재)
- ✅ 백엔드 API 34개 완료
- ❌ Cloudflare 배포 불가 (Edge Runtime 미호환)
- ❌ 로컬 환경에서만 동작
- ❌ API Cache 문제 (OpenNext)
- ❌ 환경변수 하드코딩 문제

### After (이전 완료)
- ✅ Cloudflare Pages 배포 성공
- ✅ Edge Runtime 완전 호환
- ✅ **API Cache Bypass 적용** (KNOWHOW.md 섹션 1)
- ✅ **환경변수 빌드타임 주입** (KNOWHOW.md 섹션 5)
- ✅ 글로벌 CDN으로 빠른 응답 (<200ms)
- ✅ 무료 티어로 운영 가능 (100,000 req/day)

### 비용 절감
| 항목 | Vercel | Cloudflare Pages |
|------|--------|------------------|
| **Hobby 티어** | 무료 (제한적) | 무료 (넉넉함) |
| **API 요청** | 100,000/월 | 100,000/일 |
| **대역폭** | 100GB/월 | 무제한 |
| **빌드 시간** | 100시간/월 | 500시간/월 |
| **월 비용 (Pro)** | $20 | $0 |

---

## 📅 일정 계획 (개정)

### Week 1 (Day 1-2)
- [x] 프로젝트 분석
- [x] KNOWHOW.md 검증
- [ ] **Phase 0**: OpenNext Worker Patch Script 작성
- [ ] **Phase 1**: Supabase Client Edge 호환 작업

### Week 2 (Day 3-4)
- [ ] **Phase 2**: 34개 API Route 수정
- [ ] **Phase 3**: 환경 변수 정리
- [ ] 로컬 빌드 & 테스트

### Week 3 (Day 5)
- [ ] **Phase 4**: Staging 배포 & 검증
- [ ] Production 배포
- [ ] 모니터링 설정

**총 예상 시간**: 32-40시간 (4-5일)

**⚠️ 시간 증가 이유**:
- Phase 0 추가 (OpenNext Worker Patch): +6시간
- 환경변수 빌드타임 주입 복잡도: +2시간
- KNOWHOW.md 체크리스트 검증: +4시간

---

## 🎯 다음 단계

1. **최우선 작업**: Phase 0 (OpenNext Worker Patch Script 작성)
   - KNOWHOW.md 섹션 1 (API Cache Bypass)
   - KNOWHOW.md 섹션 5 (환경변수 빌드타임 주입)

2. **병렬 작업 가능**: Phase 1 (Edge Client) + Phase 3 (환경변수 정리)

3. **순차 작업**: Phase 2 (API Route 수정) → Phase 4 (배포 & 테스트)

---

## 📚 참고 자료

### 내부 문서
- **[KNOWHOW.md](./KNOWHOW.md)** ⭐ - Cloudflare 배포 노하우 (필독!)
  - 섹션 1: Next.js Full Route Cache 우회 (필수)
  - 섹션 5: 환경변수 빌드타임 인라인 (필수)
  - 섹션 6: 배포 전 체크리스트 (필수)
  - 섹션 8: 빌드 캐시 문제 (필수)
  - 섹션 9: 환경변수 우선순위 (필수)
- [CLAUDE.md](./CLAUDE.md) - Edge Runtime 규칙
- [BACKEND.md](./BACKEND.md) - 백엔드 구현 계획 (완료)

### 외부 문서
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [@cloudflare/next-on-pages](https://github.com/cloudflare/next-on-pages)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Next.js Edge Runtime](https://nextjs.org/docs/app/building-your-application/rendering/edge-and-nodejs-runtimes)

---

## 🎓 핵심 인사이트 (KNOWHOW.md 기반)

### 1. OpenNext는 API도 캐시한다! (섹션 1)
> "Prisma 사용 여부와 무관하게, OpenNext의 Full Route Cache는 **모든 Route**에 적용된다."

**잘못된 가정**:
- ❌ "Supabase 쓰니까 Prisma 관련 섹션은 불필요"
- ❌ "API는 캐시 안 할 거야"

**올바른 이해**:
- ✅ OpenNext의 Full Route Cache는 **App Router 전체** 대상
- ✅ `/api/*` Route도 예외 없이 캐시됨
- ✅ Worker.js 패치로 API만 선택적 우회 필요

### 2. 환경변수는 빌드 시점에 하드코딩된다 (섹션 5)
> "Next.js는 `process.env.*`를 빌드 시점에 코드에 인라인한다."

**잘못된 가정**:
- ❌ "wrangler.jsonc vars로 Runtime 주입하면 되지"
- ❌ ".env 파일만 잘 관리하면 돼"

**올바른 이해**:
- ✅ 빌드 시 `.env` 파일 없으면 `undefined`가 코드에 박힘
- ✅ Runtime 주입은 Fallback일 뿐, 빌드타임 주입 필수
- ✅ `scripts/patch-open-next-worker.mjs`로 빌드 후 주입

### 3. .env.local은 모든 환경을 덮어쓴다 (섹션 9)
> ".env.local은 .env.production보다 우선 적용되어 Production 빌드도 오염시킨다."

**잘못된 가정**:
- ❌ ".env.local은 로컬 전용이겠지"
- ❌ ".env.production이 Production에서 적용되겠지"

**올바른 이해**:
- ✅ `.env.local`은 **모든 환경**에서 최우선 적용
- ✅ Production 빌드 시에도 `.env.local` 값 사용
- ✅ `.env.local` 삭제 또는 `.env.development`로 변경 필수

---

**작성자**: Claude AI
**버전**: 2.0.0 (KNOWHOW.md 검증 완료)
**마지막 업데이트**: 2025-11-20
**검증 기준**: KNOWHOW.md 섹션 1, 5, 6, 8, 9 완전 준수
