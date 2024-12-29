import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function TabelaVendas({ vendas, excluirVenda }) {
  if (!vendas || vendas.length === 0) {
    return <div className="text-gray-500 text-center">Nenhuma venda encontrada.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full leading-normal shadow rounded-lg">
        <thead>
          <tr>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Data e Hora
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Produto
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Quantidade
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Subtotal
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Desconto
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Forma de Pagamento
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Total
            </th>
            <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody>
          {vendas.map((venda) => {
            const formattedDate = format(new Date(venda.data), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });

            return (
              <tr key={venda.id} className="bg-white hover:bg-gray-100">
                <td className="px-5 py-5 border-b border-gray-200 text-sm text-center">
                  {formattedDate} {/* Exibe data e hora no horário de Brasília */}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm text-center">
                  {venda.items && venda.items.length > 0 ? (
                    venda.items.map((item, index) => (
                      <div key={index}>{item.produto?.nome || 'Sem nome'}</div>
                    ))
                  ) : (
                    <span className="text-gray-400">Sem produtos</span>
                  )}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm text-center">
                  {venda.items
                    ? venda.items.reduce((sum, item) => sum + (item.quantidade || 0), 0)
                    : 0}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm text-center">
                  R$ {venda.items
                    ? venda.items
                        .reduce((sum, item) => sum + (item.subtotal || 0), 0)
                        .toFixed(2)
                    : '0.00'}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm text-center">
                  {venda.desconto ? venda.desconto + '%' : '0.00%'}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm text-center">
                  {venda.forma_pagamento}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm text-center">
                  R$ {parseFloat(venda.total || 0).toFixed(2)}
                </td>
                <td className="px-5 py-5 border-b border-gray-200 text-sm text-center">
                  <button
                    onClick={() => excluirVenda(venda.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
