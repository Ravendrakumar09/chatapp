'use client';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as Video from 'twilio-video';

interface VideoCallState {
  isConnected: boolean;
  isConnecting: boolean;
  participants: Video.RemoteParticipant[];
  room: Video.Room | null;
  error: string | null;
  localVideoTrack: Video.LocalVideoTrack | null;
  localAudioTrack: Video.LocalAudioTrack | null;
}

interface UseVideoCallReturn extends VideoCallState {
  connectToRoom: (roomName: string, identity: string) => Promise<void>;
  disconnectFromRoom: () => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoContainerRef: React.RefObject<HTMLDivElement | null>;
}

export function useVideoCall(): UseVideoCallReturn {
  const [state, setState] = useState<VideoCallState>({
    isConnected: false,
    isConnecting: false,
    participants: [],
    room: null,
    error: null,
    localVideoTrack: null,
    localAudioTrack: null,
  });

  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoContainerRef = useRef<HTMLDivElement>(null);
  const currentRoomRef = useRef<Video.Room | null>(null);
  const isConnectingRef = useRef<boolean>(false);

  const connectToRoom = useCallback(async (roomName: string, identity: string) => {
    // Prevent multiple simultaneous connections
    if (isConnectingRef.current) {
      console.log('Connection already in progress, ignoring duplicate request');
      return;
    }

    try {
      isConnectingRef.current = true;
      setState(prev => ({ ...prev, isConnecting: true, error: null }));

      // Disconnect from any existing room first
      if (currentRoomRef.current) {
        console.log('Disconnecting from existing room before connecting to new one');
        currentRoomRef.current.disconnect();
        currentRoomRef.current = null;
        setState(prev => ({ ...prev, room: null, isConnected: false, participants: [] }));
      }

      // Get access token from API
      const response = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity, room: roomName }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to get token: ${errorData}`);
      }

      const { token } = await response.json();

      if (!token) {
        throw new Error('No token received');
      }

      console.log(`Connecting to room: ${roomName} with identity: ${identity}`);

      // Connect to Twilio room
      const room = await Video.connect(token, {
        audio: true,
        video: { width: 640, height: 480 },
      });

      // Update refs immediately
      currentRoomRef.current = room;

      setState(prev => ({ 
        ...prev, 
        room, 
        isConnected: true, 
        isConnecting: false 
      }));

      // Handle local tracks
      room.localParticipant.videoTracks.forEach(publication => {
        if (publication.track) {
          setState(prev => ({ ...prev, localVideoTrack: publication.track as Video.LocalVideoTrack }));
        }
      });

      room.localParticipant.audioTracks.forEach(publication => {
        if (publication.track) {
          setState(prev => ({ ...prev, localAudioTrack: publication.track as Video.LocalAudioTrack }));
        }
      });

      // Handle remote participants
      const handleParticipantConnected = (participant: Video.RemoteParticipant) => {
        setState(prev => ({ 
          ...prev, 
          participants: [...prev.participants, participant] 
        }));

        participant.on('trackSubscribed', (track: Video.RemoteTrack) => {
          console.log('Remote track subscribed:', track.kind);
          if (track.kind === 'video') {
            // Trigger re-render by updating participants
            setState(prev => ({ ...prev, participants: [...prev.participants] }));
          }
        });

        participant.on('trackUnsubscribed', (track: Video.RemoteTrack) => {
          console.log('Remote track unsubscribed:', track.kind);
          if ('detach' in track && typeof track.detach === 'function') {
            track.detach().forEach(element => element.remove());
          }
        });
      };

      const handleParticipantDisconnected = (participant: Video.RemoteParticipant) => {
        setState(prev => ({ 
          ...prev, 
          participants: prev.participants.filter(p => p !== participant) 
        }));
      };

      room.on('participantConnected', handleParticipantConnected);
      room.on('participantDisconnected', handleParticipantDisconnected);

      // Handle existing participants
      room.participants.forEach(handleParticipantConnected);

    } catch (error: any) {
      console.error('Error connecting to room:', error);
      
      let errorMessage = error.message;
      
      // Handle specific Twilio errors
      if (error.name === 'ParticipantDuplicateIdentityError') {
        errorMessage = 'You are already connected to this video call. Please refresh the page and try again.';
      } else if (error.name === 'RoomNotFoundError') {
        errorMessage = 'Video call room not found. The call may have ended.';
      } else if (error.name === 'RoomMaxParticipantsExceededError') {
        errorMessage = 'Video call room is full. Maximum participants exceeded.';
      } else if (error.name === 'AccessTokenInvalidError') {
        errorMessage = 'Invalid access token. Please check your Twilio configuration.';
      }
      
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        isConnecting: false 
      }));
    } finally {
      isConnectingRef.current = false;
    }
  }, []);

  const disconnectFromRoom = useCallback(() => {
    if (currentRoomRef.current) {
      console.log('Disconnecting from room');
      currentRoomRef.current.disconnect();
      currentRoomRef.current = null;
    }
    
    setState({
      isConnected: false,
      isConnecting: false,
      participants: [],
      room: null,
      error: null,
      localVideoTrack: null,
      localAudioTrack: null,
    });
    setIsVideoEnabled(true);
    setIsAudioEnabled(true);
    isConnectingRef.current = false;

    // Clean up video elements
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoContainerRef.current) {
      remoteVideoContainerRef.current.innerHTML = '';
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (state.localVideoTrack) {
      if (isVideoEnabled) {
        state.localVideoTrack.disable();
      } else {
        state.localVideoTrack.enable();
      }
      setIsVideoEnabled(!isVideoEnabled);
    }
  }, [state.localVideoTrack, isVideoEnabled]);

  const toggleAudio = useCallback(() => {
    if (state.localAudioTrack) {
      if (isAudioEnabled) {
        state.localAudioTrack.disable();
      } else {
        state.localAudioTrack.enable();
      }
      setIsAudioEnabled(!isAudioEnabled);
    }
  }, [state.localAudioTrack, isAudioEnabled]);

  // Cleanup on unmount and handle page refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (currentRoomRef.current) {
        currentRoomRef.current.disconnect();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && currentRoomRef.current) {
        console.log('Page hidden, disconnecting from room');
        currentRoomRef.current.disconnect();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (currentRoomRef.current) {
        currentRoomRef.current.disconnect();
      }
    };
  }, []);

  return {
    ...state,
    connectToRoom,
    disconnectFromRoom,
    toggleVideo,
    toggleAudio,
    isVideoEnabled,
    isAudioEnabled,
    localVideoRef,
    remoteVideoContainerRef,
  };
}
