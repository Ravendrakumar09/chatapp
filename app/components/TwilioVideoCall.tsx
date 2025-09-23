"use client";
import React, { useState, useEffect, useRef } from "react";
import * as Video from "twilio-video";

interface TwilioVideoCallProps {
  roomName: string;
  identity: string;
  onLeave?: () => void;
  onError?: (error: string) => void;
}

export default function TwilioVideoCall({ 
  roomName, 
  identity, 
  onLeave, 
  onError 
}: TwilioVideoCallProps) {
  const [room, setRoom] = useState<Video.Room | null>(null);
  const [participants, setParticipants] = useState<Video.RemoteParticipant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    connectToRoom();
    
    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [roomName, identity]);

  const connectToRoom = async () => {
    try {
      setError(null);
      
      // Fetch Access Token from API
      const response = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity, room: roomName }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorData}`);
      }

      const { token } = await response.json();

      if (!token) {
        throw new Error('Failed to get token');
      }

      // Connect to Twilio Room
      const newRoom = await Video.connect(token, {
        audio: true,
        video: { width: 640, height: 480 },
      });

      setRoom(newRoom);
      setIsConnected(true);

      // Attach Local Video
      if (newRoom.localParticipant.videoTracks.size > 0) {
        const track = Array.from(newRoom.localParticipant.videoTracks.values())[0].track;
        if (localVideoRef.current) {
          localVideoRef.current.appendChild(track.attach());
        }
      }

      // Handle Remote Participants
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
      const errorMessage = `Failed to connect: ${error.message}`;
      setError(errorMessage);
      onError?.(errorMessage);
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
      
      onLeave?.();
    }
  };

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p className="font-semibold">Connection Error:</p>
        <p>{error}</p>
        <button
          onClick={connectToRoom}
          className="mt-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-1 px-3 rounded text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-100 rounded-lg p-2">
          <h4 className="text-sm font-semibold mb-2">Your Video</h4>
          <div
            ref={localVideoRef}
            className="w-full aspect-video bg-gray-200 rounded flex items-center justify-center text-xs"
          >
            {!localVideoRef.current?.hasChildNodes() && "Loading..."}
          </div>
        </div>
        
        <div className="bg-gray-100 rounded-lg p-2">
          <h4 className="text-sm font-semibold mb-2">
            Remote Participants ({participants.length})
          </h4>
          <div
            ref={remoteVideoContainerRef}
            className="w-full aspect-video bg-gray-200 rounded flex items-center justify-center text-xs"
          >
            {participants.length === 0 && "Waiting for participants..."}
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={disconnectFromRoom}
          disabled={!isConnected}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded transition"
        >
          Leave Call
        </button>
      </div>
    </div>
  );
}
