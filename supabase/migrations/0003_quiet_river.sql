/*
  # Add user phone and payment details

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `phone` (text)
      - `name` (text)
      - `verified` (boolean)

  2. Changes to existing tables
    - Add payment details to vendas table
    - Add closed_caixas table for historical data

  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  phone text,
  name text,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view and update their own profile"
  ON user_profiles
  USING (auth.uid() = user_id);

-- Add payment details to vendas
ALTER TABLE vendas 
  ADD COLUMN IF NOT EXISTS payment_type text,
  ADD COLUMN IF NOT EXISTS installments integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS interest_rate numeric DEFAULT 0;

-- Create closed_caixas table
CREATE TABLE IF NOT EXISTS closed_caixas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  total_sales numeric NOT NULL,
  total_cash numeric DEFAULT 0,
  total_credit numeric DEFAULT 0,
  total_debit numeric DEFAULT 0,
  total_pix numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE closed_caixas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own closed caixas"
  ON closed_caixas
  USING (auth.uid() = user_id);