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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredProducts.map(produto => (
        <div
          key={produto.id}
          className="p-4 rounded-lg border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50/50 transition-colors"
        >
          <div className="flex justify-between items-center">
            <div className="font-medium text-gray-900">{produto.nome}</div>
            <button
              onClick={() => onAddToCart(produto)}
              className="p-2 rounded-full bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
              aria-label={`Adicionar ${produto.nome} ao carrinho`}
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="text-indigo-600 font-medium mt-2">
            R$ {produto.preco.toFixed(2)}
          </div>
        </div>
      ))}
      {filteredProducts.length === 0 && (
        <div className="col-span-full text-center py-8 text-gray-500">
          Nenhum produto encontrado
        </div>
      )}
    </div>
  );
}