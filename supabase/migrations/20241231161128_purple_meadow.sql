/*
  # Fix Table Relationships

  1. Changes
    - Remove incorrect foreign key constraints
    - Add correct foreign key relationships
    - Update table structure

  2. Security
    - Maintain existing RLS policies
*/

-- First, drop the existing foreign key constraints if they exist
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'funcionarios_user_id_fkey'
  ) THEN
    ALTER TABLE funcionarios DROP CONSTRAINT funcionarios_user_id_fkey;
  END IF;
END $$;

-- Remove any existing foreign key constraints from vendas to funcionarios
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'vendas_funcionario_id_fkey'
  ) THEN
    ALTER TABLE vendas DROP CONSTRAINT vendas_funcionario_id_fkey;
  END IF;
END $$;

-- Remove any existing foreign key constraints from caixas_fechados to funcionarios
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'caixas_fechados_funcionario_id_fkey'
  ) THEN
    ALTER TABLE caixas_fechados DROP CONSTRAINT caixas_fechados_funcionario_id_fkey;
  END IF;
END $$;

-- Add the correct foreign key constraint to funcionarios
ALTER TABLE funcionarios
  ADD CONSTRAINT funcionarios_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES auth.users(id);

-- Add the correct foreign key constraints back to vendas and caixas_fechados
ALTER TABLE vendas
  ADD CONSTRAINT vendas_funcionario_id_fkey 
  FOREIGN KEY (funcionario_id) 
  REFERENCES funcionarios(id);

ALTER TABLE caixas_fechados
  ADD CONSTRAINT caixas_fechados_funcionario_id_fkey 
  FOREIGN KEY (funcionario_id) 
  REFERENCES funcionarios(id);