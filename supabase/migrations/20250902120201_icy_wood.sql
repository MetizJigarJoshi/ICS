-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  password text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create eligibility_submissions table
CREATE TABLE IF NOT EXISTS eligibility_submissions (
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

-- Function to generate unique reference ID
CREATE OR REPLACE FUNCTION generate_reference_id()
RETURNS text AS $$
BEGIN
  RETURN 'IEA-' || UPPER(SUBSTRING(gen_random_uuid()::text FROM 1 FOR 8));
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_eligibility_submissions_updated_at
  BEFORE UPDATE ON eligibility_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger to auto-generate reference ID for submissions
CREATE OR REPLACE FUNCTION set_reference_id()
RETURNS trigger AS $$
BEGIN
  IF NEW.reference_id IS NULL OR NEW.reference_id = '' THEN
    NEW.reference_id = generate_reference_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_submission_reference_id
  BEFORE INSERT ON eligibility_submissions
  FOR each ROW EXECUTE FUNCTION set_reference_id();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_eligibility_submissions_user_id ON eligibility_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_submissions_reference_id ON eligibility_submissions(reference_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_submissions_created_at ON eligibility_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
