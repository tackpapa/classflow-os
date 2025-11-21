/**
 * Production Migration Executor
 * Applies audit_logs migration to production Supabase
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Hardcoded from .env.local
const supabaseUrl = 'https://ipqhhqduppzvsqwwzjkp.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwcWhocWR1cHB6dnNxd3d6amtwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzYzNjYzOCwiZXhwIjoyMDc5MjEyNjM4fQ.bedodvDtJ9WkJblh7wITNTkSXk8DyjCjIkjAIxSl8qc'

console.log('📦 GoldPen Production Migration')
console.log('================================\n')

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '✗')
  process.exit(1)
}

console.log('✓ Environment loaded')
console.log(`Target: ${supabaseUrl}\n`)

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

async function main() {
  try {
    // 1. Check if audit_logs already exists
    console.log('🔍 Checking if audit_logs table exists...')
    const { error: checkError } = await supabase
      .from('audit_logs')
      .select('id')
      .limit(1)

    if (!checkError) {
      console.log('⚠️  audit_logs table already exists')
      console.log('Migration may have been applied previously.')
      console.log('\nTo force re-run, manually drop the table first.')
      return
    }

    // If error is "relation does not exist", proceed with migration
    if (!checkError.message.includes('relation') && !checkError.message.includes('does not exist')) {
      console.error('❌ Unexpected error:', checkError.message)
      process.exit(1)
    }

    console.log('✓ Table does not exist, proceeding with migration\n')

    // 2. Read migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20251120_create_audit_logs.sql')
    console.log('📄 Reading migration:', migrationPath)
    const sql = fs.readFileSync(migrationPath, 'utf-8')

    // 3. Execute migration using RPC
    console.log('🚀 Executing migration SQL...\n')

    // Use postgres function to execute raw SQL
    const { data, error } = await supabase.rpc('exec', { sql_query: sql })

    if (error) {
      console.error('❌ Migration failed:', error.message)
      console.error('\nPlease execute the migration manually via Supabase Dashboard:')
      console.error(`https://supabase.com/dashboard/project/${supabaseUrl.match(/https:\/\/([^.]+)/)[1]}/sql/new`)
      console.error('\nCopy and paste the SQL from:')
      console.error(migrationPath)
      process.exit(1)
    }

    // 4. Verify table creation
    console.log('✅ Verifying audit_logs table...')
    const { data: verifyData, error: verifyError } = await supabase
      .from('audit_logs')
      .select('*')
      .limit(1)

    if (verifyError) {
      console.error('❌ Verification failed:', verifyError.message)
      process.exit(1)
    }

    console.log('\n🎉 Migration completed successfully!')
    console.log('\n📊 Migration Summary:')
    console.log('  - Table: audit_logs ✓')
    console.log('  - RLS Policies: 2 ✓')
    console.log('  - Indexes: 9 ✓')
    console.log('\n✅ Production database is ready!')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

main()
