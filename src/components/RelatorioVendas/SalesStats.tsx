import { ResumoVendas } from '../../types';

interface SalesStatsProps {
  stats: ResumoVendas;
  title: string;
}

export function SalesStats({ stats, title }: SalesStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="card p-4">
        <div className="text-sm font-medium text-gray-600">Dinheiro</div>
        <div className="text-2xl font-semibold text-gray-900">
          R$ {stats.dinheiro.toFixed(2)}
        </div>
      </div>
      <div className="card p-4">
        <div className="text-sm font-medium text-gray-600">PIX</div>
        <div className="text-2xl font-semibold text-gray-900">
          R$ {stats.pix.toFixed(2)}
        </div>
      </div>
      <div className="card p-4">
        <div className="text-sm font-medium text-gray-600">Cartão</div>
        <div className="text-2xl font-semibold text-gray-900">
          R$ {stats.cartao.toFixed(2)}
        </div>
      </div>
      <div className="card p-4 bg-indigo-600">
        <div className="text-sm font-medium text-indigo-100">{title}</div>
        <div className="text-2xl font-semibold text-white">
          R$ {stats.total.toFixed(2)}
        </div>
      </div>
    </div>
  );
}