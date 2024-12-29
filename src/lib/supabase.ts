import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Criação do cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função para excluir uma venda
export async function excluirVenda(vendaId: number): Promise<boolean> {
  try {
    const { error } = await supabase.from('vendas').delete().eq('id', vendaId);

    if (error) {
      console.error('Erro ao excluir venda:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Erro inesperado ao excluir venda:', err);
    return false;
  }
}
