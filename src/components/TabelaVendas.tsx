import React, { useState } from 'react';
import { Trash2, Edit3, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import EditarVendaModal from './EditarVendaModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import InformacoesModal from './InformacoesModal'; // Importando o novo modal
import type { Venda, Funcionario } from '../types';
import { Button } from 'react-bootstrap';

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
  const [showInformacoesModal, setShowInformacoesModal] = useState(false); // Estado para o modal de informações

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

  const handleInformacoesVenda = (venda: Venda) => {
    setVendaSelecionada(venda);
    setShowInformacoesModal(true);
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
      } catch (error) {
        console.error('Erro ao excluir venda:', error);
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
      <table class Name="min-w-full bg-white border border-gray-300 shadow-lg rounded-lg">
        <thead style={{ backgroundColor: '#4f46e5', color: 'white' }}>
          <tr>
            <th className="px-4 py-2 text-center border-b">Data e Hora</th>
            <th className="px-4 py-2 text-center border-b">Funcionário</th>
            <th className="px-4 py-2 text-center border-b">Itens Vendidos</th>
            <th className="px-4 py-2 text-center border-b">Desconto (%)</th>
            <th className="px-4 py-2 text-center border-b">Desconto (R$)</th>
            <th className="px-4 py-2 text-center border-b">Total da Venda</th>
            <th className="px-4 py-2 text-center border-b">Forma de Pagamento</th>
            <th className="px-4 py-2 text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {vendas.length === 0 ? (
            <tr>
              <td className="border px-4 py-2 text-center" colSpan={8}>Nenhuma venda encontrada</td>
            </tr>
          ) : (
            vendas.map((venda) => (
              <tr key={venda.id} className="hover:bg-gray-100 transition duration-200">
                <td className="border px-4 py-2 text-center">{new Date(venda.data).toLocaleString()}</td>
                <td className="border px-4 py-2 text-center">{getFuncionarioNome(venda.funcionario_id)}</td>
                <td className="border px-4 py-2 text-center">{renderItensVenda(venda.items)}</td>
                <td className="border px-4 py-2 text-center">{(venda.desconto_porcentagem ?? 0).toFixed(2)}%</td>
                <td className="border px-4 py-2 text-center">R$ {(venda.desconto_dinheiro ?? 0).toFixed(2)}</td>
                <td className="border px-4 py-2 text-center">R$ {venda.total.toFixed(2)}</td>
                <td className="border px-4 py-2 text-center">{venda.forma_pagamento}</td>
                <td className="border px-4 py-2 text-center flex justify-center">
                  <Button
                    variant="outline-primary"
                    className="btn-sm mr-2"
                    onClick={() => handleEditarVenda(venda)}
                  >
                    <Edit3 size={16} />
                  </Button>
                  <Button
                    variant="outline-info"
                    className="btn-sm mr-2"
                    onClick={() => handleInformacoesVenda(venda)}
                  >
                    <Info size={16} />
                  </Button>
                  <Button
                    variant="outline-danger"
                    className="btn-sm"
                    onClick={() => handleExcluirVenda(venda)}
                  >
                    <Trash2 size={16} />
                  </Button>
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

      {showInformacoesModal && vendaSelecionada && (
        <InformacoesModal
          show={showInformacoesModal}
          handleClose={() => setShowInformacoesModal(false)}
          title="Informações da Venda"
          content={
            <div>
              <p><strong>Data e Hora:</strong> {new Date(vendaSelecionada.data).toLocaleString()}</p>
              <p><strong>Funcionário:</strong> {getFuncionarioNome(vendaSelecionada.funcionario_id)}</p>
              <p><strong>Itens Vendidos:</strong></p>
              <ul>
                {vendaSelecionada.items.map((item, index) => (
                  <li key={index}>
                    {item.produto.nome} - {item.quantidade}x - R$ {(item.produto.preco * item.quantidade).toFixed (2)}
                  </li>
                ))}
              </ul>
              <p><strong>Desconto (%):</strong> {(vendaSelecionada.desconto_porcentagem ?? 0).toFixed(2)}%</p>
              <p><strong>Desconto (R$):</strong> R$ {(vendaSelecionada.desconto_dinheiro ?? 0).toFixed(2)}</p>
              <p><strong>Total da Venda:</strong> R$ {vendaSelecionada.total.toFixed(2)}</p>
              <p><strong>Forma de Pagamento:</strong> {vendaSelecionada.forma_pagamento}</p>
            </div>
          }
        />
      )}
    </div>
  );
};

export default TabelaVendas;