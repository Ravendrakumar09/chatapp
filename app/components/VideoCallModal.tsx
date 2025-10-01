'use client';
import React, { useRef, useEffect } from 'react';
import { useVideoCall } from '@/app/hooks/useVideoCall';
import { IoClose, IoVideocam, IoVideocamOff, IoMic, IoMicOff, IoCall } from 'react-icons/io5';
import * as Video from 'twilio-video';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  identity: string;
  participantName: string;
  onCallEnd?: () => void;
}

export default function VideoCallModal({
  isOpen,
  onClose,
  roomName,
  identity,
  participantName,
  onCallEnd,
}: VideoCallModalProps) {
  const {
    isConnected,
    isConnecting,
    participants,
    error,
    connectToRoom,
    disconnectFromRoom,
    toggleVideo,
    toggleAudio,
    isVideoEnabled,
    isAudioEnabled,
    localVideoTrack,
    localAudioTrack,
  } = useVideoCall();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoContainerRef = useRef<HTMLDivElement>(null);

  // Handle local video track
  useEffect(() => {
    if (localVideoTrack && localVideoRef.current) {
      const videoElement = localVideoRef.current;
      videoElement.srcObject = new MediaStream([localVideoTrack.mediaStreamTrack]);
      videoElement.play().catch(console.error);
    }
  }, [localVideoTrack]);

  // Handle remote video tracks
  useEffect(() => {
    if (participants.length > 0 && remoteVideoContainerRef.current) {
      // Clear existing remote videos
      remoteVideoContainerRef.current.innerHTML = '';
      
      participants.forEach(participant => {
        participant.videoTracks.forEach(publication => {
          if (publication.track) {
            const videoElement = publication.track.attach();
            remoteVideoContainerRef.current?.appendChild(videoElement);
          }
        });
      });
    }
  }, [participants]);

  useEffect(() => {
    if (isOpen && roomName && identity) {
      connectToRoom(roomName, identity);
    }
  }, [isOpen, roomName, identity, connectToRoom]);

  useEffect(() => {
    if (!isOpen) {
      disconnectFromRoom();
    }
  }, [isOpen, disconnectFromRoom]);

  const handleEndCall = () => {
    disconnectFromRoom();
    onCallEnd?.();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-6xl bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gray-800 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <h2 className="text-lg font-semibold">
              Video Call with {participantName}
            </h2>
          </div>
          <button
            onClick={handleEndCall}
            className="text-gray-300 hover:text-white transition-colors"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* Video Area */}
        <div className="relative bg-black">
          {error && (
            <div className="absolute top-4 left-4 right-4 bg-red-600 text-white p-3 rounded-lg z-10">
              <p className="font-semibold">Connection Error:</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {isConnecting && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p>Connecting to video call...</p>
              </div>
            </div>
          )}

          {isConnected && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 h-96 lg:h-[500px]">
              {/* Local Video */}
              <div className="relative bg-gray-800 rounded-lg overflow-hidden">
                <div className="absolute top-2 left-2 z-10">
                  <span className="bg-black/50 text-white text-xs px-2 py-1 rounded">
                    You {!isVideoEnabled && '(Video Off)'}
                  </span>
                </div>
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
                {!isVideoEnabled && (
                  <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                    <IoVideocamOff size={48} className="text-gray-400" />
                  </div>
                )}
              </div>

              {/* Remote Video */}
              <div className="relative bg-gray-800 rounded-lg overflow-hidden">
                <div className="absolute top-2 left-2 z-10">
                  <span className="bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {participantName} ({participants.length} participant{participants.length !== 1 ? 's' : ''})
                  </span>
                </div>
                <div
                  ref={remoteVideoContainerRef}
                  className="w-full h-full flex items-center justify-center"
                >
                  {participants.length === 0 ? (
                    <div className="text-center text-gray-400">
                      <IoVideocam size={48} className="mx-auto mb-2" />
                      <p>Waiting for {participantName} to join...</p>
                    </div>
                  ) : (
                    <div className="w-full h-full"></div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Controls */}
          {isConnected && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center space-x-4 bg-black/50 rounded-full px-6 py-3">
                <button
                  onClick={toggleAudio}
                  className={`p-3 rounded-full transition-colors ${
                    isAudioEnabled
                      ? 'bg-gray-600 hover:bg-gray-500 text-white'
                      : 'bg-red-600 hover:bg-red-500 text-white'
                  }`}
                >
                  {isAudioEnabled ? <IoMic size={20} /> : <IoMicOff size={20} />}
                </button>

                <button
                  onClick={toggleVideo}
                  className={`p-3 rounded-full transition-colors ${
                    isVideoEnabled
                      ? 'bg-gray-600 hover:bg-gray-500 text-white'
                      : 'bg-red-600 hover:bg-red-500 text-white'
                  }`}
                >
                  {isVideoEnabled ? <IoVideocam size={20} /> : <IoVideocamOff size={20} />}
                </button>

                <button
                  onClick={handleEndCall}
                  className="p-3 rounded-full bg-red-600 hover:bg-red-500 text-white transition-colors"
                >
                  <IoCall size={20} className="rotate-45" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
