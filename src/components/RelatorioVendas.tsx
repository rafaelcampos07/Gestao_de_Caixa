import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import TabelaVendas from './TabelaVendas';
import EditarVendaModal from './EditarVendaModal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { AiOutlineSearch, AiOutlineDollarCircle } from 'react-icons/ai';
import { FaMoneyBillWave, FaCreditCard, FaMoneyCheckAlt } from 'react-icons/fa';
import type { Venda, Funcionario } from '../types';

export function RelatorioVendas() {
  const [vendasAtivas, setVendasAtivas] = useState<Venda[]>([]);
  const [vendasFechadas, setVendasFechadas] = useState<Venda[]>([]);
  const [totaisAtivos, setTotaisAtivos] = useState({
    dinheiro: 0,
    pix: 0,
    credito: 0,
    debito: 0,
    total: 0,
  });
  const [totaisFechados, setTotaisFechados] = useState({
    dinheiro: 0,
    pix: 0,
    credito: 0,
    debito: 0,
    total: 0,
  });
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [vendaAtual, setVendaAtual] = useState<Venda | null>(null);
  const [isFilterActive, setIsFilterActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    carregarVendas();
    carregarFuncionarios();

    intervalRef.current = setInterval(() => {
      if (!isFilterActive) {
        console.log('Atualizando vendas...');
        carregarVendas();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isFilterActive]);

  const carregarFuncionarios = async () => {
    try {
      const { data, error } = await supabase.from('funcionarios').select('*');
      if (error) throw error;
      setFuncionarios(data || []);
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      toast.error('Erro ao carregar funcionários');
    }
  };

  const carregarVendas = async (start?: Date, end?: Date) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Usuário não autenticado');
        return;
      }

      let queryAtivas = supabase.from('vendas').select('*').eq('user_id', user.id);
      let queryFechadas = supabase.from('caixas_fechados').select('*').eq('user_id', user.id);

      if (start && end) {
        queryAtivas = queryAtivas.gte('data', start.toISOString()).lte('data', end.toISOString());
        queryFechadas = queryFechadas.gte('data', start.toISOString()).lte('data', end.toISOString());
      }

      const { data: ativas, error: errorAtivas } = await queryAtivas;
      if (errorAtivas) throw errorAtivas;
      setVendasAtivas(ativas || []);
      calcularTotais(ativas || [], setTotaisAtivos);

      const { data: fechadas, error: errorFechadas } = await queryFechadas;
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
        if (forma_pagamento === 'credito') acc.credito += total;
        if (forma_pagamento === 'debito') acc.debito += total;
        acc.total += total;
        return acc;
      },
      { dinheiro: 0, pix: 0, credito: 0, debito: 0, total: 0 }
    );

    setTotais(totais);
  };

  const excluirVenda = async (id: number, tabela: 'vendas' | 'caixas_fechados') => {
    if (!confirm('Deseja realmente excluir esta venda?')) return;

    try {
      const { error } = await supabase.from(tabela).delete().eq('id', id);
      if (error) throw error;

      toast.success('Venda excluída com sucesso!');
      carregarVendas();
    } catch (error) {
      console.error('Erro ao excluir venda:', error);
      toast.error('Erro ao excluir venda');
    }
  };

  const editarVenda = (id: number) => {
    const venda = [...vendasAtivas, ...vendasFechadas].find((venda) => venda.id === id);
    setVendaAtual(venda || null);
    setShowModal(true);
  };

  const atualizarVenda = () => {
    setShowModal(false);
    toast.success('Venda atualizada com sucesso!');
    carregarVendas();
  };

  const fecharCaixa = async () => {
    if (!confirm('Deseja realmente fechar o caixa?')) return;

    try {
      const { error: insertError } = await supabase.from('caixas_fechados').insert(vendasAtivas);
      if (insertError) throw insertError;

      const { error: deleteError } = await supabase
        .from('vendas')
        .delete()
        .in('id', vendasAtivas.map((venda) => venda.id));

      if (deleteError) throw deleteError;

      toast.success('Caixa fechado com sucesso!');
      setVendasAtivas([]);
      setTotaisAtivos({ dinheiro: 0, pix: 0, credito: 0, debito: 0, total: 0 });
      carregarVendas();
    } catch (error) {
      console.error('Erro ao fechar o caixa:', error);
      toast.error('Erro ao fechar o caixa');
    }
  };

  const handleFilter = () => {
    setIsFilterActive(true);
    carregarVendas(startDate, endDate);
  };

  const clearFilter = () => {
    setIsFilterActive(false);
    setStartDate(null);
    setEndDate(null);
    carregarVendas();
  };

  useEffect(() => {
    if (!isFilterActive && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        if (!isFilterActive) {
          console.log('Atualizando vendas...');
          carregarVendas();
        }
      }, 1000);
    }
  }, [isFilterActive]);

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

      <div className="flex gap-4 mb-6">
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          selectsStart
          startDate={startDate}
          endDate={endDate}
          placeholderText="Data Inicial"
          className="border p-2 rounded"
        />
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          selectsEnd
          startDate={startDate}
          endDate={endDate}
          minDate={startDate}
          placeholderText="Data Final"
          className="border p-2 rounded"
        />
        <button onClick={handleFilter} className="btn-primary flex items-center gap-2">
          <AiOutlineSearch size={20} />
          Filtrar
        </button>
        <button onClick={clearFilter} className="btn-secondary">
          Limpar Filtro
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-6">
        <div className="card p-2 flex items-center gap-2">
          <FaMoneyBillWave size={20} className="text-green-600" />
          <div>
            <div className="text-sm font-medium text-gray-600">Dinheiro</div>
            <div className="text-xl font-semibold text-gray-900">R$ {totaisAtivos.dinheiro.toFixed(2)}</div>
          </div>
        </div>
        <div className="card p-2 flex items-center gap-2">
          <FaMoneyCheckAlt size={20} className="text-blue-600" />
          <div>
            <div className="text-sm font-medium text-gray-600">PIX</div>
            <div className="text-xl font-semibold text-gray-900">R$ {totaisAtivos.pix.toFixed(2)}</div>
          </div>
        </div>
        <div className="card p-2 flex items-center gap-2">
          <FaCreditCard size={20} className="text-purple-600" />
          <div>
            <div className="text-sm font-medium text-gray-600">Crédito</div>
            <div className="text-xl font-semibold text-gray-900">R$ {totaisAtivos.credito.toFixed(2)}</div>
          </div>
        </div>
        <div className="card p-2 flex items-center gap-2">
          <FaCreditCard size={20} className="text-purple-600" />
          <div>
            <div className="text-sm font-medium text-gray-600">Débito</div>
            <div className="text-xl font-semibold text-gray-900">R$ {totaisAtivos.debito.toFixed(2)}</div>
          </div>
        </div>
        <div className="card p-2 bg-indigo-600 flex items-center gap-2">
          <AiOutlineDollarCircle size={20} className="text-white" />
          <div>
            <div className="text-sm font-medium text-indigo-100">Total Geral</div>
            <div className="text-xl font-semibold text-white">R$ {totaisAtivos.total.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <h2 className="text-xl font-bold mb-4">Vendas Ativas</h2>
        <TabelaVendas vendas={vendasAtivas} excluirVenda={excluirVenda} editarVenda={editarVenda} tipoTabela="ativas" funcionarios={funcionarios} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-6">
        <div className="card p-2 flex items-center gap-2">
          <FaMoneyBillWave size={20} className="text-green-600" />
          <div>
            <div className="text-sm font-medium text-gray-600">Dinheiro</div>
            <div className="text-xl font-semibold text-gray-900">R$ {totaisFechados.dinheiro.toFixed(2)}</div>
          </div>
        </div>
        <div className="card p-2 flex items-center gap-2">
          <FaMoneyCheckAlt size={20} className="text-blue-600" />
          <div>
            <div className="text-sm font-medium text-gray-600">PIX</div>
            <div className="text-xl font-semibold text-gray-900">R$ {totaisFechados.pix.toFixed(2)}</div>
          </div>
        </div>
        <div className="card p-2 flex items-center gap-2">
          <FaCreditCard size={20} className="text-purple-600" />
          <div>
            <div className="text-sm font-medium text-gray-600">Crédito</div>
            <div className="text-xl font-semibold text-gray-900">R$ {totaisFechados.credito.toFixed(2)}</div>
          </div>
        </div>
        <div className="card p-2 flex items-center gap-2">
          <FaCreditCard size={20} className="text-purple-600" />
          <div>
            <div className="text-sm font-medium text-gray-600">Débito</div>
            <div className="text-xl font-semibold text-gray-900">R$ {totaisFechados.debito.toFixed(2)}</div>
          </div>
        </div>
        <div className="card p-2 bg-indigo-600 flex items-center gap-2">
          <AiOutlineDollarCircle size={20} className="text-white" />
          <div>
            <div className="text-sm font-medium text-indigo-100">Total Geral</div>
            <div className="text-xl font-semibold text-white">R$ {totaisFechados.total.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Vendas Fechadas</h2>
        <TabelaVendas vendas={vendasFechadas} excluirVenda={excluirVenda} editarVenda={editarVenda} tipoTabela="fechadas" funcionarios={funcionarios} />
      </div>

      <EditarVendaModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        venda={vendaAtual}
        atualizarVenda={atualizarVenda}
        tipoTabela="ativas"
      />
    </div>
  );
}