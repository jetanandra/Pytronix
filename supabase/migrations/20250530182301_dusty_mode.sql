/*
  # User Notifications System

  1. New Table
    - `user_notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, FK to auth.users)
      - `type` (text, notification type)
      - `title` (text, notification title)
      - `message` (text, notification content)
      - `data` (jsonb, additional data related to the notification)
      - `is_read` (boolean, read status)
      - `created_at` (timestamptz, when notification was created)
      - `read_at` (timestamptz, when notification was read)
  
  2. Indexes
    - Index on user_id for faster queries
    - Index on is_read for filtering unread notifications
  
  3. Security
    - RLS policies to ensure users can only access their own notifications
    - Admin access for system-wide notifications
*/

-- Create user_notifications table
CREATE TABLE IF NOT EXISTS user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  read_at timestamptz
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_id ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_is_read ON user_notifications(is_read);

-- Enable Row Level Security
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON user_notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications (to mark as read)
CREATE POLICY "Users can update their own notifications"
  ON user_notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
  FOR DELETE
  ON user_notifications
  USING (auth.uid() = user_id);

-- Admins can manage all notifications
CREATE POLICY "Admins can manage all notifications"
  ON user_notifications
  FOR ALL
  USING (((auth.jwt() -> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text);

-- Insert some sample notifications for testing
DO $$
DECLARE
  user_record RECORD;
BEGIN
  -- For each user in the system
  FOR user_record IN SELECT id FROM auth.users LOOP
    -- Order received notification
    INSERT INTO user_notifications (user_id, type, title, message, data)
    VALUES (
      user_record.id,
      'order_received',
      'Order Received',
      'Your order has been received and is being processed.',
      jsonb_build_object('order_id', gen_random_uuid(), 'order_total', 1299.99)
    );
    
    -- Order shipped notification
    INSERT INTO user_notifications (user_id, type, title, message, data)
    VALUES (
      user_record.id,
      'order_shipped',
      'Order Shipped',
      'Your order has been shipped! You can track your package using the tracking information.',
      jsonb_build_object('order_id', gen_random_uuid(), 'tracking_id', 'TRK123456789')
    );
    
    -- Workshop request notification
    INSERT INTO user_notifications (user_id, type, title, message, data)
    VALUES (
      user_record.id,
      'workshop_request_approved',
      'Workshop Request Approved',
      'Your workshop request has been approved. Our team will contact you shortly to finalize the details.',
      jsonb_build_object('workshop_id', gen_random_uuid(), 'workshop_title', 'Drone Building Workshop')
    );
  END LOOP;
END;
$$;