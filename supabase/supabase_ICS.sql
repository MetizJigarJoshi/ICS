-- =====================================================
-- SUPABASE ICS PROJECT - COMPLETE SCHEMA SETUP
-- =====================================================
-- This script completely rebuilds the database schema
-- Run this in your Supabase SQL Editor to set up everything from scratch
--
-- MIGRATION: 20250103000001_create_user_profiles_migration
-- PURPOSE: Create user_profiles table and trigger for automatic profile creation
-- =====================================================

-- =====================================================
-- STEP 1: CLEAN UP EVERYTHING FIRST
-- =====================================================

-- Drop all triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_updated_at_column ON user_profiles;
DROP TRIGGER IF EXISTS update_updated_at_column ON eligibility_submissions;

-- Drop all functions
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS generate_reference_id() CASCADE;

-- Drop all policies
DROP POLICY IF EXISTS "Enable insert for authentication users" ON user_profiles;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

DROP POLICY IF EXISTS "Enable insert for authentication users" ON eligibility_submissions;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON eligibility_submissions;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON eligibility_submissions;
DROP POLICY IF EXISTS "Users can delete own submissions" ON eligibility_submissions;
DROP POLICY IF EXISTS "Users can read own submissions" ON eligibility_submissions;
DROP POLICY IF EXISTS "Users can insert own submissions" ON eligibility_submissions;
DROP POLICY IF EXISTS "Users can update own submissions" ON eligibility_submissions;

-- Drop all tables (in correct order due to foreign key constraints)
DROP TABLE IF EXISTS eligibility_submissions CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- =====================================================
-- STEP 2: CREATE TABLES
-- =====================================================

-- Create user_profiles table
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create eligibility_submissions table
CREATE TABLE eligibility_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  reference_id text UNIQUE NOT NULL,
  personal_info jsonb DEFAULT '{}',
  education_info jsonb DEFAULT '{}',
  work_experience jsonb DEFAULT '{}',
  language_skills jsonb DEFAULT '{}',
  canadian_connections jsonb DEFAULT '{}',
  additional_info jsonb DEFAULT '{}',
  submission_status text DEFAULT 'submitted',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- STEP 3: ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibility_submissions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 4: CREATE RLS POLICIES
-- =====================================================

-- User profiles policies
CREATE POLICY "Enable insert for authentication users" ON user_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable select for users based on user_id" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Eligibility submissions policies
CREATE POLICY "Enable insert for authentication users" ON eligibility_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable select for users based on user_id" ON eligibility_submissions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Enable update for users based on user_id" ON eligibility_submissions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own submissions" ON eligibility_submissions
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- =====================================================
-- STEP 5: CREATE FUNCTIONS
-- =====================================================

-- =====================================================
-- MIGRATION: User Profile Auto-Creation Trigger
-- =====================================================
-- This migration ensures that whenever a new user is created in auth.users,
-- a corresponding profile is automatically created in public.user_profiles
-- =====================================================

-- Function to generate unique reference ID
CREATE OR REPLACE FUNCTION generate_reference_id()
RETURNS text AS $$
BEGIN
  RETURN 'IEA-' || UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- MIGRATION FUNCTION: handle_new_user()
-- =====================================================
-- This function is triggered automatically when a new user is inserted into auth.users
-- It creates a corresponding profile in public.user_profiles with the user's data
--
-- TRIGGER: on_auth_user_created (AFTER INSERT ON auth.users)
-- PURPOSE: Automatically sync auth.users data to public.user_profiles
-- =====================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Log the migration attempt
  RAISE LOG 'MIGRATION: Attempting to create user profile for user: % with email: %', NEW.id, NEW.email;

  BEGIN
    -- Check if profile already exists to avoid conflicts
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = NEW.id) THEN
      -- Insert the user profile with data from auth.users
      INSERT INTO user_profiles (id, email, full_name)
      VALUES (
        NEW.id,                                    -- User ID from auth.users
        NEW.email,                                 -- Email from auth.users
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')  -- Full name from user metadata
      );

      RAISE LOG 'MIGRATION: Successfully created user profile for user: %', NEW.id;
    ELSE
      RAISE LOG 'MIGRATION: User profile already exists for user: %', NEW.id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the auth user creation
    RAISE WARNING 'MIGRATION: Failed to create user profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 6: CREATE TRIGGERS
-- =====================================================

-- =====================================================
-- MIGRATION TRIGGER: on_auth_user_created
-- =====================================================
-- This trigger automatically fires when a new user is inserted into auth.users
-- It ensures that every new user gets a corresponding profile in public.user_profiles
--
-- TRIGGER DETAILS:
-- - Event: AFTER INSERT ON auth.users
-- - Function: handle_new_user()
-- - Purpose: Auto-create user profiles from auth.users data
-- =====================================================
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Triggers to update updated_at timestamp
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_eligibility_submissions_updated_at
  BEFORE UPDATE ON eligibility_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 7: MIGRATION VERIFICATION
-- =====================================================
-- Verify that the user profile auto-creation migration is working correctly
-- =====================================================

-- Check if the migration trigger exists and is properly configured
SELECT
  'MIGRATION CHECK: User Profile Trigger' as check_name,
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing,
  CASE
    WHEN trigger_name = 'on_auth_user_created' THEN '✅ MIGRATION TRIGGER ACTIVE'
    ELSE '❌ MIGRATION TRIGGER MISSING'
  END as status
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Check if the migration function exists
SELECT
  'MIGRATION CHECK: User Profile Function' as check_name,
  routine_name,
  routine_type,
  data_type,
  CASE
    WHEN routine_name = 'handle_new_user' THEN '✅ MIGRATION FUNCTION ACTIVE'
    ELSE '❌ MIGRATION FUNCTION MISSING'
  END as status
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- =====================================================
-- STEP 8: GENERAL VERIFICATION QUERIES
-- =====================================================

-- Check if tables were created
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('user_profiles', 'eligibility_submissions')
ORDER BY table_name;

-- Check if triggers exist
SELECT
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE trigger_name IN ('on_auth_user_created', 'update_user_profiles_updated_at', 'update_eligibility_submissions_updated_at')
ORDER BY trigger_name;

-- Check if functions exist
SELECT
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_name IN ('handle_new_user', 'update_updated_at_column', 'generate_reference_id')
ORDER BY routine_name;

-- Check if RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('user_profiles', 'eligibility_submissions')
ORDER BY tablename;

-- Check policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('user_profiles', 'eligibility_submissions')
ORDER BY tablename, policyname;

-- =====================================================
-- MIGRATION COMPLETE - SCHEMA SETUP FINISHED
-- =====================================================
-- Your database is now ready for the ICS application!
--
-- MIGRATION SUMMARY:
-- ✅ User Profile Auto-Creation: auth.users → public.user_profiles
-- ✅ Automatic Trigger: on_auth_user_created (AFTER INSERT ON auth.users)
-- ✅ Migration Function: handle_new_user() with error handling
-- ✅ Data Sync: User ID, email, and full_name automatically copied
-- ✅ Error Handling: Won't break user creation if profile creation fails
-- ✅ Logging: Full migration activity logging for debugging
--
-- What this schema provides:
-- ✅ User authentication with automatic profile creation
-- ✅ Eligibility form submissions with full CRUD operations
-- ✅ Row Level Security for data protection
-- ✅ Automatic timestamp updates
-- ✅ Unique reference ID generation
-- ✅ Proper foreign key relationships
-- ✅ Delete functionality for submissions
--
-- MIGRATION TESTING:
-- 1. Create a new user account in your application
-- 2. Check the auth.users table - user should be created
-- 3. Check the public.user_profiles table - profile should be auto-created
-- 4. Verify the user_id, email, and full_name match between tables
--
-- Next steps:
-- 1. Create your .env file with Supabase credentials
-- 2. Start your development server: npm run dev
-- 3. Test user signup and form submission
-- 4. Monitor Supabase logs for migration activity
-- =====================================================
