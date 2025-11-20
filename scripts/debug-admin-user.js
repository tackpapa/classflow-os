#!/usr/bin/env node
/**
 * Debug Admin User
 * Check the current state of admin@goldpen.kr user
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vdxxzygqjjjptzlvgrtw.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkeHh6eWdxampqcHR6bHZncnR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU4OTY2NCwiZXhwIjoyMDc5MTY1NjY0fQ.ZDMtIX7YzHvJxBEpD2ZZ2grAXTBPMPkQUT362hq6M1o';

const ADMIN_EMAIL = 'admin@goldpen.kr';

async function main() {
  console.log('🔍 Debugging admin user...\n');

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Check Auth users
    console.log('1️⃣ Checking Auth users...');
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      throw authError;
    }

    const authUser = authData.users.find(u => u.email === ADMIN_EMAIL);

    if (authUser) {
      console.log('✅ Auth user found:');
      console.log('   ID:', authUser.id);
      console.log('   Email:', authUser.email);
      console.log('   Email Confirmed:', authUser.email_confirmed_at ? 'Yes' : 'No');
      console.log('   Created:', authUser.created_at);
      console.log('   Last Sign In:', authUser.last_sign_in_at || 'Never');
    } else {
      console.log('❌ Auth user NOT found');
    }

    // Check Database users
    console.log('\n2️⃣ Checking Database users...');
    const { data: dbUsers, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('email', ADMIN_EMAIL);

    if (dbError) {
      console.error('❌ Database error:', dbError);
    } else if (dbUsers && dbUsers.length > 0) {
      console.log('✅ Database user found:');
      console.log('   ID:', dbUsers[0].id);
      console.log('   Email:', dbUsers[0].email);
      console.log('   Name:', dbUsers[0].name);
      console.log('   Role:', dbUsers[0].role);
      console.log('   Org ID:', dbUsers[0].org_id);
    } else {
      console.log('❌ Database user NOT found');
    }

    // Check Organizations
    console.log('\n3️⃣ Checking Organizations...');
    const { data: orgs, error: orgError } = await supabase
      .from('organizations')
      .select('*');

    if (orgError) {
      console.error('❌ Organization error:', orgError);
    } else {
      console.log('✅ Organizations:', orgs.length);
      orgs.forEach(org => {
        console.log('   -', org.name, `(${org.id})`);
      });
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
