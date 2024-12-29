/*
  # Initial Schema Setup

  1. New Tables
    - `produtos`
      - `id` (uuid, primary key)
      - `nome` (text)
      - `preco` (numeric)
      - `descricao` (text, optional)
      - `codigo` (text, optional)
      - `estoque` (integer, optional)
      - `created_at` (timestamp)
      - `user_id` (uuid, references auth.users)

    - `vendas`
      - `id` (uuid, primary key)
      - `items` (jsonb)
      - `total` (numeric)
      - `forma_pagamento` (text)
      - `desconto` (numeric)
      - `data` (timestamp)
      - `finalizada` (boolean)
      - `user_id` (uuid, references auth.users)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Produtos table
CREATE TABLE produtos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  preco numeric NOT NULL,
  descricao text,
  codigo text,
  estoque integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users NOT NULL
);

ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own produtos"
  ON produtos
  USING (auth.uid() = user_id);

-- Vendas table
CREATE TABLE vendas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  items jsonb NOT NULL,
  total numeric NOT NULL,
  forma_pagamento text NOT NULL,
  desconto numeric DEFAULT 0,
  data timestamptz DEFAULT now(),
  finalizada boolean DEFAULT false,
  user_id uuid REFERENCES auth.users NOT NULL
);

ALTER TABLE vendas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own vendas"
  ON vendas
  USING (auth.uid() = user_id);