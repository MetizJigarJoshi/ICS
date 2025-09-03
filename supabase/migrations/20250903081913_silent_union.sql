/*
  # Update immigration interest field to support multiple selections

  1. Schema Changes
    - Update existing single string values to arrays in `eligibility_submissions.canadian_connections`
    - Ensure the field can handle multiple immigration interests as an array

  2. Data Migration
    - Convert existing single string values to arrays for backward compatibility
    - Preserve all existing data while enabling multiple selections

  3. Notes
    - This migration ensures existing data remains intact
    - New submissions can now select multiple immigration interests
    - The application code has been updated to handle arrays
*/

-- Update existing data to convert single strings to arrays
UPDATE eligibility_submissions 
SET canadian_connections = jsonb_set(
  canadian_connections,
  '{interestedInImmigrating}',
  CASE 
    WHEN jsonb_typeof(canadian_connections->'interestedInImmigrating') = 'string' 
    THEN jsonb_build_array(canadian_connections->'interestedInImmigrating')
    WHEN canadian_connections->'interestedInImmigrating' IS NULL
    THEN '[]'::jsonb
    ELSE canadian_connections->'interestedInImmigrating'
  END
)
WHERE canadian_connections IS NOT NULL;