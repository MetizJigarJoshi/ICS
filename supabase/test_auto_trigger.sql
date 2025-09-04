-- Test script to verify the automatic trigger is working
-- Run this AFTER applying the fix_auto_trigger.sql script

-- =====================================================
-- STEP 1: Check trigger status
-- =====================================================
SELECT
  'TRIGGER VERIFICATION' as test_type,
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing,
  CASE
    WHEN trigger_name = 'on_auth_user_created' THEN '✅ TRIGGER IS ACTIVE'
    ELSE '❌ TRIGGER IS MISSING'
  END as result
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- =====================================================
-- STEP 2: Check function status
-- =====================================================
SELECT
  'FUNCTION VERIFICATION' as test_type,
  routine_name,
  routine_type,
  data_type,
  CASE
    WHEN routine_name = 'handle_new_user' THEN '✅ FUNCTION IS ACTIVE'
    ELSE '❌ FUNCTION IS MISSING'
  END as result
FROM information_schema.routines
WHERE routine_name = 'handle_new_user';

-- =====================================================
-- STEP 3: Check RLS policies
-- =====================================================
SELECT
  'RLS POLICY VERIFICATION' as test_type,
  policyname,
  cmd,
  with_check,
  CASE
    WHEN policyname = 'Allow trigger to insert user profiles' AND with_check = 'true'
    THEN '✅ TRIGGER POLICY IS CORRECT'
    ELSE '❌ TRIGGER POLICY IS MISSING OR INCORRECT'
  END as result
FROM pg_policies
WHERE tablename = 'user_profiles'
  AND policyname = 'Allow trigger to insert user profiles';

-- =====================================================
-- STEP 4: Check current user counts
-- =====================================================
SELECT
  'USER COUNT VERIFICATION' as test_type,
  (SELECT COUNT(*) FROM auth.users) as auth_users_count,
  (SELECT COUNT(*) FROM user_profiles) as user_profiles_count,
  CASE
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM user_profiles)
    THEN '✅ ALL USERS HAVE PROFILES'
    ELSE '⚠️ SOME USERS MISSING PROFILES'
  END as result;

-- =====================================================
-- STEP 5: Show recent users and their profiles
-- =====================================================
SELECT
  'RECENT USERS CHECK' as test_type,
  au.id,
  au.email,
  au.created_at as auth_created,
  up.id as profile_id,
  up.full_name,
  up.created_at as profile_created,
  CASE
    WHEN up.id IS NOT NULL THEN '✅ HAS PROFILE'
    ELSE '❌ MISSING PROFILE'
  END as result
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
ORDER BY au.created_at DESC
LIMIT 5;

-- =====================================================
-- STEP 6: Instructions for testing
-- =====================================================
SELECT
  'TESTING INSTRUCTIONS' as info,
  'To test the automatic trigger:' as step1,
  '1. Create a new user account in your application' as step2,
  '2. Check if a profile was automatically created' as step3,
  '3. Verify the profile data matches the auth user data' as step4,
  '4. Check Supabase logs for trigger activity' as step5;
