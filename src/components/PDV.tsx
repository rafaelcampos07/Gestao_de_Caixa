import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ShoppingCart, Trash2, Search, DollarSign, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Produto, ItemVenda, Venda } from '../types';

export function PDV() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [carrinho, setCarrinho] = useState<ItemVenda[]>([]);
  const [busca, setBusca] = useState('');
  const [formaPagamento, setFormaPagamento] = useState<Venda['forma_pagamento']>('dinheiro');
  const [desconto, setDesconto] = useState<number | null>(null);

  const [novoProduto, setNovoProduto] = useState({
    nome: '',
    preco: null,
    quantidade: 1
  });

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

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

  const adicionarAoCarrinho = (produto: Produto, quantidade: number = 1) => {
    const item = carrinho.find(i => i.produto.id === produto.id);
    if (item) {
      setCarrinho(carrinho.map(i => 
        i.produto.id === produto.id
          ? { ...i, quantidade: i.quantidade + quantidade, subtotal: (i.quantidade + quantidade) * i.produto.preco }
          : i
      ));
    } else {
      setCarrinho([...carrinho, { produto, quantidade, subtotal: quantidade * produto.preco }]);
    }
  };

  const removerDoCarrinho = (produtoId: string) => {
    setCarrinho(carrinho.filter(i => i.produto.id !== produtoId));
  };

  const total = carrinho.reduce((acc, item) => acc + item.subtotal, 0);

  const totalComDesconto = desconto ? total - (total * desconto) / 100 : total;

  const finalizarVenda = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      if (carrinho.length === 0) {
        toast.error('Adicione produtos ao carrinho');
        return;
      }

      const venda = {
        items: carrinho,
        total: totalComDesconto,
        forma_pagamento: formaPagamento,
        desconto: desconto || 0, // Usa 0 se desconto for null
        data: new Date(),
        finalizada: true,
        user_id: user.id,
      };

      const { error } = await supabase.from('vendas').insert([venda]);
      if (error) throw error;

      toast.success('Venda finalizada com sucesso!');
      setCarrinho([]);
      setDesconto(null);
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
        <div className="space-y-4 mb-4">
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

          <div className="card p-4 border-2 border-indigo-100">
            <h3 className="font-medium text-gray-900 mb-3">Produto Avulso</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={novoProduto.nome}
                onChange={(e) => setNovoProduto(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Nome do produto"
                className="input-field"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={novoProduto.preco ?? ''}
                  onChange={(e) =>
                    setNovoProduto((prev) => ({
                      ...prev,
                      preco: e.target.value ? parseFloat(e.target.value) : null,
                    }))
                  }
                  placeholder="Preço"
                  className="input-field"
                />
                <input
                  type="number"
                  min="1"
                  value={novoProduto.quantidade}
                  onChange={(e) => setNovoProduto(prev => ({ ...prev, quantidade: parseInt(e.target.value) }))}
                  placeholder="Qtd"
                  className="input-field w-24"
                />
              </div>
              <button 
                onClick={() => {
                  if (!novoProduto.nome || novoProduto.preco <= 0) {
                    toast.error('Preencha o nome e o preço do produto');
                    return;
                  }
                  const produtoAvulso: Produto = {
                    id: `temp-${Date.now()}`,
                    nome: novoProduto.nome,
                    preco: novoProduto.preco,
                    descricao: '',
                    codigo: '',
                    estoque: 0
                  };
                  adicionarAoCarrinho(produtoAvulso, novoProduto.quantidade);
                  setNovoProduto({ nome: '', preco: 0, quantidade: 1 });
                }} 
                className="btn-primary w-full"
              >
                <Plus size={20} />
                Adicionar ao Carrinho
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {produtos
            .filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()))
            .map(produto => (
              <button
                key={produto.id}
                onClick={() => adicionarAoCarrinho(produto)}
                className="p-3 rounded-lg border-2 border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors text-left"
              >
                <div className="font-medium text-gray-900">{produto.nome}</div>
                <div className="text-indigo-600 font-medium">
                  R$ {produto.preco.toFixed(2)}
                </div>
              </button>
            ))}
        </div>
      </div>

      <div className="card p-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ShoppingCart className="text-indigo-600" />
          Carrinho
        </h2>

        <div className="space-y-2 mb-4">
          {carrinho.map(item => (
            <div key={item.produto.id} className="flex justify-between items-center p-3 rounded-lg border-2 border-gray-200 bg-gray-50">
              <div>
                <div className="font-medium text-gray-900">{item.produto.nome}</div>
                <div className="text-sm text-gray-600">
                  {item.quantidade}x R$ {item.produto.preco.toFixed(2)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="font-medium text-indigo-600">
                  R$ {item.subtotal.toFixed(2)}
                </div>
                <button
                  onClick={() => removerDoCarrinho(item.produto.id)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 mb-4">
          <select
            value={formaPagamento}
            onChange={(e) => setFormaPagamento(e.target.value as Venda['forma_pagamento'])}
            className="input-field"
          >
            <option value="dinheiro">Dinheiro</option>
            <option value="pix">PIX</option>
            <option value="debito">Cartão de Débito</option>
            <option value="credito">Cartão de Crédito</option>
          </select>

          <input
            type="number"
            step="0.01"
            value={desconto ?? ''}
            onChange={(e) => setDesconto(e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="Desconto (%)"
            className="input-field"
          />
        </div>

        <div className="text-2xl font-semibold text-gray-900 mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Total:</span>
          <span>R$ {totalComDesconto.toFixed(2)}</span>
        </div>

        <button onClick={finalizarVenda} className="btn-primary w-full">
          <DollarSign />
          Finalizar Venda
        </button>
      </div>
    </div>
  );
}
