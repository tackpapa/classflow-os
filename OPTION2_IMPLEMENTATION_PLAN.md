# Option 2 구현 계획: API Workers 분리

## 🎯 목표

Next.js 14.2 앱에서 34개 API Routes를 Cloudflare Workers로 완전 분리하여 "진짜 Workers"를 사용합니다.

## 📋 최종 아키텍처

```
사용자 요청
    ↓
Cloudflare Pages (Next.js 프론트엔드만)
    ↓
/_routes.json → /api/* 요청을 Workers로 라우팅
    ↓
Cloudflare Workers (Hono 기반 API)
    ↓
Supabase + External Services
```

## 🏗️ 프로젝트 구조

```
/Users/kiyoungtack/Desktop/goldpen/
├── app/                          # Next.js 프론트엔드 (Pages 배포)
│   ├── [institutionname]/
│   ├── (auth)/
│   └── api/                      # ⚠️ 삭제 예정 (Workers로 이동)
│
├── workers/
│   ├── api/                      # 🆕 Hono Workers API (새로 생성)
│   │   ├── src/
│   │   │   ├── index.ts          # Hono 앱 진입점
│   │   │   ├── env.ts            # 환경변수 타입
│   │   │   ├── lib/
│   │   │   │   └── supabase.ts   # Supabase client (재사용)
│   │   │   ├── middleware/
│   │   │   │   ├── cors.ts       # CORS 설정
│   │   │   │   ├── auth.ts       # 인증 미들웨어
│   │   │   │   └── logger.ts     # 로깅
│   │   │   └── routes/
│   │   │       ├── students.ts   # 34개 route 파일
│   │   │       ├── classes.ts
│   │   │       ├── teachers.ts
│   │   │       ├── attendance.ts
│   │   │       ├── lessons.ts
│   │   │       ├── consultations.ts
│   │   │       ├── exams.ts
│   │   │       ├── homework.ts
│   │   │       ├── billing.ts
│   │   │       ├── payments.ts
│   │   │       ├── expenses.ts
│   │   │       ├── credits.ts
│   │   │       ├── organizations.ts
│   │   │       ├── seats.ts
│   │   │       ├── rooms.ts
│   │   │       ├── schedules.ts
│   │   │       ├── schedule-slots.ts
│   │   │       ├── migrate.ts
│   │   │       ├── rollcall.ts
│   │   │       ├── study-plans.ts
│   │   │       ├── class-sessions.ts
│   │   │       ├── auth/
│   │   │       │   ├── signup.ts
│   │   │       │   ├── login.ts
│   │   │       │   ├── logout.ts
│   │   │       │   └── check.ts
│   │   │       ├── dashboard/
│   │   │       │   ├── stats.ts
│   │   │       │   └── recent.ts
│   │   │       ├── institution/
│   │   │       │   ├── join.ts
│   │   │       │   └── create.ts
│   │   │       ├── profile/
│   │   │       │   └── route.ts
│   │   │       └── weather/
│   │   │           └── route.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── wrangler.toml
│   │
│   └── tail-logger/              # 기존 Tail Worker (유지)
│
├── public/
│   └── _routes.json              # 🆕 API 라우팅 설정
│
├── package.json                   # 루트 워크스페이스
└── pnpm-workspace.yaml           # 🆕 Monorepo 설정
```

## 📦 단계별 구현 계획

### Phase 1: 프로젝트 구조 생성
- [ ] `workers/api/` 디렉토리 생성
- [ ] `package.json`, `tsconfig.json`, `wrangler.toml` 작성
- [ ] pnpm 워크스페이스 설정
- [ ] Hono 의존성 설치

### Phase 2: Hono 기본 앱 구현
- [ ] `src/index.ts` - Hono 앱 진입점
- [ ] `src/env.ts` - 환경변수 타입 정의
- [ ] `src/lib/supabase.ts` - Supabase client (기존 재사용)
- [ ] `src/middleware/cors.ts` - CORS 설정
- [ ] `src/middleware/auth.ts` - 인증 미들웨어
- [ ] `src/middleware/logger.ts` - 로깅

### Phase 3: API Routes 변환 (34개)

#### 변환 패턴 예시:

**Before (Next.js API Route):**
```typescript
// app/api/students/route.ts
import { createAuthenticatedClient } from '@/lib/supabase/client-edge'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  const supabase = await createAuthenticatedClient(request)
  const { data, error } = await supabase.from('students').select('*')

  if (error) {
    return Response.json({ error: error.message }, { status: 400 })
  }

  return Response.json({ data })
}
```

**After (Hono Workers):**
```typescript
// workers/api/src/routes/students.ts
import { Hono } from 'hono'
import { createAuthenticatedClient } from '../lib/supabase'
import type { Env } from '../env'

const students = new Hono<{ Bindings: Env }>()

students.get('/', async (c) => {
  const supabase = await createAuthenticatedClient(c.req.raw)
  const { data, error } = await supabase.from('students').select('*')

  if (error) {
    return c.json({ error: error.message }, 400)
  }

  return c.json({ data })
})

export default students
```

#### 변환할 34개 API Routes:

1. `/api/students` - GET, POST, PATCH, DELETE
2. `/api/classes` - GET, POST, PATCH, DELETE
3. `/api/teachers` - GET, POST, PATCH, DELETE
4. `/api/attendance` - GET, POST, PATCH
5. `/api/lessons` - GET, POST, PATCH, DELETE
6. `/api/consultations` - GET, POST, PATCH, DELETE
7. `/api/exams` - GET, POST, PATCH, DELETE
8. `/api/homework` - GET, POST, PATCH, DELETE
9. `/api/billing` - GET, POST
10. `/api/payments` - GET, POST, PATCH, DELETE
11. `/api/expenses` - GET, POST, PATCH, DELETE
12. `/api/credits` - GET, POST
13. `/api/organizations` - GET, POST, PATCH
14. `/api/seats` - GET, POST, PATCH, DELETE
15. `/api/rooms` - GET, POST, PATCH, DELETE
16. `/api/schedules` - GET, POST, PATCH, DELETE
17. `/api/schedule-slots` - GET, POST, DELETE
18. `/api/migrate` - POST (임시)
19. `/api/rollcall` - GET, POST, PATCH
20. `/api/study-plans` - GET, POST, PATCH, DELETE
21. `/api/class-sessions` - GET, POST, PATCH, DELETE
22. `/api/auth/signup` - POST
23. `/api/auth/login` - POST
24. `/api/auth/logout` - POST
25. `/api/auth/check` - GET
26. `/api/dashboard/stats` - GET
27. `/api/dashboard/recent` - GET
28. `/api/institution/join` - POST
29. `/api/institution/create` - POST
30. `/api/profile` - GET, PATCH
31. `/api/weather` - GET
32. `/api/test-db` - GET (임시)
33. `/api/test-session` - GET (임시)
34. `/api/test-supabase` - GET (임시)

### Phase 4: Pages 라우팅 설정
- [ ] `public/_routes.json` 생성 - `/api/*`를 Workers로 라우팅
- [ ] 기존 `app/api/` 폴더 백업 후 삭제

### Phase 5: 환경 변수 및 설정
- [ ] `workers/api/wrangler.toml` - Workers 설정
- [ ] 환경 변수 설정 (Supabase URL/Key)
- [ ] CORS 설정 (프론트엔드 도메인 허용)

### Phase 6: 빌드 및 배포 스크립트
- [ ] `package.json` 스크립트 추가
  - `api:dev` - Workers 로컬 개발
  - `api:build` - Workers 빌드
  - `api:deploy` - Workers 배포
  - `deploy:all` - Pages + Workers 동시 배포

### Phase 7: 테스트
- [ ] 로컬 테스트 (wrangler dev)
- [ ] 타입 체크
- [ ] 각 API endpoint 동작 확인

### Phase 8: 문서화
- [ ] DEPLOYMENT.md 업데이트
- [ ] API Workers 사용법 추가
- [ ] 트러블슈팅 가이드

## 🔧 핵심 기술 스택

- **Hono** - Workers 최적화 웹 프레임워크 (7KB)
- **Supabase JS** - 기존 코드 재사용
- **TypeScript** - 타입 안전성
- **Wrangler** - Cloudflare Workers CLI

## 📊 마이그레이션 영향 범위

### 변경되는 부분:
- ✅ API 엔드포인트 구현 (34개 파일 재작성)
- ✅ 배포 프로세스 (2개 프로젝트 분리)

### 변경되지 않는 부분:
- ❌ 프론트엔드 코드 (fetch 호출은 동일)
- ❌ Supabase 로직 (client-edge.ts 재사용)
- ❌ 인증 방식 (Bearer Token 동일)

## ⏱️ 예상 소요 시간

- Phase 1: 프로젝트 구조 생성 - **30분**
- Phase 2: Hono 기본 앱 - **1시간**
- Phase 3: API Routes 변환 - **2-3일** (34개 × 1-2시간)
- Phase 4: 라우팅 설정 - **30분**
- Phase 5: 환경 변수 - **30분**
- Phase 6: 배포 스크립트 - **1시간**
- Phase 7: 테스트 - **1일**
- Phase 8: 문서화 - **1시간**

**총 예상 시간: 2-3주**

## 🚀 배포 후 아키텍처

```
https://goldpen.pages.dev/
├── / (프론트엔드)           → Cloudflare Pages
├── /students               → Cloudflare Pages (SSG/ISR)
└── /api/*                  → Cloudflare Workers (Hono)
    ├── /api/students       → workers/api (GET, POST, PATCH, DELETE)
    ├── /api/classes        → workers/api
    └── ... (34개 route)
```

## 💰 비용 분석

| 항목 | 사용량 | 비용 |
|------|--------|------|
| Pages (프론트엔드) | 500GB bandwidth | $0 |
| Workers (API) | 10M requests/월 | $0 (100k req/day free) |
| Workers Logs | 10M lines/월 | $0 |
| **총계** | **일반적 사용** | **$0-5/월** |

## ✅ 장점

1. **진짜 Workers 사용** - Durable Objects, KV, R2, D1 사용 가능
2. **독립 배포** - API와 프론트엔드 분리 배포
3. **영구 로그** - Workers Logs 자동 지원
4. **확장성** - Workers 생태계 완전 활용

## ⚠️ 주의사항

1. **2개 프로젝트 관리** - Pages + Workers 별도 배포
2. **CORS 설정 필수** - 프론트엔드 도메인 허용
3. **환경 변수 분리** - Pages와 Workers 각각 설정

## 📝 다음 단계

1. ✅ 이 계획서 검토
2. `/sc:implement` 실행 - 자동 구현 시작
3. 단계별 검증 및 테스트
4. 배포 및 운영

---

**작성일**: 2025-11-20
**목표**: Cloudflare Workers API 완전 분리
**예상 완료**: 2-3주
