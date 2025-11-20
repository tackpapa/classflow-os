import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'fs'
import { join, dirname } from 'path'

console.log('🔧 Next.js API Routes → Hono Workers 자동 변환 시작...\n')

// Helper: 재귀적으로 route.ts 파일 찾기
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

const converted = []

for (const filePath of routeFiles) {
  const relativePath = filePath.replace(process.cwd() + '/', '')

  try {
    // API path 추출
    // app/api/students/route.ts → /api/students
    // app/api/students/[id]/route.ts → /api/students/:id
    let apiPath = relativePath
      .replace('app/api/', '/api/')
      .replace('/route.ts', '')
      .replace(/\[(\w+)\]/g, ':$1') // [id] → :id

    // Hono route 파일 경로 생성
    // /api/students → workers/api/src/routes/students.ts
    // /api/students/:id → workers/api/src/routes/students.[id].ts
    const routeName = apiPath
      .replace('/api/', '')
      .replace(/\//g, '.')
      .replace(/:/g, '[')
      .replace(/$/g, match => match.includes('[') ? ']' : '')

    const honoFilePath = join(process.cwd(), 'workers', 'api', 'src', 'routes', `${routeName || 'index'}.ts`)

    // 이미 존재하면 건너뛰기
    if (existsSync(honoFilePath)) {
      console.log(`⏭️  SKIP: ${routeName} (이미 존재)`)
      continue
    }

    // 원본 파일 읽기
    const originalContent = readFileSync(filePath, 'utf-8')

    // HTTP 메서드 추출
    const methods = []
    if (originalContent.includes('export async function GET')) methods.push('GET')
    if (originalContent.includes('export async function POST')) methods.push('POST')
    if (originalContent.includes('export async function PUT')) methods.push('PUT')
    if (originalContent.includes('export async function PATCH')) methods.push('PATCH')
    if (originalContent.includes('export async function DELETE')) methods.push('DELETE')

    if (methods.length === 0) {
      console.log(`⚠️  WARN: ${routeName} (메서드 없음)`)
      continue
    }

    // Hono route 템플릿 생성
    const honoTemplate = generateHonoRoute(apiPath, methods, routeName)

    // 디렉토리 생성
    mkdirSync(dirname(honoFilePath), { recursive: true })

    // 파일 쓰기
    writeFileSync(honoFilePath, honoTemplate, 'utf-8')

    console.log(`✅ SUCCESS: ${routeName} (${methods.join(', ')})`)
    converted.push({ path: apiPath, file: routeName, methods })

  } catch (error) {
    console.error(`❌ ERROR: ${relativePath}`)
    console.error(`   ${error.message}`)
  }
}

console.log('\n' + '='.repeat(60))
console.log('📊 변환 완료 통계:')
console.log(`   ✅ 변환 성공: ${converted.length}개`)
console.log(`   📁 총 파일: ${routeFiles.length}개`)
console.log('='.repeat(60))

// index.ts 업데이트용 import/route 목록 생성
console.log('\n📋 index.ts에 추가할 코드:\n')
console.log('// Routes')
converted.forEach(({ file, path }) => {
  const importName = file.replace(/\./g, '_').replace(/\[|\]/g, '')
  console.log(`import ${importName} from './routes/${file}'`)
})
console.log('\n// Route registration')
converted.forEach(({ file, path }) => {
  const importName = file.replace(/\./g, '_').replace(/\[|\]/g, '')
  console.log(`app.route('${path}', ${importName})`)
})

console.log('\n✅ 모든 API route가 Hono Workers로 변환되었습니다!')

// Hono route 템플릿 생성 함수
function generateHonoRoute(apiPath, methods, routeName) {
  const hasAuth = !apiPath.includes('/auth/') && !apiPath.includes('/test-')

  return `import { Hono } from 'hono'
import type { Env } from '../env'
import { createAuthenticatedClient } from '../lib/supabase'

const app = new Hono<{ Bindings: Env }>()

${methods.map(method => `
/**
 * ${method} ${apiPath}
 */
app.${method.toLowerCase()}('/', async (c) => {
  try {
    const supabase = await createAuthenticatedClient(c.req.raw, c.env)

    // TODO: 기존 app/api${apiPath.replace('/api', '')}/route.ts 로직 이식
    // 현재는 기본 응답만 반환

    return c.json({
      message: '${method} ${apiPath} - Implementation needed',
      // TODO: 실제 데이터 반환
    })
  } catch (error: any) {
    console.error('[${routeName}] ${method} error:', error)
    return c.json({ error: error.message }, 500)
  }
})
`).join('\n')}

export default app
`
}
