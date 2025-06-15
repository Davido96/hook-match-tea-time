
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Allow the system to create notifications for any user (for tips, etc.)
CREATE POLICY "System can create notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (true);

-- Enable realtime for notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.notifications;

-- Create function to create tip notifications
CREATE OR REPLACE FUNCTION public.create_tip_notification(
  recipient_user_id UUID,
  sender_name TEXT,
  tip_amount INTEGER,
  tip_message TEXT DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (
    recipient_user_id,
    'tip_received',
    'New Tip Received! 🪝',
    CASE 
      WHEN tip_message IS NOT NULL THEN
        format('%s sent you %s Keys with message: "%s"', sender_name, tip_amount, tip_message)
      ELSE
        format('%s sent you %s Keys', sender_name, tip_amount)
    END,
    jsonb_build_object(
      'sender_name', sender_name,
      'amount', tip_amount,
      'message', tip_message
    )
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.create_tip_notification(UUID, TEXT, INTEGER, TEXT) TO authenticated;
