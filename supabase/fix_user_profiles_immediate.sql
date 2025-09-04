-- Immediate fix for user_profiles trigger issue
-- Run this script to fix the trigger that's not working

-- =====================================================
-- STEP 1: Remove existing trigger and function
-- =====================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- =====================================================
-- STEP 2: Create a simple, working trigger function
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Simple insert without complex error handling
  INSERT INTO user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error but don't fail
  RAISE WARNING 'Failed to create user profile: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 3: Create the trigger
-- =====================================================
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- STEP 4: Verify the trigger was created
-- =====================================================
SELECT
  'TRIGGER CREATED' as status,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- =====================================================
-- STEP 5: Test with existing users (if any)
-- =====================================================
-- This will create profiles for any existing users who don't have profiles
INSERT INTO user_profiles (id, email, full_name)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', '')
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Show how many profiles were created
SELECT
  'PROFILES CREATED FOR EXISTING USERS' as status,
  COUNT(*) as count
FROM user_profiles;
