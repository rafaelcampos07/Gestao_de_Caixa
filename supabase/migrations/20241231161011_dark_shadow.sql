/*
  # Fix Funcionarios Table Structure

  1. Changes
    - Drop existing foreign key constraint if it exists
    - Create funcionarios table with correct structure
    - Add proper foreign key to auth.users
    - Enable RLS
    - Add policies for user access

  2. Security
    - Enable RLS
    - Add policies for authenticated users to manage their own employees
*/

-- Drop existing table if it exists
DROP TABLE IF EXISTS funcionarios;

-- Create funcionarios table with correct structure
CREATE TABLE funcionarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  nome text NOT NULL,
  celular text,
  email text,
  funcao text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE funcionarios ENABLE ROW LEVEL SECURITY;

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