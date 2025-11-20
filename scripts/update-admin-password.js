#!/usr/bin/env node
/**
 * Update Admin User Password
 * This script updates admin@goldpen.kr password to: 12345678
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vdxxzygqjjjptzlvgrtw.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkeHh6eWdxampqcHR6bHZncnR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU4OTY2NCwiZXhwIjoyMDc5MTY1NjY0fQ.ZDMtIX7YzHvJxBEpD2ZZ2grAXTBPMPkQUT362hq6M1o';

const ADMIN_EMAIL = 'admin@goldpen.kr';
const NEW_PASSWORD = '12345678';

async function main() {
  console.log('🔐 Updating admin password...\n');

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Get user by email
    console.log('🔍 Finding user:', ADMIN_EMAIL);

    const { data: userData, error: getUserError } = await supabase.auth.admin.listUsers();

    if (getUserError) {
      throw getUserError;
    }

    const user = userData.users.find(u => u.email === ADMIN_EMAIL);

    if (!user) {
      throw new Error(`User ${ADMIN_EMAIL} not found`);
    }

    console.log('✅ Found user:', user.id);

    // Update password
    console.log('🔄 Updating password...');

    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: NEW_PASSWORD }
    );

    if (updateError) {
      throw updateError;
    }

    console.log('✅ Password updated successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Updated Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    ', ADMIN_EMAIL);
    console.log('Password: ', NEW_PASSWORD);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🌐 Login at: http://localhost:8000\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
