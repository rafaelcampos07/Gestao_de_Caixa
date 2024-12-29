import { supabase } from '../lib/supabase';
import type { Venda, ClosedCaixa } from '../types';

export async function fecharCaixa(vendas: Venda[]): Promise<boolean> {
  try {
    const totals = vendas.reduce((acc, venda) => {
      const total = venda.total;
      
      switch (venda.forma_pagamento) {
        case 'dinheiro':
          acc.total_cash += total;
          break;
        case 'pix':
          acc.total_pix += total;
          break;
        case 'credito':
          acc.total_credit += total;
          break;
        case 'debito':
          acc.total_debit += total;
          break;
      }
      
      acc.total_sales += total;
      return acc;
    }, {
      total_sales: 0,
      total_cash: 0,
      total_credit: 0,
      total_debit: 0,
      total_pix: 0
    });

    const caixa = {
      ...totals,
      start_date: new Date(Math.min(...vendas.map(v => new Date(v.data).getTime()))),
      end_date: new Date(),
      items: vendas.map(v => ({
        id: v.id,
        items: v.items,
        total: v.total,
        forma_pagamento: v.forma_pagamento,
        payment_details: v.payment_details
      }))
    };

    const { error: insertError } = await supabase
      .from('caixas_fechados')
      .insert([caixa]);

    if (insertError) throw insertError;

    const { error: deleteError } = await supabase
      .from('vendas')
      .delete()
      .in('id', vendas.map(v => v.id));

    if (deleteError) throw deleteError;

    return true;
  } catch (error) {
    console.error('Erro ao fechar caixa:', error);
    return false;
  }
}