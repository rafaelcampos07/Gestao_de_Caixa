// src/components/GerenciamentoEstoque.tsx
import React from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import { atualizarEstoqueNasVendas } from '../lib/estoqueUtils';

const GerenciamentoEstoque = () => {
  // Função para adicionar produtos ao estoque
  const adicionarProdutoAoEstoque = async (produtoId: string, quantidade: number) => {
    try {
      // Obter o estoque atual do produto
      const { data: produtoAtualizado, error: produtoError } = await supabase
        .from('produtos')
        .select('estoque')
        .eq('id', produtoId)
        .single();

      if (produtoError) throw produtoError;

      // Calcular o novo estoque
      const novoEstoque = produtoAtualizado.estoque + quantidade;

      // Atualizar o estoque no banco de dados
      const { error: updateError } = await supabase
        .from('produtos')
        .update({ estoque: novoEstoque })
        .eq('id', produtoId);

      if (updateError) throw updateError;

      // Atualizar o estoque nas vendas
      await atualizarEstoqueNasVendas(produtoId);

      toast.success('Produto adicionado ao estoque e vendas atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao adicionar produto ao estoque:', error);
      toast.error('Erro ao adicionar produto ao estoque');
    }
  };

  // Função para remover produtos do estoque
  const removerProdutoDoEstoque = async (produtoId: string, quantidade: number) => {
    try {
      // Obter o estoque atual do produto
      const { data: produtoAtualizado, error: produtoError } = await supabase
        .from('produtos')
        .select('estoque')
        .eq('id', produtoId)
        .single();

      if (produtoError) throw produtoError;

      // Calcular o novo estoque
      const novoEstoque = produtoAtualizado.estoque - quantidade;

      // Atualizar o estoque no banco de dados
      const { error: updateError } = await supabase
        .from('produtos')
        .update({ estoque: novoEstoque })
        .eq('id', produtoId);

      if (updateError) throw updateError;

      // Atualizar o estoque nas vendas
      await atualizarEstoqueNasVendas(produtoId);

      toast.success('Produto removido do estoque e vendas atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao remover produto do estoque:', error);
      toast.error('Erro ao remover produto do estoque');
    }
  };

  return (
    <div>
      {/* Seus componentes e lógica para gerenciar o estoque */}
    </div>
  );
};

export default GerenciamentoEstoque;