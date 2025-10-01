'use client';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

interface VideoCallNotification {
  id: string;
  from_user_id: string;
  to_user_id: string;
  room_name: string;
  call_type: 'video' | 'audio';
  status: 'pending' | 'accepted' | 'rejected' | 'ended';
  created_at: string;
  from_user_name?: string;
}

interface UseVideoCallNotificationsReturn {
  incomingCall: VideoCallNotification | null;
  sendVideoCall: (toUserId: string, roomName: string) => Promise<string>;
  acceptCall: (notificationId: string) => Promise<void>;
  rejectCall: (notificationId: string) => Promise<void>;
  endCall: (notificationId: string) => Promise<void>;
  clearIncomingCall: () => void;
}

export function useVideoCallNotifications(userId: string | null): UseVideoCallNotificationsReturn {
  const [incomingCall, setIncomingCall] = useState<VideoCallNotification | null>(null);
  const supabase = createClient();

  // Listen for incoming video call notifications
  useEffect(() => {
    if (!userId) return;

    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase credentials not configured. Video call notifications will not work.');
      return;
    }

    let channel: any = null;

    try {
      channel = supabase
        .channel(`video-calls-${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'video_call_notifications',
            filter: `to_user_id=eq.${userId}`,
          },
          async (payload) => {
            try {
              const notification = payload.new as VideoCallNotification;
              
              // Get sender's name
              const { data: senderData } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', notification.from_user_id)
                .single();

              setIncomingCall({
                ...notification,
                from_user_name: senderData?.full_name || 'Unknown User',
              });
            } catch (error) {
              console.error('Error processing incoming call notification:', error);
            }
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'video_call_notifications',
            filter: `from_user_id=eq.${userId}`,
          },
          (payload) => {
            try {
              const notification = payload.new as VideoCallNotification;
              if (notification.status === 'accepted') {
                // Call was accepted, navigate to video call
                window.location.href = `/videocall?room=${notification.room_name}&identity=${userId}`;
              } else if (notification.status === 'rejected') {
                // Call was rejected
                setIncomingCall(null);
              }
            } catch (error) {
              console.error('Error processing call status update:', error);
            }
          }
        )
        .subscribe((status) => {
          if (status === 'CHANNEL_ERROR') {
            console.error('Supabase real-time channel error. Check your connection and credentials.');
          }
        });
    } catch (error) {
      console.error('Error setting up video call notifications:', error);
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId, supabase]);

  const sendVideoCall = useCallback(async (toUserId: string, roomName: string): Promise<string> => {
    if (!userId) throw new Error('User not authenticated');

    // Check if Supabase is properly configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      throw new Error('Supabase credentials not configured. Please check your .env.local file.');
    }

    try {
      const { data, error } = await supabase
        .from('video_call_notifications')
        .insert({
          from_user_id: userId,
          to_user_id: toUserId,
          room_name: roomName,
          call_type: 'video',
          status: 'pending',
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error sending video call notification:', error);
        throw error;
      }

      return data.id;
    } catch (error) {
      console.error('Error in sendVideoCall:', error);
      throw error;
    }
  }, [userId, supabase]);

  const acceptCall = useCallback(async (notificationId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('video_call_notifications')
        .update({ status: 'accepted' })
        .eq('id', notificationId);

      if (error) {
        console.error('Error accepting call:', error);
        throw error;
      }

      setIncomingCall(null);
    } catch (error) {
      console.error('Error in acceptCall:', error);
      throw error;
    }
  }, [userId, supabase]);

  const rejectCall = useCallback(async (notificationId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('video_call_notifications')
        .update({ status: 'rejected' })
        .eq('id', notificationId);

      if (error) {
        console.error('Error rejecting call:', error);
        throw error;
      }

      setIncomingCall(null);
    } catch (error) {
      console.error('Error in rejectCall:', error);
      throw error;
    }
  }, [userId, supabase]);

  const endCall = useCallback(async (notificationId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('video_call_notifications')
        .update({ status: 'ended' })
        .eq('id', notificationId);

      if (error) {
        console.error('Error ending call:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in endCall:', error);
      throw error;
    }
  }, [userId, supabase]);

  const clearIncomingCall = useCallback(() => {
    setIncomingCall(null);
  }, []);

  return {
    incomingCall,
    sendVideoCall,
    acceptCall,
    rejectCall,
    endCall,
    clearIncomingCall,
  };
}
