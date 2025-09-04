-- Fix for automatic user profile creation trigger
-- This script ensures the trigger works automatically when new users are added to auth.users

-- =====================================================
-- STEP 1: Complete cleanup
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- =====================================================
-- STEP 2: Ensure user_profiles table exists with correct structure
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- STEP 3: Ensure RLS is enabled and policies are correct
-- =====================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable insert for authentication users" ON user_profiles;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON user_profiles;

-- Create policies that allow the trigger to work
CREATE POLICY "Allow trigger to insert user profiles" ON user_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can select own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- STEP 4: Create a robust trigger function
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_id uuid;
  user_email text;
  user_full_name text;
BEGIN
  -- Extract values from the new user record
  user_id := NEW.id;
  user_email := NEW.email;
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');

  -- Log the attempt
  RAISE LOG 'AUTO-TRIGGER: Creating profile for user % with email %', user_id, user_email;

  -- Insert the user profile
  INSERT INTO user_profiles (id, email, full_name)
  VALUES (user_id, user_email, user_full_name);

  -- Log success
  RAISE LOG 'AUTO-TRIGGER: Successfully created profile for user %', user_id;

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't fail the user creation
  RAISE WARNING 'AUTO-TRIGGER: Failed to create profile for user %: %', user_id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 5: Create the trigger
-- =====================================================
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- STEP 6: Verify the trigger is working
-- =====================================================
SELECT
  'TRIGGER STATUS' as check_type,
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing,
  CASE
    WHEN trigger_name = 'on_auth_user_created' THEN '✅ AUTO-TRIGGER ACTIVE'
    ELSE '❌ AUTO-TRIGGER MISSING'
  END as status
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- =====================================================
-- STEP 7: Test the trigger with existing users
-- =====================================================
-- Create profiles for any existing users who don't have profiles
INSERT INTO user_profiles (id, email, full_name)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', '')
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Show results
SELECT
  'EXISTING USERS PROCESSED' as status,
  COUNT(*) as total_profiles
FROM user_profiles;

-- =====================================================
-- STEP 8: Show current state
-- =====================================================
SELECT
  'CURRENT STATE' as info,
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM user_profiles) as total_user_profiles,
  CASE
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM user_profiles)
    THEN '✅ ALL USERS HAVE PROFILES'
    ELSE '⚠️ SOME USERS MISSING PROFILES'
  END as status;
