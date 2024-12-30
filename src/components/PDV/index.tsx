import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Produto, ItemVenda, Venda } from '../../types';
import { ProductList } from './ProductList';
import { Cart } from './Cart';
import { useAuth } from '../../hooks/useAuth';
import { useSupabase } from '../../hooks/useSupabase';

export function PDV() {
  const { user } = useAuth();
  const { query, loading } = useSupabase();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemVenda[]>([]);
  const [busca, setBusca] = useState('');
  const [formaPagamento, setFormaPagamento] = useState<Venda['forma_pagamento']>('dinheiro');
  const [desconto, setDesconto] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      carregarProdutos();
    }
  }, [user]);

  const carregarProdutos = async () => {
    if (!user) return;

    const data = await query(() =>
      supabase
        .from('produtos')
        .select('*')
        .eq('user_id', user.id)
    );

    if (data) {
      setProdutos(data);
    }
  };

  // Rest of the component remains the same...
}