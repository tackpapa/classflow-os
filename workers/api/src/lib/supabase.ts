import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Env } from '../env'

/**
 * Cloudflare Workers용 Supabase 클라이언트
 * 기존 lib/supabase/client-edge.ts와 동일한 로직
 */
export function createClient(env: Env) {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      '[Supabase Workers] NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set'
    )
  }

  if (supabaseUrl.includes('your-') || supabaseKey.includes('your-')) {
    throw new Error(
      '[Supabase Workers] Invalid environment variables detected. Please set proper values.'
    )
  }

  return createSupabaseClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
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

  // Cookie에서 세션 토큰 추출
  const cookieHeader = request.headers.get('Cookie')
  if (cookieHeader) {
    const cookies = parseCookies(cookieHeader)

    const sessionToken =
      cookies['sb-access-token'] ||
      cookies['sb-auth-token'] ||
      cookies['supabase-auth-token']

    if (sessionToken) {
      return sessionToken
    }

    // Supabase SSR cookie 패턴
    for (const [key, value] of Object.entries(cookies)) {
      if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
        return value
      }
    }
  }

  return null
}

/**
 * Cookie 헤더 파싱
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
export async function createAuthenticatedClient(request: Request, env: Env) {
  const supabase = createClient(env)
  const token = getAuthToken(request)

  if (token) {
    const { error } = await supabase.auth.setSession({
      access_token: token,
      refresh_token: ''
    })

    if (error) {
      throw new Error(`[Supabase Workers] Auth error: ${error.message}`)
    }
  }

  return supabase
}
