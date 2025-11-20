import { createAuthenticatedClient } from '@/lib/supabase/client-edge'
import fs from 'fs'
import path from 'path'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * 임시 마이그레이션 API (사용 후 삭제 예정)
 * Supabase 마이그레이션 SQL을 실행합니다.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createAuthenticatedClient(request)

    // 마이그레이션 SQL 파일 읽기
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20251120_create_auth_tables.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

    // SQL 실행 (Supabase는 rpc를 통해 raw SQL 실행 지원)
    // 여러 문장으로 나누어 실행
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    const results = []
    for (const statement of statements) {
      try {
        // Supabase에서는 직접 SQL 실행을 위해 rpc를 사용하거나
        // postgres 연결을 통해 실행해야 합니다
        // 이 방법은 제한적이므로 Supabase Studio를 사용하는 것이 좋습니다
        results.push({ statement: statement.substring(0, 50) + '...', status: 'queued' })
      } catch (error: any) {
        results.push({
          statement: statement.substring(0, 50) + '...',
          status: 'error',
          error: error.message
        })
      }
    }

    return Response.json({
      message: 'Migration SQL parsed. Please execute manually in Supabase Studio.',
      statementsCount: statements.length,
      results,
      instructions: 'Go to http://127.0.0.1:54323/project/default/sql and paste the migration SQL'
    })
  } catch (error: any) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
