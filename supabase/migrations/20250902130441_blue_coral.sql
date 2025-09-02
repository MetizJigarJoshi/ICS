/*
  # Immigration Eligibility Assessment Database Schema

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `full_name` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `eligibility_submissions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references user_profiles)
      - `reference_id` (text, unique, auto-generated)
      - `personal_info` (jsonb)
      - `education_info` (jsonb)
      - `work_experience` (jsonb)
      - `language_skills` (jsonb)
      - `canadian_connections` (jsonb)
      - `additional_info` (jsonb)
      - `submission_status` (text, default 'submitted')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
    - Add policies for users to read their own submissions
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create eligibility_submissions table
CREATE TABLE IF NOT EXISTS eligibility_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  reference_id text UNIQUE NOT NULL DEFAULT 'ICS-' || upper(substring(gen_random_uuid()::text from 1 for 8)),
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

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibility_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policies for eligibility_submissions
CREATE POLICY "Users can read own submissions"
  ON eligibility_submissions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own submissions"
  ON eligibility_submissions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own submissions"
  ON eligibility_submissions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_eligibility_submissions_updated_at
  BEFORE UPDATE ON eligibility_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle user profile creation on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Create trigger for automatic user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_eligibility_submissions_user_id ON eligibility_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_submissions_reference_id ON eligibility_submissions(reference_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_submissions_created_at ON eligibility_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);