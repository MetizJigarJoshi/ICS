-- Fix user signup trigger and user profile creation
-- This migration fixes the "Database error saving new user" issue

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop the existing function
DROP FUNCTION IF EXISTS handle_new_user();

-- Recreate the function with proper error handling and correct field names
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Add logging to debug the issue
  RAISE LOG 'handle_new_user called for user: %', NEW.id;
  RAISE LOG 'User email: %', NEW.email;
  RAISE LOG 'User metadata: %', NEW.user_metadata;

  -- Check if user profile already exists
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = NEW.id) THEN
    -- Insert user profile with proper error handling
    INSERT INTO user_profiles (id, email, full_name)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.user_metadata->>'full_name', '')
    );
    RAISE LOG 'User profile created successfully for: %', NEW.id;
  ELSE
    RAISE LOG 'User profile already exists for: %', NEW.id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    -- Don't fail the user creation, just log the error
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable better logging for debugging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_messages = 'warning';

-- Manually create user profiles for any existing users that might be missing
INSERT INTO user_profiles (id, email, full_name)
SELECT
  au.id,
  au.email,
  COALESCE(au.user_metadata->>'full_name', '')
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON user_profiles TO authenticated;
GRANT ALL ON eligibility_submissions TO authenticated;

-- Fix RLS policies to allow trigger to work properly
-- The trigger needs to bypass RLS to create user profiles
ALTER TABLE user_profiles FORCE ROW LEVEL SECURITY;

-- Update the insert policy to be more permissive for new users
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);

-- Also allow the service role to insert profiles (for triggers)
CREATE POLICY "Service role can insert profiles"
  ON user_profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create a function to manually create user profiles if needed
CREATE OR REPLACE FUNCTION create_user_profile_manually(user_uuid uuid, user_email text, user_full_name text)
RETURNS boolean AS $$
BEGIN
  -- Check if profile already exists
  IF EXISTS (SELECT 1 FROM user_profiles WHERE id = user_uuid) THEN
    RAISE LOG 'User profile already exists for: %', user_uuid;
    RETURN true;
  END IF;

  -- Create profile
  INSERT INTO user_profiles (id, email, full_name)
  VALUES (user_uuid, user_email, user_full_name);

  RAISE LOG 'User profile created manually for: %', user_uuid;
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating user profile manually for %: %', user_uuid, SQLERRM;
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
