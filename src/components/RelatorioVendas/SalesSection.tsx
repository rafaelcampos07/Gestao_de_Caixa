import { Venda } from '../../types';
import { TabelaVendas } from '../TabelaVendas';
import { SalesStats } from './SalesStats';
import { calculateSalesStats } from '../../utils/sales';

interface SalesSectionProps {
  title: string;
  vendas: Venda[];
  onDelete: (id: string) => void;
}

export function SalesSection({ title, vendas, onDelete }: SalesSectionProps) {
  const stats = calculateSalesStats(vendas);

  return (
    <div className="space-y-6">
      <SalesStats stats={stats} title={`Total ${title}`} />
      
      <div>
        <h2 className="text-xl font-bold mb-4">{title}</h2>
        <TabelaVendas vendas={vendas} excluirVenda={onDelete} />
      </div>
    </div>
  );
}