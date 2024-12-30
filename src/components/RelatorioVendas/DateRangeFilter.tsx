import { Calendar, Search } from 'lucide-react';

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onFilter: () => void;
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onFilter,
}: DateRangeFilterProps) {
  return (
    <div className="card p-4">
      <h2 className="text-lg font-semibold mb-4">Filtrar por Período</h2>
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="input-field pl-10"
            placeholder="Data inicial"
          />
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
        <span className="text-gray-500">até</span>
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="input-field pl-10"
            placeholder="Data final"
          />
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        </div>
        <button 
          onClick={onFilter}
          className="btn-primary whitespace-nowrap"
        >
          <Search size={20} />
          Buscar
        </button>
      </div>
    </div>
  );
}