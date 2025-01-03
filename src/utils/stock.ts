import { supabase } from '../lib/supabase';
import type { ItemVenda } from '../types';

export async function updateStockAfterDelete(items: ItemVenda[]) {
  for (const item of items) {
    await supabase
      .from('produtos')
      .update({ 
        estoque: item.produto.estoque + item.quantidade 
      })
      .eq('id', item.produto.id);
  }
}

// Rest of the file remains the same...