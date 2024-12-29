// Update the fecharCaixa function in RelatorioVendas
import { fecharCaixa } from '../../utils/caixa';

// ... rest of the imports

const handleFecharCaixa = async () => {
  if (!confirm('Deseja realmente fechar o caixa?')) return;

  try {
    const success = await fecharCaixa(vendas);
    
    if (success) {
      toast.success('Caixa fechado com sucesso!');
      carregarVendas();
    } else {
      toast.error('Erro ao fechar o caixa');
    }
  } catch (error) {
    console.error('Erro ao fechar o caixa:', error);
    toast.error('Erro ao fechar o caixa');
  }
};