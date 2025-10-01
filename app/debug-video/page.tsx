"use client";
import { useState, useRef, useEffect } from "react";
import { useVideoCall } from "@/app/hooks/useVideoCall";
import { generateUniqueIdentity } from "@/app/utils/identityGenerator";

export default function DebugVideoPage() {
  const [roomName, setRoomName] = useState("debug-room-123");
  const [identity, setIdentity] = useState(`debug-user-${Date.now()}`);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const {
    isConnected: videoConnected,
    isConnecting,
    participants,
    error,
    connectToRoom,
    disconnectFromRoom,
    localVideoTrack,
    localAudioTrack,
    isVideoEnabled,
    isAudioEnabled,
  } = useVideoCall();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoContainerRef = useRef<HTMLDivElement>(null);

  const addDebugInfo = (message: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Handle local video track
  useEffect(() => {
    if (localVideoTrack && localVideoRef.current) {
      addDebugInfo(`Local video track received: ${localVideoTrack.mediaStreamTrack.id}`);
      const videoElement = localVideoRef.current;
      videoElement.srcObject = new MediaStream([localVideoTrack.mediaStreamTrack]);
      videoElement.play().catch(err => addDebugInfo(`Video play error: ${err.message}`));
    }
  }, [localVideoTrack]);

  // Handle remote participants
  useEffect(() => {
    if (participants.length > 0) {
      addDebugInfo(`Remote participants: ${participants.length}`);
      participants.forEach((participant, index) => {
        addDebugInfo(`Participant ${index + 1}: ${participant.identity}`);
        addDebugInfo(`Video tracks: ${participant.videoTracks.size}`);
        addDebugInfo(`Audio tracks: ${participant.audioTracks.size}`);
      });
    }
  }, [participants]);

  // Handle connection status
  useEffect(() => {
    if (videoConnected && !isConnected) {
      addDebugInfo("✅ Connected to video room");
      setIsConnected(true);
    } else if (!videoConnected && isConnected) {
      addDebugInfo("❌ Disconnected from video room");
      setIsConnected(false);
    }
  }, [videoConnected, isConnected]);

  const handleConnect = async () => {
    addDebugInfo(`Attempting to connect to room: ${roomName} as ${identity}`);
    try {
      await connectToRoom(roomName, identity);
    } catch (err: any) {
      addDebugInfo(`Connection error: ${err.message}`);
    }
  };

  const handleDisconnect = () => {
    addDebugInfo("Disconnecting from room");
    disconnectFromRoom();
  };

  const clearDebug = () => {
    setDebugInfo([]);
  };

  const generateNewIdentity = () => {
    const newIdentity = generateUniqueIdentity('debug-user');
    setIdentity(newIdentity);
    addDebugInfo(`Generated new identity: ${newIdentity}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Video Call Debug</h1>
        
        {/* Connection Controls */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Room Name:</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Identity:</label>
              <input
                type="text"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleConnect}
              disabled={isConnecting || videoConnected}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </button>
            <button
              onClick={handleDisconnect}
              disabled={!videoConnected}
              className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
            >
              Disconnect
            </button>
            <button
              onClick={clearDebug}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Clear Debug
            </button>
            <button
              onClick={generateNewIdentity}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
            >
              New Identity
            </button>
          </div>
        </div>

        {/* Video Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Local Video */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Local Video</h3>
            <div className="relative bg-gray-800 rounded-lg overflow-hidden h-64">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
              {!localVideoTrack && (
                <div className="absolute inset-0 bg-gray-700 flex items-center justify-center text-white">
                  No local video
                </div>
              )}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <p>Video Track: {localVideoTrack ? '✅' : '❌'}</p>
              <p>Audio Track: {localAudioTrack ? '✅' : '❌'}</p>
              <p>Video Enabled: {isVideoEnabled ? '✅' : '❌'}</p>
              <p>Audio Enabled: {isAudioEnabled ? '✅' : '❌'}</p>
            </div>
          </div>

          {/* Remote Video */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Remote Video</h3>
            <div className="relative bg-gray-800 rounded-lg overflow-hidden h-64">
              <div
                ref={remoteVideoContainerRef}
                className="w-full h-full flex items-center justify-center"
              >
                {participants.length === 0 ? (
                  <div className="text-white">No remote participants</div>
                ) : (
                  <div className="text-white">Remote video should appear here</div>
                )}
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <p>Participants: {participants.length}</p>
              <p>Status: {videoConnected ? 'Connected' : 'Disconnected'}</p>
            </div>
          </div>
        </div>

        {/* Debug Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Debug Information</h3>
          <div className="bg-gray-100 p-4 rounded h-64 overflow-y-auto">
            {debugInfo.length === 0 ? (
              <p className="text-gray-500">No debug information yet</p>
            ) : (
              debugInfo.map((info, index) => (
                <div key={index} className="text-sm font-mono mb-1">
                  {info}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Debug Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Make sure Supabase is configured (visit /test-supabase first)</li>
            <li>Make sure Twilio credentials are configured</li>
            <li>Click "Connect" to join the video room</li>
            <li>Check if local video appears</li>
            <li>Open another browser tab/window with different identity</li>
            <li>Connect to the same room from the second tab</li>
            <li>Check if remote video appears in both tabs</li>
            <li>Monitor debug information for any errors</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
