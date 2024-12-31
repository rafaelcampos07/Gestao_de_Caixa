/*
  # Fix Funcionarios Table Structure

  1. Changes
    - Add user_id column with proper foreign key to auth.users
    - Update existing records
    - Add proper constraints
    - Enable RLS
    - Add access policies

  2. Security
    - Enable RLS
    - Add policies for authenticated users to manage their own employees
*/

-- Add user_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'funcionarios' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE funcionarios ADD COLUMN user_id uuid REFERENCES auth.users;
  END IF;
END $$;

-- Update existing records to use the first user in auth.users (temporary fix)
UPDATE funcionarios 
SET user_id = (SELECT id FROM auth.users LIMIT 1)
WHERE user_id IS NULL;

-- Make user_id NOT NULL after populating it
ALTER TABLE funcionarios 
  ALTER COLUMN user_id SET NOT NULL;

-- Enable RLS if not already enabled
ALTER TABLE funcionarios ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own funcionarios" ON funcionarios;
DROP POLICY IF EXISTS "Users can insert their own funcionarios" ON funcionarios;
DROP POLICY IF EXISTS "Users can update their own funcionarios" ON funcionarios;
DROP POLICY IF EXISTS "Users can delete their own funcionarios" ON funcionarios;

-- Add policies
CREATE POLICY "Users can view their own funcionarios"
  ON funcionarios
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own funcionarios"
  ON funcionarios
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own funcionarios"
  ON funcionarios
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own funcionarios"
  ON funcionarios
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);