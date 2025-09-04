-- Debug script to check why user_profiles are not being created
-- Run this in your Supabase SQL Editor to diagnose the issue

-- =====================================================
-- STEP 1: Check if the trigger exists
-- =====================================================
SELECT
  'TRIGGER CHECK' as check_type,
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing,
  CASE
    WHEN trigger_name = 'on_auth_user_created' THEN '✅ TRIGGER EXISTS'
    ELSE '❌ TRIGGER MISSING'
  END as status
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- =====================================================
-- STEP 2: Check if the function exists
-- =====================================================
SELECT
  'FUNCTION CHECK' as check_type,
  routine_name,
  routine_type,
  data_type,
  CASE
    WHEN routine_name = 'handle_new_user' THEN '✅ FUNCTION EXISTS'
    ELSE '❌ FUNCTION MISSING'
  END as status
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- =====================================================
-- STEP 3: Check table structure
-- =====================================================
SELECT
  'TABLE STRUCTURE' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- =====================================================
-- STEP 4: Check RLS policies
-- =====================================================
SELECT
  'RLS POLICIES' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- =====================================================
-- STEP 5: Check if RLS is enabled
-- =====================================================
SELECT
  'RLS STATUS' as check_type,
  schemaname,
  tablename,
  rowsecurity,
  CASE
    WHEN rowsecurity = true THEN '✅ RLS ENABLED'
    ELSE '❌ RLS DISABLED'
  END as status
FROM pg_tables
WHERE tablename = 'user_profiles';

-- =====================================================
-- STEP 6: Check recent auth.users entries
-- =====================================================
SELECT
  'RECENT USERS' as check_type,
  id,
  email,
  created_at,
  raw_user_meta_data->>'full_name' as full_name
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- STEP 7: Check user_profiles entries
-- =====================================================
SELECT
  'USER PROFILES' as check_type,
  id,
  email,
  full_name,
  created_at
FROM user_profiles
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================
-- STEP 8: Test the trigger function manually
-- =====================================================
-- This will help us see if the function works when called directly
-- (Don't run this on production data, just for testing)

-- First, let's see what the function looks like
SELECT
  'FUNCTION DEFINITION' as check_type,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';
