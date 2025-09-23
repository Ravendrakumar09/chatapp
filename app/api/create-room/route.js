import twilio from 'twilio';

export async function POST(request) {
  try {
    const { roomName } = await request.json();

    if (!roomName) {
      return Response.json({ error: 'roomName is required' }, { status: 400 });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      return Response.json({ error: 'Twilio credentials missing' }, { status: 500 });
    }

    const client = twilio(accountSid, authToken);

    const room = await client.video.rooms.create({
      uniqueName: roomName,
      type: 'go', // or 'peer-to-peer', 'group'
    });

    return Response.json({ room: room.sid });
  } catch (error) {
    console.error('Room creation error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
