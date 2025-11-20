#!/usr/bin/env node
/**
 * Create Admin User in Supabase Auth & Database
 * This script creates admin@goldpen.kr user with password: goldpen2024!
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vdxxzygqjjjptzlvgrtw.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkeHh6eWdxampqcHR6bHZncnR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU4OTY2NCwiZXhwIjoyMDc5MTY1NjY0fQ.ZDMtIX7YzHvJxBEpD2ZZ2grAXTBPMPkQUT362hq6M1o';

// Admin user details
const ADMIN_EMAIL = 'admin@goldpen.kr';
const ADMIN_PASSWORD = 'goldpen2024!';
const ADMIN_USER_ID = 'e9f6b5e9-da82-4409-8e07-1fd194273a33';
const ORG_ID = '3d82170f-5cb8-4625-8be2-9ddd9d5ba0f3';

async function main() {
  console.log('🚀 Creating admin user in Supabase...\n');

  // Create Supabase Admin Client (using service role key)
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Step 1: Create user in Supabase Auth
    console.log('📧 Creating Auth user:', ADMIN_EMAIL);

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        name: 'GoldPen Admin',
        role: 'owner'
      }
    });

    if (authError) {
      // Check if user already exists
      if (authError.message.includes('already registered')) {
        console.log('⚠️  Auth user already exists, updating...');

        // Get existing user
        const { data: userData, error: getUserError } = await supabase.auth.admin.listUsers();
        if (getUserError) {
          throw getUserError;
        }

        const existingUser = userData.users.find(u => u.email === ADMIN_EMAIL);
        if (existingUser) {
          // Update password
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { password: ADMIN_PASSWORD }
          );
          if (updateError) {
            throw updateError;
          }
          console.log('✅ Updated existing auth user');
          authData.user = existingUser;
        }
      } else {
        throw authError;
      }
    } else {
      console.log('✅ Auth user created successfully');
    }

    const authUserId = authData?.user?.id || ADMIN_USER_ID;
    console.log('   User ID:', authUserId);

    // Step 2: Create/Update organization
    console.log('\n🏢 Setting up organization...');

    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .upsert({
        id: ORG_ID,
        name: '골드펜 테스트 학원',
        type: 'academy',
        owner_id: authUserId,
        settings: {}
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (orgError) {
      console.error('❌ Organization error:', orgError);
    } else {
      console.log('✅ Organization ready:', orgData.name);
    }

    // Step 3: Create/Update user profile in database
    console.log('\n👤 Creating user profile...');

    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        id: authUserId,
        org_id: ORG_ID,
        role: 'owner',
        name: 'GoldPen Admin',
        email: ADMIN_EMAIL,
        phone: '010-1234-5678'
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (userError) {
      console.error('❌ User profile error:', userError);
      throw userError;
    }

    console.log('✅ User profile created successfully');

    // Step 4: Verify everything
    console.log('\n🔍 Verifying setup...');

    const { data: verifyData, error: verifyError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        role,
        organizations:org_id (
          id,
          name,
          type
        )
      `)
      .eq('email', ADMIN_EMAIL)
      .single();

    if (verifyError) {
      throw verifyError;
    }

    console.log('\n✅ Setup Complete!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:        ', ADMIN_EMAIL);
    console.log('Password:     ', ADMIN_PASSWORD);
    console.log('Role:         ', verifyData.role);
    console.log('Organization: ', verifyData.organizations?.name);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🌐 You can now login at: http://localhost:8000\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
