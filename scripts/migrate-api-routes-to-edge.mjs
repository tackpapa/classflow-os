import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

// API Routes Edge Runtime Migration Script
// Transform all app/api/**/route.ts files to:
// 1. Edge Runtime compatibility
// 2. Use Supabase client-edge.ts
// 3. Convert NextRequest/NextResponse to Request/Response

console.log('🔧 API Routes Edge Runtime 마이그레이션 시작...\n')

// Helper function to recursively find all route.ts files
function findRouteFiles(dir, fileList = []) {
  const files = readdirSync(dir)

  for (const file of files) {
    const filePath = join(dir, file)
    const stat = statSync(filePath)

    if (stat.isDirectory()) {
      findRouteFiles(filePath, fileList)
    } else if (file === 'route.ts') {
      fileList.push(filePath)
    }
  }

  return fileList
}

// 1. 모든 API route 파일 찾기
const apiDir = join(process.cwd(), 'app', 'api')
const routeFiles = findRouteFiles(apiDir)

console.log(`📁 발견된 API route 파일: ${routeFiles.length}개\n`)

let successCount = 0
let skipCount = 0
let errorCount = 0

for (const filePath of routeFiles) {
  const relativePath = filePath.replace(process.cwd() + '/', '')

  try {
    let content = readFileSync(filePath, 'utf-8')
    let modified = false

    // 이미 Edge Runtime으로 마이그레이션 되었는지 확인
    if (content.includes("export const runtime = 'edge'")) {
      console.log(`⏭️  SKIP: ${relativePath} (이미 마이그레이션됨)`)
      skipCount++
      continue
    }

    // 2. Import 문 변경
    if (content.includes("from 'next/server'")) {
      // NextRequest, NextResponse import 제거
      content = content.replace(
        /import\s+\{\s*NextRequest\s*,\s*NextResponse\s*\}\s+from\s+['"]next\/server['"]\s*\n/g,
        ''
      )

      // 단독 NextRequest import 제거
      content = content.replace(
        /import\s+\{\s*NextRequest\s*\}\s+from\s+['"]next\/server['"]\s*\n/g,
        ''
      )

      // 단독 NextResponse import 제거
      content = content.replace(
        /import\s+\{\s*NextResponse\s*\}\s+from\s+['"]next\/server['"]\s*\n/g,
        ''
      )

      modified = true
    }

    // 3. Supabase client import 변경
    if (content.includes("from '@/lib/supabase/server'")) {
      content = content.replace(
        /import\s+\{\s*createClient\s*\}\s+from\s+['"]@\/lib\/supabase\/server['"]/g,
        "import { createAuthenticatedClient } from '@/lib/supabase/client-edge'"
      )
      modified = true
    }

    // 4. Edge Runtime 선언 추가 (첫 import 문 다음에)
    if (!content.includes("export const runtime = 'edge'")) {
      // import 문들 찾기
      const lines = content.split('\n')
      let lastImportIndex = -1

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ')) {
          lastImportIndex = i
        }
      }

      if (lastImportIndex >= 0) {
        // import 문 다음에 Edge Runtime 선언 추가
        lines.splice(lastImportIndex + 1, 0,
          '',
          "export const runtime = 'edge'",
          "export const dynamic = 'force-dynamic'",
          "export const revalidate = 0"
        )
        content = lines.join('\n')
        modified = true
      }
    }

    // 5. 함수 시그니처 변경: NextRequest → Request
    if (content.includes('NextRequest')) {
      content = content.replace(/NextRequest/g, 'Request')
      modified = true
    }

    // 6. Supabase 클라이언트 생성 변경
    if (content.includes('const supabase = createClient()')) {
      // 함수별로 처리
      content = content.replace(
        /export\s+async\s+function\s+(\w+)\s*\(\s*request:\s*Request/g,
        (match, funcName) => {
          return match
        }
      )

      // createClient() → await createAuthenticatedClient(request)
      content = content.replace(
        /const supabase = createClient\(\)/g,
        'const supabase = await createAuthenticatedClient(request)'
      )

      modified = true
    }

    // 7. NextResponse.json() → Response.json()
    if (content.includes('NextResponse.json')) {
      content = content.replace(/NextResponse\.json\(/g, 'Response.json(')
      modified = true
    }

    // 8. OPTIONS 함수도 Response로 변경
    if (content.includes('export async function OPTIONS()')) {
      content = content.replace(
        /export\s+async\s+function\s+OPTIONS\(\)\s*\{[\s\S]*?return\s+NextResponse\.json\(/,
        (match) => match.replace('NextResponse.json(', 'Response.json(')
      )
    }

    if (modified) {
      writeFileSync(filePath, content, 'utf-8')
      console.log(`✅ SUCCESS: ${relativePath}`)
      successCount++
    } else {
      console.log(`⏭️  SKIP: ${relativePath} (변경 불필요)`)
      skipCount++
    }

  } catch (error) {
    console.error(`❌ ERROR: ${relativePath}`)
    console.error(`   ${error.message}`)
    errorCount++
  }
}

console.log('\n' + '='.repeat(60))
console.log('📊 마이그레이션 완료 통계:')
console.log(`   ✅ 성공: ${successCount}개`)
console.log(`   ⏭️  건너뜀: ${skipCount}개`)
console.log(`   ❌ 실패: ${errorCount}개`)
console.log(`   📁 총 파일: ${routeFiles.length}개`)
console.log('='.repeat(60))

if (errorCount > 0) {
  console.log('\n⚠️  일부 파일 마이그레이션 실패. 수동 확인 필요.')
  process.exit(1)
}

console.log('\n✅ 모든 API route가 Edge Runtime으로 마이그레이션되었습니다!')
console.log('\n🎯 다음 단계:')
console.log('   1. TypeScript 컴파일 확인: npx tsc --noEmit')
console.log('   2. 로컬 테스트: pnpm dev')
console.log('   3. Phase 3로 진행: 환경 변수 정리')
console.log('')
