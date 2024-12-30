import { Venda, ResumoVendas } from '../types';

export function calculateSalesStats(vendas: Venda[]): ResumoVendas {
  return vendas.reduce(
    (acc, venda) => {
      const { forma_pagamento, total } = venda;
      if (forma_pagamento === 'dinheiro') acc.dinheiro += total;
      if (forma_pagamento === 'pix') acc.pix += total;
      if (['credito', 'debito'].includes(forma_pagamento)) acc.cartao += total;
      acc.total += total;
      return acc;
    },
    { dinheiro: 0, pix: 0, cartao: 0, total: 0 }
  );
}