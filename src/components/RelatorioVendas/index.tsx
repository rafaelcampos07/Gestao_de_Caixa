import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { DateRangeFilter } from './DateRangeFilter';
import { SalesSection } from './SalesSection';
import type { Venda } from '../../types';
import { useAuth } from '../../hooks/useAuth';

export function RelatorioVendas() {
  const { user } = useAuth();
  const [vendasAtivas, setVendasAtivas] = useState<Venda[]>([]);
  const [vendasFechadas, setVendasFechadas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (user) {
      carregarVendas();
    }
  }, [user]);

  const carregarVendas = async () => {
    if (!user) return;
    setLoading(true);

    try {
      let queryAtivas = supabase
        .from('vendas')
        .select('*')
        .eq('user_id', user.id)
        .order('data', { ascending: false });

      let queryFechadas = supabase
        .from('closed_caixas')
        .select('*')
        .eq('user_id', user.id)
        .order('end_date', { ascending: false });

      // Apply date filters if they exist
      if (startDate) {
        queryAtivas = queryAtivas.gte('data', `${startDate}T00:00:00`);
        queryFechadas = queryFechadas.gte('end_date', `${startDate}T00:00:00`);
      }
      if (endDate) {
        queryAtivas = queryAtivas.lte('data', `${endDate}T23:59:59`);
        queryFechadas = queryFechadas.lte('end_date', `${endDate}T23:59:59`);
      }

      const [ativasResult, fechadasResult] = await Promise.all([
        queryAtivas,
        queryFechadas
      ]);

      if (ativasResult.error) throw ativasResult.error;
      if (fechadasResult.error) throw fechadasResult.error;

      setVendasAtivas(ativasResult.data || []);
      setVendasFechadas(fechadasResult.data || []);
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
      toast.error('Erro ao carregar vendas');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, type: 'ativas' | 'fechadas') => {
    if (!confirm('Tem certeza que deseja excluir esta venda?')) return;

    try {
      const { error } = await supabase
        .from(type === 'ativas' ? 'vendas' : 'closed_caixas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Venda excluída com sucesso!');
      carregarVendas();
    } catch (error) {
      console.error('Erro ao excluir venda:', error);
      toast.error('Erro ao excluir venda');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <DateRangeFilter
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onFilter={carregarVendas}
      />

      <div className="space-y-12">
        <SalesSection
          title="Vendas Ativas"
          vendas={vendasAtivas}
          onDelete={(id) => handleDelete(id, 'ativas')}
        />

        <SalesSection
          title="Vendas Fechadas"
          vendas={vendasFechadas}
          onDelete={(id) => handleDelete(id, 'fechadas')}
        />
      </div>
    </div>
  );
}