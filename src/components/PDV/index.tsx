import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Produto, ItemVenda, Venda } from '../../types';
import { ProductList } from './ProductList';
import { Cart } from './Cart';
import { useAuth } from '../../hooks/useAuth';

export function PDV() {
  const { user } = useAuth();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
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

    try {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setProdutos(data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const adicionarAoCarrinho = (produto: Produto) => {
    const item = carrinho.find(i => i.produto.id === produto.id);
    if (item) {
      setCarrinho(carrinho.map(i => 
        i.produto.id === produto.id
          ? { ...i, quantidade: i.quantidade + 1, subtotal: (i.quantidade + 1) * i.produto.preco }
          : i
      ));
    } else {
      setCarrinho([...carrinho, { produto, quantidade: 1, subtotal: produto.preco }]);
    }
  };

  const removerDoCarrinho = (produtoId: string) => {
    setCarrinho(carrinho.filter(i => i.produto.id !== produtoId));
  };

  const finalizarVenda = async () => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    if (carrinho.length === 0) {
      toast.error('Adicione produtos ao carrinho');
      return;
    }

    try {
      const venda = {
        items: carrinho,
        total: carrinho.reduce((acc, item) => acc + item.subtotal, 0) - 
          (formaPagamento === 'dinheiro' ? desconto : 0),
        forma_pagamento: formaPagamento,
        desconto: formaPagamento === 'dinheiro' ? desconto : 0,
        data: new Date(),
        finalizada: true,
        user_id: user.id
      };

      const { error } = await supabase.from('vendas').insert([venda]);
      if (error) throw error;

      toast.success('Venda finalizada com sucesso!');
      setCarrinho([]);
      setDesconto(0);
      setFormaPagamento('dinheiro');
    } catch (error) {
      console.error('Erro ao finalizar venda:', error);
      toast.error('Erro ao finalizar venda');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="card p-4">
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar produto..."
              className="input-field flex-1"
            />
            <button className="btn-primary px-3">
              <Search size={20} />
            </button>
          </div>
        </div>

        <div className="mt-4">
          <ProductList
            produtos={produtos}
            busca={busca}
            onAddToCart={adicionarAoCarrinho}
          />
        </div>
      </div>

      <Cart
        items={carrinho}
        formaPagamento={formaPagamento}
        desconto={desconto}
        onRemoveItem={removerDoCarrinho}
        onChangeFormaPagamento={setFormaPagamento}
        onChangeDesconto={setDesconto}
        onFinalizarVenda={finalizarVenda}
      />
    </div>
  );
}