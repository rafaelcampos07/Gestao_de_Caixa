import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

// Função para restaurar o estoque ao excluir uma venda
const restaurarEstoqueAoExcluirVenda = async (venda) => {
  try {
    for (const item of venda.items) {
      // Obter o estoque atual do produto
      const { data: produtoAtualizado, error: produtoError } = await supabase
        .from('produtos')
        .select('estoque')
        .eq('id', item.produto.id)
        .single();

      if (produtoError) throw produtoError;

      // Calcular o novo estoque
      const novoEstoque = produtoAtualizado.estoque + item.quantidade;

      // Atualizar o estoque no banco de dados
      const { error: updateError } = await supabase
        .from('produtos')
        .update({ estoque: novoEstoque })
        .eq('id', item.produto.id);

      if (updateError) throw updateError;
    }

    toast.success('Estoque restaurado com sucesso!');
  } catch (error) {
    console.error('Erro ao restaurar estoque:', error);
    toast.error('Erro ao restaurar estoque');
  }
};

// Função para excluir uma venda
const excluirVenda = async (vendaId, tipoTabela) => {
  const tabela = tipoTabela === 'ativas' ? 'vendas' : 'caixas_fechados';

  try {
    // Obter a venda a ser excluída
    const { data: venda, error: vendaError } = await supabase
      .from(tabela)
      .select('*')
      .eq('id', vendaId)
      .single();

    if (vendaError) throw vendaError;

    // Restaurar o estoque dos produtos na venda
    await restaurarEstoqueAoExcluirVenda(venda);

    // Excluir a venda
    const { error: deleteError } = await supabase
      .from(tabela)
      .delete()
      .eq('id', vendaId);

    if (deleteError) throw deleteError;

    toast.success('Venda excluída com sucesso!');
  } catch (error) {
    console.error('Erro ao excluir venda:', error);
    toast.error('Erro ao excluir venda');
  }
};