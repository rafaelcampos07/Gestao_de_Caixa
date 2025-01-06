// src/components/utils.ts

import { supabase } from "../lib/supabase"; // Ajuste o caminho conforme necessário

export function calculateTotal(items, descontoDinheiro, descontoPorcentagem) {
  const subtotal = items.reduce((acc, item) => acc + item.quantidade * item.produto.preco, 0);
  const descontoPorcentagemValue = (subtotal * descontoPorcentagem) / 100;
  return subtotal - descontoPorcentagemValue - descontoDinheiro;
}

export async function handleStockUpdates(items, originalItems) {
  for (const item of items) {
    if (!item.produto.avulso) {
      const originalItem = originalItems.find(i => i.produto.id === item.produto.id);
      const quantidadeDiferenca = item.quantidade - (originalItem?.quantidade || 0);

      if (quantidadeDiferenca !== 0) {
        const { data: produto, error: selectError } = await supabase
          .from('produtos')
          .select('estoque')
          .eq('id', item.produto.id)
          .single();

        if (selectError) throw selectError;

        const novoEstoque = produto.estoque - quantidadeDiferenca;

        const { error: updateError } = await supabase
          .from('produtos')
          .update({ estoque: novoEstoque })
          .eq('id', item.produto.id);

        if (updateError) throw updateError;
      }
    }
  }
}