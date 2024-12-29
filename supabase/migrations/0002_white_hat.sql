/*
  # Add payment method column and user ID

  1. Changes
    - Add forma_pagamento column to vendas table
    - Add user_id column if it doesn't exist
    - Add foreign key constraint to auth.users
*/

-- Add forma_pagamento column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vendas' AND column_name = 'forma_pagamento'
  ) THEN
    ALTER TABLE vendas ADD COLUMN forma_pagamento text NOT NULL DEFAULT 'dinheiro';
  END IF;
END $$;

-- Add user_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'vendas' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE vendas ADD COLUMN user_id uuid REFERENCES auth.users NOT NULL;
  END IF;
END $$;