// components/VideoCallRoom.js
'use client'; // if using Next.js 13+ app router

import { useEffect, useRef, useState } from 'react';
import * as Video from 'twilio-video';

export default function VideoCallRoom({ roomName, identity, onLeave }) {
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState([]);
  const localVideoRef = useRef();
  const remoteVideosRef = useRef();

  useEffect(() => {
    let room;

    const connect = async () => {
      try {
        // 1. Get Access Token from your API
        const response = await fetch('/api/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identity, room: roomName }),
        });

        if (!response.ok) throw new Error('Failed to get token');
        const { token } = await response.json();

        // 2. Connect to Room
        room = await Video.connect(token, {
          audio: true,
          video: { width: 640, height: 480 },
        });

        setIsConnected(true);

        // 3. Show Local Video
        room.localParticipant.videoTracks.forEach((track) => {
          const el = track.track.attach();
          localVideoRef.current.appendChild(el);
        });

        // 4. Show Remote Participants
        const addParticipant = (participant) => {
          setParticipants((prev) => [...prev, participant]);

          participant.on('trackSubscribed', (track) => {
            const el = track.attach();
            remoteVideosRef.current.appendChild(el);
          });

          participant.on('trackUnsubscribed', (track) => {
            track.detach().forEach(el => el.remove());
          });
        };

        room.participants.forEach(addParticipant);
        room.on('participantConnected', addParticipant);

        room.on('participantDisconnected', (participant) => {
          setParticipants((prev) => prev.filter(p => p !== participant));
          // Clean up video elements if needed
        });

      } catch (err) {
        console.error('Connection failed:', err);
        alert('Failed to join call');
      }
    };

    connect();

    // Cleanup on unmount
    return () => {
      if (room) {
        room.disconnect();
        setIsConnected(false);
      }
    };
  }, [roomName, identity]);

  return (
    <div style={{ padding: '20px', background: '#f0f0f0' }}>
      <h2>Room: {roomName}</h2>
      <h3>You ({identity})</h3>
      <div
        ref={localVideoRef}
        style={{
          width: '320px',
          height: '240px',
          border: '3px solid blue',
          margin: '10px',
          background: '#000',
        }}
      ></div>

      <h3>Others ({participants.length})</h3>
      <div
        ref={remoteVideosRef}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      ></div>

      <button onClick={onLeave} style={{ marginTop: '20px', padding: '10px 20px' }}>
        Leave Call
      </button>
    </div>
  );
}