# Twilio Video Calling Setup Guide

## Issues Fixed

The main error "Unexpected token '<', "<!DOCTYPE "... is not valid JSON" has been resolved by:

1. **Fixed API Route Structure**: Moved API routes to correct Next.js 13+ app directory structure (`app/api/token/route.js` and `app/api/create-room/route.js`)
2. **Installed Missing Dependencies**: Added `jsonwebtoken` package
3. **Fixed JWT Usage**: Corrected JWT signing syntax
4. **Added Error Handling**: Improved error handling in API calls
5. **Created Test Page**: Added `/test-api` page to verify API functionality
6. **Removed Agora**: Cleaned up all Agora-related code and dependencies

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in your project root with your Twilio credentials:

```env
# Twilio Video Credentials
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_API_KEY_SID=your_api_key_sid_here
TWILIO_API_SECRET=your_api_secret_here
```

### 2. Get Twilio Credentials

1. Go to [Twilio Console](https://console.twilio.com/)
2. Create a new project or use existing one
3. Go to "Account" → "API Keys & Tokens"
4. Create a new API Key and note down:
   - Account SID
   - Auth Token
   - API Key SID
   - API Secret

### 3. Test the Setup

1. Start your development server: `npm run dev`
2. Visit `/test-api` to test the API endpoints
3. Visit `/videocall` to test the video calling functionality

## Video Calling Features

### Twilio Video Implementation
- Uses the Twilio Video SDK for reliable video calling
- Supports multiple participants in a room
- Handles local and remote video tracks
- Includes proper error handling and cleanup

### Features:
- **Room Management**: Create and join video rooms
- **Participant Management**: See who's in the room
- **Video/Audio Tracks**: Automatic handling of camera and microphone
- **Error Handling**: Clear error messages for troubleshooting
- **Responsive UI**: Works on desktop and mobile devices

## API Endpoints

- `POST /api/token` - Generate Twilio access token for video calls
- `POST /api/create-room` - Create a new Twilio video room

## Usage

### Basic Video Call Flow:

1. **Enter Room Details**: Provide room name and your identity
2. **Join Call**: Click "Join Call" to connect to the video room
3. **Video Display**: Your video appears in the local video area
4. **Remote Participants**: Other participants' videos appear in the remote area
5. **Leave Call**: Click "Leave Call" to disconnect

### Room Management:

- **Room Names**: Use descriptive room names (e.g., "team-meeting", "client-call")
- **Identity**: Your display name in the video call
- **Permissions**: Ensure camera and microphone permissions are granted

## Troubleshooting

### Common Issues:

1. **"Unexpected token '<'" Error**: 
   - ✅ Fixed by correcting API route structure
   - Make sure you're using the correct API endpoints

2. **"Twilio credentials missing" Error**:
   - Add your Twilio credentials to `.env.local`
   - Restart the development server

3. **"Failed to connect" Error**:
   - Check camera/microphone permissions
   - Ensure you're using HTTPS in production
   - Verify your Twilio credentials are correct

4. **API Routes Not Found**:
   - Make sure you're using Next.js 13+ app directory structure
   - API routes should be in `app/api/[route-name]/route.js`

5. **No Video/Audio**:
   - Check browser permissions for camera and microphone
   - Ensure you're using HTTPS (required for Twilio Video)
   - Try refreshing the page and rejoining

## Next Steps

1. Add your Twilio credentials to `.env.local`
2. Test the API endpoints at `/test-api`
3. Test video calling at `/videocall`
4. Customize the UI and add more features as needed
5. Deploy to production with HTTPS for full functionality

## Dependencies

- `twilio-video`: Twilio Video SDK for React
- `twilio`: Twilio server SDK for API calls
- `jsonwebtoken`: For generating Twilio access tokens