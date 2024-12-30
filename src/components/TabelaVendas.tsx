import React from 'react';
import { Trash2 } from 'lucide-react';
import type { Venda } from '../types';

interface TabelaVendasProps {
  vendas: Venda[];
  excluirVenda?: (id: number) => void;
}

export const TabelaVendas: React.FC<TabelaVendasProps> = ({ vendas, excluirVenda }) => {
  const renderItensVenda = (itens) => {
    return itens.map((item, index) => (
      <div key={index} className="flex justify-between items-center p-2">
        <span>{item.produto.nome} {item.quantidade}x</span>
        <span>R$ {(item.produto.preco * item.quantidade).toFixed(2)}</span>
      </div>
    ));
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-center border-b">Data e Hora</th>
            <th className="px-4 py-2 text-center border-b">Itens Vendidos</th>
            <th className="px-4 py-2 text-center border-b">Desconto (%)</th>
            <th className="px-4 py-2 text-center border-b">Total da Venda</th>
            <th className="px-4 py-2 text-center border-b">Forma de Pagamento</th>
            {excluirVenda && <th className="px-4 py-2 text-center border-b">Ações</th>}
          </tr>
        </thead>
        <tbody>
          {vendas.length === 0 ? (
            <tr>
              <td className="border px-4 py-2 text-center" colSpan={excluirVenda ? 6 : 5}>Nenhuma venda encontrada</td>
            </tr>
          ) : (
            vendas.map((venda) => (
              <tr key={venda.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2 text-center">{new Date(venda.data).toLocaleString()}</td>
                <td className="border px-4 py-2 text-center">{renderItensVenda(venda.items)}</td>
                <td className="border px-4 py-2 text-center">{venda.desconto}%</td>
                <td className="border px-4 py-2 text-center">R$ {venda.total.toFixed(2)}</td>
                <td className="border px-4 py-2 text-center">{venda.forma_pagamento}</td>
                {excluirVenda && (
                  <td className="border px-4 py-2 text-center">
                    <button onClick={() => excluirVenda(venda.id)} className="text-red-600 hover:text-red-800">
                      <Trash2 size={20} />
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};