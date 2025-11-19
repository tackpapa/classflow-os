import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase 브라우저 클라이언트 생성
 * Client Component에서 사용
 */
export function createClient() {
  // 환경 변수 체크 및 fallback
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  let supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  // .env.example의 placeholder 값인지 체크
  if (!supabaseUrl ||
      supabaseUrl === 'your-supabase-url' ||
      supabaseUrl.includes('your-project') ||
      !supabaseUrl.startsWith('http')) {
    // 로컬 Supabase 하드코딩 (개발용)
    supabaseUrl = 'http://127.0.0.1:54321'
  }

  if (!supabaseKey ||
      supabaseKey === 'your-supabase-anon-key' ||
      supabaseKey.includes('your-anon-key')) {
    // 로컬 Supabase JWT anon 키 (개발용)
    supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzYzNTMyNTk1LCJleHAiOjIwNzg4OTI1OTV9.SIBJC5Z-rlGxcsZXDScorXHN8iF8utn4Ie4x2q6_iXA'
  }

  return createBrowserClient(supabaseUrl, supabaseKey, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    global: {
      headers: {
        'x-client-info': 'supabase-js-web',
      },
    },
  })
}
