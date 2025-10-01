-- Create video_call_notifications table
CREATE TABLE IF NOT EXISTS video_call_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_name TEXT NOT NULL,
  call_type TEXT NOT NULL CHECK (call_type IN ('video', 'audio')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'ended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_video_call_notifications_to_user_id ON video_call_notifications(to_user_id);
CREATE INDEX IF NOT EXISTS idx_video_call_notifications_from_user_id ON video_call_notifications(from_user_id);
CREATE INDEX IF NOT EXISTS idx_video_call_notifications_status ON video_call_notifications(status);
CREATE INDEX IF NOT EXISTS idx_video_call_notifications_room_name ON video_call_notifications(room_name);

-- Enable Row Level Security
ALTER TABLE video_call_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own notifications" ON video_call_notifications
  FOR SELECT USING (
    auth.uid() = from_user_id OR 
    auth.uid() = to_user_id
  );

CREATE POLICY "Users can create notifications" ON video_call_notifications
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can update their own notifications" ON video_call_notifications
  FOR UPDATE USING (
    auth.uid() = from_user_id OR 
    auth.uid() = to_user_id
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_video_call_notifications_updated_at
  BEFORE UPDATE ON video_call_notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
