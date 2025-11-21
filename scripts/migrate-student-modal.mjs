import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const supabase = createClient(
  'https://ipqhhqduppzvsqwwzjkp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlwcWhocWR1cHB6dnNxd3d6amtwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzYzNjYzOCwiZXhwIjoyMDc5MjEyNjM4fQ.bedodvDtJ9WkJblh7wITNTkSXk8DyjCjIkjAIxSl8qc'
)

async function migrate() {
  console.log('🚀 Starting migration...\n')

  // Read SQL file
  const sqlPath = path.join(__dirname, '../supabase/migrations/20251121_student_modal_tables.sql')
  const sql = fs.readFileSync(sqlPath, 'utf8')

  // Execute via REST API (Supabase SQL Editor equivalent)
  // Since we can't run raw SQL directly, we'll create tables one by one using Supabase client

  // 1. Create student_subscriptions table
  console.log('📦 Creating student_subscriptions table...')
  const { error: e1 } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS student_subscriptions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        org_id UUID NOT NULL,
        student_id UUID NOT NULL,
        subscription_type VARCHAR(50) NOT NULL DEFAULT 'days',
        total_days INTEGER,
        remaining_days INTEGER,
        total_hours INTEGER,
        remaining_hours INTEGER,
        start_date DATE NOT NULL,
        expiry_date DATE NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        payment_id UUID,
        price INTEGER,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  })

  if (e1) {
    console.log('Note: exec_sql not available, trying alternative method...')
    // Tables will need to be created via Supabase Dashboard SQL Editor
    console.log('\n⚠️  Please run the following SQL in Supabase Dashboard SQL Editor:')
    console.log('    File: supabase/migrations/20251121_student_modal_tables.sql\n')
  } else {
    console.log('✅ student_subscriptions created')
  }

  // Try to insert seed data directly (if tables exist)
  await seedData()
}

async function seedData() {
  console.log('\n🌱 Seeding mock data...\n')

  // Get existing students and org
  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('id, org_id, name')
    .limit(10)

  if (studentsError) {
    console.error('Failed to fetch students:', studentsError)
    return
  }

  if (!students || students.length === 0) {
    console.log('No students found to seed data for')
    return
  }

  const orgId = students[0].org_id
  console.log(`Found ${students.length} students in org: ${orgId}`)

  // Get existing classes
  const { data: classes } = await supabase
    .from('classes')
    .select('id')
    .eq('org_id', orgId)
    .limit(5)

  // Get existing teachers
  const { data: teachers } = await supabase
    .from('teachers')
    .select('id')
    .eq('org_id', orgId)
    .limit(3)

  // 1. Seed student_subscriptions (이용권)
  console.log('📋 Seeding student_subscriptions...')
  const subscriptions = students.slice(0, 5).map((s, i) => ({
    org_id: orgId,
    student_id: s.id,
    subscription_type: 'days',
    total_days: 30,
    remaining_days: 30 - (i * 3), // 30, 27, 24, 21, 18
    start_date: '2025-11-20',
    expiry_date: '2025-12-20',
    status: 'active',
    price: 150000,
    notes: `${s.name}님의 30일 이용권`
  }))

  const { error: subError } = await supabase
    .from('student_subscriptions')
    .upsert(subscriptions, { onConflict: 'id' })

  if (subError) {
    if (subError.message.includes('does not exist')) {
      console.log('⚠️  student_subscriptions table does not exist - please run SQL migration first')
    } else {
      console.log('Subscription error:', subError.message)
    }
  } else {
    console.log(`✅ ${subscriptions.length} subscriptions created`)
  }

  // 2. Seed student_services (서비스 소속)
  console.log('📋 Seeding student_services...')
  const services = []
  students.forEach((s, i) => {
    // 모든 학생에게 학원 서비스
    services.push({ org_id: orgId, student_id: s.id, service_type: 'academy', is_active: true })
    // 일부 학생에게 독서실 서비스
    if (i % 2 === 0) {
      services.push({ org_id: orgId, student_id: s.id, service_type: 'reading_room', is_active: true })
    }
    // 일부 학생에게 공부방 서비스
    if (i % 3 === 0) {
      services.push({ org_id: orgId, student_id: s.id, service_type: 'study_room', is_active: true })
    }
  })

  const { error: svcError } = await supabase
    .from('student_services')
    .upsert(services, { onConflict: 'org_id,student_id,service_type', ignoreDuplicates: true })

  if (svcError) {
    if (svcError.message.includes('does not exist')) {
      console.log('⚠️  student_services table does not exist - please run SQL migration first')
    } else {
      console.log('Services error:', svcError.message)
    }
  } else {
    console.log(`✅ ${services.length} services created`)
  }

  // 3. Seed enrollments (수업 등록)
  if (classes && classes.length > 0) {
    console.log('📋 Seeding enrollments...')
    const enrollments = []
    students.slice(0, 5).forEach((s, i) => {
      // 각 학생에게 1-2개의 수업 등록
      const classCount = (i % 2) + 1
      for (let j = 0; j < classCount && j < classes.length; j++) {
        enrollments.push({
          org_id: orgId,
          student_id: s.id,
          class_id: classes[j].id,
          status: 'active',
          teacher_id: teachers && teachers.length > 0 ? teachers[j % teachers.length]?.id : null
        })
      }
    })

    const { error: enrollError } = await supabase
      .from('enrollments')
      .upsert(enrollments, { onConflict: 'org_id,student_id,class_id', ignoreDuplicates: true })

    if (enrollError) {
      if (enrollError.message.includes('does not exist')) {
        console.log('⚠️  enrollments table does not exist - please run SQL migration first')
      } else {
        console.log('Enrollments error:', enrollError.message)
      }
    } else {
      console.log(`✅ ${enrollments.length} enrollments created`)
    }
  } else {
    console.log('⚠️  No classes found, skipping enrollments')
  }

  console.log('\n✅ Seeding complete!')
}

migrate().catch(console.error)
