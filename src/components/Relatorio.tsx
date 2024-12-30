// src/components/Relatorio.tsx

import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';

function Relatorio() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [vendas, setVendas] = useState<any[]>([]);

  const buscarVendasPorData = async () => {
    if (startDate && endDate) {
      try {
        const response = await axios.get('/api/vendas', {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
        });
        setVendas(response.data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between mb-4">
        <div className="flex items-center gap-4">
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
          <button onClick={buscarVendasPorData} className="bg-blue-500 text-white p-2 rounded">
            Buscar
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <TabelaVendas vendas={vendas} />
      </div>
    </div>
  );
}

function TabelaVendas({ vendas }: { vendas: any[] }) {
  if (!vendas || vendas.length === 0) {
    return <div className="text-gray-500 text-center">Nenhuma venda encontrada.</div>;
  }

  return (
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
        </tr>
      </thead>
      <tbody>
        {vendas.map((venda) => {
          const formattedDate = new Date(venda.data).toLocaleString('pt-BR');

          return (
            <tr key={venda.id} className="bg-white hover:bg-gray-100">
              <td className="px-5 py-5 border-b border-gray-200 text-sm text-center">
                {formattedDate}
              </td>
              <td className="px-5 py-5 border-b border-gray-200 text-sm text-center">
                {venda.produto}
              </td>
              <td className="px-5 py-5 border-b border-gray-200 text-sm text-center">
                {venda.quantidade}
              </td>
              <td className="px-5 py-5 border-b border-gray-200 text-sm text-center">
                R$ {venda.subtotal.toFixed(2)}
              </td>
              <td className="px-5 py-5 border-b border-gray-200 text-sm text-center">
                {venda.desconto}%
              </td>
              <td className="px-5 py-5 border-b border-gray-200 text-sm text-center">
                {venda.forma_pagamento}
              </td>
              <td className="px-5 py-5 border-b border-gray-200 text-sm text-center">
                R$ {venda.total.toFixed(2)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export default Relatorio;