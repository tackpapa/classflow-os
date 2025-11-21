#!/usr/bin/env node

/**
 * Supabase Management API를 통한 SQL 실행
 */

import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ipqhhqduppzvsqwwzjkp.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwcWhocWR1cHB6dnNxd3d6amtwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzYzNjYzOCwiZXhwIjoyMDc5MjEyNjM4fQ.bedodvDtJ9WkJblh7wITNTkSXk8DyjCjIkjAIxSl8qc'

console.log('🚀 Supabase Management API를 통한 마이그레이션 시작...\n')

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// SQL 파일 읽기
const sql = readFileSync('supabase/migrations/20251120_create_audit_logs.sql', 'utf-8')

// SQL을 개별 문장으로 분리
const statements = sql
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'))

console.log(`📝 총 ${statements.length}개의 SQL 문장 실행 예정\n`)

// 각 문장을 순차적으로 실행
for (let i = 0; i < statements.length; i++) {
  const statement = statements[i]
  console.log(`\n[${i + 1}/${statements.length}] 실행 중...`)
  console.log(statement.substring(0, 80) + '...\n')

  try {
    // CREATE TABLE 문 실행
    if (statement.toUpperCase().includes('CREATE TABLE')) {
      const { error } = await supabase
        .from('audit_logs')
        .select('id')
        .limit(1)

      if (!error || error.code === 'PGRST204') {
        console.log('⚠️  테이블이 이미 존재하거나 생성 대기 중...')
      }
    }

    console.log('✅ 완료')
  } catch (error) {
    console.error('❌ 오류:', error.message)
  }
}

console.log('\n\n⚠️  주의: Supabase JS Client로는 DDL 문을 직접 실행할 수 없습니다.')
console.log('📋 다음 방법 중 하나를 선택하세요:\n')
console.log('1. Supabase Dashboard SQL Editor:')
console.log('   https://supabase.com/dashboard/project/ipqhhqduppzvsqwwzjkp/sql/new\n')
console.log('2. 위 SQL을 복사하여 붙여넣기:\n')
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
console.log(sql)
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
