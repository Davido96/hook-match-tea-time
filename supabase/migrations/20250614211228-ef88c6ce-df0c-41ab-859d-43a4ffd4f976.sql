
-- Fix the migration by handling existing policies properly
-- For exclusive_posts table, update existing policies or create if they don't exist

-- First, handle the exclusive_posts policies more carefully
DO $$
BEGIN
    -- Drop all existing policies for exclusive_posts to start fresh
    DROP POLICY IF EXISTS "Creators can view their own posts" ON public.exclusive_posts;
    DROP POLICY IF EXISTS "Users can view public posts" ON public.exclusive_posts;
    DROP POLICY IF EXISTS "Subscribers can view private posts" ON public.exclusive_posts;
    DROP POLICY IF EXISTS "Users can create posts" ON public.exclusive_posts;
    DROP POLICY IF EXISTS "Users can update their posts" ON public.exclusive_posts;
    DROP POLICY IF EXISTS "Users can delete their posts" ON public.exclusive_posts;
END $$;

-- Now create the policies fresh
CREATE POLICY "Users can view public posts" 
  ON public.exclusive_posts 
  FOR SELECT 
  USING (is_public = true);

CREATE POLICY "Creators can view their own posts" 
  ON public.exclusive_posts 
  FOR SELECT 
  USING (auth.uid() = creator_id);

CREATE POLICY "Subscribers can view private posts" 
  ON public.exclusive_posts 
  FOR SELECT 
  USING (
    is_public = false AND 
    EXISTS (
      SELECT 1 FROM public.subscriptions 
      WHERE subscriber_id = auth.uid() 
      AND creator_id = exclusive_posts.creator_id 
      AND is_active = true 
      AND expires_at > now()
    )
  );

CREATE POLICY "Users can create posts" 
  ON public.exclusive_posts 
  FOR INSERT 
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Users can update their posts" 
  ON public.exclusive_posts 
  FOR UPDATE 
  USING (auth.uid() = creator_id);

CREATE POLICY "Users can delete their posts" 
  ON public.exclusive_posts 
  FOR DELETE 
  USING (auth.uid() = creator_id);

-- Handle the rest of the tables that might have failed
-- Only try to add foreign key constraints if they don't exist
DO $$
BEGIN
    -- Add foreign key for follows table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'follows_follower_id_fkey' 
        AND table_name = 'follows'
    ) THEN
        ALTER TABLE public.follows ADD CONSTRAINT follows_follower_id_fkey 
          FOREIGN KEY (follower_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'follows_following_id_fkey' 
        AND table_name = 'follows'
    ) THEN
        ALTER TABLE public.follows ADD CONSTRAINT follows_following_id_fkey 
          FOREIGN KEY (following_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    -- Add foreign key for subscriptions table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'subscriptions_subscriber_id_fkey' 
        AND table_name = 'subscriptions'
    ) THEN
        ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_subscriber_id_fkey 
          FOREIGN KEY (subscriber_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    -- Add foreign key for tips table if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'tips_sender_id_fkey' 
        AND table_name = 'tips'
    ) THEN
        ALTER TABLE public.tips ADD CONSTRAINT tips_sender_id_fkey 
          FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;
