/*
  # Add create_user_notification function

  1. New Functions
    - `create_user_notification`: Function to create a new notification for a user
      - Parameters:
        - `p_user_id` (uuid): The ID of the user to notify
        - `p_type` (text): The type of notification
        - `p_title` (text): The notification title
        - `p_message` (text): The notification message
        - `p_data` (jsonb): Optional additional data for the notification
      - Returns: void
      - Security: SECURITY DEFINER to ensure it can always create notifications
      - Language: plpgsql

  2. Security
    - Function is accessible to authenticated users
    - Uses SECURITY DEFINER to bypass RLS when creating notifications
*/

-- Drop the function if it exists (to avoid errors on re-runs)
DROP FUNCTION IF EXISTS public.create_user_notification;

-- Create the function
CREATE OR REPLACE FUNCTION public.create_user_notification(
    p_user_id uuid,
    p_type text,
    p_title text,
    p_message text,
    p_data jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_notifications (
        user_id,
        type,
        title,
        message,
        data,
        is_read,
        created_at
    )
    VALUES (
        p_user_id,
        p_type,
        p_title,
        p_message,
        p_data,
        FALSE,
        now()
    );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_user_notification TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_notification TO service_role;