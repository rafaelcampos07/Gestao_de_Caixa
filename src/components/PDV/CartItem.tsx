import { Trash2 } from 'lucide-react';
import { ItemVenda } from '../../types';

interface CartItemProps {
  item: ItemVenda;
  onRemove: (id: string) => void;
}

export function CartItem({ item, onRemove }: CartItemProps) {
  return (
    <div className="flex justify-between items-center p-3 rounded-lg border-2 border-gray-200 bg-gray-50">
      <div>
        <div className="font-medium text-gray-900">{item.produto.nome}</div>
        <div className="text-sm text-gray-600">
          {item.quantidade}x R$ {item.produto.preco.toFixed(2)}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="font-medium text-indigo-600">
          R$ {item.subtotal.toFixed(2)}
        </div>
        <button
          onClick={() => onRemove(item.produto.id)}
          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}