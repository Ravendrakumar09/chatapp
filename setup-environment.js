#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Complete Environment Setup for Chat App\n');

const envPath = path.join(process.cwd(), '.env.local');

// Check if .env.local already exists
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file already exists');
  const content = fs.readFileSync(envPath, 'utf8');
  
  const hasSupabaseUrl = content.includes('NEXT_PUBLIC_SUPABASE_URL=');
  const hasSupabaseKey = content.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=');
  const hasTwilioAccountSid = content.includes('TWILIO_ACCOUNT_SID=');
  const hasTwilioApiKey = content.includes('TWILIO_API_KEY_SID=');
  const hasTwilioApiSecret = content.includes('TWILIO_API_SECRET=');
  const hasTwilioAuthToken = content.includes('TWILIO_AUTH_TOKEN=');
  
  console.log('📋 Current status:');
  console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${hasSupabaseUrl ? '✅ Set' : '❌ Missing'}`);
  console.log(`   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${hasSupabaseKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   TWILIO_ACCOUNT_SID: ${hasTwilioAccountSid ? '✅ Set' : '❌ Missing'}`);
  console.log(`   TWILIO_API_KEY_SID: ${hasTwilioApiKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   TWILIO_API_SECRET: ${hasTwilioApiSecret ? '✅ Set' : '❌ Missing'}`);
  console.log(`   TWILIO_AUTH_TOKEN: ${hasTwilioAuthToken ? '✅ Set' : '❌ Missing'}`);
  
  if (hasSupabaseUrl && hasSupabaseKey && hasTwilioAccountSid && hasTwilioApiKey && hasTwilioApiSecret && hasTwilioAuthToken) {
    console.log('\n🎉 All credentials are configured!');
    console.log('You can now test the app at http://localhost:3000');
  } else {
    console.log('\n⚠️  Some credentials are missing. Please update your .env.local file.');
  }
} else {
  console.log('❌ .env.local file not found');
  console.log('\n📝 Creating .env.local template...');
  
  const template = `# Supabase Configuration
# Get these from https://supabase.com/dashboard
# Go to your project → Settings → API

NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Twilio Video Credentials
# Get these from https://console.twilio.com/
# Go to Account → API Keys & Tokens → Create API Key

TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_SECRET=your_api_secret_here

# Instructions:
# 1. Replace the placeholder values above with your actual credentials
# 2. Save this file
# 3. Restart your development server (npm run dev)
# 4. Test at http://localhost:3000
`;

  fs.writeFileSync(envPath, template);
  console.log('✅ Created .env.local template');
  console.log('\n📋 Next steps:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Create a new project or use existing one');
  console.log('3. Get your project URL and anon key from Settings → API');
  console.log('4. Go to https://console.twilio.com/');
  console.log('5. Create an API Key in Account → API Keys & Tokens');
  console.log('6. Update the values in .env.local');
  console.log('7. Restart your development server');
}

console.log('\n🔗 Useful links:');
console.log('   Supabase Dashboard: https://supabase.com/dashboard');
console.log('   Twilio Console: https://console.twilio.com/');
console.log('   Test App: http://localhost:3000');
console.log('   Setup Guide: ./VIDEO_CALLING_SETUP_COMPLETE.md');

console.log('\n🚨 IMPORTANT: The "Failed to fetch" error is caused by missing Supabase credentials.');
console.log('   Make sure to add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local');
