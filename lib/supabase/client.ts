import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabase 브라우저 클라이언트 생성
 * Client Component에서 사용
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  // 개발 환경: Supabase 미설정 시 빈 URL로 생성 (실제 사용 시 에러 방지)
  if (!supabaseUrl || !supabaseKey ||
      supabaseUrl === 'your-supabase-url' ||
      supabaseKey === 'your-supabase-anon-key' ||
      !supabaseUrl.startsWith('http')) {
    // Mock client: 실제 API 호출은 실패하지만 애플리케이션은 로드됨
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder-anon-key'
    )
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
