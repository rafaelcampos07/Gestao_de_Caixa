import { Produto } from '../../types';
import { Plus } from 'lucide-react';

interface ProductListProps {
  produtos: Produto[];
  busca: string;
  onAddToCart: (produto: Produto) => void;
}

export function ProductList({ produtos, busca, onAddToCart }: ProductListProps) {
  const filteredProducts = produtos.filter(p => 
    p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {filteredProducts.map(produto => (
        <button
          key={produto.id}
          onClick={() => onAddToCart(produto)}
          className="p-3 rounded-lg border-2 border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors text-left"
        >
          <div className="font-medium text-gray-900">{produto.nome}</div>
          <div className="text-indigo-600 font-medium">
            R$ {produto.preco.toFixed(2)}
          </div>
        </button>
      ))}
      {filteredProducts.length === 0 && (
        <div className="col-span-full text-center py-8 text-gray-500">
          Nenhum produto encontrado
        </div>
      )}
    </div>
  );
}