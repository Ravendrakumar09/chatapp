#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Twilio Video Calling Setup Helper\n');

const envPath = path.join(process.cwd(), '.env.local');

// Check if .env.local already exists
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file already exists');
  const content = fs.readFileSync(envPath, 'utf8');
  
  const hasAccountSid = content.includes('TWILIO_ACCOUNT_SID=');
  const hasApiKey = content.includes('TWILIO_API_KEY_SID=');
  const hasApiSecret = content.includes('TWILIO_API_SECRET=');
  
  console.log('📋 Current status:');
  console.log(`   TWILIO_ACCOUNT_SID: ${hasAccountSid ? '✅ Set' : '❌ Missing'}`);
  console.log(`   TWILIO_API_KEY_SID: ${hasApiKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   TWILIO_API_SECRET: ${hasApiSecret ? '✅ Set' : '❌ Missing'}`);
  
  if (hasAccountSid && hasApiKey && hasApiSecret) {
    console.log('\n🎉 All Twilio credentials are configured!');
    console.log('You can now test video calling at http://localhost:3000/videocall');
  } else {
    console.log('\n⚠️  Some credentials are missing. Please update your .env.local file.');
  }
} else {
  console.log('❌ .env.local file not found');
  console.log('\n📝 Creating .env.local template...');
  
  const template = `# Twilio Video Credentials
# Get these from https://console.twilio.com/
# Go to Account → API Keys & Tokens → Create API Key

TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_SECRET=your_api_secret_here
TWILIO_AUTH_TOKEN=your_auth_token_here

# Instructions:
# 1. Replace the placeholder values above with your actual Twilio credentials
# 2. Save this file
# 3. Restart your development server (npm run dev)
# 4. Test at http://localhost:3000/test-api
`;

  fs.writeFileSync(envPath, template);
  console.log('✅ Created .env.local template');
  console.log('\n📋 Next steps:');
  console.log('1. Go to https://console.twilio.com/');
  console.log('2. Create an API Key in Account → API Keys & Tokens');
  console.log('3. Update the values in .env.local');
  console.log('4. Restart your development server');
}

console.log('\n🔗 Useful links:');
console.log('   Twilio Console: https://console.twilio.com/');
console.log('   Test API: http://localhost:3000/test-api');
console.log('   Video Call: http://localhost:3000/videocall');
console.log('   Setup Guide: ./SETUP_GUIDE.md');
