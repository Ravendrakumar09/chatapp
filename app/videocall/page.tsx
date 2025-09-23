"use client";
import React, { useState, useEffect, useRef } from "react";
import * as Video from "twilio-video";

export default function CallPage() {
  const [room, setRoom] = useState<Video.Room | null>(null);
  const [participants, setParticipants] = useState<Video.RemoteParticipant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roomName, setRoomName] = useState("test-room");
  const [identity, setIdentity] = useState("user-" + Math.random().toString(36).substr(2, 9));
  
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [room]);

  const connectToRoom = async () => {
    try {
      setError(null);
      
      // 1. Fetch Access Token from your API
      const response = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity, room: roomName }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        let errorMessage = `API Error: ${response.status} - ${errorData}`;
        
        try {
          const parsedError = JSON.parse(errorData);
          if (parsedError.setupInstructions) {
            errorMessage = `${parsedError.error}\n\nSetup Instructions:\n1. ${parsedError.setupInstructions.step1}\n2. ${parsedError.setupInstructions.step2}\n3. ${parsedError.setupInstructions.step3}\n4. ${parsedError.setupInstructions.step4}`;
          }
        } catch (e) {
          // Use original error message if parsing fails
        }
        
        throw new Error(errorMessage);
      }

      const { token } = await response.json();

      if (!token) {
        throw new Error('Failed to get token');
      }

      console.log('Generated token:', token);

      // 2. Connect to Twilio Room
      const newRoom = await Video.connect(token, {
        audio: true,
        video: { width: 640, height: 480 },
      });

      setRoom(newRoom);
      setIsConnected(true);

      // 3. Attach Local Video
      if (newRoom.localParticipant.videoTracks.size > 0) {
        const track = Array.from(newRoom.localParticipant.videoTracks.values())[0].track;
        if (localVideoRef.current) {
          localVideoRef.current.appendChild(track.attach());
        }
      }

      // 4. Handle Remote Participants
      const participantConnected = (participant: Video.RemoteParticipant) => {
        setParticipants(prev => [...prev, participant]);
        
        participant.on('trackSubscribed', (track: Video.RemoteTrack) => {
          if (track.kind === 'video' && remoteVideoContainerRef.current) {
            const videoElement = track.attach();
            remoteVideoContainerRef.current.appendChild(videoElement);
          }
        });

        participant.on('trackUnsubscribed', (track: Video.RemoteTrack) => {
          track.detach().forEach(element => element.remove());
        });
      };

      const participantDisconnected = (participant: Video.RemoteParticipant) => {
        setParticipants(prev => prev.filter(p => p !== participant));
      };

      newRoom.on('participantConnected', participantConnected);
      newRoom.on('participantDisconnected', participantDisconnected);

      // Handle existing participants
      newRoom.participants.forEach(participantConnected);

    } catch (error: any) {
      console.error('Error connecting to room:', error);
      setError(`Failed to connect: ${error.message}`);
    }
  };

  const disconnectFromRoom = () => {
    if (room) {
      room.disconnect();
      setRoom(null);
      setIsConnected(false);
      setParticipants([]);
      setError(null);
      
      // Clean up video elements
      if (localVideoRef.current) {
        localVideoRef.current.innerHTML = "";
      }
      if (remoteVideoContainerRef.current) {
        remoteVideoContainerRef.current.innerHTML = "";
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Twilio Video Call</h1>

      {error && (
        <div className="bg-red-600 text-white p-4 rounded-lg mb-4 max-w-md">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {!isConnected && (
        <div className="bg-white text-gray-900 p-6 rounded-lg mb-6 max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4">Join Video Call</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Room Name:</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter room name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Your Name:</label>
              <input
                type="text"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your name"
              />
            </div>
            <button
              onClick={connectToRoom}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
            >
              Join Call
            </button>
          </div>
        </div>
      )}

      {isConnected && (
        <div className="w-full max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">Your Video</h3>
              <div
                ref={localVideoRef}
                className="w-full aspect-video bg-gray-700 rounded-lg flex items-center justify-center text-sm"
              >
                {!localVideoRef.current?.hasChildNodes() && "Loading your video..."}
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-2">
                Remote Participants ({participants.length})
              </h3>
              <div
                ref={remoteVideoContainerRef}
                className="w-full aspect-video bg-gray-700 rounded-lg flex items-center justify-center text-sm"
              >
                {participants.length === 0 && "Waiting for other participants..."}
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={disconnectFromRoom}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded transition"
            >
              Leave Call
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 text-sm text-gray-400 max-w-2xl text-center">
        <p>
          <strong>Note:</strong> This demo uses Twilio Video SDK. Make sure you have:
        </p>
        <ul className="mt-2 text-left">
          <li>• Camera and microphone permissions enabled</li>
          <li>• Twilio credentials configured in .env.local</li>
          <li>• HTTPS connection for production use</li>
        </ul>
      </div>
    </div>
  );
}
