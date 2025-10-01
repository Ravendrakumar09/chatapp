# Troubleshooting Guide

## 🚨 "Failed to fetch" Error

This error occurs when Supabase credentials are not properly configured. Here's how to fix it:

### 1. Check Environment Variables

Run the environment setup script:
```bash
npm run setup-env
```

This will create a `.env.local` file with the required template.

### 2. Add Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy your Project URL and anon/public key
5. Add them to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Test Supabase Connection

Visit `http://localhost:3000/test-supabase` to test your connection.

### 4. Restart Development Server

After adding environment variables:
```bash
npm run dev
```

## 🔧 Common Issues and Solutions

### Issue: "Supabase credentials not configured"
**Solution:** Add the required environment variables to `.env.local`

### Issue: "Failed to fetch" in browser console
**Causes:**
- Missing Supabase URL or key
- Incorrect Supabase credentials
- Supabase project is paused
- Network connectivity issues

**Solutions:**
1. Verify credentials in `.env.local`
2. Check Supabase project status
3. Test internet connection
4. Check browser console for CORS errors

### Issue: Video calls not working
**Causes:**
- Missing Twilio credentials
- Supabase notifications not working
- Database table not created

**Solutions:**
1. Add Twilio credentials to `.env.local`
2. Run database migration for video call notifications
3. Test Supabase connection

### Issue: Real-time features not working
**Causes:**
- Supabase real-time not enabled
- Database RLS policies blocking access
- Network issues

**Solutions:**
1. Enable real-time in Supabase dashboard
2. Check RLS policies
3. Test real-time connection at `/test-supabase`

## 🛠️ Debug Steps

### 1. Check Environment Variables
```bash
# Check if .env.local exists
ls -la .env.local

# Check if variables are loaded (in browser console)
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
```

### 2. Test Supabase Connection
Visit `http://localhost:3000/test-supabase` and check:
- Environment variables status
- Database connection
- Authentication
- Real-time connection

### 3. Check Browser Console
Look for:
- Network errors
- CORS errors
- JavaScript errors
- Supabase-specific errors

### 4. Check Supabase Dashboard
- Project is not paused
- Real-time is enabled
- Database tables exist
- RLS policies are correct

## 📋 Required Environment Variables

### Supabase (Required for basic functionality)
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Twilio (Required for video calls)
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_SECRET=your_api_secret_here
```

## 🔍 Testing Checklist

- [ ] Environment variables are set
- [ ] Supabase connection works (`/test-supabase`)
- [ ] Database tables exist
- [ ] Real-time subscriptions work
- [ ] Video call notifications work
- [ ] Twilio video calls work

## 🆘 Still Having Issues?

1. **Check the console** for specific error messages
2. **Visit `/test-supabase`** to diagnose Supabase issues
3. **Check Supabase logs** in the dashboard
4. **Verify all credentials** are correct
5. **Restart the development server** after making changes

## 📞 Quick Fix Commands

```bash
# Setup environment
npm run setup-env

# Test Supabase
npm run test-supabase

# Restart development server
npm run dev

# Check for linting errors
npm run lint
```

## 🎯 Expected Behavior

Once properly configured:
- App loads without console errors
- Users can register/login
- Chat messages work
- Video call notifications work
- Video calls connect properly
- Real-time features work

If any of these don't work, follow the troubleshooting steps above.
