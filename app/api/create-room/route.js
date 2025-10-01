// pages/api/create-room.js
import twilio from 'twilio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  const { roomName, type = 'go' } = req.body;

  if (!roomName) {
    return res.status(400).json({ error: 'roomName is required' });
  }

  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN // 👈 Note: this is AUTH_TOKEN, not API_SECRET
  );

  try {
    const room = await client.video.rooms.create({
      uniqueName: roomName,
      type: type, // 'peer-to-peer', 'group', or 'go'
      // Optional: recordParticipantsOnConnect: true,
      // Optional: maxParticipants: 4,
      // Optional: statusCallback: 'https://your-webhook-url.com/room-events'
    });

    res.status(200).json({ roomSid: room.sid, roomName: room.uniqueName });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
}