import React, { useState } from 'react';
import { Trash2, Edit3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import EditarVendaModal from './EditarVendaModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import type { Venda, Funcionario } from '../types';

interface TabelaVendasProps {
  vendas: Venda[];
  excluirVenda: (id: number, tabela: 'vendas' | 'caixas_fechados') => void;
  editarVenda: (id: number) => void;
  tipoTabela: 'ativas' | 'fechadas';
  funcionarios: Funcionario[];
}

const TabelaVendas: React.FC<TabelaVendasProps> = ({ vendas, excluirVenda, editarVenda, tipoTabela, funcionarios }) => {
  const [vendaSelecionada, setVendaSelecionada] = useState<Venda | null>(null);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [vendaParaExcluir, setVendaParaExcluir] = useState<Venda | null>(null);

  const renderItensVenda = (itens) => {
    if (!Array.isArray(itens)) {
      itens = [];
    }
    return itens.map((item, index) => (
      <div key={index} className="flex justify-between items-center p-2">
        <span>{item.produto.nome} {item.quantidade}x</span>
        <span>R$ {(item.produto.preco * item.quantidade).toFixed(2)}</span>
      </div>
    ));
  };

  const handleExcluirVenda = (venda: Venda) => {
    setVendaParaExcluir(venda);
    setShowConfirmDeleteModal(true);
  };

  const confirmarExcluirVenda = async () => {
    if (vendaParaExcluir) {
      try {
        const tabela = tipoTabela === 'ativas' ? 'vendas' : 'caixas_fechados';

        // Atualizar o estoque dos produtos antes de excluir a venda
        for (const item of vendaParaExcluir.items) {
          if (!item.produto.avulso) {
            const { data: produtoAtualizado, error: produtoError } = await supabase
              .from('produtos')
              .select('estoque')
              .eq('id', item.produto.id)
              .single();

            if (produtoError) {
              console.error('Erro ao atualizar estoque:', produtoError);
              throw produtoError;
            }

            const novoEstoque = produtoAtualizado.estoque + item.quantidade;

            const { error: updateError } = await supabase
              .from('produtos')
              .update({ estoque: novoEstoque })
              .eq('id', item.produto.id);

            if (updateError) {
              console.error('Erro ao atualizar estoque:', updateError);
              throw updateError;
            }
          }
        }

        // Excluir a venda
        const { error: vendaError } = await supabase.from(tabela).delete().eq('id', vendaParaExcluir.id);
        if (vendaError) {
          console.error('Erro ao excluir venda:', vendaError);
          throw vendaError;
        }

        toast.success('Venda excluída com sucesso!');
        // Atualizar a lista de vendas após a exclusão
        const novasVendas = vendas.filter((venda) => venda.id !== vendaParaExcluir.id);
        // Atualiza o estado das vendas
        if (tipoTabela === 'ativas') {
          setVendasAtivas(novasVendas);
        } else {
          setVendasFechadas(novasVendas);
        }
      } catch (error) {
        console.error('Erro ao excluir venda:', error);
        //toast.error('Erro ao excluir venda');
      } finally {
        setShowConfirmDeleteModal(false);
        setVendaParaExcluir(null);
      }
    }
  };

  const handleEditarVenda = (venda: Venda) => {
    setVendaSelecionada(venda);
    setShowEditarModal(true);
  };

  const getFuncionarioNome = (funcionarioId: number) => {
    const funcionario = funcionarios.find((f) => f.id === funcionarioId);
    return funcionario ? funcionario.nome : 'Desconhecido';
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-center border-b">Data e Hora</th>
            <th className="px-4 py-2 text-center border-b">Funcionário</th>
            <th className="px-4 py-2 text-center border-b">Itens Vendidos</th>
            <th className="px-4 py-2 text-center border-b">Desconto (%)</th>
            <th className="px-4 py-2 text-center border-b">Desconto (R$)</th>
            <th className="px-4 py-2 text-center border-b">Total da Venda</th>
            <th className="px-4 py-2 text-center border-b">Forma de Pagamento</th>
            <th className="px-4 py-2 text-center border-b">Ações</th>
          </tr>
        </thead>
        <tbody>
          {vendas.length === 0 ? (
            <tr>
              <td className="border px-4 py-2 text-center" colSpan={8}>Nenhuma venda encontrada</td>
            </tr>
          ) : (
            vendas.map((venda) => (
              <tr key={venda.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2 text-center">{new Date(venda.data).toLocaleString()}</td>
                <td className="border px-4 py-2 text-center">{getFuncionarioNome(venda.funcionario_id)}</td>
                <td className="border px-4 py-2 text-center">{renderItensVenda(venda.items)}</td>
                <td className="border px-4 py-2 text-center">{(venda.desconto_porcentagem ?? 0).toFixed(2)}%</td>
                <td className="border px-4 py-2 text-center">R$ {(venda.desconto_dinheiro ?? 0).toFixed(2)}</td>
                <td className="border px-4 py-2 text-center">R$ {venda.total.toFixed(2)}</td>
                <td className="border px-4 py-2 text-center">{venda.forma_pagamento}</td>
                <td className="border px-4 py-2 text-center">
                  <button onClick={() => handleEditarVenda(venda)} className="text-blue-600 hover:text-blue-800 mr-2">
                    <Edit3 size={20} />
                  </button>
                  <button onClick={() => handleExcluirVenda(venda)} className="text-red-600 hover:text-red-800">
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showEditarModal && vendaSelecionada && (
        <EditarVendaModal
          show={showEditarModal}
          handleClose={() => setShowEditarModal(false)}
          venda={vendaSelecionada}
          atualizarVenda={() => setShowEditarModal(false)}
          tipoTabela={tipoTabela}
        />
      )}

      {showConfirmDeleteModal && vendaParaExcluir && (
        <ConfirmDeleteModal
          show={showConfirmDeleteModal}
          handleClose={() => setShowConfirmDeleteModal(false)}
          handleConfirm={confirmarExcluirVenda}
          message="Deseja realmente excluir esta venda?"
        />
      )}
    </div>
  );
};

export default TabelaVendas;