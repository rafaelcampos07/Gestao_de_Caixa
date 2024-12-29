import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Download, Calendar } from 'lucide-react';
import { utils, writeFile } from 'xlsx';
import toast from 'react-hot-toast';
import type { ClosedCaixa } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { FilterBar } from '../RelatorioVendas/FilterBar';

export function CaixasFechados() {
  const { user } = useAuth();
  const [caixas, setCaixas] = useState<ClosedCaixa[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (user) {
      carregarCaixas();
    }
  }, [user, startDate, endDate]);

  const carregarCaixas = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('closed_caixas')
        .select(`
          id,
          start_date,
          end_date,
          total_sales,
          total_cash,
          total_credit,
          total_debit,
          total_pix,
          items,
          payment_details
        `)
        .eq('user_id', user.id)
        .order('end_date', { ascending: false });

      if (startDate) {
        query = query.gte('end_date', `${startDate}T00:00:00`);
      }
      if (endDate) {
        query = query.lte('end_date', `${endDate}T23:59:59`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCaixas(data || []);
    } catch (error) {
      toast.error('Erro ao carregar caixas fechados');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Rest of the component remains the same...
}