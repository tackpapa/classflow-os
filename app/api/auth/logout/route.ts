import { createAuthenticatedClient } from '@/lib/supabase/client-edge'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * POST /api/auth/logout
 * 로그아웃 API
 *
 * @returns 200 - 로그아웃 성공
 * @returns 500 - 서버 에러
 */
export async function POST(request: Request) {
  try {
    const supabase = await createAuthenticatedClient(request)

    // Supabase Auth 로그아웃
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('[Auth Logout] Supabase auth error:', error)
      return Response.json(
        { error: '로그아웃 중 오류가 발생했습니다' },
        { status: 500 }
      )
    }

    return Response.json(
      { message: '로그아웃되었습니다' },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (error) {
    console.error('[Auth Logout] Unexpected error:', error)
    return Response.json(
      { error: '로그아웃 중 오류가 발생했습니다' },
      { status: 500 }
    )
  }
}

// CORS 및 OPTIONS 요청 처리
export async function OPTIONS() {
  return Response.json(
    {},
    {
      headers: {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    }
  )
}
