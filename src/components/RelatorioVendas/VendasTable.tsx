import { Trash2 } from 'lucide-react';
import { Venda } from '../../types';

interface VendasTableProps {
  vendas: Venda[];
  onDelete: (id: string) => void;
}

export function VendasTable({ vendas, onDelete }: VendasTableProps) {
  return (
    <table className="w-full">
      <thead>
        <tr className="bg-gray-50 border-b border-gray-100">
          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Data</th>
          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Produtos</th>
          <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Pagamento</th>
          <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Total</th>
          <th className="px-4 py-3"></th>
        </tr>
      </thead>
      <tbody>
        {vendas.map(venda => (
          <tr key={venda.id} className="border-b border-gray-100">
            <td className="px-4 py-3 text-sm text-gray-600">
              {new Date(venda.data).toLocaleString()}
            </td>
            <td className="px-4 py-3 text-sm text-gray-900">
              {venda.items.map(i => `${i.quantidade}x ${i.produto.nome}`).join(', ')}
            </td>
            <td className="px-4 py-3 text-sm text-gray-600">
              {venda.forma_pagamento}
            </td>
            <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
              R$ {venda.total.toFixed(2)}
            </td>
            <td className="px-4 py-3">
              <button
                onClick={() => onDelete(venda.id)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </td>
          </tr>
        ))}
        {vendas.length === 0 && (
          <tr>
            <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
              Nenhuma venda encontrada
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}