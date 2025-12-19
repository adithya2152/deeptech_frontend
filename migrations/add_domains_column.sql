-- Migration: Add domains column to profiles table
-- Date: 2025-12-19
-- Description: Add domains text array column for expert users to specify their areas of expertise

-- Add domains column
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS domains text[];

-- Add comment for documentation
COMMENT ON COLUMN profiles.domains IS 'Array of expertise domains for expert users (e.g., ai_ml, robotics, biotech)';

-- Create index for faster domain searches
CREATE INDEX IF NOT EXISTS idx_profiles_domains ON profiles USING GIN (domains);

-- Verify the column was added
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'profiles' 
    AND column_name = 'domains'
  ) THEN
    RAISE NOTICE '✅ domains column added successfully to profiles table';
  ELSE
    RAISE NOTICE '❌ Failed to add domains column';
  END IF;
END $$;
