import { Calendar } from 'lucide-react';

interface FilterBarProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export function FilterBar({ startDate, endDate, onStartDateChange, onEndDateChange }: FilterBarProps) {
  return (
    <div className="flex gap-4 items-center mb-6">
      <div className="relative">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="input-field pl-10"
        />
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
      </div>
      <span className="text-gray-500">até</span>
      <div className="relative">
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="input-field pl-10"
        />
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
      </div>
    </div>
  );
}