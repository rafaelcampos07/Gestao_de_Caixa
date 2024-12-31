import React, { useState } from 'react';

interface CartProps {
  items: any[];
  formaPagamento: string;
  desconto: number | null;
  onRemoveItem: (id: string) => void;
  onChangeFormaPagamento: (forma: string) => void;
  onChangeDesconto: (desconto: number | null) => void;
  onFinalizarVenda: () => void;
}

export const Cart: React.FC<CartProps> = ({
  items,
  formaPagamento,
  desconto,
  onRemoveItem,
  onChangeFormaPagamento,
  onChangeDesconto,
  onFinalizarVenda,
}) => {
  const [valorRecebido, setValorRecebido] = useState<number | null>(null);

  const total = items.reduce((acc, item) => acc + item.subtotal, 0) - (desconto || 0);
  const troco = valorRecebido !== null ? valorRecebido - total : 0;

  return (
    <div className="card p-4 space-y-4">
      <h2 className="text-xl font-semibold">Carrinho</h2>
      {items.map((item, index) => (
        <div key={index} className="flex justify-between items-center">
          <span>{item.produto.nome}</span>
          <span>R$ {item.subtotal.toFixed(2)}</span>
          <button
            className="text-red-500"
            onClick={() => onRemoveItem(item.produto.id)}
          >
            Remover
          </button>
        </div>
      ))}
      <div className="space-y-2">
        <div>
          <label htmlFor="formaPagamento" className="block text-sm font-medium">
            Forma de Pagamento
          </label>
          <select
            id="formaPagamento"
            value={formaPagamento}
            onChange={(e) => onChangeFormaPagamento(e.target.value)}
            className="input-field"
          >
            <option value="dinheiro">Dinheiro</option>
            <option value="cartao">Cartão</option>
          </select>
        </div>
        {formaPagamento === 'dinheiro' && (
          <div>
            <label htmlFor="desconto" className="block text-sm font-medium">
              Desconto
            </label>
            <input
              type="number"
              id="desconto"
              min="0"
              step="0.01"
              value={desconto !== null && desconto !== undefined ? desconto : ''}
              onChange={(e) =>
                onChangeDesconto(e.target.value ? parseFloat(e.target.value) : null)
              }
              placeholder="Desconto"
              className="input-field"
            />
          </div>
        )}
        {formaPagamento === 'dinheiro' && (
          <div>
            <label htmlFor="valorRecebido" className="block text-sm font-medium">
              Valor Recebido
            </label>
            <input
              type="number"
              id="valorRecebido"
              min="0"
              step="0.01"
              value={valorRecebido !== null && valorRecebido !== undefined ? valorRecebido : ''}
              onChange={(e) =>
                setValorRecebido(e.target.value ? parseFloat(e.target.value) : null)
              }
              placeholder="Valor Recebido"
              className="input-field"
            />
          </div>
        )}
        <div>
          <span className="block text-sm font-medium">Total:</span>
          <span className="text-lg font-semibold">R$ {total.toFixed(2)}</span>
        </div>
        {formaPagamento === 'dinheiro' && valorRecebido !== null && valorRecebido >= total && (
          <div>
            <span className="block text-sm font-medium">Troco:</span>
            <span className="text-lg font-semibold">R$ {troco.toFixed(2)}</span>
          </div>
        )}
        <button className="btn-primary w-full" onClick={onFinalizarVenda}>
          Finalizar Venda
        </button>
      </div>
    </div>
  );
};