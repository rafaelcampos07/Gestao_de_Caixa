import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { TabelaVendas } from './TabelaVendas';
import type { Venda } from '../types';

export function RelatorioVendas() {
  const [vendasAtivas, setVendasAtivas] = useState<Venda[]>([]);
  const [vendasFechadas, setVendasFechadas] = useState<Venda[]>([]);
  const [totaisAtivos, setTotaisAtivos] = useState({
    dinheiro: 0,
    pix: 0,
    cartao: 0,
    total: 0,
  });
  const [totaisFechados, setTotaisFechados] = useState({
    dinheiro: 0,
    pix: 0,
    cartao: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarVendas();
  }, []);

  const carregarVendas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      // Carregar vendas ativas
      const { data: ativas, error: errorAtivas } = await supabase
        .from('vendas')
        .select('*')
        .eq('user_id', user.id);

      if (errorAtivas) throw errorAtivas;
      setVendasAtivas(ativas || []);
      calcularTotais(ativas || [], setTotaisAtivos);

      // Carregar vendas fechadas
      const { data: fechadas, error: errorFechadas } = await supabase
        .from('caixas_fechados')
        .select('*')
        .eq('user_id', user.id);

      if (errorFechadas) throw errorFechadas;
      setVendasFechadas(fechadas || []);
      calcularTotais(fechadas || [], setTotaisFechados);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
      toast.error('Erro ao carregar vendas');
    } finally {
      setLoading(false);
    }
  };

  const calcularTotais = (vendas: Venda[], setTotais: (totais: any) => void) => {
    const totais = vendas.reduce(
      (acc, venda) => {
        const { forma_pagamento, total } = venda;
        if (forma_pagamento === 'dinheiro') acc.dinheiro += total;
        if (forma_pagamento === 'pix') acc.pix += total;
        if (['credito', 'debito'].includes(forma_pagamento)) acc.cartao += total;
        acc.total += total;
        return acc;
      },
      { dinheiro: 0, pix: 0, cartao: 0, total: 0 }
    );

    setTotais(totais);
  };

  const excluirVenda = async (id: number, tabela: 'vendas' | 'caixas_fechados') => {
    try {
      const { error } = await supabase.from(tabela).delete().eq('id', id);
      if (error) throw error;

      toast.success('Venda excluída com sucesso!');

      if (tabela === 'vendas') {
        setVendasAtivas(vendasAtivas.filter((venda) => venda.id !== id));
        calcularTotais(vendasAtivas.filter((venda) => venda.id !== id), setTotaisAtivos);
      } else if (tabela === 'caixas_fechados') {
        setVendasFechadas(vendasFechadas.filter((venda) => venda.id !== id));
        calcularTotais(vendasFechadas.filter((venda) => venda.id !== id), setTotaisFechados);
      }
    } catch (error) {
      console.error('Erro ao excluir venda:', error);
      toast.error('Erro ao excluir venda');
    }
  };

  const fecharCaixa = async () => {
    if (!confirm('Deseja realmente fechar o caixa?')) return;

    try {
      // Mover vendas ativas para caixas_fechados
      const { error: insertError } = await supabase
        .from('caixas_fechados')
        .insert(vendasAtivas);

      if (insertError) throw insertError;

      // Deletar vendas da tabela vendas
      const { error: deleteError } = await supabase
        .from('vendas')
        .delete()
        .in('id', vendasAtivas.map((venda) => venda.id));

      if (deleteError) throw deleteError;

      toast.success('Caixa fechado com sucesso!');
      setVendasAtivas([]);
      setTotaisAtivos({ dinheiro: 0, pix: 0, cartao: 0, total: 0 });
      carregarVendas(); // Recarregar vendas fechadas
    } catch (error) {
      console.error('Erro ao fechar o caixa:', error);
      toast.error('Erro ao fechar o caixa');
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
    <div>
      <div className="flex justify-end mb-6">
        <button onClick={fecharCaixa} className="btn-primary">
          Fechar Caixa
        </button>
      </div>

      {/* Resumo Vendas Ativas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="text-sm font-medium text-gray-600">Dinheiro</div>
          <div className="text-2xl font-semibold text-gray-900">
            R$ {totaisAtivos.dinheiro.toFixed(2)}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm font-medium text-gray-600">PIX</div>
          <div className="text-2xl font-semibold text-gray-900">
            R$ {totaisAtivos.pix.toFixed(2)}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm font-medium text-gray-600">Cartão</div>
          <div className="text-2xl font-semibold text-gray-900">
            R$ {totaisAtivos.cartao.toFixed(2)}
          </div>
        </div>
        <div className="card p-4 bg-indigo-600">
          <div className="text-sm font-medium text-indigo-100">Total Geral</div>
          <div className="text-2xl font-semibold text-white">
            R$ {totaisAtivos.total.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4">Vendas Ativas</h2>
        <TabelaVendas vendas={vendasAtivas} excluirVenda={(id) => excluirVenda(id, 'vendas')} />
      </div>

      {/* Resumo Vendas Fechadas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="text-sm font-medium text-gray-600">Dinheiro</div>
          <div className="text-2xl font-semibold text-gray-900">
            R$ {totaisFechados.dinheiro.toFixed(2)}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm font-medium text-gray-600">PIX</div>
          <div className="text-2xl font-semibold text-gray-900">
            R$ {totaisFechados.pix.toFixed(2)}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-sm font-medium text-gray-600">Cartão</div>
          <div className="text-2xl font-semibold text-gray-900">
            R$ {totaisFechados.cartao.toFixed(2)}
          </div>
        </div>
        <div className="card p-4 bg-indigo-600">
          <div className="text-sm font-medium text-indigo-100">Total Geral</div>
          <div className="text-2xl font-semibold text-white">
            R$ {totaisFechados.total.toFixed(2)}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Vendas Fechadas</h2>
        <TabelaVendas
          vendas={vendasFechadas}
          excluirVenda={(id) => excluirVenda(id, 'caixas_fechados')}
        />
      </div>
    </div>
  );
}