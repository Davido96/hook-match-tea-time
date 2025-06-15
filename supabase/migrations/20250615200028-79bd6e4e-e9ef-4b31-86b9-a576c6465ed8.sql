
-- Clear all existing matches, likes, conversations, and messages for fresh testing

-- First, delete all messages (they depend on conversations)
DELETE FROM public.messages;

-- Delete all conversations (they depend on matches)
DELETE FROM public.conversations;

-- Delete all matches
DELETE FROM public.matches;

-- Delete all likes (both pending and accepted)
DELETE FROM public.likes;

-- Verify the cleanup by checking row counts
SELECT 
  'matches' as table_name, 
  COUNT(*) as remaining_rows 
FROM public.matches
UNION ALL
SELECT 
  'likes' as table_name, 
  COUNT(*) as remaining_rows 
FROM public.likes
UNION ALL
SELECT 
  'conversations' as table_name, 
  COUNT(*) as remaining_rows 
FROM public.conversations
UNION ALL
SELECT 
  'messages' as table_name, 
  COUNT(*) as remaining_rows 
FROM public.messages;
