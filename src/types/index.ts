export interface Produto {
  id: string;
  nome: string;
  preco: number;
  descricao?: string;
  codigo?: string;
  estoque?: number;
  user_id: string;
}

export interface ItemVenda {
  produto: Produto;
  quantidade: number;
  subtotal: number;
}

export interface PaymentDetails {
  type: 'credit' | 'debit';
  installments: number;
  interestRate: number;
  installmentValue: number;
  totalValue: number;
}

export interface Venda {
  id: string;
  items: ItemVenda[];
  total: number;
  forma_pagamento: 'pix' | 'dinheiro' | 'credito' | 'debito';
  payment_details?: PaymentDetails;
  desconto?: number;
  data: Date;
  finalizada: boolean;
  user_id: string;
}

export interface ResumoVendas {
  dinheiro: number;
  pix: number;
  cartao: number;
  total: number;
}

export interface UserProfile {
  id: string;
  user_id: string;
  phone?: string;
  name?: string;
  verified: boolean;
}

export interface ClosedCaixa {
  id: string;
  user_id: string;
  start_date: Date;
  end_date: Date;
  total_sales: number;
  total_cash: number;
  total_credit: number;
  total_debit: number;
  total_pix: number;
}