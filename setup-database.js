#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🗄️ Database Setup for Video Call Notifications\n');

// Check if Supabase is configured
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found. Please run: npm run setup-env');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL=');
const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=');

if (!hasSupabaseUrl || !hasSupabaseKey) {
  console.log('❌ Supabase credentials not configured. Please add them to .env.local');
  process.exit(1);
}

console.log('✅ Supabase credentials found');

// Read the migration file
const migrationPath = path.join(process.cwd(), 'supabase/migrations/001_create_video_call_notifications.sql');
if (!fs.existsSync(migrationPath)) {
  console.log('❌ Migration file not found:', migrationPath);
  process.exit(1);
}

const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
console.log('✅ Migration file found');

console.log('\n📋 Database Setup Instructions:');
console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard');
console.log('2. Select your project');
console.log('3. Go to SQL Editor');
console.log('4. Copy and paste the following SQL:');
console.log('\n' + '='.repeat(60));
console.log(migrationSQL);
console.log('='.repeat(60));
console.log('\n5. Click "Run" to execute the SQL');
console.log('6. Verify the table was created in the Table Editor');

console.log('\n🔍 After running the SQL, you should see:');
console.log('- A new table called "video_call_notifications"');
console.log('- RLS policies enabled');
console.log('- Proper indexes created');

console.log('\n🧪 Test the setup:');
console.log('1. Visit: http://localhost:3000/test-supabase');
console.log('2. Check if database connection works');
console.log('3. Visit: http://localhost:3000/test-video-calls');
console.log('4. Test sending video call notifications');

console.log('\n📞 Video Call Flow:');
console.log('1. User A clicks video call button');
console.log('2. Notification is sent to User B');
console.log('3. User B sees incoming call popup');
console.log('4. User B accepts/rejects the call');
console.log('5. Both users join the same video room');
