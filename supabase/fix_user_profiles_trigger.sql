-- Fix for user profile creation trigger on live Supabase
-- This script ensures your existing schema works correctly
-- Run this script in your Supabase SQL Editor

-- Your existing schema is already correct, but let's ensure the trigger is working
-- First, let's check if the trigger exists and recreate it if needed

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Recreate the trigger function with enhanced error handling and logging
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Log the attempt
  RAISE LOG 'Attempting to create user profile for user: % with email: %', NEW.id, NEW.email;

  BEGIN
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
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the auth
    RAISE WARNING 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure all policies exist (your existing policies should work, but let's verify)
-- Check and create policies if they don't exist

-- User profiles policies
DO $$
BEGIN
  -- Insert policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_profiles'
    AND policyname = 'Enable insert for authentication users'
  ) THEN
    CREATE POLICY "Enable insert for authentication users" ON user_profiles
      FOR INSERT WITH CHECK (true);
  END IF;

  -- Select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_profiles'
    AND policyname = 'Enable select for users based on user_id'
  ) THEN
    CREATE POLICY "Enable select for users based on user_id" ON user_profiles
      FOR SELECT USING (auth.uid() = id);
  END IF;

  -- Update policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_profiles'
    AND policyname = 'Enable update for users based on user_id'
  ) THEN
    CREATE POLICY "Enable update for users based on user_id" ON user_profiles
      FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

-- Eligibility submissions policies
DO $$
BEGIN
  -- Insert policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'eligibility_submissions'
    AND policyname = 'Enable insert for authentication users'
  ) THEN
    CREATE POLICY "Enable insert for authentication users" ON eligibility_submissions
      FOR INSERT WITH CHECK (true);
  END IF;

  -- Select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'eligibility_submissions'
    AND policyname = 'Enable select for users based on user_id'
  ) THEN
    CREATE POLICY "Enable select for users based on user_id" ON eligibility_submissions
      FOR SELECT USING (user_id = auth.uid());
  END IF;

  -- Update policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'eligibility_submissions'
    AND policyname = 'Enable update for users based on user_id'
  ) THEN
    CREATE POLICY "Enable update for users based on user_id" ON eligibility_submissions
      FOR UPDATE USING (user_id = auth.uid());
  END IF;

  -- Delete policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'eligibility_submissions'
    AND policyname = 'Users can delete own submissions'
  ) THEN
    CREATE POLICY "Users can delete own submissions"
      ON eligibility_submissions
      FOR DELETE
      TO authenticated
      USING (user_id = auth.uid());
  END IF;
END $$;

-- Test the trigger by checking if it exists
SELECT
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
