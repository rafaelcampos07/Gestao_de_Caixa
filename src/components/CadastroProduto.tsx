import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Save, X, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Produto } from '../types';

export function CadastroProduto() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [produto, setProduto] = useState<Partial<Produto>>({
    nome: '',
    preco: 0,
    descricao: '',
    codigo: '',
    estoque: 0,
  });

  useEffect(() => {
    carregarProdutos();
  }, []);

  const carregarProdutos = async () => {
    const { data, error } = await supabase.from('produtos').select('*');
    if (error) {
      toast.error('Erro ao carregar produtos');
      return;
    }
    if (data) setProdutos(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const { error } = await supabase
          .from('produtos')
          .update(produto)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Produto atualizado com sucesso!');
        setEditingId(null);
      } else {
        const { error } = await supabase.from('produtos').insert([produto]);

        if (error) throw error;
        toast.success('Produto cadastrado com sucesso!');
      }

      setProduto({
        nome: '',
        preco: 0,
        descricao: '',
        codigo: '',
        estoque: 0,
      });
      carregarProdutos();
    } catch (error) {
      toast.error('Erro ao salvar produto');
    }
  };

  const handleEdit = (prod: Produto) => {
    setEditingId(prod.id);
    setProduto(prod);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        const { error } = await supabase.from('produtos').delete().eq('id', id);
        if (error) throw error;
        toast.success('Produto excluído com sucesso!');
        carregarProdutos();
      } catch (error) {
        toast.error('Erro ao excluir produto');
      }
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setProduto({
      nome: '',
      preco: 0,
      descricao: '',
      codigo: '',
      estoque: 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          {editingId ? 'Editar Produto' : 'Cadastro de Produto'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome
            </label>
            <input
              type="text"
              value={produto.nome}
              onChange={(e) =>
                setProduto((prev) => ({ ...prev, nome: e.target.value }))
              }
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Preço
            </label>
            <input
              type="number"
              step="0.01"
              value={produto.preco}
              onChange={(e) =>
                setProduto((prev) => ({
                  ...prev,
                  preco: parseFloat(e.target.value),
                }))
              }
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código
            </label>
            <input
              type="text"
              value={produto.codigo}
              onChange={(e) =>
                setProduto((prev) => ({ ...prev, codigo: e.target.value }))
              }
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estoque
            </label>
            <input
              type="number"
              value={produto.estoque}
              onChange={(e) =>
                setProduto((prev) => ({
                  ...prev,
                  estoque: parseInt(e.target.value),
                }))
              }
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={produto.descricao}
              onChange={(e) =>
                setProduto((prev) => ({ ...prev, descricao: e.target.value }))
              }
              className="input-field"
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">
              {editingId ? <Save size={20} /> : <Plus size={20} />}
              {editingId ? 'Salvar Alterações' : 'Cadastrar Produto'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="btn-secondary"
              >
                <X size={20} />
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Nome
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Preço
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Código
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                Estoque
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((prod) => (
              <tr key={prod.id} className="border-b border-gray-200">
                <td className="px-4 py-3 text-sm text-gray-900">{prod.nome}</td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  R$ {prod.preco.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{prod.codigo}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {prod.estoque}
                </td>
                <td className="px-4 py-3 flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(prod)}
                    className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => handleDelete(prod.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
