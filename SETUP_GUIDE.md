# Twilio Video Calling Setup Guide

## Quick Start

### 1. Get Twilio Credentials

1. Go to [Twilio Console](https://console.twilio.com/)
2. Sign up or log in to your account
3. Go to **Account** → **API Keys & Tokens**
4. Click **Create API Key**
5. Give it a name (e.g., "Video App")
6. Note down these values:
   - **Account SID** (starts with `AC...`)
   - **API Key SID** (starts with `SK...`)
   - **API Secret** (long random string)

### 2. Create Environment File

Create a `.env.local` file in your project root:

```env
# Twilio Video Credentials
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_KEY_SID=SKxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_API_SECRET=your_api_secret_here
TWILIO_AUTH_TOKEN=your_auth_token_here
```

### 3. Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Test the API endpoints:
   - Visit `/test-api` to test token generation
   - Visit `/videocall` to test video calling

## Troubleshooting

### Error: "Twilio credentials missing"
- Make sure `.env.local` exists in your project root
- Check that all environment variables are set correctly
- Restart your development server after adding environment variables

### Error: "Invalid Access Token"
- Verify your Twilio credentials are correct
- Make sure you're using the API Key SID (starts with `SK`) not the Account SID
- Check that the API Secret matches the one from Twilio Console

### Error: "Failed to connect"
- Ensure camera and microphone permissions are granted
- For production, use HTTPS (required by Twilio Video)
- Check browser console for detailed error messages

## Development vs Production

### Development
- Works with HTTP on localhost
- Uses test credentials
- Good for testing and development

### Production
- Requires HTTPS
- Use production Twilio credentials
- Deploy to platforms like Vercel, Netlify, or your own server

## API Endpoints

- `POST /api/token` - Generate Twilio access token
- `POST /api/create-room` - Create a new video room

## Video Calling Features

- **Room Management**: Create and join video rooms
- **Multi-participant**: Support for multiple users in a room
- **Audio/Video**: Camera and microphone support
- **Error Handling**: Clear error messages and retry functionality
- **Responsive UI**: Works on desktop and mobile

## Next Steps

1. Set up your Twilio credentials
2. Test the video calling functionality
3. Customize the UI and add more features
4. Deploy to production with HTTPS
