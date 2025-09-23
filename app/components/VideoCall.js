// components/VideoCall.js
import { useEffect, useRef, useState } from 'react';
import * as Video from 'twilio-video';

export default function VideoCall({ roomName, identity, onLeave }) {
  const [room, setRoom] = useState(null);
  const [participants, setParticipants] = useState([]);
  const localVideoRef = useRef();
  const remoteVideoContainerRef = useRef();

  useEffect(() => {
    const connectToRoom = async () => {
      try {
        // 1. Fetch Access Token from your API
        const response = await fetch('/api/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identity, room: roomName }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('API Error:', errorData);
          throw new Error(`API Error: ${response.status} - ${errorData}`);
        }

        const { token } = await response.json();

        if (!token) {
          throw new Error('Failed to get token');
        }

        // 2. Connect to Twilio Room
        const room = await Video.connect(token, {
          audio: true,
          video: { width: 640, height: 480 },
        });

        setRoom(room);

        // 3. Attach Local Video
        if (room.localParticipant.videoTracks.size > 0) {
          const track = Array.from(room.localParticipant.videoTracks.values())[0].track;
          localVideoRef.current.appendChild(track.attach());
        }

        // 4. Handle Remote Participants
        const participantConnected = (participant) => {
          setParticipants((prev) => [...prev, participant]);
          participant.on('trackSubscribed', track => {
            const videoElement = track.attach();
            remoteVideoContainerRef.current.appendChild(videoElement);
          });
        };

        const participantDisconnected = (participant) => {
          setParticipants((prev) => prev.filter(p => p !== participant));
          // Clean up video elements if needed
        };

        room.on('participantConnected', participantConnected);
        room.on('participantDisconnected', participantDisconnected);

        room.participants.forEach(participantConnected);

        // 5. Cleanup on unmount
        return () => {
          room.disconnect();
        };
      } catch (error) {
        console.error('Error connecting to room:', error);
      }
    };

    connectToRoom();
  }, [roomName, identity]);

  const leaveRoom = () => {
    if (room) {
      room.disconnect();
      setRoom(null);
      onLeave();
    }
  };

  return (
    <div>
      <h2>Room: {roomName}</h2>
      <div ref={localVideoRef} style={{ border: '2px solid blue', margin: '10px' }}></div>
      <div ref={remoteVideoContainerRef} style={{ display: 'flex', flexWrap: 'wrap' }}></div>
      <button onClick={leaveRoom}>Leave Room</button>
    </div>
  );
}