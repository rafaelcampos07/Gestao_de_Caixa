import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import TabelaVendas from './TabelaVendas';
import EditarVendaModal from './EditarVendaModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { AiOutlineSearch, AiOutlineDollarCircle } from 'react-icons/ai';
import { FaMoneyBillWave, FaCreditCard, FaMoneyCheckAlt, FaCashRegister } from 'react-icons/fa';
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
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [vendaToDelete, setVendaToDelete] = useState<{ id: number, tabela: 'vendas' | 'caixas_fechados' } | null>(null);
  const [isCloseCaixaConfirmModalOpen, setIsCloseCaixaConfirmModalOpen] = useState(false);
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
        const startDate = new Date(start);
        startDate.setHours(0, 0, 0, 0); // Início do dia
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999); // Fim do dia

        queryAtivas = queryAtivas.gte('data', startDate.toISOString()).lte('data', endDate.toISOString());
        queryFechadas = queryFechadas.gte('data', startDate.toISOString()).lte('data', endDate.toISOString());
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

  const excluirVenda = async () => {
    if (!vendaToDelete) return;

    try {
      // Primeiro, excluir os itens vendidos
      const { data: itensVendidos, error: itemError } = await supabase
        .from('itens_vendidos')
        .select('*')
        .eq('venda_id', vendaToDelete.id);

      if (itemError) throw itemError;

      // Excluir cada item vendido
      for (const item of itensVendidos) {
        const { error: deleteItemError } = await supabase
          .from('itens_vendidos')
          .delete()
          .eq('id', item.id);

        if (deleteItemError) throw deleteItemError;
      }

      // Em seguida, excluir a venda
      const { error: vendaError } = await supabase.from(vendaToDelete.tabela).delete().eq('id', vendaToDelete.id);
      if (vendaError) throw vendaError;

      // Remover a venda da lista de vendas ativas ou fechadas
      if (vendaToDelete.tabela === 'vendas') {
        setVendasAtivas((prevVendas) => prevVendas.filter((venda) => venda.id !== vendaToDelete.id));
      } else {
        setVendasFechadas((prevVendas) => prevVendas.filter((venda) => venda.id !== vendaToDelete.id));
      }

      toast.success('Venda excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir venda:', error);
      toast.error('Erro ao excluir venda');
    } finally {
      setIsConfirmModalOpen(false);
      setVendaToDelete(null);
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

  const confirmarFecharCaixa = () => {
    setIsCloseCaixaConfirmModalOpen(true);
  };

  const fecharCaixa = async () => {
    try {
      // Insere as vendas ativas no "caixas_fechados"
      const { error: insertError } = await supabase.from('caixas_fechados').insert(
        vendasAtivas.map(venda => ({
          ...venda,
          data: new Date(venda.data).toISOString() // Garante que a data está em formato ISO
        }))
      );
      if (insertError) throw insertError;

      // Deleta as vendas ativas do "vendas"
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
    } finally {
      setIsCloseCaixaConfirmModalOpen(false);
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
        <button
          onClick={confirmarFecharCaixa}
          className="btn-custom"
        >
          <FaCashRegister size={24} />
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
        <TabelaVendas vendas={vendasAtivas} excluirVenda={(id) => setVendaToDelete({ id, tabela: 'vendas' })} editarVenda={editarVenda} tipoTabela="ativas" funcionarios={funcionarios} />
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
        <TabelaVendas vendas={vendasFechadas} excluirVenda={(id) => setVendaToDelete({ id, tabela: 'caixas_fechados' })} editarVenda={editarVenda} tipoTabela="fechadas" funcionarios={funcionarios} />
      </div>

      <EditarVendaModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        venda={vendaAtual}
        atualizarVenda={atualizarVenda}
        tipoTabela="ativas"
      />

      <ConfirmDeleteModal
        show={isConfirmModalOpen}
        handleClose={() => setIsConfirmModalOpen(false)}
        handleConfirm={excluirVenda}
        message="Deseja realmente excluir esta venda?"
      />
      
      <ConfirmDeleteModal
        show={isCloseCaixaConfirmModalOpen}
        handleClose={() => setIsCloseCaixaConfirmModalOpen(false)}
        handleConfirm={fecharCaixa}
        message="Deseja realmente fechar o caixa?"
      />
    </div>
  );
}