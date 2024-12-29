/*
  # Fix tables structure and add missing columns

  1. Changes
    - Add missing columns to closed_caixas table
    - Create trigger for user profile creation
    - Fix table relationships

  2. Security
    - Maintain RLS policies
    - Add appropriate constraints
*/

-- Fix closed_caixas table
ALTER TABLE IF EXISTS closed_caixas
  ADD COLUMN IF NOT EXISTS items jsonb,
  ADD COLUMN IF NOT EXISTS payment_details jsonb;

-- Create or replace function to handle user profile creation
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ensure RLS is enabled
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Add policies for user_profiles if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can view own profile'
  ) THEN
    CREATE POLICY "Users can view own profile" ON user_profiles
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile" ON user_profiles
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;