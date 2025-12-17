-- Migration: Add is_premium column to users table
-- Run this in your Supabase SQL editor

-- Add is_premium column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;

-- Add comment to column
COMMENT ON COLUMN users.is_premium IS 'Indicates if the user has premium subscription';

