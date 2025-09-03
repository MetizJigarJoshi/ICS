/*
  # Update immigration interest field to support multiple selections

  1. Schema Changes
    - Update eligibility_submissions table to handle array of immigration interests
    - The canadian_connections jsonb field will now store interestedInImmigrating as an array

  2. Data Migration
    - Convert existing single string values to arrays for backward compatibility

  3. Notes
    - This migration maintains backward compatibility with existing data
    - Frontend will now send arrays instead of single strings
*/

-- Update existing data to convert single strings to arrays
UPDATE eligibility_submissions 
SET canadian_connections = jsonb_set(
  canadian_connections,
  '{interestedInImmigrating}',
  CASE 
    WHEN jsonb_typeof(canadian_connections->'interestedInImmigrating') = 'string' 
    THEN jsonb_build_array(canadian_connections->'interestedInImmigrating')
    ELSE canadian_connections->'interestedInImmigrating'
  END
)
WHERE canadian_connections ? 'interestedInImmigrating' 
  AND jsonb_typeof(canadian_connections->'interestedInImmigrating') = 'string';