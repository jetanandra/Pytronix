/*
  # Update user notifications RLS policies

  1. Changes
    - Add RLS policies for user_notifications table to allow users to:
      - Insert their own notifications
      - View their own notifications
      - Update their own notifications
      - Delete their own notifications
    - Add RLS policy for admins to manage all notifications
*/

-- Enable RLS on user_notifications table if not already enabled
ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own notifications" ON user_notifications;
DROP POLICY IF EXISTS "Users can insert their own notifications" ON user_notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON user_notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON user_notifications;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON user_notifications;

-- Create new policies
CREATE POLICY "Users can view their own notifications"
ON user_notifications FOR SELECT
TO public
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications"
ON user_notifications FOR INSERT
TO public
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON user_notifications FOR UPDATE
TO public
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON user_notifications FOR DELETE
TO public
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all notifications"
ON user_notifications FOR ALL
TO authenticated
USING (((auth.jwt() ->> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text)
WITH CHECK (((auth.jwt() ->> 'user_metadata'::text) ->> 'role'::text) = 'admin'::text);