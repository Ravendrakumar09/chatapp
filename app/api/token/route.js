import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const { identity, room } = await request.json();

    if (!identity || !room) {
      return Response.json({ error: 'identity and room are required' }, { status: 400 });
    }

    // Your Twilio credentials (store in .env.local)
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const apiKey = process.env.TWILIO_API_KEY_SID;
    const apiSecret = process.env.TWILIO_API_SECRET;

    console.log('Twilio credentials check:', {
      accountSid: accountSid ? 'SET' : 'NOT SET',
      apiKey: apiKey ? 'SET' : 'NOT SET',
      apiSecret: apiSecret ? 'SET' : 'NOT SET'
    });

    if (!accountSid || !apiKey || !apiSecret) {
      return Response.json({ 
        error: 'Twilio credentials missing. Please set TWILIO_ACCOUNT_SID, TWILIO_API_KEY_SID, and TWILIO_API_SECRET in .env.local',
        setupInstructions: {
          step1: 'Go to https://console.twilio.com/',
          step2: 'Create an API Key in Account → API Keys & Tokens',
          step3: 'Add credentials to .env.local file',
          step4: 'Restart your development server'
        }
      }, { status: 500 });
    }

    // Create an access token with proper Twilio format
    const now = Math.floor(Date.now() / 1000);
    
    const token = jwt.sign(
      {
        jti: `${apiKey}-${now}`,
        iss: apiKey,
        sub: accountSid,
        iat: now,
        nbf: now,
        exp: now + 3600, // 1 hour
        grants: {
          identity: identity,
          video: {
            room: room,
          },
        },
      },
      apiSecret,
      {
        algorithm: 'HS256',
        header: {
          cty: 'twilio-fpa;v=1',
          typ: 'JWT'
        }
      }
    );

    return Response.json({ token });
  } catch (error) {
    console.error('Token generation error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}