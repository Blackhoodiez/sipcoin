-- Fix for missing avatar_url column in profiles table
-- Run this in your Supabase SQL Editor

-- Check if the column exists first
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'avatar_url'
        AND table_schema = 'public'
    ) THEN
        -- Add the avatar_url column
        ALTER TABLE public.profiles 
        ADD COLUMN avatar_url text;
        
        RAISE NOTICE 'Added avatar_url column to profiles table';
    ELSE
        RAISE NOTICE 'avatar_url column already exists in profiles table';
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position; 