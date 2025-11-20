#!/usr/bin/env node
/**
 * Supabase Production Migration Script
 * This script executes the SQL migration file on production Supabase
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const SUPABASE_URL = 'https://vdxxzygqjjjptzlvgrtw.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkeHh6eWdxampqcHR6bHZncnR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzU4OTY2NCwiZXhwIjoyMDc5MTY1NjY0fQ.ZDMtIX7YzHvJxBEpD2ZZ2grAXTBPMPkQUT362hq6M1o';

async function executeSql(sql) {
  return new Promise((resolve, reject) => {
    const url = new URL('/rest/v1/rpc/exec_sql', SUPABASE_URL);

    const postData = JSON.stringify({ query: sql });

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('🚀 Starting Supabase Production Migration...\n');

  // Read SQL file
  const sqlPath = path.join(__dirname, '../backups/supabase_ready.sql');
  console.log(`📄 Reading SQL file: ${sqlPath}`);

  if (!fs.existsSync(sqlPath)) {
    console.error('❌ SQL file not found:', sqlPath);
    process.exit(1);
  }

  const sqlContent = fs.readFileSync(sqlPath, 'utf8');
  console.log(`✅ SQL file loaded (${sqlContent.length} characters)\n`);

  console.log('⚠️  WARNING: This will execute SQL on PRODUCTION database!');
  console.log('Database:', SUPABASE_URL);
  console.log('\n⏳ Executing SQL via Supabase REST API...\n');

  try {
    const result = await executeSql(sqlContent);
    console.log('✅ Migration completed successfully!');
    console.log('Result:', result);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

main();
