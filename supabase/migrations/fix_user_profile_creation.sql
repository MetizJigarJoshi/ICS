-- Fix for user profile creation trigger
-- The current trigger is failing silently, so let's recreate it with better error handling

-- First, let's check if the trigger function exists and recreate it
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Log the attempt
  RAISE LOG 'Attempting to create user profile for user: % with email: %', NEW.id, NEW.email;

  -- Check if profile already exists to avoid conflicts
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = NEW.id) THEN
    -- Insert the user profile
    INSERT INTO user_profiles (id, email, full_name)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );

    RAISE LOG 'Successfully created user profile for user: %', NEW.id;
  ELSE
    RAISE LOG 'User profile already exists for user: %', NEW.id;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
    RAISE LOG 'Error details: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Manual fix: Create profile for the existing user that was just created
INSERT INTO user_profiles (id, email, full_name)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', '')
FROM auth.users
WHERE id = '7c2b57cd-0789-4527-9fe9-51a1e5b61cf1'
  AND NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.users.id)
ON CONFLICT (id) DO NOTHING;

-- Also create a profile for the previous user if it exists
INSERT INTO user_profiles (id, email, full_name)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', '')
FROM auth.users
WHERE id = '1406fefa-07f7-4054-ad0e-f30a9fbe6b7f'
  AND NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.users.id)
ON CONFLICT (id) DO NOTHING;

-- Enable better logging for debugging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_messages = 'warning';
SELECT pg_reload_conf();
